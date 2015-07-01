<?php
namespace Dynavis;

class Database {
	private static $medoo;
	public static function get() {
		if(!isset(self::$medoo)) self::$medoo = new \medoo(DB_CONFIG);
		return self::$medoo;
	}

	public static function normalize_string($str) {
		return preg_replace("/[[:space:]]+/", " ", trim($str));
	}
}