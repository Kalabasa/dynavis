<?php
class Dataset extends Entity {
	const TABLE = "dataset";
	protected $user_id = null;
	protected $name = null;
	protected $description = null;

	function __construct($param) {
		if(is_int($param)){
			parent::__construct($param);
		}elseif(is_array($param)) {
			parent::__construct();
			$this->set($param["user"]);
		}else{
			throw new InvalidArgumentException("Constructor only accepts an integer ID or an array.");
		}
	}

	public function set($user) {
		if(is_null($user->get_id())) {
			throw new RuntimeException("The user is not yet stored in the database.");
		}

		$this->load();
		$this->user_id = $user->get_id();
	}

	public function get_points() {
		return array_map(
			function ($x) {
				return new Datapoint((int) $x["id"]);
			},
			$this->_db->select(Datapoint::TABLE, ["[><]" . self::TABLE => ["dataset_id" => "id"]], [Datapoint::TABLE . ".id"])
		);
	}
}