import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000']

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  
  const isAllowed = allowedOrigins.some(allowed => {
    if (allowed === '*') return true
    return origin === allowed
  })

  const response = NextResponse.next()
  
  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization')
  
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
