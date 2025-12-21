import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BGx4P9lNctV2SU1MhWE87OYyT7KtM1HMGP8iy__REZX6Pa5jCxzuj_lsJKHfGGCqPdBaEBLjKAzw2GSKYF5TP60';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('usePushNotifications hook initialized');
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            console.log('Push is active Supported in this browser');
            setIsSupported(true);
            registerServiceWorker();
        } else {
            console.log('Push NOT supported');
            setLoading(false);
        }
    }, []);

    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        } finally {
            setLoading(false);
        }
    }

    async function subscribeToPush() {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            setSubscription(sub);

            // Send subscription to server
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sub),
            });

            return true;
        } catch (error) {
            console.error('Failed to subscribe to push:', error);
            // Permission denied usually
            return false;
        } finally {
            setLoading(false);
        }
    }

    async function unsubscribeFromPush() {
        setLoading(true);
        try {
            if (subscription) {
                // 1. Unsubscribe from browser
                await subscription.unsubscribe();

                // 2. Remove from backend
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });

                setSubscription(null);
            }
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
        } finally {
            setLoading(false);
        }
    }

    return {
        isSupported,
        subscription,
        subscribeToPush,
        unsubscribeFromPush,
        loading
    };
}
