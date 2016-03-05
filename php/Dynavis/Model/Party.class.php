<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class Party extends \Dynavis\Core\Entity {
	public static $TABLE = "party";
	public static $FIELDS = ["name"];
	public static $QUERY_FIELDS = ["name"];

	public function get_elections() {
		$fields = array_map(function($f) {
			return Elect::$TABLE . ".$f";
		}, array_merge(Elect::$FIELDS, [Elect::$PRIMARY_KEY]));
		
		return array_map(
			function ($data) {
				return new Elect($data, false);
			},
			Database::get()->select(Elect::$TABLE, [
				"[><]" . static::$TABLE => ["party_id" => static::$PRIMARY_KEY]
			], $fields, [
				static::$TABLE . "." . static::$PRIMARY_KEY => $this->get_id()
			])
		);
	}

	public static function get_by_name($name) {
		$ret = Database::get()->get(static::$TABLE, static::$PRIMARY_KEY, [
			"name" => Database::normalize_string($name),
		]);
		if($ret === false) throw new \Dynavis\Core\NotFoundException("Name not found. $name");
		return new Party((int) $ret, false);
	}

	public function save() {
		// normalize strings
		$this->name = Database::normalize_string($this->name);

		if(!strlen($this->name)) {
			throw new \Dynavis\Core\DataException("Empty name.");
		}

		parent::save();
	}
}