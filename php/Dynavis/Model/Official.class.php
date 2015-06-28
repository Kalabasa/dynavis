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
		// normalize
		$this->surname = trim(preg_replace("/[[:space:]]+/", " ", $this->surname));
		$this->name = trim(preg_replace("/[[:space:]]+/", " ", $this->name));
		$this->nickname = $this->nickname ? trim(preg_replace("/[[:space:]]+/", " ", $this->nickname)) : null;

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
			"surname" => trim(preg_replace("/[[:space:]]+/", " ", $surname)),
			"name" => trim(preg_replace("/[[:space:]]+/", " ", $name)),
		]]);
		var_dump($surname, $name);
		var_dump($ret);
		var_dump(Database::get()->log());
		if(!$ret) return null;
		return new Official((int) $ret[static::PRIMARY_KEY], false);
	}
}