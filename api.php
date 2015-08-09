<?php
require 'php/init.include.php';

use \Dynavis\Database;
use \Dynavis\Core\Entity;
use \Dynavis\Core\NotFoundException;
use \Dynavis\Core\DataException;

use \Dynavis\Model\Official;
use \Dynavis\Model\Family;
use \Dynavis\Model\Party;
use \Dynavis\Model\Area;
use \Dynavis\Model\Elect;
use \Dynavis\Model\User;
use \Dynavis\Model\Dataset;
use \Dynavis\Model\Datapoint;
use \Dynavis\Model\Token;

use \Dynavis\DataProcessor;

\Slim\Route::setDefaultConditions([
	"id" => "\d+",
	"id_" => "\d+",
	"code" => "\d{8,9}",
	"level" => "region|province|municipality|barangay",
	"zoom" => "\d+",
	"x" => "\d+",
	"y" => "\d+",
]);

$app = new \Slim\Slim(["debug" => true]);

$auth_admin = authenticator(["roles" => ["admin"]]);
$auth_username = authenticator(["username_match" => true]);
$auth_token = authenticator(["token_match" => true]);
$auth_username_or_admin = authenticator(["username_match" => true, "roles" => ["admin"]]);

//-----------------------------------------------------------------------------
// GET requests
//-----------------------------------------------------------------------------

$app->get("/officials", function () { generic_get_list("Official"); } )->name("officials");
$app->get("/officials/:id", "get_official");
$app->get("/officials/:id/families", "get_official_families");
$app->get("/families", function () { generic_get_list("Family"); } );
$app->get("/families/:id", "get_family");
$app->get("/families/:id/officials", "get_family_officials");
$app->get("/parties", function () { generic_get_list("Party"); } );
$app->get("/parties/:id", function ($id) { generic_get_item("Party", $id); });
$app->get("/parties/:id/elections", "get_party_elections");
$app->get("/areas", "get_areas")->name("areas");
$app->get("/areas/id/:id", "get_area");
$app->get("/areas/:code", "code_to_id", "get_area");
$app->get("/areas/id/:id/elections", "get_area_elections");
$app->get("/areas/:code/elections", "code_to_id", "get_area_elections");
$app->get("/elections", function () { generic_get_list("Elect"); } );
$app->get("/elections/:id", function ($id) { generic_get_item("Elect", $id); } );
$app->get("/users", function () { generic_get_list("User"); } );
$app->get("/users/:username", "get_user");
$app->get("/users/:username/datasets", "get_user_datasets");
$app->get("/users/:username/datasets/:id", "get_user_dataset");
$app->get("/users/:username/datasets/:id/datapoints", "get_user_dataset_datapoints");
$app->get("/users/:username/datasets/:id_/datapoints/:id", "get_user_dataset_datapoint");
$app->get("/datasets", "get_datasets");
$app->get("/tokens/:id", $auth_token, "get_token");
$app->get("/geojson/:level/:zoom/:x/:y", "get_geojson");


//-----------------------------------------------------------------------------
// POST requests
//-----------------------------------------------------------------------------

$app->post("/officials", $auth_admin, "post_official");
$app->post("/officials/:id/families", $auth_admin, "post_official_family");
$app->post("/families", $auth_admin, function () { generic_post_item("Family", "families"); } );
$app->post("/families/:id/officials", $auth_admin, "post_family_official");
$app->post("/parties", $auth_admin, function () { generic_post_item("Party", "parties"); } );
$app->post("/areas", $auth_admin, "post_area");
$app->post("/elections", $auth_admin, "post_election");
$app->post("/users", "post_user");
$app->post("/users/:username/datasets", $auth_username, "post_user_dataset");
$app->post("/users/:username/datasets/:id/datapoints", $auth_username, "post_user_dataset_datapoint");
$app->post("/tokens", "post_token");
$app->post("/geojson/:level", $auth_admin, "post_geojson");
$app->post("/generate-indicator", $auth_admin, "generate_indicator");


//-----------------------------------------------------------------------------
// PUT requests
//-----------------------------------------------------------------------------

$app->map("/officials/:id", $auth_admin, function ($id) { generic_put_item("Official", $id); } )->via("PUT", "PATCH");
$app->map("/families/:id", $auth_admin, function ($id) { generic_put_item("Family", $id); } )->via("PUT", "PATCH");
$app->map("/parties/:id", $auth_admin, function ($id) { generic_put_item("Party", $id); } )->via("PUT", "PATCH");
$app->map("/areas/id/:id", $auth_admin, "put_area")->via("PUT", "PATCH");
$app->map("/areas/:code", $auth_admin, "code_to_id", "put_area")->via("PUT", "PATCH");
$app->map("/elections/:id", $auth_admin, function ($id) { generic_put_item("Elect", $id); } )->via("PUT", "PATCH");
$app->map("/users/:username", $auth_username_or_admin, "put_user")->via("PUT", "PATCH");
$app->map("/users/:username/datasets/:id", $auth_username, "put_user_dataset")->via("PUT", "PATCH");
$app->map("/users/:username/datasets/:id_/datapoints/:id", $auth_username, "put_user_dataset_datapoint")->via("PUT", "PATCH");


//-----------------------------------------------------------------------------
// DELETE requests
//-----------------------------------------------------------------------------

$app->delete("/officials/:id", $auth_admin, function ($id) { generic_delete_item("Official", $id); } );
$app->delete("/officials/:official_id/families/:id", $auth_admin, "delete_official_family");
$app->delete("/families", $auth_admin, function () { generic_delete_all("Family"); } );
$app->delete("/families/:id", $auth_admin, function ($id) { generic_delete_item("Family", $id); } );
$app->delete("/families/:official_id/officials/:id", $auth_admin, "delete_family_official");
$app->delete("/parties/:id", $auth_admin, function ($id) { generic_delete_item("Party", $id); } );
$app->delete("/areas", $auth_admin, function () { generic_delete_all("Area"); } );
$app->delete("/areas/id/:id", $auth_admin, "delete_area");
$app->delete("/areas/:code", "code_to_id", $auth_admin, "delete_area");
$app->delete("/elections", $auth_admin, "delete_all_elections");
$app->delete("/elections/:id", $auth_admin, function ($id) { generic_delete_item("Elect", $id); } );
$app->delete("/users/:username", $auth_username_or_admin, "delete_user");
$app->delete("/users/:username/datasets/:id", $auth_username_or_admin, "delete_user_dataset");
$app->delete("/users/:username/datasets/:id_/datapoints/:id", $auth_username, "delete_user_dataset_datapoint");
$app->delete("/tokens/:id", $auth_token, function ($id) { generic_delete_item("Token", $id); } );

$app->run();


//-----------------------------------------------------------------------------
// Function definitions
//-----------------------------------------------------------------------------

function defaults($params, $defaults){
	foreach ($params as $key => $value) {
		$defaults[$key] = $value;
	}
	return $defaults;
}

function code_to_id($route) {
	global $app;
	$code = $route->getParams()["code"];
	try {
		$area = Area::get_by_code((int) $code);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}
	$app->is_id_from_code = true;
	$app->redirect($app->request->getRootUri() . preg_replace("/(?=\/)?\d{8,9}(?=\/)?/", "id/" . $area->get_id(), $app->request->getResourceUri()));
}

function authenticator($options) {
	global $app;
	return function($route) use ($options, $app) {
		$auth = $app->request->headers->get("Authorization");

		if(!isset($auth)) {
			$app->halt(401);
		}

		$matches = array();
		preg_match('/Token token="(.*)"/', $auth, $matches);
		if(isset($matches[1])){
			$token_string = $matches[1];
		}else{
			$app->halt(401);
		}

		$token = \Dynavis\Model\Token::get_by_token($token_string);
		if(!$token || !$token->valid()) {
			$app->halt(401);
		}

		$user = $token->get_user();
		$role = ["user", "admin"][$user->type];

		$allow = false;
		if(isset($options["roles"]) && in_array($role, $options["roles"])) {
			$allow = true;
		}else if(isset($options["username_match"]) && $route->getParam("username") === $user->username) {
			$allow = true;
		}else if(isset($options["token_match"]) && (int) $route->getParam("id") === $token->get_id()) {
			$allow = true;
		}

		if(!$allow) {
			$app->halt(403);
		}

		$app->user_id = $user->get_id();
	};
}

function normalize_query($query_string) {
	return preg_split("/\W+/", $query_string, null, PREG_SPLIT_NO_EMPTY);
}


// Generic

function generic_get_list($class) {
	global $app;
	$class = "\\Dynavis\\Model\\" . $class;

	$params = defaults($app->request->get(), [
		"count" => 0,
		"start" => 0,
		"q" => null,
		"qnorm" => true,
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];
	if(!is_null($params["q"])) {
		$query = $params["qnorm"]
			? normalize_query($params["q"])
			: [$params["q"]];
	}

	$result = isset($query)
		? $class::query_items($count, $start, $query)
		: $class::list_items($count, $start);
	if(!$result) {
		$app->halt(400, "Invalid request parameters.");
	}
	$list = array_map(
		function ($data) use ($class) {
			return new $class($data, false);
		},
		$result["data"]
	);
	$total = $result["total"];

	$end = $start + count($list);
	if($end > $total) $end = $total;

	echo json_encode([
		"total" => $total,
		"start" => $start,
		"end" => $end,
		"data" => $list,
	]);
}

function generic_get_item($class, $id) {
	global $app;
	$class = "\\Dynavis\\Model\\" . $class;
	try {
		$item = new $class((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	echo json_encode($item);
}

function generic_post_item($class, $name) {
	global $app;
	$class = "\\Dynavis\\Model\\" . $class;

	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	$item = new $class();
	foreach ($class::FIELDS as $field) {
		if(!isset($data[$field])) {
			$app->halt(400, "Incomplete data. " . $field);
		}
		$item->$field = $data[$field];
	}
	try {
		$item->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($item);
}

function generic_put_item($class, $id) {
	global $app;
	$class = "\\Dynavis\\Model\\" . $class;

	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	try {
		$item = new $class((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	foreach ($data as $key => $value) {
		if(!in_array($key, $class::FIELDS)) {
			$app->halt(400, "Invalid property. " . $key);
		}
		$item->$key = $value;
	}
	try {
		$item->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	echo json_encode($item);
}

function generic_delete_item($class, $id) {
	global $app;
	$class = "\\Dynavis\\Model\\" . $class;
	try {
		$item = new $class((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	try {
		$item->delete();
	}catch(DataException $e) {
		$app->halt(400, $e->getMessage());
	}

	$app->response->setStatus(204);
}

function generic_delete_all($class) {
	global $app;
	$class = "\\Dynavis\\Model\\" . $class;
	$class::delete_all();
	$app->response->setStatus(204);
}


// Officials

function get_official($id) {
	global $app;
	try {
		$official = new Official((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	echo json_encode($official);
}

function get_official_families($id) {
	global $app;
	try {
		$official = new Official((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$families = $official->get_families();

	echo json_encode([
		"total" => count($families),
		"data" => $families,
	]);
}

function post_official() {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["surname"], $data["name"])) {
		$app->halt(400, "Incomplete data.");
	}

	$official = new Official();
	$official->surname = $data["surname"];
	$official->name = $data["name"];
	$official->nickname = isset($data["nickname"]) ? $data["nickname"] : null;
	try {
		$official->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($official);
}

function post_official_family($id) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	try {
		$official = new Official((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	Database::get()->pdo->beginTransaction();

	if(isset($data["id"])) {
		try {
			$family = new Family((int) $data["id"]);
		}catch(NotFoundException $e) {
			Database::get()->pdo->rollback();
			$app->halt(400, "Invalid family ID.");
		}
	}else if(isset($data["name"])) {
		$family = new Family();
		$family->name = $data["name"];
		try{
			$family->save();
		}catch(DataException $e) {
			Database::get()->pdo->rollback();
			$app->halt(400, "Invalid family data. " . $e->getMessage());
		}
	}else{
		Database::get()->pdo->rollback();
		$app->halt(400, "Incomplete data.");
	}

	try {
		$family->add_member($official);
	}catch(DataException $e) {
		Database::get()->pdo->rollback();
		$app->halt(400, $e->getMessage());
	}

	Database::get()->pdo->commit();

	$app->response->setStatus(201);
	echo json_encode($family);
}

function delete_official_family($official_id, $family_id) {
	global $app;

	Database::get()->pdo->beginTransaction();
	
	try {
		$official = new Official((int) $official_id);
		$family = new Family((int) $family_id);
		$family->remove_member($official);
	}catch(NotFoundException $e) {
		Database::get()->pdo->rollback();
		$app->halt(404);
	}catch(DataException $e) {
		Database::get()->pdo->rollback();
		$app->halt(404);
	}

	Database::get()->pdo->commit();

	$app->response->setStatus(204);
}


// Families

function get_family($id) {
	global $app;
	try {
		$family = new Family((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	echo json_encode($family);
}

function get_family_officials($id) {
	global $app;

	$params = defaults($app->request->get(), [
		"year" => False,
	]);

	try {
		$family = new Family((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$members = $family->get_members($params["year"]);

	echo json_encode([
		"total" => count($members),
		"data" => $members,
	]);
}

function post_family_official($id) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	try {
		$family = new Family((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	if(!isset($data["id"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$official = new Official((int) $data["id"]);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid official ID.");
	}

	try {
		$family->add_member($official);
	}catch(DataException $e) {
		$app->halt(400, $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($official);
}

function delete_family_official($family_id, $official_id) {
	return delete_official_family($official_id, $family_id);
}


// Parties

function get_party_elections($id) {
	global $app;
	try {
		$party = new Party((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$elections = $party->get_elections();

	echo json_encode([
		"total" => count($elections),
		"data" => $elections,
	]);
}


// Areas

function get_areas() {
	global $app;
	$params = defaults($app->request->get(), [
		"count" => 0,
		"start" => 0,
		"level" => null,
		"q" => null,
		"qnorm" => true,
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];

	if(isset($params["level"])) $level = $params["level"];
	else $level = null;

	if(is_null($params["q"])) {
		$query = null;
	}else{
		$query = $params["qnorm"]
			? normalize_query($params["q"])
			: [$params["q"]];
	}

	$result = Area::list_areas($count, $start, $level, $query);
	if(!$result) {
		$app->halt(400, "Invalid request parameters.");
	}
	$areas = array_map(
		function ($data) {
			return new Area($data, false);
		},
		$result["data"]
	);
	$total = $result["total"];

	$end = $start + count($areas);
	if($end > $total) $end = $total;

	echo json_encode([
		"total" => $total,
		"start" => $start,
		"end" => $end,
		"data" => $areas,
	]);
}

function get_area($id) {
	global $app;
	try {
		$area = new Area((int) $id, !$app->is_id_from_code);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	echo json_encode($area);
}

function get_area_elections($id) {
	global $app;
	try {
		$area = new Area((int) $id, !$app->is_id_from_code);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$elections = $area->get_elections();

	echo json_encode([
		"total" => count($elections),
		"data" => $elections,
	]);
}

function put_area($id) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	$area = new Area((int) $id, !$app->is_id_from_code);
	if(!$area) {
		$app->halt(404);
	}

	if(isset($data["level"])) {
		$data["type"] = [
			"region" => 0,
			"province" => 1,
			"municipality" => 2,
			"barangay" => 3,
		][$data["level"]];
		unset($data["level"]);
	}

	foreach ($data as $key => $value) {
		if(!in_array($key, Area::FIELDS)) {
			$app->halt(400, "Invalid property. " . $key);
		}
		$area->$key = $value;
	}
	try {
		$area->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	echo json_encode($area);
}

function post_area() {
	global $app;

	if(isset($_FILES["file"])) {
		return post_areas_file($_FILES["file"]);
	}

	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["code"], $data["name"], $data["level"])) {
		$app->halt(400, "Incomplete data.");
	}

	$area = new Area();
	$area->code = (int) $data["code"];
	$area->name = $data["name"];
	$area->type = [
		"region" => 0,
		"province" => 1,
		"municipality" => 2,
		"barangay" => 3,
	][$data["level"]];
	try {
		$area->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($area);
}

function post_areas_file($file) {
	global $app;
	Database::get()->pdo->beginTransaction();
	try {
		Area::file($file);
	}catch(DataException $e) {
		Database::get()->pdo->rollBack();
		$app->halt(400, "Invalid file. " . $e->getMessage());
	}
	Database::get()->pdo->commit();
	$app->response->setStatus(201);
	$app->response->headers->set("Location", $app->urlFor("areas"));
}

function delete_area($id) {
	global $app;
	try {
		$area = new Area((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	try {
		$area->delete();
	}catch(DataException $e) {
		$app->halt(400, $e->getMessage());
	}

	$app->response->setStatus(204);
}


// Elections

function post_election() {
	global $app;

	if(isset($_FILES["file"])) {
		return post_elections_file($_FILES["file"]);
	}

	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}


	if(!isset($data["official_id"], $data["year"], $data["year_end"], $data["area_code"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$official = new Official((int) $data["official_id"]);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid official ID.");
	}
	try{
		$area = Area::get_by_code((int) $data["area_code"]);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid area code.");
	}
	try{
		$party = isset($data["party_id"]) ? new Party((int) $data["party_id"]) : null;
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid party ID.");
	}

	$elect = new Elect(null, [
		"official" => $official,
		"area" => $area,
		"party" => $party,
	]);
	$elect->year = (int) $data["year"];
	$elect->year_end = (int) $data["year_end"];
	$elect->position = isset($data["position"]) ? $data["position"] : null;
	$elect->votes = isset($data["votes"]) ? (int) $data["votes"] : null;
	try {
		$elect->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($elect);
}

function post_elections_file($file) {
	global $app;
	Database::get()->pdo->beginTransaction();
	try {
		Elect::file($file);
	}catch(DataException $e) {
		Database::get()->pdo->rollBack();
		$app->halt(400, "Invalid file. " . $e->getMessage());
	}
	Database::get()->pdo->commit();
	$app->response->setStatus(201);
	$app->response->headers->set("Location", $app->urlFor("officials"));
}

function delete_all_elections() { // Deletes EVERYTHING! except areas,datasets,etc
	global $app;
	Elect::delete_all();
	Party::delete_all();
	Database::get()->query("delete from " . Family::TABLE_FAMILY_MEMBERSHIP);
	Official::delete_all();
	Family::delete_all();
	$app->response->setStatus(204);
}


// Users

function get_user($username) {
	global $app;
	try {
		$user = User::get_by_username($username);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}
	echo json_encode($user);
}

function post_user() {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["username"], $data["password"])) {
		$app->halt(400, "Incomplete data.");
	}

	$user = new User();
	$user->username = $data["username"];
	$user->set_password($data["password"]);
	$user->type = 0;
	try {
		$user->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($user);
}

function put_user($username) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	try {
		$user = User::get_by_username($username);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	if(array_key_exists("password", $data)) {
		if(!isset($data["old_password"])) {
			$app->halt(400, "No old_password parameter found. The current password is needed to change password.");
		}else if(!$user->check_password($data["old_password"])) {
			$app->halt(400, "Invalid old password.");
		}
		$user->set_password($data["password"]);
	}

	if(array_key_exists("role", $data)) {
		switch ($data["role"]) {
			case "user": $type = 0; break;
			case "admin": $type = 1; break;
			default: $app->halt(400, "Invalid role. " . $data["role"]);
		}
		$user->type = $type;
	}

	try {
		$user->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	echo json_encode($user);
}

function delete_user($username) {
	global $app;
	try {
		$user = User::get_by_username($username);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	try {
		$user->delete();
	}catch(DataException $e) {
		$app->halt(400, $e->getMessage());
	}

	$app->response->setStatus(204);
}


// Datasets

function get_datasets() {
	global $app;
	$params = defaults($app->request->get(), [
		"count" => 0,
		"start" => 0,
		"type" => null,
		"q" => null,
		"qnorm" => true,
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];

	if(isset($params["type"])) $type = $params["type"];
	else $type = null;

	if(is_null($params["q"])) {
		$query = null;
	}else{
		$query = $params["qnorm"]
			? normalize_query($params["q"])
			: [$params["q"]];
	}

	$result = Dataset::list_datasets($count, $start, $type, $query);
	if(!$result) {
		$app->halt(400, "Invalid request parameters.");
	}
	$areas = array_map(
		function ($data) {
			return new Dataset($data, false);
		},
		$result["data"]
	);
	$total = $result["total"];

	$end = $start + count($areas);
	if($end > $total) $end = $total;

	echo json_encode([
		"total" => $total,
		"start" => $start,
		"end" => $end,
		"data" => $areas,
	]);
}

function get_user_datasets($username) {
	global $app;
	$params = defaults($app->request->get(), [
		"count" => 0,
		"start" => 0,
		"type" => null,
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];

	try {
		$user = User::get_by_username($username);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	$type = $params["type"];
	$datasets = $user->get_datasets($count, $start, $type);
	$total = $user->count_datasets($type);

	$end = $start + count($datasets);
	if($end > $total) $end = $total;

	echo json_encode([
		"total" => $total,
		"start" => $start,
		"end" => $end,
		"data" => $datasets,
	]);
}

function get_user_dataset($username, $dataset_id) {
	global $app;
	try {
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	if($dataset->user_id != $user->get_id()) {
		$app->halt(404);
	}

	echo json_encode($dataset);
}

function get_user_dataset_datapoint($username, $dataset_id, $datapoint_id) {
	global $app;
	try {
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	if($dataset->user_id != $user->get_id()) {
		$app->halt(404);
	}
	try {
		$datapoint = new Datapoint((int) $datapoint_id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	if($datapoints->dataset_id != $dataset->get_id()) {
		$app->halt(404);
	}

	echo json_encode($datapoint);
}

function get_user_dataset_datapoints($username, $dataset_id) {
	global $app;
	$params = defaults($app->request->get(), [
		"count" => 0,
		"start" => 0,
		"type" => null,
		"year" => null,
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];
	$year = is_null($params["year"]) ? null : (int) $params["year"];

	try {
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	if($dataset->user_id != $user->get_id()) {
		$app->halt(404);
	}

	echo json_encode($dataset->get_points($count, $start, $year));
}

function post_user_dataset($username) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["name"], $data["description"], $data["type"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$user = User::get_by_username($username);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	$dataset = new Dataset(null, ["user" => $user]);
	$dataset->name = $data["name"];
	$dataset->type = [
		"area" => 0,
		"tag" => 1,
	][$data["type"]];
	$dataset->description = $data["description"];
	try {
		$dataset->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($dataset);
}

function post_user_dataset_datapoint($username, $dataset_id) {
	global $app;

	if(isset($_FILES["file"])) {
		return post_dataset_file($username, $dataset_id, $_FILES["file"]);
	}

	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	try {
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	if($dataset->user_id != $user->get_id()) {
		$app->halt(404);
	}

	if(!isset($data["year"], $data["area_code"], $data["value"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$area = Area::get_by_code((int) $data["area_code"]);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid area code.");
	}

	$datapoint = new Datapoint([
		"dataset" => $dataset,
		"area" => $area,
	]);
	$datapoint->year = $data["year"];
	$datapoint->value = $data["value"];	
	try {
		$datapoint->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($datapoint);
}

function post_dataset_file($username, $dataset_id, $file) {
	global $app;
	
	try {
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	Database::get()->pdo->beginTransaction();
	try {
		$dataset->file($_FILES["file"]);
	}catch(DataException $e) {
		Database::get()->pdo->rollBack();
		$app->halt(400, "Invalid file. " . $e->getMessage());
	}
	Database::get()->pdo->commit();

	$app->response->setStatus(201);
}

function put_user_dataset($username, $dataset_id) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	try {
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	if($dataset->user_id != $user->get_id()) {
			$app->halt(404);
	}

	foreach ($data as $key => $value) {
		if(!in_array($key, Dataset::FIELDS)) {
			$app->halt(400, "Invalid property. " . $key);
		}
		$dataset->$key = $value;
	}
	try {
		$dataset->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}
}

function put_user_dataset_datapoint($username, $dataset_id, $datapoint_id) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	try{
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
		$datapoint = new Datapoint((int) $datapoint_id);
		if($dataset->user_id != $user->get_id() || $datapoint->dataset_id != $dataset_id) {
			$app->halt(404);
		}
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	foreach ($data as $key => $value) {
		if(!in_array($key, Datapoint::FIELDS)) {
			$app->halt(400, "Invalid property. " . $key);
		}
		$datapoint->$key = $value;
	}
	try {
		$datapoint->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	echo json_encode($datapoint);
}

function delete_user_dataset($username, $dataset_id) {
	global $app;
	try {
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	if($dataset->user_id != $user->get_id()) {
			$app->halt(404);
	}

	try {
		$dataset->delete();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data. " . $e->getMessage());
	}

	$app->response->setStatus(204);
}

function delete_user_dataset_datapoint($username, $dataset_id, $datapoint_id) {
	global $app;

	try{
		$user = User::get_by_username($username);
		$dataset = new Dataset((int) $dataset_id);
		$datapoint = new Datapoint((int) $datapoint_id);
		if($dataset->user_id != $user->get_id() || $datapoint->dataset_id != $dataset_id) {
			$app->halt(404);
		}
	}catch(NotFoundException $e) {
		$app->halt(404, $e->getMessage());
	}

	try {
		$datapoint->delete();
	}catch(DataException $e) {
		$app->halt(400, $e->getMessage());
	}

	$app->response->setStatus(204);
}


// Tokens

function get_token($id) {
	global $app;
	try {
		$token = new Token((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$token->refresh();
	
	Token::cleanup();

	echo json_encode($token);
}

function post_token() {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["username"], $data["password"])) {
		$app->halt(400, "Incomplete data.");
	}

	try{
		$user = User::get_by_username($data["username"]);
	}catch(NotFoundException $e) {
		$app->halt(401, "Invalid username or password.");
	}
	if(!$user->check_password($data["password"])) {
		$app->halt(401, "Invalid username or password.");
	}

	$token = new Token(null, ["user" => $user]);
	$token->save();

	Token::cleanup();

	$app->response->setStatus(201);
	echo json_encode($token);
}


// GeoJSON

function get_geojson($level, $zoom, $x, $y) {
	global $app;

	$target_zoom = [ // These zoom levels must match with the client
		"region" => 0,
		"province" => 8,
		"municipality" => 10,
		"barangay" => 12,
	][$level];

	$s = pow(2, $target_zoom - $zoom);
	$x = floor((int)$x * $s);
	$y = floor((int)$y * $s);

	$url = dirname($app->request->getRootUri()) . "/data/$level/$x/$y.json";
	$path = __DIR__ . "/data/$level/$x/$y.json";

	if(file_exists($path)) {
		$app->response->setStatus(302);
		$app->response->headers->set("Location", $url);
	}else{
		echo "null";
	}
}

function post_geojson($level) {
	global $app;

	if(!isset($_FILES["file"])) {
		$app->halt(400, "No file uploaded.");
	}

	$file = $_FILES["file"];
	$error = $file["error"];
	if($error != UPLOAD_ERR_OK) {
		switch ($error) { 
			case UPLOAD_ERR_INI_SIZE: 
				$message = "The uploaded file exceeds the upload_max_filesize directive in php.ini"; 
				break; 
			case UPLOAD_ERR_FORM_SIZE: 
				$message = "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form"; 
				break; 
			case UPLOAD_ERR_PARTIAL: 
				$message = "The uploaded file was only partially uploaded"; 
				break; 
			case UPLOAD_ERR_NO_FILE: 
				$message = "No file was uploaded"; 
				break; 
			case UPLOAD_ERR_NO_TMP_DIR: 
				$message = "Missing a temporary folder"; 
				break; 
			case UPLOAD_ERR_CANT_WRITE: 
				$message = "Failed to write file to disk"; 
				break; 
			case UPLOAD_ERR_EXTENSION: 
				$message = "File upload stopped by extension"; 
				break; 

			default: 
				$message = "Unknown upload error"; 
				break; 
		} 
		throw new \RuntimeException("File upload error. " . $message);
	}

	if(!is_uploaded_file($file["tmp_name"])) {
		throw new \RuntimeException("Invalid file.");
	}

	$size = $file["size"];
	if($size == 0) {
		throw new DataException("No file or empty file was uploaded.");
	}

	$dir = "./data";
	if(!is_dir($dir)) {
		if(!mkdir($dir, 0775)) {
			throw new \RuntimeException("Cannot create data directory.");
		}
	}

	$dest = "$dir/$level.json";
	if(!copy($file["tmp_name"], $dest)) {
		throw new \RuntimeException("Cannot save file!");
	}

	exec(escapeshellcmd("./scripts/process_geojson.py " . escapeshellarg($dest) . " " . escapeshellarg($level) . " &"));

	$app->response->setStatus(204);
}


// Generate indicator

function generate_indicator() {
	global $app;

	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["username"], $data["indicator"], $data["description"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$user = User::get_by_username($data["username"]);
	}catch(NotFoundException $e) {
		$app->halt(400, $e->getMessage());
	}
	$indicator = $data["indicator"];
	$description = $data["description"];

	try{
		$dataset = DataProcessor::generate_indicator($indicator, $description, $user);
	}catch(DataException $e) {
		$app->halt(403, "Unsuccessful. Make sure the necessary data, such as election records, political dynasty associations, and complete area data, are in-place. " . $e->getMessage());
	}

	$app->response->setStatus(201);
	echo json_encode($dataset);
}