<?php
namespace Dynavis\Model;

class Family extends \Dynavis\Core\Entity {
	const TABLE = "family";
	const FIELDS = ["name"];

	const TABLE_FAMILY_MEMBERSHIP = "family_membership";

	public function add_member($official) {
		if($this->is_member($official)) {
			throw new \Dynavis\Core\DataException("Cannot add an already-added member.");
		}

		\Dynavis\Core\Entity::$medoo->insert(static::TABLE_FAMILY_MEMBERSHIP, [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]);
	}

	public function get_members() {
		// TODO: add year parameter to get_members and is_member
		// * The set Members(f,t) is dependent of family f and time t.
		return array_map(
			function ($item) {
				return new Official((int) $item[Official::PRIMARY_KEY], false);
			},
			\Dynavis\Core\Entity::$medoo->select(Official::TABLE, [
				"[><]" . static::TABLE_FAMILY_MEMBERSHIP => [Official::PRIMARY_KEY => "official_id"],
				"[><]" . static::TABLE => [static::TABLE_FAMILY_MEMBERSHIP . ".family_id" => static::PRIMARY_KEY],
			], [
				Official::TABLE . "." . Official::PRIMARY_KEY
			], [
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
		);
	}

	public function is_member($official) {
		if(is_null($official->get_id()) or is_null($this->get_id())) {
			throw new \RuntimeException("The official or the family is not yet stored in the database.");
		}

		return \Dynavis\Core\Entity::$medoo->has(static::TABLE_FAMILY_MEMBERSHIP, [ "AND" => [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]]);
	}

	public function remove_member($official) {
		if(!$this->is_member($official)) {
			throw new \Dynavis\Core\DataException("Cannot remove a non-member.");
		}

		$ret = \Dynavis\Core\Entity::$medoo->delete(static::TABLE_FAMILY_MEMBERSHIP, [ "AND" => [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]]);

		if(!$ret) { 
			throw new \Dynavis\Core\DataException("Error removing family membership from the database.");
		}
	}
}