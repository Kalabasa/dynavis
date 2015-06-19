<?php
namespace Dynavis\Model;
use \Dynavis\Database;

class Token extends \Dynavis\Core\RefEntity {
	const TABLE = "token";
	const FIELDS = [
		"user_id",
		"token",
		"expiry",
	];

	public function set($param) {
		$user = $param["user"];
		
		if(is_null($user->get_id())) {
			throw new \RuntimeException("The user is not yet stored in the database.");
		}

		$this->user_id = $user->get_id();
		$this->token = base64_encode(openssl_random_pseudo_bytes(96));
		$this->expiry = (new \DateTime("+30 minutes"))->format("Y-m-d H:i:s");
	}

	public static function get_by_token($token) {
		$ret = Database::get()->get(static::TABLE, [static::PRIMARY_KEY], ["token" => $token]);
		if(!$ret) return null;
		return new Token((int) $ret[static::PRIMARY_KEY]);
	}

	public function get_user() {
		$this->load();
		return new User($this->user_id);
	}

	public function valid() {
		$this->load();
		$now = new \DateTime();
		$expiry = new \DateTime($this->expiry);
		return $now < $expiry;
	}

	public function set_expiry($datetime) {
		$this->load();
		$this->expiry = $datetime->format("Y-m-d H:i:s");
	}

	public function jsonSerialize() {
		$data = parent::jsonSerialize();
		$data["username"] = (new User((int) $data["user_id"]))->username;
		unset($data["user_id"]);
		return $data;
	}
}