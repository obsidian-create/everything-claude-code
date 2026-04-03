<?php
/**
 * contact.php — Obsidian Global Events
 * Simple mail handler, compatible with IONOS shared hosting.
 *
 * ✏️ Customise:
 *   RECIPIENT_EMAIL → your email address
 *   FROM_NAME       → sender label in inbox
 *   SITE_URL        → your domain for CORS check
 */

// ── Config ────────────────────────────────────────────────
define('RECIPIENT_EMAIL', 'office@oge.ae');           // ✏️ change
define('FROM_NAME',       'Obsidian Global Events Website');
define('SITE_URL',        'https://www.oge.ae');       // ✏️ change
define('RATE_LIMIT_FILE', sys_get_temp_dir() . '/oge_contact_rate.json');
define('MAX_REQUESTS_PER_HOUR', 10);

// ── CORS / method check ───────────────────────────────────
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Rate limiting (simple file-based) ────────────────────
function checkRateLimit(): bool {
    $ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $data = [];

    if (file_exists(RATE_LIMIT_FILE)) {
        $raw = file_get_contents(RATE_LIMIT_FILE);
        $data = json_decode($raw, true) ?: [];
    }

    $now  = time();
    $hour = 3600;

    // Remove old entries
    $data = array_filter($data, fn($t) => ($now - $t) < $hour);

    $ipHits = array_filter($data, fn($t, $k) => str_starts_with($k, $ip . '_'), ARRAY_FILTER_USE_BOTH);
    if (count($ipHits) >= MAX_REQUESTS_PER_HOUR) return false;

    $data[$ip . '_' . $now] = $now;
    file_put_contents(RATE_LIMIT_FILE, json_encode($data));
    return true;
}

if (!checkRateLimit()) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please try again later.']);
    exit;
}

// ── Sanitise input ────────────────────────────────────────
function clean(string $val): string {
    return strip_tags(trim($val));
}

$name       = clean($_POST['name']       ?? '');
$email      = clean($_POST['email']      ?? '');
$phone      = clean($_POST['phone']      ?? '');
$eventType  = clean($_POST['event_type'] ?? '');
$message    = clean($_POST['message']    ?? '');
$consent    = isset($_POST['consent'])  && $_POST['consent'] === 'on';

// ── Validate ──────────────────────────────────────────────
$errors = [];

if (empty($name))    $errors[] = 'Name is required.';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))
                     $errors[] = 'Valid email is required.';
if (empty($message)) $errors[] = 'Message is required.';
if (!$consent)       $errors[] = 'Consent is required.';

// Block obviously spammy content
$spamPatterns = ['http://', 'https://', 'www.', 'click here', 'buy now', 'casino'];
foreach ($spamPatterns as $pattern) {
    if (stripos($message, $pattern) !== false) {
        $errors[] = 'Message contains disallowed content.';
        break;
    }
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['errors' => $errors]);
    exit;
}

// ── Build email ───────────────────────────────────────────
$subject = "New Enquiry from {$name} — Obsidian Global Events";

$body = "You have received a new enquiry via the website contact form.\n\n"
      . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      . "Name:       {$name}\n"
      . "Email:      {$email}\n"
      . "Phone:      " . ($phone ?: '—') . "\n"
      . "Event Type: " . ($eventType ?: '—') . "\n"
      . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
      . "Message:\n{$message}\n\n"
      . "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      . "Sent: " . date('Y-m-d H:i:s T') . "\n"
      . "IP:   " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

// Safe headers — no injection possible as email is validated above
$headers  = "From: " . FROM_NAME . " <noreply@oge.ae>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";

// ── Send ──────────────────────────────────────────────────
$sent = mail(RECIPIENT_EMAIL, $subject, $body, $headers);

if ($sent) {
    http_response_code(200);
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Mail delivery failed. Please email us directly.']);
}
