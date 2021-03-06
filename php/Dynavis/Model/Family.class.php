<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class Family extends \Dynavis\Core\Entity {
	public static $TABLE = "family";
	public static $FIELDS = ["name"];
	public static $QUERY_FIELDS = ["name"];

	public static $TABLE_FAMILY_MEMBERSHIP = "family_membership";

	public static function get_by_name($name) {
		$ret = Database::get()->get(static::$TABLE, static::$PRIMARY_KEY, [
			"name" => Database::normalize_string($name),
		]);
		if($ret === false) throw new \Dynavis\Core\NotFoundException("Name not found. $name");
		return new Family((int) $ret, false);
	}

	public function add_member($official) {
		if($this->is_member($official)) {
			throw new \Dynavis\Core\DataException("Cannot add an already-added member.");
		}

		Database::get()->insert(static::$TABLE_FAMILY_MEMBERSHIP, [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]);
	}

	public function get_members($year = False) {
		$fields = array_map(function($f) {
			return Official::$TABLE . ".$f";
		}, array_merge(Official::$FIELDS, [Official::$PRIMARY_KEY]));
		
		$query =
			" select " . join(",", $fields)
			. " from " . Official::$TABLE

			. " inner join " . static::$TABLE_FAMILY_MEMBERSHIP
				. " on " . Official::$TABLE . "." . Official::$PRIMARY_KEY . " = " . static::$TABLE_FAMILY_MEMBERSHIP . ".official_id"
			. " inner join " . static::$TABLE
				. " on " . static::$TABLE_FAMILY_MEMBERSHIP . ".family_id = " . static::$TABLE . "." . static::$PRIMARY_KEY;

		if($year) {
			$query .= 
				" inner join " . Elect::$TABLE . " e1 "
					. "on " . Official::$TABLE . "." . Official::$PRIMARY_KEY . " = e1.official_id "
				. " left join " . Elect::$TABLE . " e2 "
					. " on e1.official_id = e2.official_id and e1.year > e2.year ";
		}

		$query .= " where " . static::$TABLE . "." . static::$PRIMARY_KEY . " = " . Database::get()->quote($this->get_id());

		if($year) {
			$query .=
				" and e2." . Elect::$PRIMARY_KEY . " is null"
				. " and e1.year <= " . Database::get()->quote($year);
		}

		return array_map(
			function ($data) {
				return new Official($data, false);
			},
			Database::get()->query($query)->fetchAll()
		);
	}

	public function count_members() {
		return Database::get()->count(Official::$TABLE, [
			"[><]" . static::$TABLE_FAMILY_MEMBERSHIP => [Official::$PRIMARY_KEY => "official_id"],
			"[><]" . static::$TABLE => [static::$TABLE_FAMILY_MEMBERSHIP . ".family_id" => static::$PRIMARY_KEY],
		], Official::$TABLE . "." . Official::$PRIMARY_KEY, [
			static::$TABLE . "." . static::$PRIMARY_KEY => $this->get_id()
		]);
	}

	public function is_member($official) {
		if(is_null($official->get_id()) or is_null($this->get_id())) {
			throw new \RuntimeException("The official or the family is not yet stored in the database.");
		}

		return Database::get()->has(static::$TABLE_FAMILY_MEMBERSHIP, [ "AND" => [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]]);
	}

	public function remove_member($official) {
		if(!$this->is_member($official)) {
			throw new \Dynavis\Core\DataException("Cannot remove a non-member.");
		}

		$ret = Database::get()->delete(static::$TABLE_FAMILY_MEMBERSHIP, [ "AND" => [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]]);

		if(!$ret) { 
			throw new \Dynavis\Core\DataException("Error removing family membership from the database.");
		}

		$this->autodelete();
	}

	public function autodelete() {
		if($this->count_members() == 0) {
			$this->delete();
			return true;
		}
		return false;
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