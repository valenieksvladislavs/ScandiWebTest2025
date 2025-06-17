<?php

namespace App\GraphQL\Types;

use App\Entity\AttributeSet;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class AttributeSetType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'AttributeSet',
            'description' => 'Attribute set type',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute set ID',
                    'resolve' => fn(AttributeSet $attributeSet) => $attributeSet->getId()
                ],
                'name' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute set name',
                    'resolve' => fn(AttributeSet $attributeSet) => $attributeSet->getName()
                ],
                'type' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute set type',
                    'resolve' => fn(AttributeSet $attributeSet) => $attributeSet->getType()
                ],
                'items' => [
                    'type' => Type::listOf(new AttributeType()),
                    'description' => 'Attribute items',
                    'resolve' => fn(AttributeSet $attributeSet) => $attributeSet->getAttributes()
                ]
            ]
        ]);
    }
} 