<?php
namespace Dynavis\Model;

class TagDatapoint extends \Dynavis\Core\RefEntity {
	const TABLE = "tag_datapoint";
	const FIELDS = ["dataset_id", "year", "area_code", "family_id", "value"];

	public function set($param) {
		$dataset = $param["dataset"];
		$area = $param["area"];
		$family = $param["family"];

		if(is_null($dataset->get_id()) || is_null($area->get_id()) || is_null($family->get_id())) {
			throw new \RuntimeException("The dataset, the area, or the family is not yet stored in the database.");
		}

		$this->dataset_id = $dataset->get_id();
		$this->area_code = $area->get_id();
		$this->family_id = $family->get_id();
	}
}