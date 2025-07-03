<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$static = __DIR__ . '/public' . $uri;
if (file_exists($static) && !is_dir($static)) {
    return false;
}

require __DIR__ . '/public/index.php';
