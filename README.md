# Cloudflare R2 ImageBed

English | [简体中文](./README_zh-cn.md)

CF-R2-ImageBed is a image hosting service based on [Cloudflare R2 object storage](https://developers.cloudflare.com/r2/). PicGo supported. 

Cloudflare R2 offers a [free tier](https://developers.cloudflare.com/r2/platform/pricing/).

The repo contains 3 parts:

* A [Worker](./worker) that handles requests to upload files to R2 storage or get file from it.
* A [Python script](./uploader) as a demo to show to upload file to Worker.
* A [Page Function](./page-function) that can provide file in R2 bucket.

*Currently Cloudflare Pages Functions don't support R2 bucket binding, so the page function part is not finished. They [promised](https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/) to support it soon.*

## Basic knowledge

When you deploy a worker to Cloudflare, they host it at domain `<worker name>.<worker subdomain>`. In my case, it's `upload-blog.caomingjun.workers.dev`.

**Key** is a string to distinguish object in R2. We use the path name as key. For example, `PUT https://upload-blog.caomingjun.workers.dev/foo/bar.png` will put the file with key `foo/bar.png`.

If the upload succeed, the worker will send the URL which you can access the file. It will be `<ROOT_URL><key>`.

## Usage

### Pre-requisites

You should:

* Have a [Cloudflare Workers account](https://dash.cloudflare.com/sign-up/workers)
* Enable R2 for your Cloudflare account and create a bucket
* Install Python3 and `pip` on your computer

Also, prepare the following secrets

- [Cloudflare API token](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/authentication/) with `Edit Cloudflare Workers` permissions.

**Warning** if your image bed have Chinese users: [`*.workers.dev` suspected of being blocked in China](https://community.cloudflare.com/t/cloudflare-workers-suspected-of-being-blocked-in-china/382155), so you may need a domain to bind to it.

### Deploy the worker

Firstly, fork this repo.

You may want to change these in the source code:

* `allowPaths` in `worker/src/config.ts`. A path that doesn't match any of the `allowPaths` will be rejected.
* `name = "upload-blog"` in `worker/wrangler.toml` . It tells Cloudflare to deploy the worker to `upload-blog.<your worker subdomain>` . You can change it.

In the new repo, create these secrets:

* `BUCKET_NAME` : the name of the R2 bucket you create in [Pre-requisites](#pre-requisites).
* `CF_API_TOKEN` : the Cloudflare API token with `Edit Cloudflare Workers` permissions.
* `CLOUDFLARE_ACCOUNT_ID` : your Cloudflare account ID, can be found in your workers dashboard.
* `ROOT_URL` : the root of URL that you want to use to access the file you upload. You can just put the URL that you deploy your worker to, like `https://upload-blog.<your worker subdomain>/`. Don't miss the `/` at the end.
* `UPLOAD_SECRET` : something like a password to avoid someone upload file to you bucket. You can use any string you like.

Then run the workflow `deploy`. You may need to enable actions for the repo first.

### Upload files

We recommend you to use our [PicGo plugin](https://github.com/cmj2002/picgo-CF-R2), because [PicGo](https://github.com/PicGo/PicGo-Core) supports many editors like Typora and VSCode. PicGo also have a [GUI version](https://github.com/Molunerfinn/PicGo).

You can also use our [Python uploader](./uploader) which supports Typora or [write your own](./uploader/README.md#other-upload-script).

### Provides the files from Cloudflare Pages

Cloudflare Pages Functions allow running workers when someone access specified URL in your page.

*Currently Cloudflare Pages Functions don't support R2 bucket binding, so the page function part is not finished. They [promised](https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/) to support it soon.*

## Todo

* [ ] Finish Page Function. (Waiting for Cloudflare to support R2 binding in Pages Functions)
* [x] Support Typora image upload in python script.
* [ ] Check if there is object using the same key in bucket before putting it.
* [x] PicGo plugin.

## Disclaimer

Cloudflare is a trademark owned by Cloudflare, Inc.

Cloudflare does not have any involvement in the project and did not review or approve of this project.