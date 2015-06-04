<?
namespace Dynavis\Core;

abstract class RefEntity extends Entity {
	function __construct($param) {
		if(is_int($param)){
			parent::__construct($param);
		}elseif(is_array($param)) {
			parent::__construct();
			$this->set($param);
		}else{
			throw new \InvalidArgumentException("Constructor only accepts an integer ID or an array.");
		}
	}
	
	abstract public function set($param);
}