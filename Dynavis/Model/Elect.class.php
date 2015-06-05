<?php
namespace Dynavis\Model;

class Elect extends \Dynavis\Core\RefEntity {
	const TABLE = "elect";
	const FIELDS = [
		"official_id",
		"year",
		"year_end",
		"position",
		"votes",
		"area_code",
		"party_id",
	];

	public function set($param) {
		$official = $param["official"];
		$area = $param["area"];
		$party = $param["party"];
		
		if(is_null($official->get_id()) || is_null($area->get_id()) || is_null($party->get_id())) {
			throw new \RuntimeException("The official, the area, or the party is not yet stored in the database.");
		}

		$this->official_id = $official->get_id();
		$this->area_code = $area->get_id();
		$this->party_id = $party->get_id();
	}

	public function save() {
		if($this->year >= $this->year_end) {
			throw new \RuntimeException("'year' must be less than 'year_end'.");
		}

		// TODO: check year-area-position overlap
		// + official cannot be in two positions simultaneously

		parent::save();
	}
}