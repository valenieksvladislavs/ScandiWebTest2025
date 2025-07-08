<?php

declare(strict_types=1);

namespace App\GraphQL\Resolvers;

use App\Entity\Product;
use PDO;

class ProductResolver
{
    public function __construct(private PDO $pdo)
    {
    }

    public function getProducts(?string $category = null): array
    {
        return Product::getAll($this->pdo, $category);
    }

    public function getProduct(string $id): ?Product
    {
        return Product::get($this->pdo, $id);
    }
}
