// ============================================
// Send Push Notification Edge Function
// ============================================
// Handles sending Web Push notifications to users

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Import utility functions inline since Supabase doesn't support _shared folder imports
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = 'mailto:contact@extrahostelero.com'

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
  actions?: Array<{ action: string; title: string }>
  requireInteraction?: boolean
}

interface PushSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

async function sendWebPush(subscription: PushSubscription, payload: PushPayload): Promise<boolean> {
  try {
    const { default: webpush } = await import('https://esm.sh/web-push@3.6.6')
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth }
    }
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload), { TTL: 86400 })
    return true
  } catch (error: any) {
    console.error('Push send error:', error.message || error)
    return false
  }
}

async function getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)
    .eq('active', true)
  if (error) {
    console.error('Error fetching subscriptions:', error)
    return []
  }
  return data || []
}

async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const subscriptions = await getUserPushSubscriptions(userId)
  if (subscriptions.length === 0) {
    console.log(`No active push subscriptions for user ${userId}`)
    return
  }
  const results = await Promise.allSettled(subscriptions.map(sub => sendWebPush(sub, payload)))
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected' || (results[i] as any).value === false) {
      await supabase.from('push_subscriptions').update({ active: false }).eq('endpoint', subscriptions[i].endpoint)
    }
  }
}

function buildDeepLink(type: string, data: Record<string, any>): string {
  const baseUrl = Deno.env.get('APP_URL') || 'https://extrahostelero.com'
  switch (type) {
    case 'job_posted': return `${baseUrl}/?view=job&id=${data.job_id}`
    case 'new_message': return `${baseUrl}/?view=chat&user=${data.sender_id}${data.job_id ? '&job=' + data.job_id : ''}`
    case 'application_accepted': return `${baseUrl}/?view=job&id=${data.job_id}&tab=application`
    case 'application_rejected': return `${baseUrl}/?view=jobs`
    default: return baseUrl
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushRequest {
  type: 'job_posted' | 'new_message' | 'application_accepted' | 'application_rejected'
  user_ids: string[]  // can send to multiple users
  title: string
  body: string
  data: Record<string, any>
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const payload: PushRequest = await req.json()

    // Validate required fields
    if (!payload.type || !payload.user_ids || !payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, user_ids, title, body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Build deep link URL for this notification
    const deepLink = buildDeepLink(payload.type, payload.data)

    // Build notification payload
    const notification: PushPayload = {
      title: payload.title,
      body: payload.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: payload.type,
      data: {
        ...payload.data,
        url: deepLink,
        type: payload.type
      },
      requireInteraction: payload.type === 'application_accepted' // Keep important notifications visible
    }

    // Add action buttons based on notification type
    if (payload.type === 'new_message') {
      notification.actions = [
        { action: 'open', title: 'Abrir chat' }
      ]
    } else if (payload.type === 'job_posted') {
      notification.actions = [
        { action: 'view', title: 'Ver oferta' }
      ]
    } else if (payload.type === 'application_accepted') {
      notification.actions = [
        { action: 'view', title: 'Ver detalles' }
      ]
    }

    // Send push notification to all specified users
    const sendPromises = payload.user_ids.map(userId =>
      sendPushToUser(userId, notification)
    )

    await Promise.all(sendPromises)

    console.log(`Sent ${payload.type} notifications to ${payload.user_ids.length} user(s)`)

    return new Response(
      JSON.stringify({
        success: true,
        sent_to: payload.user_ids.length,
        type: payload.type
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error: any) {
    console.error('Error in send-push-notification:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
