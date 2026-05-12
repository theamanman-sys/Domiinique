<?php
/**
 * Receipt Upload Service
 * Securely handles the storage of payment screenshots on the local server.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Adjust if you want to restrict to your domain

// 1. Basic Security
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'POST protocol required']);
    exit;
}

if (!isset($_FILES['receipt']) || $_FILES['receipt']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'No valid transmission file found.']);
    exit;
}

// 2. Setup Directory
$uploadDir = 'receipts/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// 3. Validate File
$file = $_FILES['receipt'];
$fileType = mime_content_type($file['tmp_name']);
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

if (!in_array($fileType, $allowedTypes)) {
    echo json_encode(['status' => 'error', 'message' => 'Only JPEG, PNG and WEBP image protocols are accepted.']);
    exit;
}

// 4. Clean and Move File
$orderId = preg_replace('/[^A-Za-z0-9\-]/', '', $_POST['orderId'] ?? 'unknown');
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
if (!$extension) {
    $extension = ($fileType === 'image/jpeg') ? 'jpg' : (($fileType === 'image/png') ? 'png' : 'webp');
}

$fileName = $orderId . '_' . time() . '.' . $extension;
$targetPath = $uploadDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Generate the URL for the stored file
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $baseUrl = $protocol . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);
    $fileUrl = rtrim($baseUrl, '/') . '/' . $targetPath;

    echo json_encode([
        'status' => 'success',
        'message' => 'Transmission received',
        'url' => $fileUrl
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to synchronize file to local archive.']);
}
