<?php
namespace Dynavis\Core;

abstract class Entity implements \JsonSerializable{
	// Table name
	const TABLE = null;

	// Array of non-autoincrement fields in the database table
	const FIELDS = null;

	// Name of primary key field
	const PRIMARY_KEY = "id";

	// Medoo
	public static $medoo = null;

	// ID of this entity
	private $_id = null;

	// Actual data in the database; synchronized
	private $_data = null;

	public function __construct($id = null, $check = true) {
		static::init();

		// Get the item data if id is given
		if(isset($id)) {
			if(!$check || self::$medoo->has(static::TABLE, [static::PRIMARY_KEY => $id])) {
				$this->_id = (int) $id;
			}else{
				throw new \RuntimeException("Entity ID is not in the database. " . get_class($this), 1);
			}
		}else{
			$this->_data = [];
		}
	}

	public static function init() {
		if(!isset(self::$medoo)) self::$medoo = new \medoo(DB_CONFIG);
	}

	public static function count() {
		static::init();
		return (int) self::$medoo->count(static::TABLE);
	}

	public static function list_items($count, $start) {
		static::init();
		return self::$medoo->select(static::TABLE, [static::PRIMARY_KEY], ["LIMIT" => [(int) $start , (int) $count]]);
	}

	public function save() {
		if(isset($this->_id)) {
			$this->update();
		}else{
			$this->insert();
		}
	}
	
	public function delete() {
		if(!isset($this->_id)){
			throw new \RuntimeException("Cannot delete a new entity.");
		}

		$ret = self::$medoo->delete(static::TABLE, [static::PRIMARY_KEY => $this->_id]);

		if(!$ret){
			throw new \RuntimeException("Error deleting entity from the database. " . get_class($this));
		}

		$this->_data = null;
	}

	public function get_id() { return $this->_id; }

	protected function load() {
		if(is_null($this->_data) && isset($this->_id)){
			$this->_data = self::$medoo->get(static::TABLE, static::FIELDS, [static::PRIMARY_KEY => $this->_id]);
			foreach ($this->_data as $key => $value) {
				$this->$key = $value;
			}
		}
	}

	public function jsonSerialize() {
		if(is_null($this->_id)){
			throw new \RuntimeException("Cannot serialize unsaved entity.");
		}

		if(is_null($this->_data)) $this->load();
		$data = $this->_data;
		$data[static::PRIMARY_KEY] = $this->_id;
		return $data;
	}

	public function __get($prop) {
		if(!in_array($prop, static::FIELDS, true) && !property_exists($this, $prop)){
			throw new \RuntimeException("Property is not accessible. " . get_class($this) . "::" . $prop);
		}

		$this->load();
		return $this->$prop;
	}

	public function __set($prop, $value) {
		if(!in_array($prop, static::FIELDS, true) && !property_exists($this, $prop)){
			throw new \RuntimeException("Property is not accessible. " . get_class($this) . "::" . $prop);
		}

		$this->load();
		$this->$prop = $value;
	}

	private function update() {
		if(is_null($this->_data)) return;

		$update_data = [];
		foreach (static::FIELDS as $f) {
			if($this->_data[$f] != $this->$f) {
				$update_data[$f] = $this->$f;
			}
		}

		if(!empty($update_data)){
			$ret = self::$medoo->update(static::TABLE, $update_data, [static::PRIMARY_KEY => $this->_id]);

			if(!$ret) {
				throw new \RuntimeException("Error updating entity in the database. " . get_class($this));
			}

			foreach ($update_data as $key => $value) {
				$this->_data[$key] = $value;
			}
		}
	}

	private function insert() {
		$insert_data = [];
		foreach (static::FIELDS as $f) {
			$insert_data[$f] = $this->$f;
		}

		$ret = self::$medoo->insert(static::TABLE, $insert_data);

		if(!in_array(static::PRIMARY_KEY, static::FIELDS)) {
			if(!$ret) {
				throw new \RuntimeException("Error adding entity to the database. " . get_class($this));
			}

			$this->_id = (int) $ret;
		}else{
			$this->_id = (int) $insert_data[static::PRIMARY_KEY];
		}

		$this->_data = $insert_data;
	}
}
Entity::init();