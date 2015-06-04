<?php
class Datapoint extends RefEntity {
	const TABLE = "datapoint";
	protected $dataset_id = null;
	protected $year = null;
	protected $area_code = null;
	protected $value = null;

	public function set($param) {
		$dataset = $param["dataset"];
		$area = $param["area"];

		if(is_null($dataset->get_id()) || is_null($area->get_id())) {
			throw new RuntimeException("The dataset or the area is not yet stored in the database.");
		}

		$this->load();
		$this->dataset_id = $dataset->get_id();
		$this->area_code = $area->get_id();
	}
}