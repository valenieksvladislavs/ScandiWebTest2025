<?php

declare(strict_types=1);

namespace App\Entity;

class Attribute extends BaseEntity
{
    private string $displayValue;
    
    private string $value;
    
    private string $attributeSetId;

    public function getDisplayValue(): string
    {
        return $this->displayValue;
    }

    public function setDisplayValue(string $displayValue): self
    {
        $this->displayValue = $displayValue;
        return $this;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function setValue(string $value): self
    {
        $this->value = $value;
        return $this;
    }

    public function getAttributeSetId(): string
    {
        return $this->attributeSetId;
    }

    public function setAttributeSetId(string $attributeSetId): self
    {
        $this->attributeSetId = $attributeSetId;
        return $this;
    }

    protected static function getTableName(): string
	{
		return 'attributes';
	}

	protected static function fromAssoc(\PDO $pdo, array $row, ?string $prefix = null): self
	{
		return (new self($pdo))
			->setId($row["{$prefix}id"] ?? null)
			->setDisplayValue($row["{$prefix}display_value"] ?? null)
			->setValue($row["{$prefix}value"] ?? null)
            ->setAttributeSetId($row["{$prefix}attribute_set_id"] ?? null);
	}

	protected function getDataForSave(): array
	{
		return [
			'display_value' => $this->displayValue,
			'value' => $this->value,
			'attribute_set_id' => $this->attributeSetId
		];
	}
}
