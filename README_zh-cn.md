# Cloudflare R2 ImageBed

CF-R2-ImageBed 是基于 [Cloudflare R2 对象存储](https://developers.cloudflare.com/r2/)的图像托管服务。R2 提供[免费层](https://developers.cloudflare.com/r2/platform/pricing/)。

[English](./README.md) | 简体中文

本仓库包含 3 个部分：

- 一个 [Worker](./worker) 处理将文件上传到 R2 存储或从中获取文件的请求。
- 一个 [Python 脚本](./uploader)，用于将文件上传到 Worker。
- 一个 [Page Function](./page-function)，用于从 R2 存储桶中提供文件

*目前 Cloudflare Pages Functions 不支持 R2 桶绑定，所以 Page Function 部分没有完成。Cloudflare [承诺](https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/)很快就会支持绑定。*

## 基础知识

当您将 Worker 部署到 Cloudflare 时，他们将其托管在域名 `<worker name>.<worker subdomain>` 上。对于我，它是 `upload-blog.caomingjun.workers.dev`。

**Key** 是一个字符串，用于区分 R2 中的对象。本项目使用路径名作为键。例如，`PUT https://upload-blog.caomingjun.workers.dev/foo/bar.png` 将文件以 key `foo/bar.png` 上传。

如果上传成功，worker 的返回值会包含一个可以访问文件的 URL。格式是 `<ROOT_URL><key>`

## 用法

### 先决条件

你应该：

- 拥有 [Cloudflare Workers 帐户](https://dash.cloudflare.com/sign-up/workers)
- 为您的 Cloudflare 帐户启用 R2 并创建一个存储桶
- 在您的计算机上安装 Python3 和 `pip`

另外，准备以下资源：

- 具有 `Edit Cloudflare Workers` 权限的 [Cloudflare API 令牌](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/authentication/)

### 部署 Worker

首先，fork 这个仓库。

您可能希望在源代码中更改这些内容：

- 在 `worker/src/handler.ts` 的第一行 的 `ALLOW_PATHS`。与 `ALLOW_PATHS` 的所有路径都不匹配的上传请求将被拒绝。
- `worker/wrangler.toml` 中的 `name = "upload-blog"` 。 它告诉 Cloudflare 将 Worker 部署到`upload-blog.<your worker subdomain>`。你可以更改它。

在新的仓库中，创建这些 Secret：

- `BUCKET_NAME`：您在[先决条件](#先决条件)中创建的 R2 存储桶的名称。
- `CF_API_TOKEN`：具有 `Edit Cloudflare Workers` 权限的 Cloudflare API 令牌。
- `CLOUDFLARE_ACCOUNT_ID`：您的 Cloudflare 帐户 ID，可以在您的 Workers dashboard 中找到。
- `ROOT_URL`：您要用于访问您上传的文件的 URL 的根。您可以选择您部署 Worker 的 URL，比如对于我是 `https://upload-blog.caomingjun.workers.dev/`。不要漏掉最后的 `/` 。
- `UPLOAD_SECRET`：类似于密码，以避免有人将文件上传到您的存储桶。你可以使用任何你喜欢的字符串。

然后运行 workflow `deploy`。您可能需要先为仓库启用 Action。

### 使用 Python 脚本

进入 `uploader` 文件夹。

将 `example.env` 重命名为 `.env`，然后填写以下字段：

- `UPLOAD_SECRET`: 必须和你部署 Worker 时设置的 `UPLOAD_SECRET` 完全一样。
- `REMOTE_URL`：您部署 Worker 的 URL。例如，`https://foo.bar.workers.dev/`。

`pip -r requirements.txt` 安装依赖。

函数 `upload` 接受 Key 和本地文件路径作为参数，如果成功则返回上传文件的 URL。

此脚本尚未完全完成。未来它会支持 Typora 的图片上传。

### 从 Cloudflare Pages 提供文件

当有人访问您页面中的指定 URL 时，Cloudflare Pages Functions 允许运行 Worker。

*目前 Cloudflare Pages Functions 不支持 R2 桶绑定，所以这部分没有完成。他们[承诺](https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/)很快就会支持它。*

## TODO

- [ ] 完成 Pages Functions。（需要等待 Cloudflare 在 Pages Functions 中支持 R2 绑定）
- [ ] Python 脚本支持 Typora 图片上传。
- [ ] 在放入存储同之前检查桶中是否有使用相同键的对象。

## 免责声明

Cloudflare 是 Cloudflare, Inc. 拥有的商标。

Cloudflare 没有参与该项目，也没有审查或批准该项目。