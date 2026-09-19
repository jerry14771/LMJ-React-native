import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  subscribeToTopic,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

const messaging = getMessaging(getApp());

/**
 * Push notification service — FCM topic broadcast.
 *
 * Every app install subscribes to the `invoice_updates` topic at startup.
 * The PHP backend sends one FCM message to that topic whenever a new
 * invoice is inserted (see sendInvoiceNotification.php), so every device
 * with the app installed receives a notification.
 */

export const INVOICE_TOPIC = 'invoice_updates';
export const ANDROID_CHANNEL_ID = 'jewelry_orders';
export const NOTIFICATION_COLOR = '#C9A227';
export const NOTIFICATION_SOUND = 'notification_sound';

// ─── Channel (Android 8+ requires a channel for heads-up display) ────────────
export async function createNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'New Jewelry Orders',
    description: 'New orders created on the admin app',
    importance: AndroidImportance.HIGH,
    sound: NOTIFICATION_SOUND,
    color: NOTIFICATION_COLOR,
  });
}

// ─── Permission + topic subscription ─────────────────────────────────────────
export async function registerForNotifications() {
  try {
    // Notifee's requestPermission handles the Android 13+ POST_NOTIFICATIONS
    // runtime dialog (and is a no-op on older Android versions).
    await notifee.requestPermission();

    // Play-services availability is checked by FCM itself; if the device has
    // none, these calls reject and we swallow the error below so the app
    // keeps working without push.
    await registerDeviceForRemoteMessages(messaging);
    await subscribeToTopic(messaging, INVOICE_TOPIC);
    await createNotificationChannel();
  } catch (e) {
    // Never crash or block startup over notifications.
    console.warn('[notifications] registration skipped:', e?.message || e);
  }
}

// ─── Foreground: FCM delivers to onMessage → show a local notification ───────
export function registerForegroundHandler(onPressInvoice) {
  return onMessage(messaging, async (remoteMessage) => {
    const data = remoteMessage?.data || {};
    if (data.type !== 'invoice') return;

    try {
      await notifee.displayNotification({
        title: remoteMessage?.notification?.title || 'New Jewelry Order',
        body: remoteMessage?.notification?.body || 'A new order was created',
        data: { invoiceId: data.invoiceId || '', invoice_number: data.invoice_number || '' },
        android: {
          channelId: ANDROID_CHANNEL_ID,
          smallIcon: 'ic_notification',
          color: NOTIFICATION_COLOR,
          sound: NOTIFICATION_SOUND,
          timestamp: Date.now(),
          pressAction: { id: 'default' },
        },
      });
    } catch (e) {
      console.warn('[notifications] display failed:', e?.message || e);
    }
  });
}

// ─── Tap handling (background → app open, and cold start) ────────────────────
export function registerNotificationOpenedHandlers(onPressInvoice) {
  // App was in background; user tapped the notification.
  onNotificationOpenedApp(messaging, (remoteMessage) => {
    _handleTap(remoteMessage, onPressInvoice);
  });

  // App was killed; tap launched it fresh.
  getInitialNotification(messaging)
    .then((remoteMessage) => {
      if (remoteMessage) _handleTap(remoteMessage, onPressInvoice);
    })
    .catch(() => { });
}

function _handleTap(remoteMessage, onPressInvoice) {
  const data = remoteMessage?.data || {};
  if (data.type !== 'invoice') return;
  if (typeof onPressInvoice === 'function') {
    onPressInvoice({ invoiceId: data.invoiceId, invoice_number: data.invoice_number });
  }
}