#!/usr/bin/env python3
from typing import Optional
import magic
import requests
import hashlib
import os
from dotenv import load_dotenv
from datetime import datetime
import argparse
from wslPath import convertPath

DEBUG = False

load_dotenv()

UPLOAD_SECRET = os.getenv("UPLOAD_SECRET")
REMOTE_URL = os.getenv("REMOTE_URL")


def wslProxy(port: int) -> Optional[dict]:
    """
    Returns a dictionary of proxy settings for WSL, which use the `port` of host as HTTP proxy
    """
    if port == 0:
        return None
    with open("/etc/resolv.conf", "r") as f:
        lines = f.read().splitlines()
        ip = ""
        for line in lines:
            if line.startswith("nameserver"):
                ip = line.split(" ")[1]
                break
        if ip == "":
            raise Exception("Cannot find IP address of host")
    return {
        "http": "http://{}:{}".format(ip, port),
        "https": "http://{}:{}".format(ip, port),
    }


def upload(key: str, file: str, proxy: Optional[dict]) -> str:
    """
    Uploads a file and returns the url
    """
    url = REMOTE_URL + key
    if DEBUG:
        print("Uploading " + file + " to " + url)
    # auth=sha256(time+key+secret)
    reqTime = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
    auth = hashlib.sha256(reqTime.encode('utf-8') + key.encode('utf-8') + UPLOAD_SECRET.encode('utf-8')).hexdigest()
    with open(file, "rb") as f:
        res = requests.put(url, data=f, headers={
            'Date': reqTime,
            'Authorization': 'Bearer ' + auth,
            'Content-Type': magic.from_file(file, mime=True),
            'Content-Length': str(f.tell())
        }, proxies=proxy)
    if res.status_code != 200:
        raise Exception("Upload failed with status code: " + str(res.status_code) + "\n" + res.text)
    return res.json()["url"]


def genKey(file: str, index: int) -> str:
    """
    Generates a key for the file
    """
    extension = os.path.splitext(file)[1]
    return datetime.now().strftime(r'images/%Y/%m/%d%H%M%S' + str(index) + extension)


def main():
    parser = argparse.ArgumentParser(description='Uploads a file to the remote server')
    parser.add_argument('--wsl', action='store_true', help='Convert the path to WSL')
    parser.add_argument('files', type=str, nargs='+', help='The absolute paths of files to upload')
    parser.add_argument('--wsl-proxy-port', type=int, default=0,
                        help='If you are using WSL, set this port of host as HTTP proxy')
    args = parser.parse_args()
    urls = []
    current = -1
    # print(args)
    # exit(0)
    try:
        for file in args.files:
            current += 1
            if args.wsl:
                file = convertPath(file)
            key = genKey(file, current)
            urls.append(upload(key, file, wslProxy(args.wsl_proxy_port)))
    except Exception as e:
        print("Upload failed when uploading " + args.files[current] + ": \n" + str(e))
        exit(1)
    print("Upload Success:")
    for i in range(len(urls)):
        print(urls[i])


if __name__ == "__main__":
    main()
