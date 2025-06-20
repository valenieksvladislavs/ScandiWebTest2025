<?php
namespace App\Entity;

class Product extends BaseEntity
{
    private string $brand;
    
    private string $name;
    
    private bool $inStock;
    
    private array $gallery = [];
    
    private ?string $description = null;
    
    private string $categoryId;

    private Category $category;

    /**
     * @var array<int, Attribute>
     */
    private array $attributes = [];

    /**
     * @var array<int, Price>
     */
    private array $prices = [];

    public function getBrand(): string
    {
        return $this->brand;
    }

    public function setBrand(string $brand): self
    {
        $this->brand = $brand;
        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getInStock(): bool
    {
        return $this->inStock;
    }

    public function setInStock(bool $inStock): self
    {
        $this->inStock = $inStock;
        return $this;
    }

    public function getGallery(): array
    {
        return $this->gallery;
    }

    public function setGallery(array $gallery): self
    {
        $this->gallery = $gallery;
        return $this;
    }

    public function getCategoryId(): string
    {
        return $this->categoryId;
    }

    public function setCategoryId(string $categoryId): self
    {
        $this->categoryId = $categoryId;
        return $this;
    }

    public function getCategory(): Category
    {
        return $this->category;
    }

    public function setCategory(Category $category): self
    {
        $this->category = $category;
        return $this;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function addAttribute(AttributeSet $attributeSet): self
    {
        $this->attributes[] = $attributeSet;
        return $this;
    }

    public function removeAttribute(Attribute $attribute): self
    {
        $this->attributes = array_filter($this->attributes, function ($a) use ($attribute) {
            return $a->getId() !== $attribute->getId();
        });
        return $this;
    }

    public function getPrices(): array
    {
        return $this->prices;
    }

    public function addPrice(Price $price): self
    {
        $this->prices[] = $price;
        return $this;
    }

    public function removePrice(Price $price): self
    {
        $this->prices = array_filter($this->prices, function ($p) use ($price) {
            return $p->getId() !== $price->getId();
        });
        return $this;
    }

    protected static function getTableName(): string
	{
		return 'products';
	}

	protected static function fromAssoc(\PDO $pdo, array $row, ?string $prefix = null): self
	{
		return (new self($pdo))
			->setId($row["{$prefix}id"] ?? '')
            ->setBrand($row["{$prefix}brand"] ?? '')
			->setName($row["{$prefix}name"] ?? '')
            ->setInStock(!!$row["{$prefix}in_stock"] ?? false)
            ->setDescription($row["{$prefix}description"] ?? null)
            ->setGallery(json_decode($row["{$prefix}gallery"] ?? ''))
            ->setCategoryId($row["{$prefix}category_id"] ?? '');
	}

	protected function getDataForSave(): array
	{
		return [
			'brand' => $this->brand,
			'name' => $this->name,
			'in_stock' => (int)$this->inStock,
			'description' => $this->description,
			'gallery' => json_encode($this->gallery),
			'category_id' => $this->categoryId
		];
	}
    
    private static function hydrateFromRows(\PDO $pdo, array $rows): array
    {
        if (!$rows || count($rows) === 0) {
            return [];
        }

        $productsAcc = [];
        $categoriesAcc = [];
        $attributeSetsAcc = [];
        $currenciesAcc = [];

        $priceIds = [];

        foreach ($rows as $row) {
            $pid = $row['p_id'];
            if (!$product = $productsAcc[$pid] ?? null) {
                $product = self::fromAssoc($pdo, $row, 'p_');
                $productsAcc[$pid] = $product;
            }

            $cid = $row['c_id'];
            if (!$category = $categoriesAcc[$cid] ?? null) {
                $category = Category::fromAssoc($pdo, $row, 'c_');
                $categoriesAcc[$cid] = $category;
            }

            $product->setCategory($category);

            if ($asId = $row['as_id'] ?? null) {
                if (!$attributeSet = $attributeSetsAcc[$asId] ?? null) {
                    $attributeSet = AttributeSet::fromAssoc($pdo, $row, 'as_');
                    $attributeSetsAcc[$asId] = $attributeSet;
                    $product->addAttribute($attributeSet);
                }
                
                if (isset($row['ai_id']) && !empty($row['ai_id'])) {
                    $attributeItem = Attribute::fromAssoc($pdo, $row, 'ai_');
                    $attributeSet->addAttribute($attributeItem);
                }
            }

            $priceId = $row['pr_id'] ?? null;
            if ($priceId && !in_array($priceId, $priceIds)) {
                $price = Price::fromAssoc($pdo, $row, 'pr_');
                
                $curId = $row['cur_id'];
                if (!$currency = $currenciesAcc[$curId] ?? null) {
                    $currency = Currency::fromAssoc($pdo, $row, 'cur_');
                    $currenciesAcc[$curId] = $currency;
                }

                $price->setCurrency($currency);
                $product->addPrice($price);

                $priceIds[] = $priceId;
            }
        }

        return array_values($productsAcc);
    }

    private static function getBaseQuery(): string
    {
        return <<<SQL
            SELECT
                p.id                AS p_id,
                p.name              AS p_name,
                p.in_stock          AS p_in_stock,
                p.description       AS p_description,
                p.gallery           AS p_gallery,
                p.brand             AS p_brand,
                p.category_id       AS p_category_id,

                c.id                AS c_id,
                c.name              AS c_name,

                pr.id               AS pr_id,
                pr.amount           AS pr_amount,
                pr.product_id       AS pr_product_id,
                pr.currency_id      AS pr_currency_id,

                cur.id              AS cur_id,
                cur.label           AS cur_label,
                cur.symbol          AS cur_symbol,

                attr_set.id         AS as_id,
                attr_set.name       AS as_name,
                attr_set.type       AS as_type,
                attr_set.product_id AS as_product_id,

                ai.id               AS ai_id,
                ai.display_value    AS ai_display_value,
                ai.value            AS ai_value,
                ai.attribute_set_id AS ai_attribute_set_id

            FROM products p
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN prices pr ON pr.product_id = p.id
            LEFT JOIN currencies cur ON pr.currency_id = cur.id
            LEFT JOIN attribute_sets attr_set ON attr_set.product_id = p.id
            LEFT JOIN attributes ai ON ai.attribute_set_id = attr_set.id
            SQL;
    }

    public static function get(\PDO $pdo, string $id): ?self
    {
        $sql = self::getBaseQuery() . " WHERE p.id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $products = self::hydrateFromRows($pdo, $rows);
        return $products[0] ?? null;
    }

    public static function getAll(\PDO $pdo, ?string $categoryId = null): array
    {
        $sql = self::getBaseQuery();
        $params = [];

        if ($categoryId !== null) {
            $sql .= " WHERE p.category_id = :category_id";
            $params['category_id'] = $categoryId;
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return self::hydrateFromRows($pdo, $rows);
    }
}
