export async function onRequestGet(context) {
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  if (!params.path || params.path.length === 0) {
    return env.ASSETS.fetch(request);
  }

  const key = new URL(request.url).pathname.slice(1);
  const object = await env.BUCKET.get(key);

  if (!object) {
    return new Response("Object Not Found", { status: 404 });
  }

  return new Response(object.body);
}
