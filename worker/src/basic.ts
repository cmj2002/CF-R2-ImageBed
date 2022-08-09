/*
 * Implementation of basic functions.
 * Including GET,HEAD,PUT.
 */

import { getKey, validate } from './utils'
import { config } from './config'

export async function handleGET(request: Request): Promise<Response> {
  const key = getKey(request)
  const object = await BUCKET.get(key)

  if (!object) {
    return new Response('Object Not Found', { status: 404 })
  }

  let init: ResponseInit = { status: 200 }

  if (object.httpMetadata.contentType) {
    init = {
      status: 200,
      headers: {
        'Content-Type': object.httpMetadata.contentType,
        'Content-Length': object.size.toString(),
        Date: new Date().toUTCString(),
      },
    }
    return new Response(object.body, init)
  } else {
    init = {
      status: 200,
      headers: {
        'Content-Length': object.size.toString(),
        Date: new Date().toUTCString(),
      },
    }
    return new Response(object.body, init)
  }
}

export async function handleHEAD(request: Request): Promise<Response> {
  const key = getKey(request)
  const object = await BUCKET.get(key)

  if (!object) {
    return new Response('Object Not Found', { status: 404 })
  }

  if (object.httpMetadata.contentType) {
    const init: ResponseInit = {
      status: 200,
      headers: {
        Date: new Date().toUTCString(),
        'Content-Length': object.size.toString(),
        'Content-Type': object.httpMetadata.contentType,
      },
    }
    return new Response(null, init)
  } else {
    const init: ResponseInit = {
      status: 200,
      headers: {
        Date: new Date().toUTCString(),
        'Content-Length': object.size.toString(),
      },
    }
    return new Response(null, init)
  }
}

export async function handlePUT(request: Request): Promise<Response> {
  const key = getKey(request)

  const res = await validate(key, request)
  if (res !== null) return res

  if (!config.allowDelete && (await BUCKET.get(key))) {
    return new Response(
      JSON.stringify({
        message: 'Something is already here and delete is not allowed',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  await BUCKET.put(key, request.body, {
    httpMetadata: {
      contentType: request.headers.get('Content-Type') ?? undefined,
    },
  })
  const r = {
    message: 'Success',
    path: key,
    url: ROOT_URL + key,
  }
  return new Response(JSON.stringify(r), { status: 200 })
}
