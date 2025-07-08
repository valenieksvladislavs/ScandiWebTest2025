<?php

declare(strict_types=1);

namespace App\Config;

use FastRoute\Dispatcher;
use FastRoute\RouteCollector;
use PDO;

use function FastRoute\simpleDispatcher;

class Router
{
    private Dispatcher $dispatcher;
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->dispatcher = simpleDispatcher(function (RouteCollector $r) {
            $r->post('/graphql', [\App\Controller\GraphQLController::class, 'handle']);
            $r->post('/graphql/', [\App\Controller\GraphQLController::class, 'handle']);
            $r->get('/graphql', [\App\Controller\GraphQLController::class, 'handle']);
            $r->get('/graphql/', [\App\Controller\GraphQLController::class, 'handle']);
            $r->get('/test', function () {
                return 'Test route works!';
            });
        });
    }

    public function dispatch(string $httpMethod, string $uri): void
    {
        $route = $this->dispatcher->dispatch($httpMethod, $uri);

        switch ($route[0]) {
            case Dispatcher::NOT_FOUND:
                header('HTTP/1.0 404 Not Found');
                echo json_encode(['error' => 'Not Found']);
                break;

            case Dispatcher::METHOD_NOT_ALLOWED:
                header('HTTP/1.0 405 Method Not Allowed');
                echo json_encode(['error' => 'Method Not Allowed']);
                break;

            case Dispatcher::FOUND:
                [$controller, $method] = $route[1];
                $vars = $route[2];

                $controllerInstance = new $controller($this->pdo);
                $result = $controllerInstance->$method();

                if ($result !== null) {
                    echo $result;
                }
                break;
        }
    }
}
