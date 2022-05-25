# Cloudflare R2 ImageBed

CF-R2-ImageBed is a image hosting service based on [Cloudflare R2 object storage](https://developers.cloudflare.com/r2/). R2 offers a [free tier](https://developers.cloudflare.com/r2/platform/pricing/).

English | [简体中文](./README_zh-cn.md)

The repo contains 3 parts:

* A [Worker](./worker) that handles requests to upload files to R2 storage or get file from it.
* A [Python script](./uploader) that upload files to the worker from Typora.
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

### Deploy the worker

Firstly, fork this repo.

You may want to change these in the source code:

* `ALLOW_PATHS` in the first line of `worker/src/handler.ts`. A path that doesn't match any of the `ALLOW_PATHS` will be rejected.
* `name = "upload-blog"` in `worker/wrangler.toml` . It tells Cloudflare to deploy the worker to `upload-blog.<your worker subdomain>` . You can change it.

In the new repo, create these secrets:

* `BUCKET_NAME` : the name of the R2 bucket you create in [Pre-requisites](#pre-requisites).
* `CF_API_TOKEN` : the Cloudflare API token with `Edit Cloudflare Workers` permissions.
* `CLOUDFLARE_ACCOUNT_ID` : your Cloudflare account ID, can be found in your workers dashboard.
* `ROOT_URL` : the root of URL that you want to use to access the file you upload. You can just put the URL that you deploy your worker to, like `https://upload-blog.<your worker subdomain>/`. Don't miss the `/` at the end.
* `UPLOAD_SECRET` : something like a password to avoid someone upload file to you bucket. You can use any string you like.

Then run the workflow `deploy`. You may need to enable actions for the repo first.

### Use the python script

Enter the `uploader` folder.

Rename the `example.env` to `.env` , then fill in these fields:

* `UPLOAD_SECRET` : must be exactly the same as the `UPLOAD_SECRET` you set when you deploy the worker.
* `REMOTE_URL` : the URL you deploy your worker. For example, `https://foo.bar.workers.dev/`.

`pip install -r requirements.txt` to install requirements.

Then set the Typora upload command to `python <path to main.py>`. If you set proxy environment variables, the script will use them.

#### use in WSL

You may install python in wsl while running Typora in Windows. 

In this case, the upload command is `wsl python <path to main.py in wsl> --wsl`.

If you have a proxy in windows and want to use it in WSL, use `wsl python <path to main.py in wsl> --wsl --wsl-proxy-port <port>`. It will use `http://windowsip:<port>` as proxy.

We use the nameserver in `/etc/resolv.conf` to get the IP of the windows machine. If you change it manually, the script may not work.

#### Other upload script

If you write a script in other languages or based on other Markdown editors, feel free to open a pull request. You can take mine as an example.

### Provides the files from Cloudflare Pages

Cloudflare Pages Functions allow running workers when someone access specified URL in your page.

*Currently Cloudflare Pages Functions don't support R2 bucket binding, so the page function part is not finished. They [promised](https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/) to support it soon.*

## Todo

* [ ] Finish Page Function. (Waiting for Cloudflare to support R2 binding in Pages Functions)
* [x] Support Typora image upload in python script.
* [ ] Check if there is object using the same key in bucket before putting it.

## Disclaimer

Cloudflare is a trademark owned by Cloudflare, Inc.

Cloudflare does not have any involvement in the project and did not review or approve of this project.