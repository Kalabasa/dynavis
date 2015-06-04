<?php
class Family extends Entity {
	const TABLE = "family";
	protected $name = null;

	const TABLE_FAMILY_MEMBERSHIP = "family_membership";

	public function add_member($official) {
		if($this->is_member($official)) {
			throw new Exception("Cannot add an already-added member.");
		}

		$this->_db->insert(self::TABLE_FAMILY_MEMBERSHIP, [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]);
	}

	public function get_members() {
		return array_map(
			function ($x) {
				return new Official((int) $x["id"]);
			},
			$this->_db->select(Official::TABLE, ["[><]" . self::TABLE_FAMILY_MEMBERSHIP => ["id" => "official_id"]], [Official::TABLE . ".id"])
		);
	}

	public function is_member($official) {
		if(is_null($official->get_id()) or is_null($this->get_id())) {
			throw new RuntimeException("The official or the family is not yet stored in the database.");
		}

		return $this->_db->has(self::TABLE_FAMILY_MEMBERSHIP, [ "AND" => [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]]);
	}

	public function remove_member($official) {
		if(!$this->is_member($official)) {
			throw new Exception("Cannot remove a non-member.");
		}

		$ret = $this->_db->delete(self::TABLE_FAMILY_MEMBERSHIP, [ "AND" => [
			"official_id" => $official->get_id(),
			"family_id" => $this->get_id(),
		]]);

		if(!$ret) { 
			throw new RuntimeException("Error removing family membership from the database.");
		}
	}
}