<?php
namespace Dynavis\Model;
use \Dynavis\Database;
use \Dynavis\PSGC;

class Dataset extends \Dynavis\Core\RefEntity {
	public static $TABLE = "dataset";
	public static $FIELDS = ["user_id", "type", "name", "description"];
	public static $QUERY_FIELDS = ["name", "description"];

	public function set($param) {
		$user = $param["user"];
		
		if(!is_null($user) && is_null($user->get_id())) {
			throw new \RuntimeException("The user is not yet stored in the database.");
		}

		$this->user_id = is_null($user) ? null : $user->get_id();
	}

	public static function list_datasets($count, $start, $type = null, $query = null) {
		if($count < 0 || $start < -1) return false;
		if(!is_null($query) && empty($query)) return ["total" => 0, "data" => []];
		
		switch ($type) {
			case "area": $type = 0; break;
			case "tag": $type = 1; break;
			case null: break;
			default: return false; break;
		}

		$where = [];
		if(!is_null($type)) {
			$where["type"] = $type;
		}
		if(!is_null($query)) {
			$where = ["AND" => array_merge($where, ["name[~]" => array_unique($query)])];
		}

		$total = Database::get()->count(static::$TABLE, $where);
		if($count != 0) {
			$where["LIMIT"] = [(int) $start , (int) $count];
		}

		return [
			"total" => $total,
			"data" => Database::get()->select(static::$TABLE, array_merge(static::$FIELDS, [static::$PRIMARY_KEY]), $where),
		];
	}

	public function get_points($count = 0, $start = 0, $year = null) {
		if($count < 0 || $start < -1) return false;

		$this->load();
		$class = [
			"\\Dynavis\\Model\\Datapoint",
			"\\Dynavis\\Model\\TagDatapoint"
		][$this->type];

		$join = [
			"[><]" . static::$TABLE => ["dataset_id" => static::$PRIMARY_KEY]
		];

		$fields = array_merge($class::$FIELDS, [$class::$TABLE . "." . $class::$PRIMARY_KEY]);
		unset($fields[0]);

		$where = [
			static::$TABLE . "." . static::$PRIMARY_KEY => $this->get_id(),
		];

		if(!is_null($year)) {
			$where = ["AND" => array_merge($where, [$class::$TABLE . ".year" => $year])];
		}

		$total = Database::get()->count($class::$TABLE, $join, "*", $where);
		if($count != 0) {
			$where["LIMIT"] = [(int) $start , (int) $count];
		}
		
		return [
			"total" => $total,
			"data" => Database::get()->select($class::$TABLE, $join, $fields, $where)
		];
	}

	public function jsonSerialize() {
		$data = parent::jsonSerialize();

		$data["username"] = (new User((int) $data["user_id"], false))->username;
		unset($data["user_id"]);

		$class = [
			"\\Dynavis\\Model\\Datapoint",
			"\\Dynavis\\Model\\TagDatapoint"
		][$data["type"]];

		$join = ["[><]" . static::$TABLE => ["dataset_id" => static::$PRIMARY_KEY]];
		$where = [static::$TABLE . "." . static::$PRIMARY_KEY => $this->get_id()];
		$data["min_year"] = Database::get()->min($class::$TABLE, $join, $class::$TABLE . ".year", $where);
		$data["max_year"] = Database::get()->max($class::$TABLE, $join, $class::$TABLE . ".year", $where);

		$levels = ["region", "province", "municipality", "barangay"];
		$contained_levels = [];
		$join = [
			"[><]" . static::$TABLE => ["dataset_id" => static::$PRIMARY_KEY],
			"[><]" . Area::$TABLE => ["area_code" => "code"],
		];
		foreach ($levels as $key => $value) {
			$contained_levels[$value] = Database::get()->has($class::$TABLE,$join,["AND" => [
				static::$TABLE . "." . static::$PRIMARY_KEY => $this->get_id(),
				Area::$TABLE . ".type" => $key,
			]]);
		}
		$data["contained_levels"] = $contained_levels;

		$data["type"] = ["area", "tag"][$data["type"]];

		return $data;
	}
	
	public function file($file) {
		$error = $file["error"];
		if($error != UPLOAD_ERR_OK) {
			throw new \RuntimeException("File upload error.");
		}

		$size = $file["size"];
		if($size == 0) {
			throw new \Dynavis\Core\DataException("No file uploaded.");
		}

		$handle = fopen($file["tmp_name"], "r");
		if ($handle === FALSE) {
			throw new \RuntimeException("Error reading file.", 1);
		}

		$data = [];
		while (($row = fgetcsv($handle)) !== FALSE) {
			$data[] = $row;
		}
		fclose($handle);

		$header = $data[0];
		$c = count($header);
		for ($i = 1; $i < $c; $i++) {
			$year = (int) $header[$i];
			if($year === 0) {
				throw new \Dynavis\Core\DataException("Invalid year format in header row. " . $header[i]);
			}
			$header[$i] = $year;
		}

		$insert_data = [];

		$r = count($data);
		for ($i = 1; $i < $r; $i++) {
			$row = $data[$i];
			if(count($row) !== $c) {
				throw new \Dynavis\Core\DataException("Incorrect number of columns in row. Expected " . $c . ". Got " . count($row) . " at row " . ($i + 1) . ": " . join(",", $row));
			}
			
			$area_code = (int) $row[0];
			try {
				$area = Area::get_by_code($area_code);
			}catch(\Dynavis\Core\NotFoundException $e) {
				$area = Area::get_by_name($row[0]);
				if(!$area) {
					$why = $area_code ? "Invalid PSGC code. " : "Name not recognized. ";
					throw new \Dynavis\Core\DataException("Invalid area format. " . $why . $row[0] . " at row " . ($i + 1));
				}
				$area_code = $area->code;
			}

			for ($j = 1; $j < $c; $j++) {
				if(strlen($row[$j]) && !preg_match("/^(\+|-)?((\d{0,65}\.\d{0,30})|\d{1,65})$/", $row[$j])) {
					throw new \Dynavis\Core\DataException("Invalid number format. " . $row[$j] . " at row " . ($i + 1));
				}
				$insert_data[] = [
					"dataset_id" => $this->get_id(),
					"year"  => $header[$j],
					"area_code" => $area_code,
					"value" => strlen($row[$j]) ? $row[$j] : null,
				];
			}
		}

		$values_string = "(" . join("),(", array_map(
			function ($row) {
				return join(",", array_map(
					function ($x) {
						return is_null($x) ? "NULL" : Database::get()->quote($x);
					},
					$row
				));
			},
			$insert_data
		)) . ")";

		$ret = Database::get()->query("insert into " . Datapoint::$TABLE . " (dataset_id,year,area_code,value) values " . $values_string);

		if(!$ret) {
			throw new \Dynavis\Core\DataException("Error adding file data to the database.");
		}
	}
}