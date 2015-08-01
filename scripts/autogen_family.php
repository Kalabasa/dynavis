<?php
require '../php/init.include.php';

use \Dynavis\Database;
use \Dynavis\DataProcessor;
use \Dynavis\Model\Official;
use \Dynavis\Model\Family;

$officials = Official::list_items(0, 0);
Database::get()->pdo->beginTransaction();
try {
	$total = $officials["total"];
	$i = 0;
	foreach ($officials["data"] as $o) {
		print "$i/$total\n"; $i++;
		$official = new Official((int) $o["id"], false);
		try {
			$family = Family::get_by_name($official->surname);
		}catch(\Dynavis\Core\NotFoundException $e) {
			$family = new Family();
			$family->name = $official->surname;
			$family->save();
		}
		$family->add_member($official);
	}

	// Delete single-member families
	Database::get()->query(
		"DELETE FROM family
		WHERE
			id IN (SELECT 
				T.family_id
			FROM
				(SELECT 
					family_id
				FROM
					family_membership
				INNER JOIN family ON id = family_id
				GROUP BY id
				HAVING COUNT(*) = 1) T)"
	);
}catch(Exception $e) {
	Database::get()->pdo->rollBack();
	throw $e;
}
Database::get()->pdo->commit();