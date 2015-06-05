<?php
namespace Dynavis\Model;

class Datapoint extends \Dynavis\Core\RefEntity {
	const TABLE = "datapoint";
	const FIELDS = ["dataset_id", "year", "area_code", "value"];

	public function set($param) {
		$dataset = $param["dataset"];
		$area = $param["area"];

		if(is_null($dataset->get_id()) || is_null($area->get_id())) {
			throw new \RuntimeException("The dataset or the area is not yet stored in the database.");
		}

		$this->dataset_id = $dataset->get_id();
		$this->area_code = $area->get_id();
	}
}