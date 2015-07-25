<?php
namespace Dynavis;
use \PDO;
use \Dynavis\Database;
use \Dynavis\Model\Official;
use \Dynavis\Model\Family;
use \Dynavis\Model\Area;
use \Dynavis\Model\Elect;
use \Dynavis\Model\Dataset;
use \Dynavis\Model\Datapoint;
use \Dynavis\Model\TagDatapoint;
use \Dynavis\Model\User;

class DataProcessor {
	const INDICATORS = [
		"DYNSHA" => ["calculate_dynsha", ["code"]],
		"DYNLAR" => ["calculate_dynlar", ["code"]],
		"DYNHERF" => ["calculate_dynherf", ["code"]],
		"LocalDynastySize" => ["calculate_localdynastysize", ["code", "id"]],
		"RecursiveDynastySize" => ["calculate_recursivedynastysize", ["code", "id"]],
	];

	public static function save_dataset($calc_data, $username, $name, $description) {
		Database::get()->pdo->beginTransaction();

		$dataset = new Dataset(["user" => User::get_by_username($username)]);
		$dataset->name = $name;
		$dataset->description = $description;
		$dataset->type = $calc_data["type"];
		$dataset->save();

		$result = $calc_data["result"];
		$min_year = $calc_data["min_year"];
		$max_year = $calc_data["max_year"];
		$insert_data = [];
		$variables = static::INDICATORS[$name][1];

		foreach ($result as $row) {
			$a = [
				$dataset->get_id(),
				$row["year"],
			];
			foreach ($variables as $v) {
				$a[] = $row[$v];
			}
			$a[] = $row[$name];
			$insert_data[] = $a;
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

		if($dataset->type === 0) {
			$ret = Database::get()->query("insert into " . Datapoint::TABLE . " (dataset_id,year,area_code,value) values " . $values_string);
		}else{
			$ret = Database::get()->query("insert into " . TagDatapoint::TABLE . " (dataset_id,year,area_code,family_id,value) values " . $values_string);
		}

		if(!$ret) {
			Database::get()->pdo->rollBack();
			throw new \Dynavis\Core\DataException("Cannot insert into database. " . Database::get()->error()[2]);
		}

		Database::get()->pdo->commit();

		return $dataset->get_id();
	}

	public static function calculate_indicator($name) {
		$p = static::INDICATORS[$name];
		$calc_function = $p[0];
		$variables = $p[1];

		$min_year = Database::get()->min(Elect::TABLE, "year");
		$max_year = Database::get()->max(Elect::TABLE, "year_end") - 1;

		$result = [];

		for($t = $min_year; $t <= $max_year; $t++) {
			$subresult = static::$calc_function($t);
			foreach ($subresult as $s) {
				$s["year"] = $t;
				$result[] = $s;
			}
		}

		return [
			"min_year" => $min_year,
			"max_year" => $max_year,
			"type" => count($variables) - 1, // FIXME: DANGEROUS!
			"result" => $result,
		];
	}

	private static function calculate_dynsha($year) {
		// DYNSHA(a,t) = | Officials(a,t) ∩ IsMembers(t) |
		$query =
			" select "
				. Area::TABLE . ".code "
				. " , count(" . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id) AS Size "
				. " , count(*) AS Total "
				. " , 100 * count(" . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id) / count(*) AS DYNSHA "
			. " from " . Area::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Area::TABLE . ".code = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			. " left join " . Family::TABLE_FAMILY_MEMBERSHIP
				. " on " . Official::TABLE . "." . Official::PRIMARY_KEY . " = " . Family::TABLE_FAMILY_MEMBERSHIP . ".official_id "
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by " . Area::TABLE . ".code ";

		$st = Database::get()->pdo->prepare($query);
		$st->bindParam(":year", $year, PDO::PARAM_INT);
		$st->execute();
		return $st->fetchAll();
	}

	private static function calculate_dynlar($year) {
		// DYNLAR(a,t) = max over f in F [ |DynOfficials(a,f,t)| ]

		// Gets the total elected of each area -> Total
		$subsubquery = 
			" select "
				. Area::TABLE . ".code "
				. " , count(*) AS Total "
			. " from " . Area::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Area::TABLE . ".code = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by " . Area::TABLE . ".code ";

		// Gets the share of each dynasty in an area -> Size
		$subquery = 
			" select "
				. "area_code"
				. " , " . Family::TABLE . "." . Family::PRIMARY_KEY
				. " , count( " . Family::TABLE . "." . Family::PRIMARY_KEY . ") AS Size "
				. " , Total"
			. " from "
				. " ( " . $subsubquery . " ) T "

			. " inner join " . Elect::TABLE
				. " on T.area_code = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			. " left join " . FAMILY::TABLE_FAMILY_MEMBERSHIP
				. " on " . Official::TABLE . "." . Official::PRIMARY_KEY . " = " . Family::TABLE_FAMILY_MEMBERSHIP . ".official_id "
			. " left join " . Family::TABLE
				. " on " . Family::TABLE . "." . Family::PRIMARY_KEY . " = " . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id "
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by "
				. "area_code"
				. " , " . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id "
			. " order by Size desc";

		// Gets the dynasty with the largest share in each area
		// (this following query works because $subquery is ordered by Size descending)
		$query = 
			" select code, id, Size, Total, 100 * Size / Total AS DYNLAR "
			. " from  ( " . $subquery . " ) T2 "
			. " group by code ";

		$st = Database::get()->pdo->prepare($query);
		$st->bindParam(":year", $year, PDO::PARAM_INT);
		$st->execute();
		return $st->fetchAll();
	}

	private static function calculate_dynherf($year) {
		// DYNHERF(a,t) = sum over f in F [ DynOfficials(a,f,t)^2 ]

		// Gets the total elected of each area -> Total
		$subsubquery = 
			" select "
				. Area::TABLE . ".code "
				. " , count(*) AS Total "
			. " from " . Area::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Area::TABLE . ".code = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by " . Area::TABLE . ".code ";

		// Gets the share of each dynasty in an area -> Size
		$subquery = 
			" select "
				. "area_code"
				. " , count( " . Family::TABLE . "." . Family::PRIMARY_KEY . ") AS Size "
				. " , Total"
			. " from "
				. " ( " . $subsubquery . " ) T "

			. " inner join " . Elect::TABLE
				. " on T.area_code = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			. " left join " . FAMILY::TABLE_FAMILY_MEMBERSHIP
				. " on " . Official::TABLE . "." . Official::PRIMARY_KEY . " = " . Family::TABLE_FAMILY_MEMBERSHIP . ".official_id "
			. " left join " . Family::TABLE
				. " on " . Family::TABLE . "." . Family::PRIMARY_KEY . " = " . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id "
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by "
				. "area_code "
				. " , " . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id ";

		// Computes the Herfindahl index
		$query = 
			" select code, Total, SUM(POW(Size / Total, 2)) AS DYNHERF "
			. " from  ( " . $subquery . " ) T2 "
			. " group by code ";

		$st = Database::get()->pdo->prepare($query);
		$st->bindParam(":year", $year, PDO::PARAM_INT);
		$st->execute();
		return $st->fetchAll();
	}

	private static function calculate_localdynastysize($year) {
		// LocalDynastySize(a,f,t) = | DynOfficials(a,f,t) |
		$query = 
			" select "
				. Area::TABLE . ".code "
				. " , " . Family::TABLE . "." . Family::PRIMARY_KEY
				. " , COUNT(*) AS LocalDynastySize "
			. " from " . Area::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Area::TABLE . ".code = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			. " inner join " . Family::TABLE_FAMILY_MEMBERSHIP
				. " on " . Official::TABLE . "." . Official::PRIMARY_KEY . " = " . Family::TABLE_FAMILY_MEMBERSHIP . ".official_id "
			. " inner join " . Family::TABLE
				. " on " . Family::TABLE . "." . Family::PRIMARY_KEY . " = " . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id "
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by "
				. Area::TABLE . ".code "
				. " , " . Family::TABLE . "." . Family::PRIMARY_KEY;

		$st = Database::get()->pdo->prepare($query);
		$st->bindParam(":year", $year, PDO::PARAM_INT);
		$st->execute();
		return $st->fetchAll();
	}

	private static function calculate_recursivedynastysize($year) {
		// RecursiveDynastySize(a,f,t) = LocalDynastySize(a,f,t) + sum over s in S(a) [ RecursiveDynastySize(s,f,t) ]
		$lds = static::calculate_localdynastysize($year);

		$rds_index = [];
		foreach ($lds as $l) {
			$area = (int) $l["code"];
			$family = (int) $l["id"];
			$value = $l["LocalDynastySize"];
			while($area) {
				if(!array_key_exists($area, $rds_index)) {
					$rds_index[$area] = [];
				}
				if(!array_key_exists($family, $rds_index[$area])) {
					$rds_index[$area][$family] = [
						"code" => $area,
						"id" => $family,
						"RecursiveDynastySize" => 0,
					];
				}
				$rds_index[$area][$family]["RecursiveDynastySize"] += $value;

				// TODO: use parent_code in the Area table first
				$area = Area::extract_subcodes($area)["parent_code"];
			}
		}

		$rds = [];
		foreach ($rds_index as $area => $families) {
			foreach ($families as $family => $row) {
				$rds[] = $row;
			}
		}

		return $rds;
	}
}