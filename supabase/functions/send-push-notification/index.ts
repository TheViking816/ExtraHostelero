// ============================================
// Supabase Edge Function - Push Notification Relay
// ============================================
// Este edge function actúa como RELAY/PROXY
// Recibe llamadas de los triggers DB y las reenvía al backend Node.js en Vercel

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const PUSH_BACKEND_URL = Deno.env.get('PUSH_BACKEND_URL')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushRequest {
  type: 'job_posted' | 'new_message' | 'application_accepted' | 'application_rejected'
  user_ids: string[]
  title: string
  body: string
  data: Record<string, any>
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: PushRequest = await req.json()

    // Validar campos requeridos
    if (!payload.type || !payload.user_ids || !payload.title || !payload.body) {
      console.error('Missing required fields:', payload)
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Edge Relay] Forwarding ${payload.type} to ${payload.user_ids.length} user(s)`)
    console.log(`[Edge Relay] Backend URL: ${PUSH_BACKEND_URL}`)

    // Reenviar al backend Node.js en Vercel
    const response = await fetch(PUSH_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log(`[Edge Relay] Backend response status: ${response.status}`)

    // Verificar content-type antes de parsear como JSON
    const contentType = response.headers.get('content-type')
    console.log(`[Edge Relay] Backend content-type: ${contentType}`)

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error(`[Edge Relay] Backend returned non-JSON: ${text.substring(0, 200)}`)
      return new Response(
        JSON.stringify({ error: 'Backend returned non-JSON response', details: text.substring(0, 500) }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()

    if (!response.ok) {
      console.error('[Edge Relay] Backend error:', result)
      return new Response(
        JSON.stringify({ error: 'Backend error', details: result }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Edge Relay] Success:`, result)

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('[Edge Relay] Error:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
