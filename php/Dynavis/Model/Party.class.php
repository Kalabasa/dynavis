<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class Party extends \Dynavis\Core\Entity {
	const TABLE = "party";
	const FIELDS = ["name"];

	public function get_elections() {
		return array_map(
			function ($item) {
				return new Elect((int) $item[Elect::PRIMARY_KEY]);
			},
			Database::get()->select(Elect::TABLE, [
				"[><]" . static::TABLE => ["party_id" => static::PRIMARY_KEY]
			],[
				Elect::TABLE . "." . Elect::PRIMARY_KEY
			],[
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
		);
	}
}