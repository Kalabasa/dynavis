<?php
namespace Dynavis\Core;

abstract class Entity {
	private static $medoo;

	// Database handle
	protected $_db = null;

	// Array of non-autoincrement fields in the database table
	protected $_fields = null;

	// ID of this entity
	private $_id = null;

	// Actual data in the database; synchronized
	private $_data = null;

	// Name of primary key field
	private $_key_field = null;

	const TABLE = null;

	public function __construct($id = null) {
		$this->_db = self::$medoo;

		$columns = $this->_db->query("show columns from " . static::TABLE)->fetchAll();
		$this->_fields = [];
		foreach($columns as $c) {
			if($c["Key"] == "PRI") {
				if(isset($this->_key_field)){
					throw new RuntimeException("Multiple primary keys are not supported.");
				}
				$this->_key_field = $c["Field"];
			}
			if($c["Extra"] == "auto_increment") continue;

			$this->_fields[] = $c["Field"];
		}

		if(isset($id)) {
			if($this->_db->has(static::TABLE, [$this->_key_field => $id])) {
				$this->_id = (int) $id;
			}else{
				throw new RuntimeException("Entity ID is not in the database. " . get_class($this), 1);
			}
		}else{
			$this->_data = [];
		}
	}

	public function __get($prop) {
		if(!in_array($prop, $this->_fields, true) || !property_exists($this, $prop)){
			throw new RuntimeException("Property is not accessible. " . get_class($this) . "::" . $prop);
		}

		$this->load();
		return $this->$prop;
	}

	public function __set($prop, $value) {
		if(!in_array($prop, $this->_fields, true) || !property_exists($this, $prop)){
			throw new RuntimeException("Property is not accessible. " . get_class($this) . "::" . $prop);
		}

		$this->load();
		$this->$prop = $value;
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
			throw new RuntimeException("Cannot delete a new entity.");
		}

		$ret = $this->_db->delete(static::TABLE, [$this->_key_field => $this->_id]);

		if(!$ret){
			throw new RuntimeException("Error deleting entity from the database. " . get_class($this));
		}

		$this->_data = null;
	}

	public function get_id() { return $this->_id; }

	protected function load() {
		if(is_null($this->_data) && isset($this->_id)){
			$this->_data = $this->_db->get(static::TABLE, $this->_fields, [$this->_key_field => $this->_id]);
			foreach ($this->_data as $key => $value) {
				$this->$key = $value;
			}
		}
	}

	private function update() {
		if(is_null($this->_data)) return;

		$update_data = [];
		foreach ($this->_fields as $f) {
			if($this->_data[$f] != $this->$f) {
				$update_data[$f] = $this->$f;
			}
		}

		if(!empty($update_data)){
			$ret = $this->_db->update(static::TABLE, $update_data, [$this->_key_field => $this->_id]);

			if(!$ret) {
				throw new RuntimeException("Error updating entity in the database. " . get_class($this));
			}

			foreach ($update_data as $key => $value) {
				$this->_data[$key] = $value;
			}
		}
	}

	private function insert() {
		$insert_data = [];
		foreach ($this->_fields as $f) {
			$insert_data[$f] = $this->$f;
		}

		$ret = $this->_db->insert(static::TABLE, $insert_data);

		if(!in_array($this->_key_field, $this->_fields)) {
			if(!$ret) {
				throw new RuntimeException("Error adding entity to the database. " . get_class($this));
			}

			$this->_id = (int) $ret;
		}else{
			$this->_id = (int) $insert_data[$this->_key_field];
		}

		$this->_data = $insert_data;
	}

	public static function init() {
		self::$medoo = new \medoo(DB_CONFIG);
	}
}

Entity::init();