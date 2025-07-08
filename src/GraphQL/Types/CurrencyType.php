<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Entity\Currency;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class CurrencyType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Currency',
            'description' => 'Currency type',
            'fields' => [
                'label' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Currency label',
                    'resolve' => fn(Currency $currency) => $currency->getLabel()
                ],
                'symbol' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Currency symbol',
                    'resolve' => fn(Currency $currency) => $currency->getSymbol()
                ]
            ]
        ]);
    }
} 