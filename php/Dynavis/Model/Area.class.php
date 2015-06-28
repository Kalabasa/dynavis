<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class Area extends \Dynavis\Core\RefEntity {
	const TABLE = "area";
	const FIELDS = ["code", "name", "type", "parent_code"];
	const PRIMARY_KEY = "code";

	public function set($param) {
		$parent = $param["parent"];
		
		if(is_null($parent)) {
			$this->parent_code = null;
		}else{
			if(is_null($parent->get_id())) {
				throw new \RuntimeException("The parent area is not yet stored in the database.");
			}

			$this->parent_code = $parent->get_id();
		}
	}

	public static function get_by_name($name) {
		$ret = Database::get()->get(static::TABLE, [static::PRIMARY_KEY], [
			"name" => trim(preg_replace("/[[:space:]]+/", " ", $name)),
		]);
		if(!$ret) return null;
		return new Area((int) $ret[static::PRIMARY_KEY], false);
	}

	public static function list_areas($count, $start, $level = null) {
		// TODO: merge with query_areas (DRY principle)
		if($count < 0 || $start < -1) return [];
		switch ($level) {
			case "region": $type = 0; break;
			case "province": $type = 1; break;
			case "municipality": $type = 2; break;
			case "barangay": $type = 3; break;
			case null: break;
			default: return []; break;
		}
		$where = [
			"LIMIT" => [(int) $start , (int) $count]
		];
		if(!is_null($level)) {
			$where["type"] = $type;
		}
		return Database::get()->select(static::TABLE, [static::PRIMARY_KEY], $where);
	}

	public static function query_areas($count, $start, $query, $level = null) {
		if($count < 0 || $start < -1) return [];
		switch ($level) {
			case "region": $type = 0; break;
			case "province": $type = 1; break;
			case "municipality": $type = 2; break;
			case "barangay": $type = 3; break;
			case null: break;
			default: return []; break;
		}
		$query_value = "%" . join("%", $query) . "%";
		$limit = [(int) $start , (int) $count];
		if(is_null($level)) {
			$where = [
				"name[~]" => $query_value,
				"LIMIT" => $limit
			];
		}else{
			$where = [
				"AND" => [
					"name[~]" => $query_value,
					"type" => $type
				],
				"LIMIT" => $limit
			];
		}
		return Database::get()->select(static::TABLE, [static::PRIMARY_KEY], $where);
	}

	public static function count_areas($level = null) {
		switch ($level) {
			case "region": $type = 0; break;
			case "province": $type = 1; break;
			case "municipality": $type = 2; break;
			case "barangay": $type = 3; break;
			case null: break;
			default: return []; break;
		}
		$where = null;
		if(!is_null($level)) {
			$where = ["type" => $type];
		}
		return Database::get()->count(static::TABLE, $where);
	}

	public function get_parent() {
		if($type == 0) return null;
		$this->load();
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
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
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
		// normalize
		$this->name = trim(preg_replace("/[[:space:]]+/", " ", $this->name));

		parent::save();
	}

	public static function parse_area_name($name) {
		$code = (int) $name;
		if($code) {
			return $code;
		}

		// TODO: Need mapping of names to code

		return null;
	}
}