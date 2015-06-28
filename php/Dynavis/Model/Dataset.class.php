<?php
namespace Dynavis\Model;
use \Dynavis\Database;

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

		$header = $data[0];
		foreach ($header as $i => $value) {
			$year = (int) $value;
			if($year === 0) {
				throw new \Dynavis\Core\DataException("Invalid year format in header row. " . $value);
			}
			$header[$i] = $year;
		}
		$c = count($header);

		$insert_data = [];

		$r = count($data);
		for ($i = 1; $i < $r; $i++) {
			$row = $data[$i];
			if(count($row) !== c) {
				throw new \Dynavis\Core\DataException("Incorrect number of columns in row. Expected " . $c . ". Got " . count($row) . " at row " . ($i + 1) . ": " . join(",", $row));
			}
			$area_code = Area::parse_area_name($row[0]);
			if(!$area_code) {
				throw new \Dynavis\Core\DataException("Invalid area format. " . $row[0]);
			}
			// TODO: check decimal format of values (but don't cast (datapoint value may not fit in a float))
			for ($j = 1; $j < $c; $j++) { 
				$insert_data[] = [
					"dataset_id" => $this->get_id(),
					"year"  => $header[$j],
					"area_code" => $area_code,
					"value" => empty($row[$j]) ? null : $row[$j],
				];
			}
		}

		$values_string = "(" . join("),(", array_map(
			function ($row) {
				return join(",", array_map(
					function ($x) {
						return is_null($x) ? "NULL" : Database::get()->quote($x);
					},
					$row
				));
			},
			$insert_data
		)) . ")";

		$ret = Database::get()->query("insert into " . Datapoint::TABLE . " (dataset_id,year,area_code,value) values " . $values_string);

		if(!$ret) {
			throw new \Dynavis\Core\DataException("Error adding file data to the database.");
		}
	}

	public function get_points() {
		return array_map(
			function ($item) {
				return new Datapoint((int) $item[Datapoint::PRIMARY_KEY], false);
			},
			Database::get()->select(Datapoint::TABLE, [
				"[><]" . static::TABLE => ["dataset_id" => static::PRIMARY_KEY]
			], [
				Datapoint::TABLE . "." . Datapoint::PRIMARY_KEY
			],[
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
		);
	}

	public function jsonSerialize() {
		$data = parent::jsonSerialize();
		$data["username"] = (new User((int) $data["user_id"], false))->username;
		unset($data["user_id"]);
		return $data;
	}
}