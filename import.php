<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Config\Database;
use App\Entity\Category;
use App\Entity\Product;
use App\Entity\AttributeSet;
use App\Entity\Attribute;
use App\Entity\Price;
use App\Entity\Currency;
use Ramsey\Uuid\Uuid;

// Database connection
$pdo = Database::getInstance()->getConnection();

// Read and decode JSON data
$jsonData = json_decode(file_get_contents(__DIR__ . '/data/data.json'), true);
$data = $jsonData['data'];

// Import categories
$categories = [];
foreach ($data['categories'] as $categoryData) {
    if ($categoryData['name'] === 'all') {
        continue;
    }

    $category = new Category($pdo);
    $category->setId($categoryData['name']);
    $category->setName($categoryData['name']);
    $category->save();
    $categories[$categoryData['name']] = $category;
}

// Import currencies (USD is the only one in the data)
$currency = new Currency($pdo);
$currency->setId('USD');
$currency->setLabel('USD');
$currency->setSymbol('$');
$currency->save();

// Import products
foreach ($data['products'] as $productData) {
    // Create and save product
    $product = new Product($pdo);
    $product->setId($productData['id']);
    $product->setName($productData['name']);
    $product->setBrand($productData['brand']);
    $product->setInStock($productData['inStock']);
    $product->setDescription($productData['description']);
    $product->setGallery($productData['gallery']);
    $product->setCategoryId($categories[$productData['category']]->getId());
    $product->save();

    // Import attribute sets and attributes
    foreach ($productData['attributes'] as $attributeSetData) {
        $attributeSetId = $productData['id'] . "-" . $attributeSetData['id'];

        $attributeSet = new AttributeSet($pdo);
        $attributeSet->setId($attributeSetId);
        $attributeSet->setName($attributeSetData['name']);
        $attributeSet->setType($attributeSetData['type']);
        $attributeSet->setProductId($product->getId());
        $attributeSet->save();

        // Add attributes to the set
        foreach ($attributeSetData['items'] as $attributeData) {
            $attribute = new Attribute($pdo);
            $attribute->setId($attributeSetId . " - " . $attributeData['id']);
            $attribute->setDisplayValue($attributeData['displayValue']);
            $attribute->setValue($attributeData['value']);
            $attribute->setAttributeSetId($attributeSet->getId());
            $attribute->save();
        }

        $product->addAttribute($attributeSet);
    }

    // Import prices
    foreach ($productData['prices'] as $priceData) {
        $price = new Price($pdo);
        $price->setId($productData['id'] . " - " . $priceData['amount'] . " - " . $currency->getId());
        $price->setAmount($priceData['amount']);
        $price->setCurrencyId($currency->getId());
        $price->setProductId($product->getId());
        $price->save();
        $product->addPrice($price);
    }
}

echo "Data import completed successfully!\n";
