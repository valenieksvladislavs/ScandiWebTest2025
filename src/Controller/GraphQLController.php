<?php

declare(strict_types=1);

namespace App\Controller;

use App\GraphQL\Schema;
use GraphQL\GraphQL as GraphQLBase;
use GraphQL\Error\DebugFlag;

class GraphQLController {
    public function __construct(private \PDO $pdo)
    {}

    public function handle() {
        try {
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            $query = $input['query'] ?? null;
            $variables = $input['variables'] ?? null;

            if (!$query) {
                throw new \Exception('No query provided');
            }

            $result = GraphQLBase::executeQuery(
                Schema::get(),
                $query,
                null,
                ['pdo' => $this->pdo],
                $variables
            );

            $output = $result->toArray(DebugFlag::INCLUDE_DEBUG_MESSAGE);
        } catch (\Exception $e) {
            $output = [
                'errors' => [
                    'message' => $e->getMessage()
                ]
            ];
        }

        header('Content-Type: application/json; charset=UTF-8');
        return json_encode($output);
    }
}
