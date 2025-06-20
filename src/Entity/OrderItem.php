<?php

namespace App\Entity;

use Ramsey\Uuid\Uuid;

class OrderItem extends BaseEntity
{
    private string $orderId;
    private string $productId;
    private string $name;
    private float $price;
    private int $quantity;
    private array $attributes = [];

    public function __construct(protected readonly \PDO $pdo)
    {
        $this->id = Uuid::uuid4()->toString();
    }

    public function getOrderId(): string { return $this->orderId; }
    public function setOrderId(string $orderId): self { $this->orderId = $orderId; return $this; }

    public function getProductId(): string { return $this->productId; }
    public function setProductId(string $productId): self { $this->productId = $productId; return $this; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    public function getPrice(): float { return $this->price; }
    public function setPrice(float $price): self { $this->price = $price; return $this; }

    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $quantity): self { $this->quantity = $quantity; return $this; }

    public function getAttributes(): array { return $this->attributes; }
    public function setAttributes(array $attributes): self { $this->attributes = $attributes; return $this; }

    protected static function getTableName(): string { return 'order_items'; }

    protected static function fromAssoc(\PDO $pdo, array $row, ?string $prefix = null): self
    {
        $prefix = $prefix ?? '';
        return (new self($pdo))
            ->setId($row["{$prefix}id"] ?? null)
            ->setOrderId($row["{$prefix}order_id"] ?? null)
            ->setProductId($row["{$prefix}product_id"] ?? null)
            ->setName($row["{$prefix}name"] ?? null)
            ->setPrice((float)($row["{$prefix}price"] ?? 0))
            ->setQuantity((int)($row["{$prefix}quantity"] ?? 1))
            ->setAttributes(json_decode($row["{$prefix}attributes"] ?? '[]', true));
    }

    protected function getDataForSave(): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->orderId,
            'product_id' => $this->productId,
            'name' => $this->name,
            'price' => $this->price,
            'quantity' => $this->quantity,
            'attributes' => json_encode($this->attributes),
        ];
    }
} 