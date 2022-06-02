# Cloudflare R2 ImageBed

[![Deploy](https://github.com/cmj2002/CF-R2-ImageBed/actions/workflows/deploy.yml/badge.svg)](https://github.com/cmj2002/CF-R2-ImageBed/actions/workflows/deploy.yml)

[English](./README.md) | 简体中文

CF-R2-ImageBed 是基于 [Cloudflare R2 对象存储](https://developers.cloudflare.com/r2/)的图像托管服务。支持使用 PicGo 上传。

Cloudflare R2 提供[免费层](https://developers.cloudflare.com/r2/platform/pricing/)。


本仓库包含 3 个部分：

- 一个 [Worker](./worker) 处理将文件上传到 R2 存储或从中获取文件的请求。
- 一个 [Python 脚本](./uploader)，作为向 Worker 上传文件的 demo。
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

**警告**：[GFW 疑似对 `workers.dev` 进行了 SNI 封锁](https://community.cloudflare.com/t/cloudflare-workers-suspected-of-being-blocked-in-china/382155)。你可能还需要一个域名进行绑定。

### 部署 Worker

首先，fork 这个仓库。

您可能希望在源代码中更改这些内容：

- 在 `worker/src/config.ts` 中的 `allowPaths`。与 `allowPaths` 的所有路径都不匹配的上传请求将被拒绝。
- 在 `worker/src/config.ts` 中的 `allowDelete`。如果设置为 `false`，则删除请求、覆盖原有文件的写入将被拒绝。
- `worker/wrangler.toml` 中的 `name = "upload-blog"` 。 它告诉 Cloudflare 将 Worker 部署到`upload-blog.<your worker subdomain>`。你可以更改它。

在新的仓库中，创建这些 Secret：

- `BUCKET_NAME`：您在[先决条件](#先决条件)中创建的 R2 存储桶的名称。
- `CF_API_TOKEN`：具有 `Edit Cloudflare Workers` 权限的 Cloudflare API 令牌。
- `CLOUDFLARE_ACCOUNT_ID`：您的 Cloudflare 帐户 ID，可以在您的 Workers dashboard 中找到。
- `ROOT_URL`：您要用于访问您上传的文件的 URL 的根。您可以选择您部署 Worker 的 URL，比如对于我是 `https://upload-blog.caomingjun.workers.dev/`。不要漏掉最后的 `/` 。
- `UPLOAD_SECRET`：类似于密码，以避免有人将文件上传到您的存储桶。你可以使用任何你喜欢的字符串。

然后运行 workflow `deploy`。您可能需要先为仓库启用 Action。

### 上传文件

我们建议您使用我们的 [PicGo 插件](https://github.com/cmj2002/picgo-CF-R2)进行上传，因为 [PicGo](https://github.com/PicGo/PicGo-Core) 支持许多编辑器，例如 Typora 和 VSCode。PicGo 也有一个 [GUI 版本](https://github.com/Molunerfinn/PicGo)。

你也可以使用我们的 [Python 上传脚本](./uploader)，它支持 Typora。或者你也可以[自己写一个](uploader/README_zh-cn.md#其他上传脚本)。

### 从 Cloudflare Pages 提供文件

当有人访问您页面中的指定 URL 时，Cloudflare Pages Functions 允许运行 Worker。

*目前 Cloudflare Pages Functions 不支持 R2 桶绑定，所以这部分没有完成。他们[承诺](https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/)很快就会支持它。*

## TODO

- [ ] 完成 Pages Functions。（需要等待 Cloudflare 在 Pages Functions 中支持 R2 绑定）
- [x] Python 脚本支持 Typora 图片上传。
- [x] 在放入存储同之前检查桶中是否有使用相同键的对象。
- [x] PicGo 插件。

## 变更日志

- 2022-06-02: 增加获取信息、删除功能；在覆写之前进行检查；存储 `Content-Type`。

## 免责声明

Cloudflare 是 Cloudflare, Inc. 拥有的商标。

Cloudflare 没有参与该项目，也没有审查或批准该项目。