<?php
namespace App\Entity;

abstract class BaseEntity
{
    protected string $id;

    public function __construct(protected readonly \PDO $pdo)
    {}

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): static
	{
		$this->id = $id;
		return $this;
	}
    
    public static function get(\PDO $pdo, string $id): ?self
    {
        $table = static::getTableName();
        $stmt = $pdo->prepare("SELECT * FROM {$table} WHERE id = :id");
		$stmt->execute(['id' => $id]);
		$row = $stmt->fetch(\PDO::FETCH_ASSOC);

		if (!$row) {
			return null;
		}

		return static::fromAssoc($pdo, $row);
    }

    /**
     * @return Array<self>
     */
    public static function getAll(\PDO $pdo): array
    {
        $table = static::getTableName();
        $stmt = $pdo->prepare("SELECT * FROM {$table}");
		$stmt->execute();
		$rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

		if (!$rows || count($rows) === 0) {
			return [];
		}

		return array_map(function ($row) use ($pdo) {
			return static::fromAssoc($pdo, $row);
		}, $rows);
    }

    public function save(): bool
    {
        $table = static::getTableName();
        $data = $this->getDataForSave();
        
        if (!empty($this->id)) {
            $data['id'] = $this->id;
        }

        $fields = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_map(fn($key) => ":{$key}", array_keys($data)));
        $updateFields = implode(', ', array_map(fn($key) => "{$key} = :{$key}", array_keys($data)));

        $sql = <<<SQL
            INSERT INTO {$table} ({$fields}) 
            VALUES ({$placeholders})
            ON DUPLICATE KEY UPDATE {$updateFields}
            SQL;
            
        $stmt = $this->pdo->prepare($sql);
        $result = $stmt->execute($data);

        if (!$this->id && $result) {
            $this->id = $this->pdo->lastInsertId();
        }

        return $result;
    }

    abstract protected static function getTableName(): string;

    abstract protected static function fromAssoc(\PDO $db, array $row, ?string $prefix = null): self;

    abstract protected function getDataForSave(): array;
}
