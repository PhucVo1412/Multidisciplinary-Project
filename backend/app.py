from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS
from datetime import datetime
import pytz
import os

###############################################################################
# FLASK APP CONFIG
###############################################################################
app = Flask(__name__)
CORS(app)
# Database: SQLite stored in data.db
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
# JWT secret key (change this to a strong random value in production!)
app.config['JWT_SECRET_KEY'] = 'supersecretkey'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

###############################################################################
# TIMEZONE CONFIGURATION
###############################################################################
VIETNAM_TZ = pytz.timezone('Asia/Ho_Chi_Minh')

###############################################################################
# MODELS
###############################################################################
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class Record(db.Model):
    __tablename__ = 'records'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(200), nullable=False)
    time = db.Column(db.DateTime, default=lambda: datetime.now(VIETNAM_TZ))  # Ensure default is correct
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref='records')

###############################################################################
# CREATE TABLES IF THEY DON'T EXIST
###############################################################################
with app.app_context():
    db.create_all()

###############################################################################
# SWAGGER UI SETUP
###############################################################################
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'  # must point to your swagger.json file

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

###############################################################################
# ROUTES
###############################################################################
@app.route('/')
def home():
    return "Welcome! Go to /swagger for API documentation."

###############################################################################
# AUTH ROUTES
###############################################################################
@app.route('/register', methods=['POST'])
def register():
    """
    Registers a new user by hashing their password.
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400

    # Hash the password
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create and save new user
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    """
    Logs in an existing user and returns a JWT token.
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # Create a token with user.id as identity
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'access_token': access_token}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/users', methods=['GET'])
def get_users():
    """
    Temporary route to fetch all users (for debugging).
    """
    users = User.query.all()
    return jsonify([{'id': u.id, 'username': u.username} for u in users]), 200

@app.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Deletes a user along with all associated records.
    """
    current_user_id = int(get_jwt_identity())

    if current_user_id != user_id:
        return jsonify({'message': 'Unauthorized to delete this user'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Delete all associated records
    Record.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User and associated records deleted'}), 200

###############################################################################
# RECORD ROUTES (PROTECTED)
###############################################################################
@app.route('/records', methods=['GET'])
@jwt_required()
def get_records():
    """
    Get all records for the logged-in user.
    """
    current_user_id = int(get_jwt_identity())
    records = Record.query.filter_by(user_id=current_user_id).all()
    output = []
    for r in records:
        output.append({
            'id': r.id,
            'action': r.action,
            'time': r.time.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify(output), 200

@app.route('/records', methods=['POST'])
@jwt_required()
def create_record():
    """
    Create a new record for the logged-in user.
    """
    current_user_id = int(get_jwt_identity())
    data = request.json
    action = data.get('action')

    if not action:
        return jsonify({'message': 'Action is required'}), 400

    new_record = Record(action=action, user_id=current_user_id)
    db.session.add(new_record)
    db.session.commit()

    return jsonify({
        'message': 'Record created',
        'record': {
            'id': new_record.id,
            'action': new_record.action,
            'time': new_record.time.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 201

@app.route('/records/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    """
    Delete a record if it belongs to the logged-in user.
    """
    current_user_id = int(get_jwt_identity())
    record = Record.query.filter_by(id=record_id, user_id=current_user_id).first()

    if not record:
        return jsonify({'message': 'Record not found or not yours'}), 404

    db.session.delete(record)
    db.session.commit()

    return jsonify({'message': 'Record deleted'}), 200

###############################################################################
# RUN THE APP
###############################################################################
if __name__ == '__main__':
    app.run(debug=True)
