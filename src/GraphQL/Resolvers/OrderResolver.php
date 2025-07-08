<?php

declare(strict_types=1);

namespace App\GraphQL\Resolvers;

use App\Entity\Order;
use App\Entity\OrderItem;
use PDO;

class OrderResolver
{
    public function __construct(private PDO $pdo) {}

    /**
     * @param array $items
     * @return bool
     */
    public function createOrder(array $items): bool
    {
        $this->pdo->beginTransaction();
        try {
            $total = 0;
            foreach ($items as $item) {
                $total += $item['price'] * $item['quantity'];
            }
            $order = new Order($this->pdo);
            $order->setTotal($total)
                ->setStatus('pending')
                ->setCreatedAt(date('Y-m-d H:i:s'));
            $order->save();

            foreach ($items as $item) {
                $orderItem = new OrderItem($this->pdo);
                $orderItem->setOrderId($order->getId())
                    ->setProductId($item['productId'])
                    ->setName($item['name'])
                    ->setPrice($item['price'])
                    ->setQuantity($item['quantity'])
                    ->setAttributes($item['attributes'] ?? []);
                $orderItem->save();
            }
            $this->pdo->commit();
            return true;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            return false;
        }
    }
}
