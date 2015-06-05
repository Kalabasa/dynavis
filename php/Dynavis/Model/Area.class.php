<?php
namespace Dynavis\Model;

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

	public static function list_areas($count, $start, $type) {
		static::init();
		if($count < 0 || $start < -1) return [];
		return self::$medoo->select(static::TABLE, [static::PRIMARY_KEY], ["LIMIT" => [(int) $start , (int) $count], "type" => (int) $type]);
	}

	public function get_parent() {
		if($type == 0) return null;
		return new Area($this->parent_code);
	}

	public function get_elections() {
		return array_map(
			function ($item) {
				return new Elect((int) $item[Elect::PRIMARY_KEY]);
			},
			\Dynavis\Core\Entity::$medoo->select(Elect::TABLE, [
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
			\Dynavis\Core\Entity::$medoo->select(Official::TABLE, [
				"[><]" . Elect::TABLE => [Official::PRIMARY_KEY => "official_id"],
				"[><]" . static::TABLE => [Elect::TABLE . ".area_code" => static::PRIMARY_KEY],
			], [
				Official::TABLE . "." . Official::PRIMARY_KEY
			], [
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
		);
	}
}