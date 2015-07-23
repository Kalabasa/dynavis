<?php
namespace Dynavis\Model;
use \Dynavis\Database;

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

		if(is_null($official->get_id()) || is_null($area->get_id()) || (!is_null($party) && is_null($party->get_id()))) {
			throw new \RuntimeException("The official, the area, or the party is not yet stored in the database.");
		}

		$this->official_id = $official->get_id();
		$this->area_code = $area->code;
		$this->party_id = is_null($party) ? null : $party->get_id();
	}

	public function save() {
		if($this->year >= $this->year_end) {
			throw new \Dynavis\Core\DataException("'year' must be less than 'year_end'.");
		}

		// normalize strings
		$this->position = $this->position && trim($this->position) ? Database::normalize_string($this->position) : null;

		// Check for year-area-position overlaps
		$conflicts = Database::get()->select(static::TABLE, [static::PRIMARY_KEY], ["AND" => [
			static::PRIMARY_KEY . "[!]" => $this->get_id(),
			"year[<]" => $this->year_end,
			"year_end[>]" => $this->year,
			"position" => $this->position,
			"area_code" => $this->area_code,
		]]);

		if(count($conflicts)) {
			throw new \Dynavis\Core\DataException("Conflict with other election records: "
				. join(", ", array_map(function($item) {
					return $item[static::PRIMARY_KEY];
				}, $conflicts)));
		}

		// Official cannot be in two posts simultaneously
		$official_overlaps = Database::get()->select(static::TABLE, [static::PRIMARY_KEY], ["AND" => [
			static::PRIMARY_KEY . "[!]" => $this->get_id(),
			"year[<]" => $this->year_end,
			"year_end[>]" => $this->year,
			"official_id" => $this->official_id,
		]]);

		if(count($official_overlaps)) {
			throw new \Dynavis\Core\DataException("No official can be in two posts simultaneously."
				. " Official ID: " . $this->official_id
				. " Conflicts: " . join(", ", array_map(function($item) {
					return $item[static::PRIMARY_KEY];
				}, $official_overlaps)));
		}

		parent::save();
	}

	public function delete() {
		$official = new Official((int) $this->official_id, false);
		parent::delete();
		$official->autodelete();
	}

	public static function file($file) {
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

		$file_fields = ["area", "year", "position", "surname", "name", "nickname", "party", "votes"];
		$num_fields = count($file_fields);

		$insert_data = [];

		$r = count($data);
		for ($i = 0; $i < $r; $i++) {
			$row = $data[$i];
			if(count($row) !== $num_fields) {
				throw new \Dynavis\Core\DataException("Incorrect number of columns in row. Expected " . $num_fields . ". Got " . count($row) . " at row " . ($i + 1) . ": " . join(",", $row));
			}
			$entry = [];
			foreach ($row as $key => $value) {
				$entry[$file_fields[$key]] = $value;
			}
			$insert_data[] = static::process_row($entry, $i);
		}

		// No checking for overlaps. Assume correct data.

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

		$ret = Database::get()->query("insert into " . static::TABLE . " (official_id,year,year_end,position,votes,area_code,party_id) values " . $values_string);

		if(!$ret) {
			throw new \Dynavis\Core\DataException("Error adding file data to database.");
		}
	}

	private static function process_row($entry, $row) {
		$official = Official::get_by_name($entry["surname"], $entry["name"]);
		if(!$official) {
			$official = new Official();
			$official->surname = $entry["surname"];
			$official->name = $entry["name"];
			$official->nickname = $entry["nickname"];
			$official->save();
		}

		$year = (int) $entry["year"];
		if(!$year) {
			throw new \Dynavis\Core\DataException("Invalid year format. " . $entry["year"] . " at row " . ($row + 1));
		}
		// The length of term for LGU positions is three (3) years.
		$year_end = $year + 3; // TODO: how about special elections or rescheduled elections

		$position = $entry["position"];
		$position = $position && trim($position) ? Database::normalize_string($position) : null;

		$votes = (int) $entry["votes"];
		if(!is_numeric($votes)) {
			throw new \Dynavis\Core\DataException("Invalid votes format. " . $entry["votes"] . " at row " . ($row + 1));
		}

		$area = null;
		$area_code = (int) $entry["area"];
		if($area_code) {
			try{
				$area = Area::get_by_code($area_code);
			}catch(\Dynavis\Core\NotFoundException $e) {
				throw new \Dynavis\Core\DataException("Invalid area code. " . $entry["area"] . " at row " . ($row + 1));
			}
		}else{
			$area = Area::get_by_name($entry["area"]);
			if(!$area) {
				throw new \Dynavis\Core\DataException("Invalid area name. " . $entry["area"] . " at row " . ($row + 1));
			}
		}

		$party = null;
		if(!empty($entry["party"]) && $entry["party"] !== "IND") { // IND = coding for independent
			$party = Party::get_by_name($entry["party"]);
			if(!$party) {
				$party = new Party();
				$party->name = $entry["party"];
				$party->save();
			}
		}

		return [
			$official->get_id(),
			$year,
			$year_end,
			$position,
			$votes,
			$area->code,
			is_null($party) ? null : $party->get_id(),
		];
	}
}