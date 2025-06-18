from Adafruit_IO import MQTTClient
from dotenv import load_dotenv
import os, time
import base64
# Load .env vars
load_dotenv()

# ✅ Adafruit IO Credentials from environment
AIO_USERNAME = os.getenv("AIO_USERNAME")
AIO_KEY = os.getenv("AIO_KEY")
AIO_FEED = "project-242.name"  
AIO_FEED_DOOR = "project-242.door"
AIO_FEED_LED = "project-242.led"
AIO_FEED_LIGHT = "project-242.light"
AIO_FEED_IMAGE = "picture"
AIO_FEED_BUTTON = "project-242.on-off"

# MQTT Callback Functions

def normal_aio(message):
    def connected(client):
        print("Subcribed to Adafruit IO feed")
        client.subscribe(AIO_FEED)
        client.subscribe(AIO_FEED_DOOR)
        client.subscribe(AIO_FEED_LIGHT)
        client.subscribe(AIO_FEED_BUTTON)
    def disconnected(client):
        print("Disconnected from Adafruit IO!")
    aio_client = MQTTClient(AIO_USERNAME, AIO_KEY)
    aio_client.on_connect = connected
    aio_client.on_disconnect = disconnected
    aio_client.on_message = message
    return aio_client


def aio_listener_img(message):
    def connected(client):
        print("Subcribed to Image feed")
        client.subscribe(AIO_FEED_IMAGE)
    def disconnected(client):
        print("Disconnected from Adafruit IO!")
    aio_client = MQTTClient(AIO_USERNAME, AIO_KEY)
    aio_client.on_connect = connected
    aio_client.on_disconnect = disconnected
    aio_client.on_message = message
    return aio_client


# aio_client.connect()
# aio_client.loop_background()
def publish_command(aio_client,feed, command):
    """
    Publishes a command to the specified Adafruit IO feed.
    """
    try:
        aio_client.publish(feed, command)
        print(f"Data sent to feed '{feed}': {command}")
    except Exception as e:
        print("Failed to send data to Adafruit IO:", e)

# aio_client = aio_listener_img(message)
# publish_command(aio_client, AIO_FEED_DOOR, "ON")
# time.sleep(5)