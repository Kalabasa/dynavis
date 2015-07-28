<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class Official extends \Dynavis\Core\Entity {
	const TABLE = "official";
	const FIELDS = ["surname", "name", "nickname"];
	const QUERY_FIELDS = ["surname", "name", "nickname"];

	const TABLE_FAMILY_MEMBERSHIP = "family_membership";

	public function get_families() {
		return array_map(
			function ($id) {
				return new Family((int) $id, false);
			},
			Database::get()->select(Family::TABLE, [
				"[><]" . static::TABLE_FAMILY_MEMBERSHIP => [Family::PRIMARY_KEY => "family_id"],
				"[><]" . static::TABLE => [static::TABLE_FAMILY_MEMBERSHIP . ".official_id" => static::PRIMARY_KEY],
			], Family::TABLE . "." . Family::PRIMARY_KEY, [
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
		);
	}

	public function get_elections() {
		return array_map(
			function ($id) {
				return new Elect((int) $id, false);
			},
			Database::get()->select(Elect::TABLE, Elect::TABLE . "." . Elect::PRIMARY_KEY, [
				Elect::TABLE . ".official_id" => $this->get_id()
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

	public function autodelete() {
		$elections = Database::get()->count(Elect::TABLE, [
			Elect::TABLE . ".official_id" => $this->get_id()
		]);
		
		if($elections === 0) {
			$this->delete();
			return true;
		}
		return false;
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
		$ret = Database::get()->get(static::TABLE, static::PRIMARY_KEY, ["AND" => [
			"surname" => Database::normalize_string($surname),
			"name" => Database::normalize_string($name),
		]]);
		if(!$ret) return null;
		return new Official((int) $ret[static::PRIMARY_KEY], false);
	}
}