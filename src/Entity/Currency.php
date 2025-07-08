<?php

declare(strict_types=1);

namespace App\Entity;

class Currency extends BaseEntity
{
    private string $label;

    private string $symbol;

    public function getLabel(): string
    {
        return $this->label;
    }

    public function setLabel(string $label): self
    {
        $this->label = $label;
        return $this;
    }

    public function getSymbol(): string
    {
        return $this->symbol;
    }

    public function setSymbol(string $symbol): self
    {
        $this->symbol = $symbol;
        return $this;
    }

    protected static function getTableName(): string
    {
        return 'currencies';
    }

    protected static function fromAssoc(\PDO $pdo, array $row, ?string $prefix = null): self
    {
        return (new self($pdo))
            ->setId($row["{$prefix}id"] ?? null)
            ->setLabel($row["{$prefix}label"] ?? null)
            ->setSymbol($row["{$prefix}symbol"] ?? null);
    }

    protected function getDataForSave(): array
    {
        return [
            'label' => $this->label,
            'symbol' => $this->symbol
        ];
    }
}
