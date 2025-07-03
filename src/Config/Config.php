<?php

namespace App\Config;

use Dotenv\Dotenv;

class Config
{
    private static ?Config $instance = null;
    private array $config = [];

    private function __construct()
    {
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->safeLoad();

        $this->config = [
            'db' => [
                'host' => $_ENV['DB_HOST'] ?? 'localhost',
                'name' => $_ENV['DB_NAME'] ?? 'scandiweb_test',
                'user' => $_ENV['DB_USER'] ?? 'root',
                'pass' => $_ENV['DB_PASS'] ?? '',
            ]
        ];
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get(string $key, $default = null)
    {
        return $this->config[$key] ?? $default;
    }
}
