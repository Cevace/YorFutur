// public/sw.js

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png', // Zorg dat deze bestaat of gebruik een default
            badge: '/logo/Cevace-wit-logo.svg', // Klein icoontje voor android status bar
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.url || '/'
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Bekijk Vacatures',
                    icon: '/checkmark.png'
                },
                {
                    action: 'close',
                    title: 'Sluiten',
                    icon: '/xmark.png'
                },
            ]
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.');

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
