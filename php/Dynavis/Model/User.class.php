<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class User extends \Dynavis\Core\Entity {
	const TABLE = "user";
	const FIELDS = [
		"username",
		"pw_hash",
		"type",
		"salt",
	];

	public static function get_by_username($username) {
		$ret = Database::get()->get(static::TABLE, [static::PRIMARY_KEY], ["username" => $username]);
		if(!$ret) return null;
		return new User((int) $ret[static::PRIMARY_KEY]);
	}

	public function get_datasets() {
		return array_map(
			function ($item) {
				return new Dataset((int) $item[Dataset::PRIMARY_KEY], false);
			},
			Database::get()->select(Dataset::TABLE, [
				"[><]" . static::TABLE => ["user_id" => static::PRIMARY_KEY]
			], [
				Dataset::TABLE . "." . Dataset::PRIMARY_KEY
			],[
				static::TABLE . "." . static::PRIMARY_KEY => $this->get_id()
			])
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
		return password_hash($password, PASSWORD_BCRYPT, ["salt" => $this->salt]);
	}

	public function jsonSerialize() {
		$data = parent::jsonSerialize();
		$data["role"] = ["user", "admin"][$data["type"]];
		unset($data["id"]);
		unset($data["type"]);
		unset($data["pw_hash"]);
		unset($data["salt"]);
		return $data;
	}
}