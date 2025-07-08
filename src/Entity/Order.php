<?php

declare(strict_types=1);

namespace App\Entity;

use Ramsey\Uuid\Uuid;

class Order extends BaseEntity
{
    private float $total;
    private string $status;
    private string $createdAt;

    public function __construct(protected readonly \PDO $pdo)
    {
        $this->id = Uuid::uuid4()->toString();
    }

    public function getTotal(): float { return $this->total; }
    public function setTotal(float $total): self { $this->total = $total; return $this; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }

    public function getCreatedAt(): string { return $this->createdAt; }
    public function setCreatedAt(string $createdAt): self { $this->createdAt = $createdAt; return $this; }

    protected static function getTableName(): string { return 'orders'; }

    protected static function fromAssoc(\PDO $pdo, array $row, ?string $prefix = null): self
    {
        $prefix = $prefix ?? '';
        return (new self($pdo))
            ->setId($row["{$prefix}id"] ?? null)
            ->setTotal((float)($row["{$prefix}total"] ?? 0))
            ->setStatus($row["{$prefix}status"] ?? '')
            ->setCreatedAt($row["{$prefix}created_at"] ?? '');
    }

    protected function getDataForSave(): array
    {
        return [
            'id' => $this->id,
            'total' => $this->total,
            'status' => $this->status,
            'created_at' => $this->createdAt,
        ];
    }
}
