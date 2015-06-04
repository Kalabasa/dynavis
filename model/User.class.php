<?php
class User extends Entity{
	const TABLE = "user";
	protected $username = null;
	protected $pw_hash = null;
	protected $type = null;
	protected $salt = null;

	public static function get($username) {
		$ret = $this->db->get(self::TABLE, ["id"], ["username" => $username]);
		if(!$ret) return null;
		return new User($ret);
	}

	public function set_password($password) {
		$this->load();
		$this->salt = mcrypt_create_iv(128);
		$this->pw_hash = $this->hash_password($password);
	}

	public function check_password($password) {
		$this->load();
		if(is_null($this->pw_hash) || is_null($this->salt)) {
			throw new RuntimeException("Password not set yet.");
		}
		
		return $this->pw_hash == $this->hash_password($password);
	}

	private function hash_password($password) {
		$this->load();
		return password_hash($password, PASSWORD_BCRYPT, ["salt" => $this->salt]);
	}
}