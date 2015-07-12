<?php
namespace Dynavis;
use \PDO;
use \Dynavis\Database;
use \Dynavis\Model\Official;
use \Dynavis\Model\Family;
use \Dynavis\Model\Area;
use \Dynavis\Model\Elect;

class DataProcessor {
	public static function calculate_indicator($name) {
		$calc_function = [
			"DYNSHA" => "calculate_dynsha",
			"DYNLAR" => "calculate_dynlar",
			"DYNHERF" => "calculate_dynherf",
			"LocalDynastySize" => "calculate_localdynastysize",
			"RecursiveDynastySize" => "calculate_recursivedynastysize",
		][$name];

		$variables = [
			"DYNSHA" => ["code"],
			"DYNLAR" => ["code"],
			"DYNHERF" => ["code"],
			"LocalDynastySize" => ["code", "id"],
			"RecursiveDynastySize" => ["code", "id"],
		][$name];

		$min_year = Database::get()->min(Elect::TABLE, "year");
		$max_year = Database::get()->max(Elect::TABLE, "year_end") - 1;

		$result = [];

		for($t = $min_year; $t <= $max_year; $t++) {
			$subresult = static::$calc_function($t);
			foreach ($subresult as $s) {
				$arr = &$result;
				foreach ($variables as $v) {
					$key = $s[$v];
					if(!array_key_exists($key, $arr)) {
						$arr[$key] = [];
					}
					$arr = &$arr[$key];
				}
				$arr[$t] = $s[$name];
			}
		}

		return [
			"min_year" => $min_year,
			"max_year" => $max_year,
			"result" => $result,
		];
	}

	private static function calculate_dynsha($year) {
		// DYNSHA(a,t) = | Officials(a,t) ∩ IsMembers(t) |
		$query =
			" select "
				. Area::TABLE . "." . Area::PRIMARY_KEY
				. " , count(" . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id) AS Size "
				. " , count(*) AS Total "
				. " , count(" . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id) / count(*) AS DYNSHA "
			. " from " . Area::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Area::TABLE . "." . Area::PRIMARY_KEY . " = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			. " left join " . Family::TABLE_FAMILY_MEMBERSHIP
				. " on " . Official::TABLE . "." . Official::PRIMARY_KEY . " = " . Family::TABLE_FAMILY_MEMBERSHIP . ".official_id "
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by " . Area::TABLE . "." . Area::PRIMARY_KEY;

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
				. Area::TABLE . "." . Area::PRIMARY_KEY
				. " , count(*) AS Total "
			. " from " . Area::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Area::TABLE . "." . Area::PRIMARY_KEY . " = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by " . Area::TABLE . "." . Area::PRIMARY_KEY;

		// Gets the share of each dynasty in an area -> Size
		$subquery = 
			" select "
				. Area::PRIMARY_KEY
				. " , " . Family::TABLE . "." . Family::PRIMARY_KEY
				. " , count( " . Family::TABLE . "." . Family::PRIMARY_KEY . ") AS Size "
				. " , Total"
			. " from "
				. " ( " . $subsubquery . " ) T "

			. " inner join " . Elect::TABLE
				. " on T." . Area::PRIMARY_KEY . " = " . Elect::TABLE . ".area_code "
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
				. Area::PRIMARY_KEY
				. " , " . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id "
			. " order by Size desc";

		// Gets the dynasty with the largest share in each area
		// (this following query works because $subquery is ordered by Size descending)
		$query = 
			" select code, id, Size, Total, 100 * Size / Total AS DYNLAR "
			. " from  ( " . $subquery . " ) T2 "
			. " group by " . Area::PRIMARY_KEY;

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
				. Area::TABLE . "." . Area::PRIMARY_KEY
				. " , count(*) AS Total "
			. " from " . Area::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Area::TABLE . "." . Area::PRIMARY_KEY . " = " . Elect::TABLE . ".area_code "
			. " inner join " . Official::TABLE
				. " on " . Elect::TABLE . ".official_id = " . Official::TABLE . "." . Official::PRIMARY_KEY
			
			. " where "
				. Elect::TABLE . ".year <= :year "
				. " and " . Elect::TABLE . ".year_end > :year "
			. " group by " . Area::TABLE . "." . Area::PRIMARY_KEY;

		// Gets the share of each dynasty in an area -> Size
		$subquery = 
			" select "
				. Area::PRIMARY_KEY
				. " , count( " . Family::TABLE . "." . Family::PRIMARY_KEY . ") AS Size "
				. " , Total"
			. " from "
				. " ( " . $subsubquery . " ) T "

			. " inner join " . Elect::TABLE
				. " on T." . Area::PRIMARY_KEY . " = " . Elect::TABLE . ".area_code "
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
				. Area::PRIMARY_KEY
				. " , " . Family::TABLE_FAMILY_MEMBERSHIP . ".family_id ";

		// Computes the Herfindahl index
		$query = 
			" select code, Total, SUM(POW(Size / Total, 2)) AS DYNHERF "
			. " from  ( " . $subquery . " ) T2 "
			. " group by " . Area::PRIMARY_KEY;

		$st = Database::get()->pdo->prepare($query);
		$st->bindParam(":year", $year, PDO::PARAM_INT);
		$st->execute();
		return $st->fetchAll();
	}

	private static function calculate_localdynastysize($year) {
		// LocalDynastySize(a,f,t) = | DynOfficials(a,f,t) |
		$query = 
			" select "
				. Area::TABLE . "." . Area::PRIMARY_KEY
				. " , " . Family::TABLE . "." . Family::PRIMARY_KEY
				. " , COUNT(*) AS LocalDynastySize "
			. " from " . Area::TABLE

			. " inner join " . Elect::TABLE
				. " on " . Area::TABLE . "." . Area::PRIMARY_KEY . " = " . Elect::TABLE . ".area_code "
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
				. Area::TABLE . "." . Area::PRIMARY_KEY
				. " , " . Family::TABLE . "." . Family::PRIMARY_KEY;

		$st = Database::get()->pdo->prepare($query);
		$st->bindParam(":year", $year, PDO::PARAM_INT);
		$st->execute();
		return $st->fetchAll();
	}

	private static function calculate_recursivedynastysize($year) {
		// RecursiveDynastySize(a,f,t) = LocalDynastySize(a,f,t) + sum over s in S(a) [ RecursiveDynastySize(s,f,t) ]
		$lds = static::calculate_localdynastysize($year);
		$rds = $lds;

		$rds_index = [];
		foreach ($rds as &$r) {
			$area = $r["code"];
			$family = $r["id"];
			$r["RecursiveDynastySize"] = $r["LocalDynastySize"];
			unset($r["LocalDynastySize"]);
			if(!array_key_exists($area, $rds_index)) {
				$rds_index[$area] = [];
			}
			$rds_index[$area][$family] = &$r;
		}

		foreach ($lds as $l) {
			$area = $l["code"];
			$family = $l["id"];
			$value = $l["LocalDynastySize"];
			while($area) {
				// TODO: use parent_code in the Area table first
				$area = Area::extract_subcodes($area)["parent_code"];
				if(!array_key_exists($area, $rds_index)) {
					$rds_index[$area] = [];
				}
				if(!array_key_exists($family, $rds_index[$area])) {
					$new_row = [
						"code" => $area,
						"id" => $family,
						"RecursiveDynastySize" => 0,
					];
					$rds[] = &$new_row;
					$rds_index[$area][$family] = &$new_row;
				}
				$rds_index[$area][$family]["RecursiveDynastySize"] += $value;
			}
		}

		return $rds;
	}
}