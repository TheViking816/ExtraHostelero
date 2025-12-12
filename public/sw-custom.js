// ============================================
// Custom Service Worker for Push Notifications
// ============================================
// Handles push notification events and notification clicks

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event)

  if (!event.data) {
    console.log('[Service Worker] Push event but no data')
    return
  }

  // Parse notification data
  let notification
  try {
    notification = event.data.json()
  } catch (err) {
    // Fallback if JSON parsing fails
    notification = {
      title: 'ExtraHostelero',
      body: event.data.text(),
      icon: '/favicon.svg'
    }
  }

  const { title, body, icon, badge, tag, data, actions, requireInteraction } = notification

  // Show notification to user
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/favicon.svg',
      badge: badge || '/favicon.svg',
      tag: tag || 'default',
      data,
      actions,
      requireInteraction: requireInteraction || false,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      renotify: true, // Show notification even if tag matches existing one
    })
  )
})

// Listen for notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event)

  // Close the notification
  event.notification.close()

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/'
  const action = event.action

  console.log('[Service Worker] Opening URL:', urlToOpen, 'Action:', action)

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open in a window/tab
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Navigate to the URL and focus the window
            return client.focus().then(() => {
              return client.navigate(urlToOpen)
            })
          }
        }

        // No existing window - open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Listen for push subscription change events
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Service Worker] Push subscription changed')

  // Resubscribe to push notifications
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.VAPID_PUBLIC_KEY // This will be injected by the app
    })
      .then((subscription) => {
        console.log('[Service Worker] Resubscribed to push notifications')

        // Send new subscription to backend
        // Note: You would need to implement this endpoint or use Supabase client
        return fetch('/api/update-push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription.toJSON())
        })
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to resubscribe:', error)
      })
  )
})

// Log service worker activation
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated')
})

// Log service worker installation
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed')
  self.skipWaiting() // Activate immediately
})
