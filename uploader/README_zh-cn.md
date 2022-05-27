# Python demo for uploader

[English](./README.md) | 简体中文

这是将文件上传到 Worker 的一个 demo，它支持 Typora。

我们建议您使用我们的 [PicGo 插件](https://github.com/cmj2002/picgo-CF-R2)，因为 [PicGo](https://github.com/PicGo/PicGo-Core) 支持许多编辑器，例如 Typora 和 VSCode。PicGo 也有一个 [GUI 版本](https://github.com/Molunerfinn/PicGo)。

如果你不想使用 PicGo，你可以使用这个 demo 或者[自己写一个](#其他上传脚本)。

## 使用该脚本

将 `example.env` 重命名为 `.env`，然后填写以下字段：

- `UPLOAD_SECRET`: 必须和你部署 Worker 时设置的 `UPLOAD_SECRET` 完全一样。
- `REMOTE_URL`：您部署 Worker 的 URL。例如，`https://foo.bar.workers.dev/`。

`pip install -r requirements.txt` 安装依赖。

函数 `upload` 接受 Key 和本地文件路径作为参数，如果成功则返回上传文件的 URL。

最后，将 Typora 的上传命令设置为 `python <path to main.py>`。如果你在环境变量中设置了代理，脚本会自动使用它。

### 在WSL中运行

如果你使用 WSL 中的 Python 运行该脚本而在 Windows 中运行 Typora，请将上传命令设置为 `wsl python <path to main.py in wsl> --wsl`。

如果你希望在 WSL 中使用 Windows 上的代理，请将上传命令设置为 `wsl python <path to main.py in wsl> --wsl --wsl-proxy-port <port>`。脚本会将 `http://windowsip:<port>` 作为代理。

脚本通过读取 `/etc/resolv.conf` 的 `nameserver` 来获取 Windows 的 IP 地址。如果你手动更改了它，脚本可能出错。

## 其他上传脚本

如果你用其他语言或者基于其他 Markdown 编辑器编写了脚本，欢迎提交 Pull Request。你可以将已有的脚本作为一个例子。