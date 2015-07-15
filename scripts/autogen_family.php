<?php
require 'php/init.include.php';

use \Dynavis\Database;
use \Dynavis\DataProcessor;
use \Dynavis\Model\Official;
use \Dynavis\Model\Family;

$officials = Official::list_items(0, 0);
Database::get()->pdo->beginTransaction();
try {
	foreach ($officials["data"] as $o) {
		$official = new Official((int) $o["id"], false);
		$family = Family::get_by_name($official->surname);
		if(!$family) {
			$family = new Family();
			$family->name = $official->surname;
			$family->save();
		}
		$family->add_member($official);
	}

	$families = Family::list_items(0, 0);
	foreach ($families["data"] as $f) {
		if($f->count_members() == 1) {
			$f->delete();
		}
	}
}catch(Exception $e) {
	Database::get()->pdo->rollBack();
	throw $e;
}
Database::get()->pdo->commit();