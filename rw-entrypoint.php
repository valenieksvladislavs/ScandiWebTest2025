<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET,POST,OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit;
}

$static = __DIR__ . '/frontend/dist' . $uri;
if (file_exists($static) && !is_dir($static)) {
    return false;
}

$apiPrefixes = [
    '/graphql',
];
foreach ($apiPrefixes as $prefix) {
    if (strpos($uri, $prefix) === 0) {
        require __DIR__ . '/public/index.php';
        exit;
    }
}

require __DIR__ . '/frontend/dist/index.html';
