from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS
from datetime import datetime
import pytz
from sqlalchemy import LargeBinary
import os

# Import Adafruit IO MQTT publishing functionality from separate module
from adafruit_io_client import publish_command, AIO_FEED_DOOR, AIO_FEED_LED, AIO_FEED_LIGHT

###############################################################################
# FLASK APP CONFIGURATION
###############################################################################
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['JWT_SECRET_KEY'] = 'supersecretkey'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

VIETNAM_TZ = pytz.timezone('Asia/Ho_Chi_Minh')


###############################################################################
# MODELS
###############################################################################
# ---------------------------
# User Models (Polymorphic)
# ---------------------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))  # base identity: "user"
    name = db.Column(db.String(80), nullable=True)
    account = db.Column(db.String(80), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    __mapper_args__ = {
        'polymorphic_on': type,
        'polymorphic_identity': 'user'
    }

    # One-to-one relationship to FaceIdentity
    face_identity = db.relationship('FaceIdentity', backref='user', uselist=False)


class NormalUser(User):
    __tablename__ = 'normal_users'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    action = db.Column(db.String(120), nullable=True)
    __mapper_args__ = {
        'polymorphic_identity': 'normal'  # Changed from 'user' to 'normal'
    }


class AdminUser(User):
    __tablename__ = 'admin_users'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    access = db.Column(db.String(120), nullable=True)
    __mapper_args__ = {
        'polymorphic_identity': 'admin'
    }


# ---------------------------
# FaceIdentity Model (storing image as binary data)
# ---------------------------
class FaceIdentity(db.Model):
    __tablename__ = 'face_identity'
    id = db.Column(db.Integer, primary_key=True)
    face_id = db.Column(db.String(120), unique=True, nullable=True)
    name = db.Column(db.String(80), nullable=True)
    face_image = db.Column(LargeBinary, nullable=True)  # JPG/JPEG binary data
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)


# ---------------------------
# Place Model
# ---------------------------
class Place(db.Model):
    __tablename__ = 'places'
    id = db.Column(db.Integer, primary_key=True)
    room = db.Column(db.String(120), nullable=True)
    address = db.Column(db.String(120), nullable=True)
    equipment = db.relationship('Equipment', backref='place', lazy=True)


# ---------------------------
# Equipment & Sub-entities
# ---------------------------
class Equipment(db.Model):
    __tablename__ = 'equipment'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(50), default='idle')
    start = db.Column(db.DateTime, default=lambda: datetime.now(VIETNAM_TZ))
    end = db.Column(db.DateTime, nullable=True)
    place_id = db.Column(db.Integer, db.ForeignKey('places.id'), nullable=True)
    led_lcds = db.relationship('LedLCD', backref='equipment', lazy=True)
    lights = db.relationship('Light', backref='equipment', lazy=True)
    doors = db.relationship('Door', backref='equipment', lazy=True)


class LedLCD(db.Model):
    __tablename__ = 'led_lcd'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=False)


class Light(db.Model):
    __tablename__ = 'light'
    id = db.Column(db.Integer, primary_key=True)
    switch = db.Column(db.Boolean, default=False)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=False)


class Door(db.Model):
    __tablename__ = 'door'
    id = db.Column(db.Integer, primary_key=True)
    servo = db.Column(db.String(120), nullable=True)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=False)


# ---------------------------
# Control Model (for actions)
# ---------------------------
class Control(db.Model):
    __tablename__ = 'control'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(200), nullable=False)
    device_type = db.Column(db.String(50), nullable=False)
    device_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=True)
    start_time = db.Column(db.DateTime, default=lambda: datetime.now(VIETNAM_TZ))
    end_time = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=True)


###############################################################################
# CREATE DATABASE TABLES
###############################################################################
with app.app_context():
    db.create_all()

###############################################################################
# SWAGGER UI SETUP
###############################################################################
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(SWAGGER_URL, API_URL)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)


###############################################################################
# ROUTES
###############################################################################
@app.route('/')
def home():
    return "Welcome! Go to /swagger for API documentation."


# ---------------------------
# Authentication Routes
# ---------------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    # Let the user choose the role; default is "user"
    role = data.get('role', 'user').lower()
    # Extra field: admin_token (only required for admin registration)
    admin_token = data.get('admin_token')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'User already exists'}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    name = data.get('name')
    account = data.get('account')
    phone = data.get('phone')

    # Define the secret admin token (for demo only; use env variable in production)
    SECRET_ADMIN_TOKEN = "mySuperSecretAdminToken123"

    if role == 'admin':
        if admin_token != SECRET_ADMIN_TOKEN:
            return jsonify({'message': 'Invalid admin token'}), 403
        access = data.get('access', 'full')
        new_user = AdminUser(
            type='admin',
            name=name,
            account=account,
            phone=phone,
            username=username,
            password_hash=hashed_pw,
            access=access
        )
    else:
        action = data.get('action', 'default_action')
        new_user = NormalUser(
            type='user',  # Normal users are stored with polymorphic_identity "user" but mapped as NormalUser
            name=name,
            account=account,
            phone=phone,
            username=username,
            password_hash=hashed_pw,
            action=action
        )

    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': f"{role.capitalize()} user registered successfully", 'user_id': new_user.id}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'access_token': access_token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401


# ---------------------------
# Face Identity Routes
# ---------------------------
@app.route('/face_identity', methods=['POST'])
@jwt_required()
def create_or_update_face_identity():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    face_id_value = request.form.get('face_id')
    face_name = request.form.get('name')
    if not face_id_value:
        return jsonify({'message': 'face_id is required'}), 400
    if 'face_image' not in request.files:
        return jsonify({'message': 'Face image file is required'}), 400
    image_file = request.files['face_image']
    image_data = image_file.read()
    if user.face_identity:
        user.face_identity.face_id = face_id_value
        user.face_identity.name = face_name
        user.face_identity.face_image = image_data
    else:
        new_face = FaceIdentity(face_id=face_id_value, name=face_name, face_image=image_data, user_id=user.id)
        db.session.add(new_face)
    db.session.commit()
    return jsonify({'message': 'Face identity saved/updated'}), 200


@app.route('/face_identity', methods=['GET'])
@jwt_required()
def get_face_identity():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user or not user.face_identity:
        return jsonify({'message': 'Face identity not found'}), 404
    fi = user.face_identity
    import base64
    encoded_image = base64.b64encode(fi.face_image).decode('utf-8') if fi.face_image else None
    return jsonify({'id': fi.id, 'face_id': fi.face_id, 'name': fi.name, 'face_image': encoded_image}), 200


# ---------------------------
# Place Routes
# ---------------------------
@app.route('/places', methods=['POST'])
@jwt_required()
def create_place():
    data = request.json
    room = data.get('room')
    address = data.get('address')
    new_place = Place(room=room, address=address)
    db.session.add(new_place)
    db.session.commit()
    return jsonify({"message": "Place created", "id": new_place.id}), 201


@app.route('/places/<int:place_id>', methods=['GET'])
@jwt_required()
def get_place(place_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({"message": "Place not found"}), 404
    equipment_list = [{"id": eq.id, "name": eq.name, "status": eq.status} for eq in place.equipment]
    return jsonify({"id": place.id, "room": place.room, "address": place.address, "equipment": equipment_list}), 200


@app.route('/places', methods=['GET'])
@jwt_required()
def get_all_places():
    places = Place.query.all()
    output = [{"id": pl.id, "room": pl.room, "address": pl.address} for pl in places]
    return jsonify(output), 200


@app.route('/places/<int:place_id>', methods=['PUT'])
@jwt_required()
def update_place(place_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({"message": "Place not found"}), 404
    data = request.json
    place.room = data.get('room', place.room)
    place.address = data.get('address', place.address)
    db.session.commit()
    return jsonify({"message": "Place updated"}), 200


@app.route('/places/<int:place_id>', methods=['DELETE'])
@jwt_required()
def delete_place(place_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({"message": "Place not found"}), 404
    db.session.delete(place)
    db.session.commit()
    return jsonify({"message": "Place deleted"}), 200


# ---------------------------
# Equipment Routes
# ---------------------------
@app.route('/equipment', methods=['POST'])
@jwt_required()
def create_equipment_endpoint():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'message': "Equipment 'name' is required"}), 400
    status = data.get('status', 'idle')
    place_id = data.get('place_id')
    equipment = Equipment(name=name, status=status, place_id=place_id)
    db.session.add(equipment)
    db.session.commit()
    return jsonify({"message": "Equipment created", "id": equipment.id}), 201


@app.route('/equipment/<int:equipment_id>', methods=['GET'])
@jwt_required()
def get_equipment_endpoint(equipment_id):
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    led_lcds = [{"id": lcd.id, "name": lcd.name} for lcd in eq.led_lcds]
    lights = [{"id": l.id, "switch": l.switch} for l in eq.lights]
    doors = [{"id": d.id, "servo": d.servo} for d in eq.doors]
    return jsonify({
        "id": eq.id,
        "name": eq.name,
        "status": eq.status,
        "start": eq.start.isoformat() if eq.start else None,
        "end": eq.end.isoformat() if eq.end else None,
        "place_id": eq.place_id,
        "led_lcds": led_lcds,
        "lights": lights,
        "doors": doors
    }), 200


@app.route('/equipment', methods=['GET'])
@jwt_required()
def get_all_equipment_endpoint():
    equipments = Equipment.query.all()
    output = [{
        "id": eq.id,
        "name": eq.name,
        "status": eq.status,
        "start": eq.start.isoformat() if eq.start else None,
        "end": eq.end.isoformat() if eq.end else None,
        "place_id": eq.place_id
    } for eq in equipments]
    return jsonify(output), 200


@app.route('/equipment/<int:equipment_id>', methods=['PUT'])
@jwt_required()
def update_equipment_endpoint(equipment_id):
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    data = request.json
    eq.name = data.get('name', eq.name)
    eq.status = data.get('status', eq.status)
    eq.place_id = data.get('place_id', eq.place_id)
    db.session.commit()
    return jsonify({"message": "Equipment updated"}), 200


@app.route('/equipment/<int:equipment_id>', methods=['DELETE'])
@jwt_required()
def delete_equipment_endpoint(equipment_id):
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    db.session.delete(eq)
    db.session.commit()
    return jsonify({"message": "Equipment deleted"}), 200


# ---------------------------
# LedLCD Routes
# ---------------------------
@app.route('/equipment/<int:equipment_id>/ledlcd', methods=['POST'])
@jwt_required()
def create_ledlcd_endpoint():
    equipment_id = request.view_args['equipment_id']
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"message": "'name' is required for LedLCD"}), 400
    lcd = LedLCD(name=name, equipment_id=equipment_id)
    db.session.add(lcd)
    db.session.commit()
    return jsonify({"message": "LedLCD created", "id": lcd.id}), 201


@app.route('/equipment/<int:equipment_id>/ledlcd', methods=['GET'])
@jwt_required()
def get_ledlcd_for_equipment(equipment_id):
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    lcds = [{"id": lcd.id, "name": lcd.name} for lcd in eq.led_lcds]
    return jsonify(lcds), 200


# ---------------------------
# Light Routes
# ---------------------------
@app.route('/equipment/<int:equipment_id>/lights', methods=['POST'])
@jwt_required()
def create_light_endpoint():
    equipment_id = request.view_args['equipment_id']
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    data = request.json
    switch_state = data.get('switch', False)
    light = Light(switch=switch_state, equipment_id=equipment_id)
    db.session.add(light)
    db.session.commit()
    return jsonify({"message": "Light created", "id": light.id}), 201


@app.route('/equipment/<int:equipment_id>/lights', methods=['GET'])
@jwt_required()
def get_lights_for_equipment(equipment_id):
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    lights = [{"id": l.id, "switch": l.switch} for l in eq.lights]
    return jsonify(lights), 200


# ---------------------------
# Door Routes
# ---------------------------
@app.route('/equipment/<int:equipment_id>/doors', methods=['POST'])
@jwt_required()
def create_door_endpoint():
    equipment_id = request.view_args['equipment_id']
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    data = request.json
    servo_value = data.get('servo', 'default_servo')
    door = Door(servo=servo_value, equipment_id=equipment_id)
    db.session.add(door)
    db.session.commit()
    return jsonify({"message": "Door created", "id": door.id}), 201


@app.route('/equipment/<int:equipment_id>/doors', methods=['GET'])
@jwt_required()
def get_doors_for_equipment(equipment_id):
    eq = Equipment.query.get(equipment_id)
    if not eq:
        return jsonify({"message": "Equipment not found"}), 404
    doors = [{"id": d.id, "servo": d.servo} for d in eq.doors]
    return jsonify(doors), 200


# ---------------------------
# Control Routes (Actions)
# ---------------------------
@app.route('/controls', methods=['POST'])
@jwt_required()
def create_control():
    current_user_id = int(get_jwt_identity())
    data = request.json
    action = data.get('action')
    device_type = data.get('device_type')
    device_id = data.get('device_id')
    equipment_id = data.get('equipment_id')
    if not action or not device_type or not device_id:
        return jsonify({"message": "action, device_type, and device_id are required"}), 400
    control = Control(
        action=action,
        device_type=device_type,
        device_id=device_id,
        equipment_id=equipment_id,
        user_id=current_user_id,
        status=data.get('status', 'pending')
    )
    db.session.add(control)
    db.session.commit()
    return jsonify({"message": "Control created", "id": control.id}), 201


@app.route('/controls', methods=['GET'])
@jwt_required()
def get_controls():
    current_user_id = int(get_jwt_identity())
    controls = Control.query.filter_by(user_id=current_user_id).all()
    output = [{
        'id': c.id,
        'action': c.action,
        'device_type': c.device_type,
        'device_id': c.device_id,
        'status': c.status,
        'start_time': c.start_time.isoformat(),
        'end_time': c.end_time.isoformat() if c.end_time else None,
        'equipment_id': c.equipment_id
    } for c in controls]
    return jsonify(output), 200


@app.route('/controls/<int:control_id>/execute', methods=['POST'])
@jwt_required()
def execute_control(control_id):
    current_user_id = int(get_jwt_identity())
    control = Control.query.filter_by(id=control_id, user_id=current_user_id).first()
    if not control:
        return jsonify({"message": "Control not found or not owned by user"}), 404
    device_type = control.device_type.lower()
    if device_type == "door":
        feed = AIO_FEED_DOOR
    elif device_type == "led":
        feed = AIO_FEED_LED
    elif device_type == "light":
        feed = AIO_FEED_LIGHT
    else:
        return jsonify({"message": "Unsupported device type"}), 400
    publish_command(feed, control.action)
    return jsonify({"message": f"Command '{control.action}' sent to {control.device_type}."}), 200


@app.route('/controls/<int:control_id>', methods=['PUT'])
@jwt_required()
def update_control(control_id):
    current_user_id = int(get_jwt_identity())
    control = Control.query.filter_by(id=control_id, user_id=current_user_id).first()
    if not control:
        return jsonify({"message": "Control not found or not owned by user"}), 404
    data = request.json
    control.action = data.get('action', control.action)
    control.device_type = data.get('device_type', control.device_type)
    control.device_id = data.get('device_id', control.device_id)
    control.status = data.get('status', control.status)
    if 'end_time' in data:
        control.end_time = datetime.now(VIETNAM_TZ) if data.get('end_time') else None
    db.session.commit()
    return jsonify({"message": "Control updated"}), 200


@app.route('/controls/<int:control_id>', methods=['DELETE'])
@jwt_required()
def delete_control(control_id):
    current_user_id = int(get_jwt_identity())
    control = Control.query.filter_by(id=control_id, user_id=current_user_id).first()
    if not control:
        return jsonify({"message": "Control not found or not owned by user"}), 404
    db.session.delete(control)
    db.session.commit()
    return jsonify({"message": "Control deleted"}), 200


# ---------------------------
# Admin Endpoint for Deleting Normal Users
# ---------------------------
@app.route('/admin/normal_users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_normal_user(user_id):
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    if current_user.type != 'admin':
        return jsonify({"message": "Unauthorized: admin access required"}), 403
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"message": "User not found"}), 404
    if target_user.type != 'user':
        return jsonify({"message": "Cannot delete an admin user via this endpoint"}), 400
    db.session.delete(target_user)
    db.session.commit()
    return jsonify({"message": "Normal user deleted successfully"}), 200


###############################################################################
# RUN THE APP
###############################################################################
if __name__ == '__main__':
    app.run(debug=True)
