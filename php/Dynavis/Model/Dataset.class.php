<?php
namespace Dynavis\Model;

class Dataset extends \Dynavis\Core\RefEntity {
	const TABLE = "dataset";
	const FIELDS = ["user_id", "name", "description"];

	public function set($param) {
		$user = $param["user"];
		
		if(!is_null($user) && is_null($user->get_id())) {
			throw new \RuntimeException("The user is not yet stored in the database.");
		}

		$this->user_id = is_null($user) ? null : $user->get_id();
	}

	public function file($file) {
		$error = $file["error"];
		if($error != UPLOAD_ERR_OK) {
			throw new \RuntimeException("File upload error.");
		}

		$size = $file["size"];
		if($size == 0) {
			throw new \Dynavis\Core\DataException("No file uploaded.");
		}

		$handle = fopen($file["tmp_name"], "r");
		if ($handle === FALSE) {
			throw new \RuntimeException("Error reading file.", 1);
		}

		$data = [];
		while (($row = fgetcsv($handle)) !== FALSE) {
			$data[] = $row;
		}
		fclose($handle);

		// TODO: Error checking
		// * Throw exceptions
		$insert_data = [];

		$header = $data[0];
		foreach ($header as $key => $value) {
			$header[$key] = (int) $value;
		}
		$c = count($header);

		$r = count($data);
		for ($i = 1; $i < $r; $i++) {
			$row = $data[$i];
			$area_code = (int) $row[0];
			for ($j = 1; $j < $c; $j++) { 
				$insert_data[] = [
					"dataset_id" => $this->get_id(),
					"year"  => $header[$j],
					"area_code" => $area_code,
					"value" => empty($row[$j]) ? null : (int) $row[$j],
				];
			}
		}

		$values_string = "(" . join("),(", array_map(
			function ($row) {
				return join(",", array_map(
					function ($x) {
						return \Dynavis\Core\Entity::$medoo->quote($x);
					},
					$row
				));
			},
			$insert_data
		)) . ")";

		$ret = \Dynavis\Core\Entity::$medoo->query("insert into " . Datapoint::TABLE . " (dataset_id,year,area_code,value) values " . $values_string);

		if(!$ret) {
			throw new \Dynavis\Core\DataException("Error adding file data to the database.");
		}
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