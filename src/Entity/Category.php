<?php

namespace App\Entity;

class Category extends BaseEntity
{
	private string $name;

	public function getName(): string
	{
		return $this->name;
	}

	public function setName(string $name): self
	{
		$this->name = $name;
		return $this;
	}
	
	protected static function getTableName(): string
	{
		return 'categories';
	}

	protected static function fromAssoc(\PDO $pdo, array $row, ?string $prefix = null): self
	{
		return (new self($pdo))
			->setId($row["{$prefix}id"] ?? null)
			->setName($row["{$prefix}name"] ?? null);
	}

	protected function getDataForSave(): array
	{
		return [
			'name' => $this->name
		];
	}
}
