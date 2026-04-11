import { handlers } from '@/lib/auth'

export async function GET(...args: Parameters<typeof handlers.GET>) {
  try {
    return await handlers.GET(...args)
  } catch (error) {
    console.error('[Auth GET Error]', error)
    return new Response(JSON.stringify({ error: 'Internal auth error', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(...args: Parameters<typeof handlers.POST>) {
  try {
    return await handlers.POST(...args)
  } catch (error) {
    console.error('[Auth POST Error]', error)
    return new Response(JSON.stringify({ error: 'Internal auth error', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
