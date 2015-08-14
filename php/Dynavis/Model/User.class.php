<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class User extends \Dynavis\Core\Entity {
	const TABLE = "user";
	const FIELDS = [
		"active",
		"username",
		"pw_hash",
		"type",
		"salt",
	];
	const QUERY_FIELDS = ["username"];

	public static function get_by_username($username) {
		$ret = Database::get()->get(static::TABLE, static::PRIMARY_KEY, [
			"username" => Database::normalize_string($username)
		]);
		if($ret === false) throw new \Dynavis\Core\NotFoundException("Username not found. $username");
		return new User((int) $ret, false);
	}

	public function count_datasets($type = null) {
		$where = [
			static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
		];

		if(!is_null($type)) {
			switch ($type) {
				case "area": $type = 0; break;
				case "tag": $type = 1; break;
				default: $app->halt(400, "Invalid type. " . $type);
			}
			$where = ["AND" => array_merge($where, ["type" => $type])];
		}

		return Database::get()->count(Dataset::TABLE, [
			"[><]" . static::TABLE => ["user_id" => static::PRIMARY_KEY]
		], Dataset::TABLE . "." . Dataset::PRIMARY_KEY, $where);
	}

	public function get_datasets($count, $start, $type = null) {
		if($count < 0 || $start < -1) return false;

		$where = [
			static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
		];
		
		if(!is_null($type)) {
			switch ($type) {
				case "area": $type = 0; break;
				case "tag": $type = 1; break;
				default: $app->halt(400, "Invalid type. " . $type);
			}
			$where = ["AND" => array_merge($where, [Dataset::TABLE . ".type" => $type])];
		}

		if($count != 0) {
			$where["LIMIT"] = [(int) $start , (int) $count];
		}

		$fields = array_map(function($f) {
			return Dataset::TABLE . ".$f";
		}, array_merge(Dataset::FIELDS, [Dataset::PRIMARY_KEY]));

		return array_map(
			function ($data) {
				return new Dataset($data, false);
			},
			Database::get()->select(Dataset::TABLE, [
				"[><]" . static::TABLE => ["user_id" => static::PRIMARY_KEY]
			], $fields, $where)
		);
	}

	public function set_password($password) {
		$this->load();
		$this->salt = base64_encode(mcrypt_create_iv(96));
		$this->pw_hash = $this->hash_password($password);
	}

	public function check_password($password) {
		$this->load();
		if(is_null($this->pw_hash) || is_null($this->salt)) {
			throw new \RuntimeException("Password not set yet.");
		}
		
		return $this->pw_hash == $this->hash_password($password);
	}

	private function hash_password($password) {
		$this->load();
		return password_hash($password . substr($this->salt,4,4), PASSWORD_BCRYPT, ["salt" => $this->salt]);
	}

	public static function list_items($count, $start) {
		if($count < 0 || $start < -1) return false;
		$where = $count == 0 ? [] : ["LIMIT" => [(int) $start , (int) $count]];
		$where["ORDER"] = "active ASC";
		return [
			"total" => static::count(),
			"data" => Database::get()->select(static::TABLE, array_merge(static::FIELDS, [static::PRIMARY_KEY]), $where),
		];
	}

	public function save() {
		if(static::count() == 0) {
			// First user is admin
			$this->active = true;
			$this->type = 1;
		}
		parent::save();
	}

	public function jsonSerialize() {
		$data = parent::jsonSerialize();
		$data["active"] = $data["active"] != 0;
		$data["role"] = ["user", "admin"][$data["type"]];
		unset($data["id"]);
		unset($data["type"]);
		unset($data["pw_hash"]);
		unset($data["salt"]);
		return $data;
	}
}