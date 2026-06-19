/**
 * usePushNotifications — manages browser push notification subscription.
 * Handles service worker registration, permission requests, and tRPC subscription sync.
 * ~90 lines
 */
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

type PushState = "unsupported" | "default" | "denied" | "granted" | "loading";

/** Convert a base64 VAPID key to Uint8Array for the Push API */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>("loading");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const subscribeMutation = trpc.pushNotifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.pushNotifications.unsubscribe.useMutation();

  // Check support and current permission on mount
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    setState(Notification.permission as PushState);

    // Check for existing subscription
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setSubscription(sub);
      });
    });
  }, []);

  /** Register SW and subscribe to push */
  const subscribe = useCallback(async () => {
    if (state === "unsupported" || state === "denied") return false;
    setState("loading");

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission as PushState);
        return false;
      }

      // Get VAPID public key from Vite env
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("[Push] VAPID public key not available");
        setState("default");
        return false;
      }

      // Subscribe to push manager
      const pushSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      // Send subscription to server
      const keys = pushSub.toJSON().keys!;
      await subscribeMutation.mutateAsync({
        endpoint: pushSub.endpoint,
        keys: { p256dh: keys.p256dh!, auth: keys.auth! },
      });

      setSubscription(pushSub);
      setState("granted");
      return true;
    } catch (err) {
      console.error("[Push] Subscribe error:", err);
      setState(Notification.permission as PushState);
      return false;
    }
  }, [state, subscribeMutation]);

  /** Unsubscribe from push */
  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    try {
      await unsubscribeMutation.mutateAsync({ endpoint: subscription.endpoint });
      await subscription.unsubscribe();
      setSubscription(null);
      setState("default");
    } catch (err) {
      console.error("[Push] Unsubscribe error:", err);
    }
  }, [subscription, unsubscribeMutation]);

  return {
    state,
    isSubscribed: !!subscription,
    subscribe,
    unsubscribe,
    isSupported: state !== "unsupported",
  };
}
