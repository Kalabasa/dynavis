<?php
namespace Dynavis\Model;
use \Dynavis\Database;
use \Dynavis\PSGC;

class Area extends \Dynavis\Core\Entity {
	const TABLE = "area";
	const FIELDS = ["code", "name", "type", "parent_code", "mun_id", "bar_id"];

	public static function get_by_code($code) {
		$ret = Database::get()->get(static::TABLE, [static::PRIMARY_KEY], [
			"code" => $code,
		]);
		if(!$ret) throw new \Dynavis\Core\NotFoundException("Code does not exist. " . $code);
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

	public static function list_areas($count, $start, $level = null, $query = null) {
		if($count < 0 || $start < -1) return false;
		if(!is_null($query) && empty($query)) return ["total" => 0, "data" => []];
		
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
		if(!is_null($query)) {
			$where = ["AND" => array_merge($where, ["name[~]" => array_unique($query)])];
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

	public function get_officials($year = False) {
		$query =
			" select distinct " . Official::TABLE . "." . Official::PRIMARY_KEY
			. " from " . Official::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Official::TABLE . "." . Official::PRIMARY_KEY . " = " . Elect::TABLE . ".official_id "
			. " inner join " . static::TABLE
				. " on " . Elect::TABLE . ".area_code = " . static::TABLE . "." . static::PRIMARY_KEY

			. " where "
				. static::TABLE . "." . static::PRIMARY_KEY . " = " . Database::get()->quote($this->get_id());

		if($year) {
			$query .= " and year <= " . Database::get()->quote($year)
				. " and year_end > " . Database::get()->quote($year);
		}

		return array_map(
			function ($item) {
				return new Official((int) $item[Official::PRIMARY_KEY], false);
			},
			Database::get()->query($query)->fetchAll()
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

		$type = (int) $this->type;
		if($type < 0 || $type >= 4) {
			throw new \Dynavis\Core\DataException("Invalid type. " . $type);
		}

		if(!strlen($this->name)) {
			throw new \Dynavis\Core\DataException("Empty name.");
		}

		// Calculate sub-codes
		$this->bar_id = $this->code % 10000000;
		$this->mun_id = floor($this->bar_id / 1000);

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
			$code,
			Database::normalize_string($entry["name"]),
			static::extract_level($code),
			null,
			$subcodes["mun_id"],
			$subcodes["bar_id"],
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

		$parent_code = null;
		$mun_id = null;
		$bar_id = null;

		$province_code = substr($str, 2, 2);
		if($province_code === "00") {
			// region.parent = NULL
			$parent_code = null;
		}else{
			$region_code = substr($str, 0, 2);
			$municipality_code = substr($str, 4, 2);
			if($municipality_code === "00") {
				// province.parent = region
				$parent_code = intval($region_code . "0000000");
			}else{
				$mun_id = $province_code . $municipality_code;
				$barangay_code = substr($str, 6, 3);
				if($barangay_code === "000") {
					// municipality.parent = province
					$parent_code = intval($region_code . $province_code . "00000");
				}else{
					// barangay.parent = municipality
					$bar_id = $mun_id . $barangay_code;
					$parent_code = intval($region_code . $mun_id . "000");
				}
			}
		}

		return [
			"parent_code" => $parent_code,
			"mun_id" => $mun_id,
			"bar_id" => $bar_id,
		];
	}

	public static function get_by_name($name) {
		$names = static::psgc_get_names($name);

		$candidates = [];
		foreach ($names as $n) {
			if(array_key_exists($n, PSGC::MAP)) {
				$c = count(PSGC::MAP[$n]);
				foreach (PSGC::MAP[$n] as $area_code) {
					if(!isset($candidates[$area_code])) {
						$candidates[$area_code] = 0;
					}
					$candidates[$area_code] += 1.0/$c;
				}
			}
		}

		if(empty($candidates)) return null;

		$highest = null;
		foreach ($candidates as $area_code => $prob) {
			if(!$highest || $candidates[$highest] < $prob) {
				$highest = $area_code;
			}
		}
		return static::get_by_code($highest);
	}

	/* area name normalization functions */

	private static function psgc_get_names($s) {
		$split = preg_split("/[()]|\s+-\s+/", $s, 0, PREG_SPLIT_NO_EMPTY);
		$names = [];
		foreach ($split as $value) {
			$nv = static::psgc_normalize($value);
			if($nv) $names[] = $nv;
		}
		$add = [];
		foreach($names as $n){
			$len = strlen($n);
			if(substr_compare($n, "city", $len-4, 4) === 0) {
				$add[] = substr($n, $len-4);
			}
		}
		return $names + $add;
	}

	private static function psgc_normalize($s) {
		$s = iconv('UTF-8', 'ASCII//TRANSLIT', $s);
		$s = preg_replace("/_/", " ", $s);
		$s = strtolower(preg_replace_callback(
				"/\b(?=[CLXVI]+\b)(C){0,3}(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/",
				function($matches) {
					$numeral_map = [[100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
					$n = strtoupper($matches[0]);
					$i = $result = 0;
					foreach ($numeral_map as $pair) {
						$integer = $pair[0];
						$numeral = $pair[1];
						$len = strlen($numeral);
						while(substr($n, $i, $len) == $numeral){
							$result += $integer;
							$i += $len;
						}
					}
					return strval($result);
				},
				$s
			));
		$s = preg_replace("/\bcity\s+of(.+)/", "$1city", $s);
		$s = preg_replace("/\bbarangay\b/", "bgy", $s);
		$s = preg_replace("/\bpoblacion\b/", "pob", $s);
		$s = preg_replace("/\b(general|heneral|hen)\b/", "gen", $s);
		$s = preg_replace("#[*-.'/\s]+|of|the#", "", $s);
		return $s;
	}

}