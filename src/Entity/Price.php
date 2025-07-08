<?php

declare(strict_types=1);

namespace App\Entity;

class Price extends BaseEntity
{
    private float $amount;
    
    private string $currencyId;

    private string $productId;

    private Currency $currency;

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): self
    {
        $this->amount = $amount;
        return $this;
    }

    public function getCurrencyId(): string
    {
        return $this->currencyId;
    }

    public function setCurrencyId(string $currencyId): self
    {
        $this->currencyId = $currencyId;
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

    public function getCurrency(): Currency
    {
        return $this->currency;
    }
    
    public function setCurrency(Currency $currency): self
    {
        $this->currency = $currency;
        return $this;
    }

    protected static function getTableName(): string
	{
		return 'prices';
	}

	protected static function fromAssoc(\PDO $pdo, array $row, ?string $prefix = null): self
	{
		return (new self($pdo))
			->setId($row["{$prefix}id"] ?? null)
			->setAmount(floatval($row["{$prefix}amount"] ?? null))
            ->setCurrencyId($row["{$prefix}currency_id"] ?? null)
            ->setProductId($row["{$prefix}product_id"] ?? null);
	}

	protected function getDataForSave(): array
	{
		return [
			'amount' => $this->amount,
			'currency_id' => $this->currencyId,
			'product_id' => $this->productId
		];
	}
}
