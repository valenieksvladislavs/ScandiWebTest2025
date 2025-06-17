<?php

namespace App\GraphQL;

use App\GraphQL\Resolvers\CategoryResolver;
use App\GraphQL\Types\CategoryType;
use App\GraphQL\Types\ProductType;
use App\GraphQL\Types\AttributeSetType;
use App\GraphQL\Types\AttributeType;
use App\GraphQL\Types\PriceType;
use App\GraphQL\Types\CurrencyType;
use App\GraphQL\Resolvers\ProductResolver;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema as GraphQLSchema;

class Schema
{
    private static ?GraphQLSchema $schema = null;
    private static ?CategoryType $categoryType = null;
    private static ?ProductType $productType = null;
    private static ?AttributeSetType $attributeSetType = null;
    private static ?AttributeType $attributeType = null;
    private static ?PriceType $priceType = null;
    private static ?CurrencyType $currencyType = null;

    public static function get(): GraphQLSchema
    {
        if (self::$schema === null) {
            self::$schema = new GraphQLSchema([
                'query' => new ObjectType([
                    'name' => 'Query',
                    'fields' => [
                        'categories' => [
                            'type' => Type::listOf(self::getCategoryType()),
                            'resolve' => function () {
                                $resolver = new CategoryResolver($GLOBALS['pdo']);
                                return $resolver->getCategories();
                            }
                        ],
                        'products' => [
                            'type' => Type::listOf(self::getProductType()),
                            'args' => [
                                'category' => [
                                    'type' => Type::string(),
                                    'description' => 'Filter products by category'
                                ]
                            ],
                            'resolve' => function ($root, $args) {
                                $resolver = new ProductResolver($GLOBALS['pdo']);
                                return $resolver->getProducts($args['category'] ?? null);
                            }
                        ],
                        'product' => [
                            'type' => self::getProductType(),
                            'args' => [
                                'id' => [
                                    'type' => Type::nonNull(Type::string()),
                                    'description' => 'Product ID'
                                ]
                            ],
                            'resolve' => function ($root, $args) {
                                $resolver = new ProductResolver($GLOBALS['pdo']);
                                return $resolver->getProduct($args['id']);
                            }
                        ]
                    ]
                ])
            ]);
        }

        return self::$schema;
    }

    public static function getCategoryType(): CategoryType
    {
        if (self::$categoryType === null) {
            self::$categoryType = new CategoryType();
        }
        return self::$categoryType;
    }

    public static function getProductType(): ProductType
    {
        if (self::$productType === null) {
            self::$productType = new ProductType();
        }
        return self::$productType;
    }

    public static function getAttributeSetType(): AttributeSetType
    {
        if (self::$attributeSetType === null) {
            self::$attributeSetType = new AttributeSetType();
        }
        return self::$attributeSetType;
    }

    public static function getAttributeType(): AttributeType
    {
        if (self::$attributeType === null) {
            self::$attributeType = new AttributeType();
        }
        return self::$attributeType;
    }

    public static function getPriceType(): PriceType
    {
        if (self::$priceType === null) {
            self::$priceType = new PriceType();
        }
        return self::$priceType;
    }

    public static function getCurrencyType(): CurrencyType
    {
        if (self::$currencyType === null) {
            self::$currencyType = new CurrencyType();
        }
        return self::$currencyType;
    }
}
