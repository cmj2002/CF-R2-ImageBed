const ALLOW_PATHS = [
    "assets/",
    "images/"
];

function getKey(req: Request): string {
    const url = new URL(req.url);
    return url.pathname.slice(1);
}

export async function handleGET(request: Request): Promise<Response> {
    const key = getKey(request);
    const object = await BUCKET.get(key);

    if (!object) {
        return new Response("Object Not Found", {status: 404});
    }

    return new Response(object.body);
}

export async function handlePOST(request: Request): Promise<Response> {
    const key = getKey(request);
    let json: any;
    try {
        json = request.json();
    } catch (e) {
        let r = {
            "message": "Request body is not valid JSON",
            "path": key
        }
        return new Response(JSON.stringify(r), {status: 400});
    }

    // validate json
    if (!json.hasOwnProperty("time")) {
        let r = {
            "message": "Missing time property",
            "path": key
        }
        return new Response(JSON.stringify(r), {status: 400});
    } else if (!json.hasOwnProperty("auth")) {
        let r = {
            "message": "Missing auth property",
            "path": key
        }
        return new Response(JSON.stringify(r), {status: 400});
    } else if (!json.hasOwnProperty("data")) {
        let r = {
            "message": "Missing data property",
            "path": key
        }
        return new Response(JSON.stringify(r), {status: 400});
    } else {
        // The time should be the last 45 seconds
        const now = new Date();
        const reqTime = new Date(json.time);
        const diff = now.getTime() - reqTime.getTime();
        if (diff > 45000) {
            let r = {
                "message": "Time is more than 45 seconds old. Check if you are using utc time and retry.",
                "path": key
            }
            return new Response(JSON.stringify(r), {status: 403});
        }

        // validate auth
        let toHash = json["time"] + key + UPLOAD_SECRET
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(toHash));
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        if (hashHex != json["auth"]) {
            let r = {
                "message": "Authorization failed.",
                "path": key
            }
            return new Response(JSON.stringify(r), {status: 403});
        }

        // check if path is allowed
        if (!ALLOW_PATHS.some(p => key.startsWith(p))) {
            let r = {
                "message": "Requested path is not allowed.",
                "path": key
            }
            return new Response(JSON.stringify(r), {status: 403});
        }
    }
    await BUCKET.put(key, json["data"]);
    const r = {
        "message": "Success",
        "path": key,
        "url": ROOT_URL + key
    }
    return new Response(JSON.stringify(r), {status: 200});
}
