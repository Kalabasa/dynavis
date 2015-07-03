<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class Official extends \Dynavis\Core\Entity {
	const TABLE = "official";
	const FIELDS = ["surname", "name", "nickname"];

	const TABLE_FAMILY_MEMBERSHIP = "family_membership";

	public function get_families() {
		return array_map(
			function ($item) {
				return new Family((int) $item[Family::PRIMARY_KEY], false);
			},
			Database::get()->select(Family::TABLE, [
				"[><]" . static::TABLE_FAMILY_MEMBERSHIP => [Family::PRIMARY_KEY => "family_id"],
				"[><]" . static::TABLE => [static::TABLE_FAMILY_MEMBERSHIP . ".official_id" => static::PRIMARY_KEY],
			], [
				Family::TABLE . "." . Family::PRIMARY_KEY
			], [
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
		);
	}

	public function save() {
		// normalize strings
		$this->surname = Database::normalize_string($this->surname);
		$this->name = Database::normalize_string($this->name);
		$this->nickname = trim($this->nickname) ? Database::normalize_string($this->nickname) : null;

		if(!strlen($this->surname) || !strlen($this->name)) {
			throw new \Dynavis\Core\DataException("Required fields empty. (surname, name)");
		}

		parent::save();
	}

	public function delete() {
		Database::get()->pdo->beginTransaction();

		try{
			// Remove membership before deletion
			foreach ($this->get_families() as $f) {
				$f->remove_member($this);
			}

			parent::delete();
		}catch(Exception $e) {
			Database::get()->pdo->rollback();
			throw e;
		}

		Database::get()->pdo->commit();
	}

	public static function get_by_name($surname, $name) {
		$ret = Database::get()->get(static::TABLE, [static::PRIMARY_KEY], ["AND" => [
			"surname" => Database::normalize_string($surname),
			"name" => Database::normalize_string($name),
		]]);
		if(!$ret) return null;
		return new Official((int) $ret[static::PRIMARY_KEY], false);
	}
}