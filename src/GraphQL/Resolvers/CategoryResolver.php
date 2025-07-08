<?php

declare(strict_types=1);

namespace App\GraphQL\Resolvers;

use App\Entity\Category;
use PDO;

class CategoryResolver
{
    public function __construct(private PDO $pdo) {}

    public function getCategories(): array
    {
        return Category::getAll($this->pdo);
    }
}
