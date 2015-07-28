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
	const QUERY_FIELDS = null;

	public function set($param) {
		$user = $param["user"];
		
		if(is_null($user->get_id())) {
			throw new \RuntimeException("The user is not yet stored in the database.");
		}

		$this->user_id = $user->get_id();
		$this->token = base64_encode(openssl_random_pseudo_bytes(96));
		$this->refresh();
	}

	public static function get_by_token($token) {
		$ret = Database::get()->get(static::TABLE, static::PRIMARY_KEY, ["token" => $token]);
		if($ret === false) throw new \Dynavis\Core\NotFoundException("Token not found. $token");
		return new Token((int) $ret, false);
	}

	public function get_user() {
		$this->load();
		return new User($this->user_id, false);
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

	public function refresh() {
		$this->set_expiry(new \DateTime("+10 days"));
	}

	public function jsonSerialize() {
		$data = parent::jsonSerialize();
		$data["username"] = (new User((int) $data["user_id"], false))->username;
		unset($data["user_id"]);
		return $data;
	}

	public static function cleanup() {
		$dt = new \DateTime("-10 hours");
		Database::get()->delete(static::TABLE, ["expiry[<]" => $dt->format("Y-m-d H:i:s")]);
	}
}