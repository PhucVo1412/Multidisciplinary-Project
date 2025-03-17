from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS
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
# MODELS
###############################################################################
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class Item(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref='items')

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

###############################################################################
# ITEM ROUTES (PROTECTED)
###############################################################################
@app.route('/items', methods=['GET'])
@jwt_required()
def get_items():
    """
    Gets all items for the logged-in user.
    """
    current_user_id = get_jwt_identity()  # get user ID from token
    items = Item.query.filter_by(user_id=current_user_id).all()

    return jsonify([{'id': i.id, 'name': i.name} for i in items]), 200

@app.route('/items', methods=['POST'])
@jwt_required()
def add_item():
    """
    Creates a new item linked to the logged-in user.
    """
    current_user_id = get_jwt_identity()
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'message': 'Item name is required'}), 400

    new_item = Item(name=name, user_id=current_user_id)
    db.session.add(new_item)
    db.session.commit()

    return jsonify({
        'message': 'Item created',
        'item': {'id': new_item.id, 'name': new_item.name}
    }), 201

@app.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    """
    Deletes an item if it belongs to the logged-in user.
    """
    current_user_id = get_jwt_identity()
    item = Item.query.filter_by(id=item_id, user_id=current_user_id).first()
    if not item:
        return jsonify({'message': 'Item not found or not yours'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Item deleted'}), 200

###############################################################################
# RUN THE APP
###############################################################################
if __name__ == '__main__':
    # Make sure the 'static/swagger.json' file exists
    # Then run: python app.py
    app.run(debug=True)
