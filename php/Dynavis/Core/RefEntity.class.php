<?php
namespace Dynavis\Core;

abstract class RefEntity extends Entity {
	function __construct($id_or_data = null, $check_or_refs = false, $check = true) {
		if(!is_array($check_or_refs)) {
			if(is_bool($check_or_refs)){
				$check = $check_or_refs;
			}else{
				throw new \InvalidArgumentException("Invalid second parameter. Needs boolean.");
			}
		}
		parent::__construct($id_or_data, $check);
		if(is_array($check_or_refs)) $this->set($check_or_refs);
	}
	
	abstract public function set($references);
}