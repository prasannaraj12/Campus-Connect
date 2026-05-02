import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from './use-auth'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export type PushStatus = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

export function usePush() {
  const { user } = useAuth()
  const [status, setStatus] = useState<PushStatus>('loading')
  const saveSubscription = useMutation(api.push.saveSubscription)
  const removeSubscription = useMutation(api.push.removeSubscription)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      console.error('VAPID_PUBLIC_KEY not set')
      return
    }
    setStatus('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const key = sub.getKey('p256dh')
      const authKey = sub.getKey('auth')

      if (!key || !authKey) throw new Error('Missing push keys')

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

      await saveSubscription({
        userId: user?.userId,
        endpoint: sub.endpoint,
        p256dh,
        auth,
      })

      setStatus('subscribed')
    } catch (err) {
      console.error('Push subscribe failed:', err)
      setStatus('unsubscribed')
    }
  }

  const unsubscribe = async () => {
    setStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await removeSubscription({ endpoint: sub.endpoint })
        await sub.unsubscribe()
      }
      setStatus('unsubscribed')
    } catch (err) {
      console.error('Push unsubscribe failed:', err)
      setStatus('subscribed')
    }
  }

  return { status, subscribe, unsubscribe }
}
