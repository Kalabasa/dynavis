<?php
namespace Dynavis\Model;

class Dataset extends \Dynavis\Core\RefEntity {
	const TABLE = "dataset";
	const FIELDS = ["user_id", "name", "description"];

	public function set($param) {
		$user = $param["user"];
		
		if(is_null($user->get_id())) {
			throw new \RuntimeException("The user is not yet stored in the database.");
		}

		$this->load();
		$this->user_id = $user->get_id();
	}

	public function get_points() {
		return array_map(
			function ($item) {
				return new Datapoint((int) $item[Datapoint::PRIMARY_KEY], false);
			},
			\Dynavis\Core\Entity::$medoo->select(Datapoint::TABLE, [
				"[><]" . static::TABLE => ["dataset_id" => static::PRIMARY_KEY]
			], [
				Datapoint::TABLE . "." . Datapoint::PRIMARY_KEY
			],[
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
		);
	}
}