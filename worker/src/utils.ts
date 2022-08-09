import { config } from './config'

export function getKey(req: Request): string {
  const url = new URL(req.url)
  return url.pathname.slice(1)
}

export async function validate(
  key: string,
  request: Request,
): Promise<Response | null> {
  if (!request.headers.has('Date')) {
    const r = {
      message: 'Missing Header: Date',
      path: key,
    }
    return new Response(JSON.stringify(r), { status: 400 })
  } else if (!request.headers.has('Authorization')) {
    const r = {
      message: 'Missing Header: Authorization',
      path: key,
    }
    return new Response(JSON.stringify(r), { status: 401 })
  } else {
    // The time should be the last 45 seconds
    const now = new Date()
    const reqTime = new Date(request.headers.get('Date') as string)
    const diff = now.getTime() - reqTime.getTime()
    if (diff > 45000) {
      const r = {
        message:
          'Time is more than 45 seconds old. Check if you are using utc time and retry.',
        path: key,
      }
      return new Response(JSON.stringify(r), { status: 403 })
    }

    // validate auth
    const toHash = (request.headers.get('Date') as string) + key + UPLOAD_SECRET
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(toHash),
    )
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    if (
      `Bearer ${hashHex}` != (request.headers.get('Authorization') as string)
    ) {
      const r = {
        message: 'Authorization failed.',
        path: key,
      }
      return new Response(JSON.stringify(r), { status: 403 })
    }

    // check if path is allowed
    if (!config.allowPaths.some((p) => key.startsWith(p))) {
      const r = {
        message: 'Requested path is not allowed.',
        path: key,
      }
      return new Response(JSON.stringify(r), { status: 403 })
    }
    return null
  }
}
