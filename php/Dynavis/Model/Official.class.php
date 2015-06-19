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
}