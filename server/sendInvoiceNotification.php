<?php
/**
 * sendInvoiceNotification.php
 *
 * Sends a push notification to every device with the app installed via an
 * FCM topic broadcast (topic: "invoice_updates"). Each app install subscribes
 * to this topic on startup (see Components/Common/notificationService.js).
 *
 * Uses the FCM HTTP v1 API with service-account (JWT) authentication.
 * No composer packages required — only the openssl and curl PHP extensions,
 * which are available on virtually every shared host.
 *
 * SETUP (one time):
 *   1. Firebase Console -> Project Settings -> Service accounts ->
 *      "Generate new private key" -> save the JSON file on the server.
 *      Keep it OUTSIDE the webroot if possible.
 *   2. Set SERVICE_ACCOUNT_JSON below (server path) or define
 *      FIREBASE_SERVICE_ACCOUNT_JSON before including this file.
 *   3. No other config needed — the GCP project id is read from the
 *      service-account JSON itself.
 *
 * USAGE (from insertInvoice.php, after a successful insert):
 *   require_once __DIR__ . '/sendInvoiceNotification.php';
 *   try {
 *       sendInvoiceNotification([
 *           'invoice_number' => $invoice_number,
 *           'invoiceId'      => $conn->insert_id,
 *           'name'           => $name,
 *           'totalAmount'    => $totalAmount,
 *           'metal'          => $metal,
 *       ]);
 *   } catch (Throwable $e) {
 *       error_log('[FCM] invoice notification failed: ' . $e->getMessage());
 *   }
 *   // A notification failure must NEVER fail the invoice insert.
 */

if (!defined('SERVICE_ACCOUNT_JSON')) {
    /**
     * Server path to the Firebase service-account JSON key.
     * Override by defining FIREBASE_SERVICE_ACCOUNT_JSON before include.
     */
    define('SERVICE_ACCOUNT_JSON', __DIR__ . '/secrets/service-account.json');
}

define('FCM_OAUTH_TOKEN_URL', 'https://oauth2.googleapis.com/token');
define('FCM_SCOPE', 'https://www.googleapis.com/auth/firebase.messaging');
define('FCM_TOPIC', 'invoice_updates');
define('FCM_ANDROID_CHANNEL_ID', 'invoice_updates');

/**
 * Send a "new invoice" notification to all devices subscribed to the topic.
 *
 * @param array $invoice Associative array with keys:
 *   invoice_number, invoiceId, name, totalAmount [, metal]
 * @return array ['ok' => bool, 'status' => int, 'body' => string]
 * @throws Exception When credentials are missing or the HTTP call fails hard.
 */
function sendInvoiceNotification(array $invoice)
{
    $title = 'New Invoice #' . $invoice['invoice_number'];
    $body  = $invoice['name']
        . ' — Rs. ' . number_format((float) $invoice['totalAmount'], 0)
        . (!empty($invoice['metal']) ? ' (' . $invoice['metal'] . ')' : '');

    // FCM `data` payload values must be strings.
    $data = [
        'type'           => 'invoice',
        'invoiceId'      => (string) $invoice['invoiceId'],
        'invoice_number' => (string) $invoice['invoice_number'],
        'name'           => (string) $invoice['name'],
        'totalAmount'    => (string) $invoice['totalAmount'],
    ];

    return fcmSendToTopic(FCM_TOPIC, $title, $body, $data);
}

/**
 * Send an arbitrary notification to an FCM topic (HTTP v1 API).
 *
 * @return array ['ok' => bool, 'status' => int, 'body' => string]
 */
function fcmSendToTopic($topic, $title, $body, array $data = [])
{
    $projectId = fcmGetProjectId();

    $message = [
        'message' => [
            'topic'        => $topic,
            'notification' => ['title' => $title, 'body' => $body],
            'data'         => $data,
            'android'      => [
                'priority'    => 'HIGH',
                'notification' => ['channel_id' => FCM_ANDROID_CHANNEL_ID],
            ],
        ],
    ];

    $ch = curl_init('https://fcm.googleapis.com/v1/projects/' . $projectId . '/messages:send');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . fcmGetAccessToken(),
            'Content-Type: application/json; UTF-8',
        ],
        CURLOPT_POSTFIELDS     => json_encode($message),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);
    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        throw new Exception('FCM request failed: ' . $curlErr);
    }

    $ok = ($status >= 200 && $status < 300);
    if (!$ok) {
        // Non-fatal for the caller (they wrap us in try/catch), but log it.
        error_log('[FCM] send failed (HTTP ' . $status . '): ' . $response);
    }

    return ['ok' => $ok, 'status' => $status, 'body' => $response];
}

// ─── Authentication ──────────────────────────────────────────────────────────

/** Path to the service-account JSON, allowing runtime override. */
function fcmServiceAccountPath()
{
    if (function_exists('env') && env('FIREBASE_SERVICE_ACCOUNT_JSON')) {
        return env('FIREBASE_SERVICE_ACCOUNT_JSON');
    }
    if (getenv('FIREBASE_SERVICE_ACCOUNT_JSON')) {
        return getenv('FIREBASE_SERVICE_ACCOUNT_JSON');
    }
    return SERVICE_ACCOUNT_JSON;
}

/** Extract the GCP project id from the service-account JSON. */
function fcmGetProjectId()
{
    $sa = fcmLoadServiceAccount();
    if (empty($sa['project_id'])) {
        throw new Exception('service-account JSON is missing "project_id"');
    }
    return $sa['project_id'];
}

function fcmLoadServiceAccount()
{
    static $sa = null;
    if ($sa !== null) {
        return $sa;
    }
    $path = fcmServiceAccountPath();
    if (!is_readable($path)) {
        throw new Exception('Firebase service-account JSON not found at: ' . $path);
    }
    $sa = json_decode((string) file_get_contents($path), true);
    if (empty($sa['client_email']) || empty($sa['private_key'])) {
        throw new Exception('Invalid service-account JSON (missing client_email/private_key)');
    }
    return $sa;
}

/**
 * OAuth2 access token via service-account JWT, cached in the temp dir for
 * ~50 minutes (tokens are valid for 60).
 */
function fcmGetAccessToken()
{
    $cacheFile = sys_get_temp_dir() . '/fcm_token_cache_' . md5(fcmServiceAccountPath()) . '.json';

    if (is_readable($cacheFile)) {
        $cache = json_decode((string) file_get_contents($cacheFile), true);
        if (!empty($cache['token']) && !empty($cache['expiresAt']) && time() < ($cache['expiresAt'] - 60)) {
            return $cache['token'];
        }
    }

    $sa   = fcmLoadServiceAccount();
    $now  = time();
    $jwt  = fcmBase64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])) . '.'
          . fcmBase64UrlEncode(json_encode([
                'iss'   => $sa['client_email'],
                'scope' => FCM_SCOPE,
                'aud'   => FCM_OAUTH_TOKEN_URL,
                'iat'   => $now,
                'exp'   => $now + 3600,
            ]));

    $signature = '';
    openssl_sign($jwt, $signature, $sa['private_key'], 'sha256WithRSAEncryption');
    if (!$signature) {
        throw new Exception('Failed to sign service-account JWT');
    }
    $jwt .= '.' . fcmBase64UrlEncode($signature);

    $ch = curl_init(FCM_OAUTH_TOKEN_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);
    $resp = json_decode((string) curl_exec($ch), true);
    curl_close($ch);

    if (empty($resp['access_token'])) {
        throw new Exception('OAuth token exchange failed: ' . json_encode($resp));
    }

    @file_put_contents(
        $cacheFile,
        json_encode([
            'token'     => $resp['access_token'],
            'expiresAt' => $now + (int) ($resp['expires_in'] ?? 3600),
        ]),
        LOCK_EX
    );

    return $resp['access_token'];
}

function fcmBase64UrlEncode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
