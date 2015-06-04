<?php
class Datapoint extends Entity {
	const TABLE = "datapoint";
	protected $dataset_id = null;
	protected $year = null;
	protected $area_code = null;
	protected $value = null;

	function __construct($param) {
		if(is_int($param)){
			parent::__construct($param);
		}elseif(is_array($param)) {
			parent::__construct();
			$this->set($param["dataset"], $param["area"]);
		}else{
			throw new InvalidArgumentException("Constructor only accepts an integer ID or an array.");
		}
	}

	public function set($dataset, $area) {
		if(is_null($dataset->get_id()) || is_null($area->get_id())) {
			throw new RuntimeException("The dataset or the area is not yet stored in the database.");
		}

		$this->load();
		$this->dataset_id = $dataset->get_id();
		$this->area_code = $area->get_id();
	}
}