<?php
class Elect extends Entity {
	const TABLE = "elect";
	protected $official_id = null;
	protected $year = null;
	protected $year_end = null;
	protected $position = null;
	protected $votes = null;
	protected $area_code = null;
	protected $party_id = null;

	function __construct($param) {
		if(is_int($param)){
			parent::__construct($param);
		}elseif(is_array($param)) {
			parent::__construct();
			$this->set($param["official"], $param["area"], $param["party"]);
		}else{
			throw new InvalidArgumentException("Constructor only accepts an integer ID or an array.");
		}
	}

	public function set($official, $area, $party) {
		if(is_null($official->get_id()) || is_null($area->get_id()) || is_null($party->get_id())) {
			throw new RuntimeException("The official, the area, or the party is not yet stored in the database.");
		}

		$this->load();
		$this->official_id = $official->get_id();
		$this->area_code = $area->get_id();
		$this->party_id = $party->get_id();
	}

	public function save() {
		if($this->year >= $this->year_end) {
			throw new Exception("'year' must be less than 'year_end'.");
		}

		// TODO: check year-area-position overlap
		// + official cannot be in two positions simultaneously

		parent::save();
	}
}