<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Entity\Price;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class PriceType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Price',
            'description' => 'Price type',
            'fields' => [
                'amount' => [
                    'type' => Type::nonNull(Type::float()),
                    'description' => 'Price amount',
                    'resolve' => fn(Price $price) => $price->getAmount()
                ],
                'currency' => [
                    'type' => new CurrencyType(),
                    'description' => 'Price currency',
                    'resolve' => fn(Price $price) => $price->getCurrency()
                ]
            ]
        ]);
    }
} 