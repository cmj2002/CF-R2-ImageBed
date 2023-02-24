/*
 * Implementation of POST method.
 * This method provides complex functions like delete files and get info about files.
 */

import { getKey, validate } from './utils'
import { config } from './config'

async function getInfo(key: string, options: any): Promise<Response> {
  const object = await BUCKET.get(key)
  if (object) {
    let r;
    if(!options.verbose){
      r = {
        type: 'file',
        path: key,
        size: object.size,
        updated: object.uploaded.toISOString(),
      }
    }else{
      r = {
        type: 'file',
        path: key,
        size: object.size,
        updated: object.uploaded.toISOString(),
        httpMetadata: object.httpMetadata,
        customMetadata: object.customMetadata,
        checksums: object.checksums,
        etag: object.etag,
      }
    }
    return new Response(JSON.stringify(r), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } else {
    const folder = await BUCKET.list({ prefix: key })
    if (folder && folder.objects.length > 0) {
      let files;
      if(!options.verbose){
        files = folder.objects.map((o) => o.key)
      }else{
        files = folder.objects.map((o) => {
          return {
            path: o.key,
            size: o.size,
            updated: o.uploaded.toISOString(),
            httpMetadata: o.httpMetadata,
            customMetadata: o.customMetadata,
            checksums: o.checksums,
            etag: o.etag,
          }
        })
      }
      const r = {
        type: 'folder',
        path: key,
        files: files,
      }
      return new Response(JSON.stringify(r), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ message: 'Object Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function deleteObject(key: string): Promise<Response> {
  if (!config.allowDelete) {
    return new Response(JSON.stringify({ message: 'Delete is not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const obj = await BUCKET.get(key)
  if (obj) {
    await BUCKET.delete(key)
    return new Response(JSON.stringify({ message: 'Object Deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } else {
    return new Response(JSON.stringify({ message: 'Object Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function handlePOST(request: Request): Promise<Response> {
  // If the key is a file, return it's information, including size, updated time, etc.
  // If the key is a folder, return the list of files in the folder.
  const key = getKey(request)

  const res = await validate(key, request)
  if (res !== null) return res

  let json: any
  try {
    json = await request.json()
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let action
  try {
    action = json.action
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Missing action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  switch (action) {
    case 'info':
      return await getInfo(key, json)
    case 'delete':
      return await deleteObject(key)
    default:
      return new Response(JSON.stringify({ message: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
  }
}
