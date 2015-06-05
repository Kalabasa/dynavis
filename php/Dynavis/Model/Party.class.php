<?php
namespace Dynavis\Model;

class Party extends \Dynavis\Core\Entity {
	const TABLE = "party";
	const FIELDS = ["name"];

	public function get_members() {
		return null; // TODO: how to get members (add year parameter)
	}
}