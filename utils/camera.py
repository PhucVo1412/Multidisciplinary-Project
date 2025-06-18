#####################################################################################################################
import time
import cv2
from Adafruit_IO import MQTTClient  
import paho.mqtt.client as mqtt
import base64
import os

# Adafruit IO Credentials
AIO_USERNAME = os.getenv("AIO_USERNAME") # Replace with your Adafruit IO username
AIO_KEY = os.getenv("AIO_KEY") # Replace with your Adafruit IO key from .env file
AIO_FEED_COMMAND = "project-242.on-off"

broker = "localhost"  
topic_size = "image/size"    
topic_data = "image/chunks"  
chunk_size = 4096

mqtt_client  = mqtt.Client()
# mqtt_client.connect(broker, 1883, 60)


cam = None
ButtonState = False 

# Initialize MQTT Client
aio_client  = MQTTClient(AIO_USERNAME, AIO_KEY)

# MQTT Callback Functions
def connected(client):
    print("Connected to Adafruit IO!")
    client.subscribe(AIO_FEED_COMMAND)

def disconnected(client):
    print("Disconnected from Adafruit IO!")


def message(client, feed_id, payload):
    global ButtonState
    print(f"Received: {payload}")

    if payload.lower() == "off":
        ButtonState = False
    else:
        ButtonState = True

aio_client.on_connect = connected
aio_client.on_message = message
aio_client.on_disconnect = disconnected

aio_client.connect()
aio_client.loop_background()  # Keep MQTT connection alive in the background


def image_capture(image_path):
    ret, frame = cam.read()
    if not ret:
        print("Error: Unable to capture image.")
        return

    # Encode to JPEG in memory at high quality
    result, encimg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not result:
        print("Error: Failed to encode image.")
        return

    # Check if image size exceeds 100 KB
    if len(encimg) > 102400:
        print("Image larger than 100 KB, compressing...")

        # Try reducing quality to compress
        for quality in range(90, 10, -10):
            result, encimg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
            if len(encimg) <= 102400:
                print(f"Compressed under 100 KB with quality={quality}")
                break
    else:
        print("Image is under 100 KB, no compression needed.")

    # Write final compressed image to disk
    with open(image_path, 'wb') as f:
        f.write(encimg.tobytes())

def sending_image(image_path):
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

        # Publish to Adafruit IO (Assuming you have a feed for images)
        aio_client.publish("picture", encoded_string)
        print(f"{img_path} successfully sent to Adafruit IO!")

    except Exception as e:
        print("Error sending image:", e)



while True:
    if ButtonState:
        cam = cv2.VideoCapture(0)
        print("Camera turned ON.")
        for i in range(2):
            img_path = f"imaget_{i}.jpg"
            image_capture(img_path)
            sending_image(img_path)
            time.sleep(1)
        cam.release()
        cam = None
        new_aio_client = MQTTClient(AIO_USERNAME, AIO_KEY)
        new_aio_client.connect()
        new_aio_client.publish(AIO_FEED_COMMAND, "off")
        time.sleep(2)
        print("Camera turned OFF.")
