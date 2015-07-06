<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class Area extends \Dynavis\Core\Entity {
	const TABLE = "area";
	const FIELDS = ["code", "name", "type", "parent_code", "mun_id", "bar_id"];
	const PRIMARY_KEY = "code";

	public static function get_by_name($name) {
		$ret = Database::get()->get(static::TABLE, [static::PRIMARY_KEY], [
			"name" => Database::normalize_string($name),
		]);
		if(!$ret) return null;
		return new Area((int) $ret[static::PRIMARY_KEY], false);
	}

	public static function get_by_municipality_code($id) {
		$ret = Database::get()->get(static::TABLE, [static::PRIMARY_KEY], [
			"mun_id" => $id,
		]);
		if(!$ret) return null;
		return new Area((int) $ret[static::PRIMARY_KEY], false);
	}

	public static function get_by_barangay_code($id) {
		$ret = Database::get()->get(static::TABLE, [static::PRIMARY_KEY], [
			"bar_id" => $id,
		]);
		if(!$ret) return null;
		return new Area((int) $ret[static::PRIMARY_KEY], false);
	}

	public static function list_areas($count, $start, $level = null) {
		// TODO: merge with query_areas (DRY principle)
		if($count < 0 || $start < -1) return false;
		switch ($level) {
			case "region": $type = 0; break;
			case "province": $type = 1; break;
			case "municipality": $type = 2; break;
			case "barangay": $type = 3; break;
			case null: break;
			default: return false; break;
		}

		$where = [];
		if(!is_null($level)) {
			$where["type"] = $type;
		}

		$total = Database::get()->count(static::TABLE, $where);
		if($count != 0) {
			$where["LIMIT"] = [(int) $start , (int) $count];
		}

		return [
			"total" => $total,
			"data" => Database::get()->select(static::TABLE, [static::PRIMARY_KEY], $where)
		];
	}

	public static function query_areas($count, $start, $query, $level = null) {
		if($count < 0 || $start < -1) return false;
		switch ($level) {
			case "region": $type = 0; break;
			case "province": $type = 1; break;
			case "municipality": $type = 2; break;
			case "barangay": $type = 3; break;
			case null: break;
			default: return false; break;
		}

		$uquery = array_unique($query);
		if(is_null($level)) {
			$where = ["name[~]" => $uquery];
		}else{
			$where = [
				"AND" => [
					"name[~]" => $uquery,
					"type" => $type,
				],
			];
		}

		$total = Database::get()->count(static::TABLE, $where);
		if($count != 0) {
			$where["LIMIT"] = [(int) $start , (int) $count];
		}

		return [
			"total" => $total,
			"data" => Database::get()->select(static::TABLE, [static::PRIMARY_KEY], $where),
		];
	}

	public static function count_areas($level = null) {
		switch ($level) {
			case "region": $type = 0; break;
			case "province": $type = 1; break;
			case "municipality": $type = 2; break;
			case "barangay": $type = 3; break;
			case null: break;
			default: return false; break;
		}

		$where = null;
		if(!is_null($level)) {
			$where = ["type" => $type];
		}
		
		return Database::get()->count(static::TABLE, $where);
	}

	public function get_parent() {
		$this->load();
		if(is_null($this->parent_code)) return null;
		return new Area($this->parent_code, false);
	}

	public function get_elections() {
		return array_map(
			function ($item) {
				return new Elect((int) $item[Elect::PRIMARY_KEY], false);
			},
			Database::get()->select(Elect::TABLE, [
				"[><]" . static::TABLE => ["area_code" => static::PRIMARY_KEY]
			], [
				Elect::TABLE . "." . Elect::PRIMARY_KEY
			],[
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_code()
			])
		);
	}

	public function get_officials() {
		return array_map(
			function ($item) {
				return new Official((int) $item[Official::PRIMARY_KEY], false);
			},
			Database::get()->select(Official::TABLE, [
				"[><]" . Elect::TABLE => [Official::PRIMARY_KEY => "official_id"],
				"[><]" . static::TABLE => [Elect::TABLE . ".area_code" => static::PRIMARY_KEY],
			], [
				Official::TABLE . "." . Official::PRIMARY_KEY
			], [
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
		);
	}

	public function jsonSerialize() {
		$data = parent::jsonSerialize();
		$data["level"] = ["region", "province", "municipality", "barangay"][$data["type"]];
		unset($data["type"]);
		return $data;
	}

	public function save() {
		// normalize strings
		$this->name = Database::normalize_string($this->name);

		if(!strlen($this->name)) {
			throw new \Dynavis\Core\DataException("Empty name.");
		}

		// Calculate sub-codes
		$this->bar_id = $this->code % 10000000;
		$this->mun_id = Math.floor($this->bar_id / 1000);

		parent::save();
	}

	public static function file($file) {
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

		$insert_data = [];

		$r = count($data);
		for ($i = 0; $i < $r; $i++) {
			$row = $data[$i];

			$entry = ["code" => null, "name" => null];
			foreach ($row as $value) {
				if(is_null($entry["code"]) && strlen($value) == 9 && intval($value)) {
					$entry["code"] = $value;
				}else{
					if(is_null($entry["name"]) || strlen($value) > strlen($entry["name"])) {
						$entry["name"] = $value;
					}
				}
			}
			if(!is_null($entry["code"])) {
				if(is_null($entry["name"])) $entry["name"] = "(Unnamed)";
				$insert_data[] = static::process_row($entry, $i);
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

		$ret = Database::get()->query("replace into " . static::TABLE . " (code,name,type,parent_code,mun_id,bar_id) values " . $values_string);

		if(!$ret) {
			throw new \Dynavis\Core\DataException("Error adding file data to database.");
		}

		// TODO: What about parent_codes (they're null)
	}

	private static function process_row($entry, $row) {
		$code = (int) $entry["code"];
		$subcodes = static::extract_subcodes($code);
		return [
			"code" => $code,
			"name" => Database::normalize_string($entry["name"]),
			"type" => static::extract_level($code),
			"parent_code" => null,
			"mun_id" => $subcodes["mun_id"],
			"bar_id" => $subcodes["bar_id"],
		];
	}

	public static function extract_level($code) {
		// Assuming valid PSGC $code
		$str = str_pad($code, 9, "0", STR_PAD_LEFT);

		$province_code = substr($str, 2, 2);
		$municipality_code = substr($str, 4, 2);
		$barangay_code = substr($str, 6, 3);

		if($province_code === "00") return 0;
		if($municipality_code === "00") return 1;
		if($barangay_code === "000") return 2;
		return 3;
	}

	public static function extract_subcodes($code) {
		// Assuming valid PSGC $code
		$str = str_pad($code, 9, "0", STR_PAD_LEFT);

		$region_code = substr($str, 0, 2);
		$province_code = substr($str, 2, 2);
		$municipality_code = substr($str, 4, 2);
		$barangay_code = substr($str, 6, 3);

		$parent_code = null;
		$mun_id = null;
		$bar_id = null;

		if($municipality_code === "00") {
			// province.parent = region
			$parent_code = intval($region_code . "0000000");
		}else if($barangay_code === "000") {
			// municipality.parent = province
			$parent_code = intval($region_code . $province_code . "00000");
			$mun_id = $province_code . $municipality_code;
		}else{
			// barangay.parent = municipality
			$parent_code = intval($region_code . $mun_id . "000");
			$mun_id = $province_code . $municipality_code;
			$bar_id = $mun_id . $barangay_code;
		}

		return [
			"parent_code" => $parent_code,
			"mun_id" => $mun_id,
			"bar_id" => $bar_id,
		];
	}
}