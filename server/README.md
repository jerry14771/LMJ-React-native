# Server-side push notifications for new invoices

Every device with the app installed subscribes to the FCM topic
`invoice_updates` on app startup. When `insertInvoice.php` successfully
creates an invoice, it calls `sendInvoiceNotification()`, which sends ONE
Firebase Cloud Message to that topic — every install receives it.

```
App (any user) ──creates invoice──▶ insertInvoice.php
                                        │ success
                                        ▼
                          sendInvoiceNotification()  ──▶ FCM topic
                                        │                 "invoice_updates"
                                        ▼
                     all devices with the app installed 🔔
```

## One-time setup

1. **Firebase project** — create at console.firebase.google.com, then add an
   **Android app** with package name `com.lmjorder` (must match
   `android/app/build.gradle` → `applicationId`). Download
   `google-services.json` and place it at `android/app/google-services.json`
   in the React Native project, then rebuild the app (native config changed).

2. **Service account key** — Firebase Console → Project Settings →
   Service accounts → *Generate new private key*. Save the JSON on this
   server, ideally outside the webroot, e.g.:
   `server/secrets/service-account.json` (create the folder; the default
   path in `sendInvoiceNotification.php` points there), or set
   `FIREBASE_SERVICE_ACCOUNT_JSON` env var. Never commit it to git —
   `server/secrets/` is git-ignored for you.

3. **PHP requirements** — only `openssl` + `curl` extensions (standard on
   every host). No composer packages needed.

## Integrating into insertInvoice.php

After the insert succeeds and you know the new row's id, add:

```php
require_once __DIR__ . '/sendInvoiceNotification.php';

try {
    sendInvoiceNotification([
        'invoice_number' => $invoice_number,
        'invoiceId'      => $conn->insert_id, // or however you get the id
        'name'           => $name,
        'totalAmount'    => $totalAmount,
        'metal'          => $metal, // optional
    ]);
} catch (Throwable $e) {
    error_log('[FCM] invoice notification failed: ' . $e->getMessage());
    // Intentionally swallow: a notification failure must never fail the insert.
}
```

Adjust variable names to whatever `insertInvoice.php` actually uses.

## Testing

```bash
# from this folder, with the key in place:
php test_fcm.php
```

Then check a device that has the (rebuilt) app installed — notification
should appear whether the app is foreground, background, or killed.

## Files

| File | Purpose |
|---|---|
| `sendInvoiceNotification.php` | FCM v1 sender: JWT auth, token cache, topic send |
| `test_fcm.php` | CLI smoke test, dev only — delete before production |
| `secrets/` | service-account JSON (git-ignored, create yourself) |
