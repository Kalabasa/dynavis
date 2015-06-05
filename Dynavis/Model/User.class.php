<?php
namespace Dynavis\Model;

class User extends \Dynavis\Core\Entity {
	const TABLE = "user";
	const FIELDS = [
		"username",
		"pw_hash",
		"type",
		"salt",
	];

	public static function get($username) {
		static::init();
		$ret = $this->db->get(static::TABLE, [static::PRIMARY_KEY], ["username" => $username]);
		if(!$ret) return null;
		return new User((int) $ret);
	}

	public function get_datasets() {
		return array_map(
			function ($item) {
				return new Dataset((int) $item[Dataset::PRIMARY_KEY], false);
			},
			\Dynavis\Core\Entity::$medoo->select(Dataset::TABLE, [
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
		$this->salt = mcrypt_create_iv(128);
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
		unset($data["pw_hash"]);
		unset($data["salt"]);
		return $data;
	}
}