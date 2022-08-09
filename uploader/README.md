# Python demo for uploader

English | [简体中文](./README_zh-cn.md)

This is a demo to upload files to Worker. It supports Typora.

We recommend you to use our [PicGo plugin](https://github.com/cmj2002/picgo-CF-R2), because [PicGo](https://github.com/PicGo/PicGo-Core) supports many editors like Typora and VSCode. PicGo also have a [GUI version](https://github.com/Molunerfinn/PicGo).

If you don't want to use PicGo, you can use this script or [write your own](#other-upload-script).

## How to use this script

Rename the `example.env` to `.env` , then fill in these fields:

- `UPLOAD_SECRET` : must be exactly the same as the `UPLOAD_SECRET` you set when you deploy the worker.
- `REMOTE_URL` : the URL you deploy your worker. For example, `https://foo.bar.workers.dev/`.

`pip install -r requirements.txt` to install requirements.

Then set the Typora upload command to `python <path to main.py>`. If you set proxy environment variables, the script will use them.

### use in WSL

You may install python in wsl while running Typora in Windows.

In this case, the upload command is `wsl python <path to main.py in wsl> --wsl`.

If you have a proxy in windows and want to use it in WSL, use `wsl python <path to main.py in wsl> --wsl --wsl-proxy-port <port>`. It will use `http://windowsip:<port>` as proxy.

We use the nameserver in `/etc/resolv.conf` to get the IP of the windows machine. If you change it manually, the script may not work.

## Other upload script

If you write a script in other languages or based on other Markdown editors, feel free to open a pull request. You can take mine as an example.
