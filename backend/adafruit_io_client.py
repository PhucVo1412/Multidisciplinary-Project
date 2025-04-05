from Adafruit_IO import MQTTClient
from dotenv import load_dotenv
import os, time

# Load .env vars
load_dotenv()

# ✅ Adafruit IO Credentials from environment
AIO_USERNAME = os.getenv("AIO_USERNAME")
AIO_KEY = os.getenv("AIO_KEY")
AIO_FEED = "project-242.name"  # Replace with your feed name
AIO_FEED_DOOR = "project-242.door"
AIO_FEED_LED = "project-242.led"
AIO_FEED_LIGHT = "project-242.light"

aio_client = MQTTClient(AIO_USERNAME, AIO_KEY)

# MQTT Callback Functions
def connected(client):
    print("Connected to Adafruit IO!")

def disconnected(client):
    print("Disconnected from Adafruit IO!")

aio_client.on_connect = connected
aio_client.on_disconnect = disconnected

aio_client.connect()
aio_client.loop_background()
def publish_command(feed, command):
    """
    Publishes a command to the specified Adafruit IO feed.
    """
    try:
        aio_client.publish(feed, command)
        print(f"Data sent to feed '{feed}': {command}")
    except Exception as e:
        print("Failed to send data to Adafruit IO:", e)


# publish_command()
# time.sleep(5)