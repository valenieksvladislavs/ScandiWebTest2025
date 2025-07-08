<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Entity\Attribute;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class AttributeType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Attribute',
            'description' => 'Attribute type',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute ID',
                    'resolve' => fn(Attribute $attribute) => $attribute->getId()
                ],
                'displayValue' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute display value',
                    'resolve' => fn(Attribute $attribute) => $attribute->getDisplayValue()
                ],
                'value' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute value',
                    'resolve' => fn(Attribute $attribute) => $attribute->getValue()
                ]
            ]
        ]);
    }
} 