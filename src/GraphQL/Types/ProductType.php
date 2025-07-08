<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Entity\Product;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class ProductType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Product',
            'description' => 'Product type',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Product ID',
                    'resolve' => fn(Product $product) => $product->getId()
                ],
                'name' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Product name',
                    'resolve' => fn(Product $product) => $product->getName()
                ],
                'brand' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Product brand',
                    'resolve' => fn(Product $product) => $product->getBrand()
                ],
                'inStock' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => 'Product availability',
                    'resolve' => fn(Product $product) => $product->getInStock()
                ],
                'gallery' => [
                    'type' => Type::listOf(Type::string()),
                    'description' => 'Product gallery images',
                    'resolve' => fn(Product $product) => $product->getGallery()
                ],
                'description' => [
                    'type' => Type::string(),
                    'description' => 'Product description',
                    'resolve' => fn(Product $product) => $product->getDescription()
                ],
                'category' => [
                    'type' => Type::string(),
                    'description' => 'Product category',
                    'resolve' => fn(Product $product) => $product->getCategory()->getName()
                ],
                'attributes' => [
                    'type' => Type::listOf(new AttributeSetType()),
                    'description' => 'Product attributes',
                    'resolve' => fn(Product $product) => $product->getAttributes()
                ],
                'prices' => [
                    'type' => Type::listOf(new PriceType()),
                    'description' => 'Product prices',
                    'resolve' => fn(Product $product) => $product->getPrices()
                ]
            ]
        ]);
    }
} 