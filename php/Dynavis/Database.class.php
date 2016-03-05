<?php
namespace Dynavis;

class Database {
	private static $medoo;
	public static function get() {
		if(!isset(self::$medoo)) self::$medoo = new \medoo(include("php/db_config.include.php"));
		return self::$medoo;
	}

	public static function normalize_string($str) {
		return preg_replace("/[[:space:]]+/", " ", trim($str));
	}
}