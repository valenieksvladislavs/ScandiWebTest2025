<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;
use App\Config\Router;

// Get the request method and URI
$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Initialize database connection
$pdo = Database::getInstance()->getConnection();

// Initialize router and dispatch the request
$router = new Router($pdo);
$router->dispatch($httpMethod, $uri);
