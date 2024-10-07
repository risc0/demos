import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import env from "./env"

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authParts = basicAuth.split(' ')
    if (authParts.length === 2) {
      const auth = authParts[1]
      const decodedAuth = atob(auth)
      const [user, pwd] = decodedAuth.split(':')

      if (user === 'root' && pwd === env.PASSWORD) {
        return NextResponse.next()
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Enter root as username and password"',
    },
  })
}
