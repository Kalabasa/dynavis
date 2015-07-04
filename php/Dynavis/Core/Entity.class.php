<?php
namespace Dynavis\Core;
use \Dynavis\Database;

abstract class Entity implements \JsonSerializable{
	// Table name
	const TABLE = null;

	// Array of non-autoincrement fields in the database table
	const FIELDS = null;

	// Name of primary key field
	const PRIMARY_KEY = "id";

	// ID of this entity
	private $_id = null;

	// Actual data in the database; synchronized
	private $_data = null;

	public function __construct($id = null, $check = true) {
		// Get the item data if id is given
		if(isset($id)) {
			if(!$check || static::has($id)) {
				$this->_id = $id;
			}else{
				throw new NotFoundException("Entity ID is not in the database. " . get_class($this), 1);
			}
		}else{
			$this->_data = [];
		}
	}

	public static function has($id) {
		return Database::get()->has(static::TABLE, [static::PRIMARY_KEY => $id])
	}

	public static function count() {
		return Database::get()->count(static::TABLE);
	}

	public static function list_items($count, $start) {
		if($count < 0 || $start < -1) return false;
		$limit = $count == 0 ? null : ["LIMIT" => [(int) $start , (int) $count]];
		return [
			"total" => static::count(),
			"data" => Database::get()->select(static::TABLE, [static::PRIMARY_KEY], $limit),
		];
	}

	public static function query_items($count, $start, $query, $fields) {
		if($count < 0 || $start < -1) return false;
		
		$uquery = array_unique($query);
		$search = [];
		foreach ($fields as $f) {
			$search[$f . "[~]"] = $uquery;
		}
		$where = [
			"OR" => $search
		];

		$total = Database::get()->count(static::TABLE, $where);
		if($count != 0) {
			$where["LIMIT"] = [(int) $start , (int) $count];
		}

		return [
			"total" => $total,
			"data" => Database::get()->select(static::TABLE, [static::PRIMARY_KEY], $where),
		];
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

		$ret = Database::get()->delete(static::TABLE, [static::PRIMARY_KEY => $this->_id]);

		if(!$ret){
			throw new DataException("Error deleting entity from the database. " . get_class($this));
		}

		$this->_data = null;
	}

	public function get_id() { return $this->_id; }

	protected function load() {
		if(is_null($this->_data) && isset($this->_id)) {
			$this->_data = Database::get()->get(static::TABLE, static::FIELDS, [static::PRIMARY_KEY => $this->_id]);
			// TODO: cast values to field types
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
			$ret = Database::get()->update(static::TABLE, $update_data, [static::PRIMARY_KEY => $this->_id]);

			if(!$ret) {
				throw new DataException("Error updating entity in the database. " . get_class($this));
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

		$ret = Database::get()->insert(static::TABLE, $insert_data);

		if(!in_array(static::PRIMARY_KEY, static::FIELDS)) {
			if(!$ret) {
				throw new DataException("Error adding entity to the database. " . get_class($this));
			}

			$this->_id = (int) $ret;
		}else{
			$this->_id = (int) $insert_data[static::PRIMARY_KEY];
		}

		$this->_data = $insert_data;
	}
}