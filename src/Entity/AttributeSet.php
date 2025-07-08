<?php

declare(strict_types=1);

namespace App\Entity;

class AttributeSet extends BaseEntity
{
    private string $name;

    private string $type;

    private string $productId;

    /**
     * @var array<int, Attribute>
     */
    private array $attributes = [];

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getProductId(): string
    {
        return $this->productId;
    }

    public function setProductId(string $productId): self
    {
        $this->productId = $productId;
        return $this;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function addAttribute(Attribute $attribute): self
    {
        $this->attributes[] = $attribute;
        return $this;
    }

    public function removeAttribute(Attribute $attribute): self
    {
        $this->attributes = array_filter($this->attributes, function ($a) use ($attribute) {
            return $a->getId() !== $attribute->getId();
        });
        return $this;
    }

    protected static function getTableName(): string
    {
        return 'attribute_sets';
    }

    protected static function fromAssoc(\PDO $pdo, array $row, ?string $prefix = null): self
    {
        return (new self($pdo))
            ->setId($row["{$prefix}id"] ?? null)
            ->setName($row["{$prefix}name"] ?? null)
            ->setType($row["{$prefix}type"] ?? null)
            ->setProductId($row["{$prefix}product_id"] ?? null);
    }

    protected function getDataForSave(): array
    {
        return [
            'name' => $this->name,
            'type' => $this->type,
            'product_id' => $this->productId
        ];
    }
}
