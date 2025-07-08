<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Entity\Category;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class CategoryType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Category',
            'description' => 'Category type',
            'fields' => [
                'name' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Category name',
                    'resolve' => fn(Category $category) => $category->getName()
                ]
            ]
        ]);
    }
}
