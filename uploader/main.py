import requests
import hashlib
import os
from dotenv import load_dotenv
from datetime import datetime

timeFormat = "%Y-%m-%d %H:%M:%S"

load_dotenv()

UPLOAD_SECRET = os.getenv("UPLOAD_SECRET")
REMOTE_URL = os.getenv("REMOTE_URL")


def upload(key: str, file: str) -> str:
    """
    Uploads a file and returns the url
    """
    url = REMOTE_URL + key
    # auth=sha256(time+key+secret)
    reqTime = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
    auth = hashlib.sha256(reqTime.encode('utf-8') + key.encode('utf-8') + UPLOAD_SECRET.encode('utf-8')).hexdigest()
    with open(file, "rb") as f:
        res = requests.put(url, data=f, headers={
            'Date': reqTime,
            'Authorization': 'Bearer ' + auth,
            'Content-Type': 'application/octet-stream',
            'Content-Length': str(f.tell())
        })
    if res.status_code != 200:
        print(res.text)
        raise Exception("Upload failed with status code: " + str(res.status_code))
    return res.json()["url"]


if __name__ == "__main__":
    print(upload("assets/test.png", "test.png"))
