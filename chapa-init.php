<?php
/**
 * Chapa Payment Initialization Proxy
 * Handles the server-side API call to Chapa to avoid CORS issues.
 * Deploy this alongside your HTML files on cPanel.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'POST required']);
    exit;
}

// Chapa Secret Key (TEST MODE)
$secretKey = 'CHASECK_TEST-1Eo0K1QGElguTsqCiVSd0onAPbN1YUQE';

// Read incoming JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['amount']) || !isset($input['email']) || !isset($input['tx_ref'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

// Build payload for Chapa
$payload = [
    'amount'        => $input['amount'],
    'currency'      => $input['currency'] ?? 'ETB',
    'email'         => $input['email'],
    'first_name'    => $input['first_name'] ?? '',
    'last_name'     => $input['last_name'] ?? '',
    'phone_number'  => $input['phone_number'] ?? '',
    'tx_ref'        => $input['tx_ref'],
    'return_url'    => $input['return_url'] ?? '',
    'customization' => $input['customization'] ?? [
        'title' => 'Domiinique Living Signature',
        'description' => 'Order Payment'
    ]
];

// Call Chapa API
$jsonPayload = json_encode($payload);

if ($jsonPayload === false) {
    echo json_encode(['status' => 'error', 'message' => 'JSON encoding failed: ' . json_last_error_msg()]);
    exit;
}

$ch = curl_init('https://api.chapa.co/v1/transaction/initialize');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $jsonPayload, // Strictly string payload
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $secretKey,
        'Content-Type: application/json',
        'Accept: application/json'
    ],
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    // Log internal curl error
    file_put_contents('chapa_error.log', date('[Y-m-d H:i:s] ') . "CURL Error: " . $error . PHP_EOL, FILE_APPEND);
    echo json_encode(['status' => 'error', 'message' => 'Archive connection timeout.']);
    exit;
}

// Forward data back to frontend
// If Chapa returns an error (400+), we still want to see their message
if ($httpCode >= 400) {
    file_put_contents('chapa_error.log', date('[Y-m-d H:i:s] ') . "HTTP $httpCode - Response: " . $response . PHP_EOL, FILE_APPEND);
}

// Ensure the response is valid JSON before echoing
$chapaData = json_decode($response, true);
if (!$chapaData) {
    echo json_encode(['status' => 'error', 'message' => 'External system responded with malformed data.']);
    exit;
}

http_response_code($httpCode);
echo json_encode($chapaData);
