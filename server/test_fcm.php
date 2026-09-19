<?php
/**
 * test_fcm.php — dev-only CLI script.
 *
 * Sends a test notification to the "invoice_updates" topic WITHOUT creating
 * an invoice, so you can verify Firebase + service-account + app registration
 * end to end before touching insertInvoice.php.
 *
 * Usage (on the server, from the directory containing this file):
 *   php test_fcm.php
 *
 * Expects the service-account JSON at ./secrets/service-account.json,
 * or set the env var first:
 *   FIREBASE_SERVICE_ACCOUNT_JSON=/path/to/key.json php test_fcm.php
 *
 * NOTE: delete this file (or block web access to it) before going live.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("CLI only.\n");
}

require_once __DIR__ . '/sendInvoiceNotification.php';

echo "FCM topic push test\n";
echo "-------------------\n";
echo "Service account : " . fcmServiceAccountPath() . "\n";
echo "Project         : " . fcmGetProjectId() . "\n";
echo "Topic           : " . FCM_TOPIC . "\n\n";

try {
    $result = fcmSendToTopic(
        FCM_TOPIC,
        'Test notification',
        'If you can read this, invoice pushes are working!',
        ['type' => 'invoice', 'invoiceId' => '0', 'invoice_number' => 'TEST']
    );

    echo $result['ok']
        ? "SUCCESS (HTTP {$result['status']})\n{$result['body']}\n"
        : "FAILED  (HTTP {$result['status']})\n{$result['body']}\n";
    exit($result['ok'] ? 0 : 1);
} catch (Throwable $e) {
    echo 'ERROR: ' . $e->getMessage() . "\n";
    exit(1);
}
