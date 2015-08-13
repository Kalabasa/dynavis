<?php
namespace Dynavis\Core;
use \PDO;
use \Dynavis\Database;

abstract class Entity implements \JsonSerializable{
	// Table name
	const TABLE = null;

	// Array of non-autoincrement fields in the database table
	const FIELDS = null;

	// Name of primary key field
	const PRIMARY_KEY = "id";

	// Fields to query when searching
	const QUERY_FIELDS = ["id"];

	// ID of this entity
	private $_id = null;

	// Actual data in the database; synchronized
	private $_data = null;

	public function __construct($id_or_data = null, $check = true) {
		if(isset($id_or_data)) {
			if(is_array($id_or_data)) { // assume assoc array
				$this->_data = [];
				foreach ($id_or_data as $k => $v) {
					if(in_array($k, static::FIELDS, true)) {
						$this->$k = $v;
						if(!$check) $this->_data[$k] = $v;
					}
				}
				if(!$check && isset($id_or_data[static::PRIMARY_KEY])) {
					$this->_id = $id_or_data[static::PRIMARY_KEY];
				}
			}else{ // not data, then id
				if(!$check || static::has($id_or_data)) {
					$this->_id = $id_or_data;
				}else{
					throw new NotFoundException("Entity ID is not in the database. " . get_class($this), 1);
				}
			}
		}else{
			$this->_data = [];
		}
	}

	public static function has($id) {
		return Database::get()->has(static::TABLE, [static::PRIMARY_KEY => $id]);
	}

	public static function count() {
		return Database::get()->count(static::TABLE);
	}

	public static function list_items($count, $start) {
		if($count < 0 || $start < -1) return false;
		$limit = $count == 0 ? null : ["LIMIT" => [(int) $start , (int) $count]];
		return [
			"total" => static::count(),
			"data" => Database::get()->select(static::TABLE, array_merge(static::FIELDS, [static::PRIMARY_KEY]), $limit),
		];
	}

	public static function query_items($count, $start, $query) {
		if($count < 0 || $start < -1) return false;
		if(!is_null($query) && empty($query)) return ["total" => 0, "data" => []];
		
		$where = " 1 ";
		if(is_null($query)) {
			$uquery = [];
		}else{
			$search_clause = " 1 ";
			$uquery = array_unique($query);
			foreach ($uquery as $k => $v) {
				$word_conditions = " 0 ";
				foreach (static::QUERY_FIELDS as $f) {
					$word_conditions .= " or $f like :query_$k";
				}
				$search_clause .= " and ($word_conditions) ";
			}
			$where .= " and ($search_clause) ";
		}

		function bind($statement, $uquery) {
			foreach ($uquery as $k => $v) {
				$statement->bindValue(":query_$k", "%$v%", PDO::PARAM_STR);
			}
		}

		$count_query = " select count(*) "
			. " from " . static::TABLE
			. " where $where ";

		$count_st = Database::get()->pdo->prepare($count_query);
		bind($count_st, $uquery);
		$count_st->execute();
		$total = (int) $count_st->fetch()[0];

		$select_query = " select " . join(",", array_merge(static::FIELDS, [static::PRIMARY_KEY]))
			. " from " . static::TABLE
			. " where $where ";
		if($count != 0) {
			$select_query .= " limit :start , :count ";
		}

		$select_st = Database::get()->pdo->prepare($select_query);
		bind($select_st, $uquery);
		if($count != 0) {
			$select_st->bindParam(":start", $start, PDO::PARAM_INT);
			$select_st->bindParam(":count", $count, PDO::PARAM_INT);
		}
		$select_st->execute();

		return [
			"total" => $total,
			"data" => $select_st->fetchAll(),
		];
	}

	public static function delete_all() {
		$ret = Database::get()->query("delete from " . static::TABLE);
		if(!$ret){
			throw new DataException("Error deleting entities from the database. " . get_called_class());
		}
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
			foreach (static::FIELDS as $f) {
				$this->$f = $this->_data[$f];
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
			if(!property_exists($this, $f)) {
				$this->$f = null;
			}
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