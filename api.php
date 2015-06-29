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

\Slim\Route::setDefaultConditions([
	"id" => "\d+",
	"code" => "\d{9}",
	"level" => "region|province|municipality|barangay",
]);

$app = new \Slim\Slim(["debug" => true]);
$auth_admin = authenticator(["roles" => ["admin"]]);
$auth_username = authenticator(["username_match" => true]);
$auth_token = authenticator(["token_match" => true]);
$auth_username_or_admin = authenticator(["username_match" => true, "roles" => ["admin"]]);

//-----------------------------------------------------------------------------
// GET requests
//-----------------------------------------------------------------------------

$app->get("/officials", function () { generic_get_list("Official", ["surname", "name"]); } );
$app->get("/officials/:id", "get_official" )->name("officials");
$app->get("/officials/:id/families", "get_official_families");
$app->get("/families", function () { generic_get_list("Family", ["name"]); } );
$app->get("/families/:id", "get_family")->name("families");
$app->get("/families/:id/officials", "get_family_officials");
$app->get("/parties", function () { generic_get_list("Party", ["name"]); } );
$app->get("/parties/:id", function ($id) { generic_get_item("Party", $id); })->name("parties");
$app->get("/parties/:id/elections", "get_party_elections");
$app->get("/areas", "get_areas");
$app->get("/areas/:code", function ($code) { generic_get_item("Area", $code); } )->name("areas");
$app->get("/areas/:code/elections", "get_area_elections");
$app->get("/elections", function () { generic_get_list("Elect"); } );
$app->get("/elections/:id", function ($id) { generic_get_item("Elect", $id); } )->name("elections");
$app->get("/users", function () { generic_get_list("User"); } );
$app->get("/users/:username", "get_user")->name("users");
$app->get("/users/:username/datasets", "get_user_datasets");
$app->get("/users/:username/datasets/:id", "get_user_dataset");
$app->get("/users/:username/datasets/:id/datapoints", "get_user_dataset_datapoints");
$app->get("/datasets", function () { generic_get_list("Dataset"); } );
$app->get("/tokens/:id", $auth_token, function ($id) { generic_get_item("Token", $id); } )->name("tokens");


//-----------------------------------------------------------------------------
// POST requests
//-----------------------------------------------------------------------------

$app->post("/officials", $auth_admin, "post_official" );
$app->post("/officials/:id/families", $auth_admin, "post_official_family");
$app->post("/families/:id/officials", $auth_admin, "post_family_official");
$app->post("/parties", $auth_admin, function () { generic_post_item("Party", "parties"); } );
$app->post("/areas", $auth_admin, "post_area");
$app->post("/elections", $auth_admin, "post_election");
$app->post("/users", "post_user");
$app->post("/users/:username/datasets", $auth_username, "post_user_dataset");
$app->post("/users/:username/datasets/:id/datapoints", $auth_username, "post_user_dataset_datapoint");
$app->post("/tokens", "post_token");


//-----------------------------------------------------------------------------
// PUT requests
//-----------------------------------------------------------------------------

$app->put("/officials/:id", $auth_admin, function ($id) { generic_put_item("Official", $id); } );
$app->put("/families/:id", $auth_admin, function ($id) { generic_put_item("Family", $id); } );
$app->put("/parties/:id", $auth_admin, function ($id) { generic_put_item("Party", $id); } );
$app->put("/areas/:code", $auth_admin, "put_area" );
$app->put("/elections/:id", $auth_admin, function ($id) { generic_put_item("Elect", $id); } );
$app->put("/users/:username", $auth_username_or_admin, "put_user" );
$app->put("/users/:username/datasets/:id", $auth_username, "put_user_dataset" );
$app->put("/users/:username/datasets/:dataset_id/datapoints/:id", $auth_username, "put_user_dataset_datapoint" );


//-----------------------------------------------------------------------------
// DELETE requests
//-----------------------------------------------------------------------------

$app->delete("/officials/:id", $auth_admin, function ($id) { generic_delete_item("Official", $id); } );
$app->delete("/officials/:official_id/families/:id", $auth_admin, "delete_official_family");
$app->delete("/families/:id", $auth_admin, function ($id) { generic_delete_item("Family", $id); } );
$app->delete("/families/:official_id/officials/:id", $auth_admin, "delete_family_official");
$app->delete("/parties/:id", $auth_admin, function ($id) { generic_delete_item("Party", $id); } );
$app->delete("/areas/:code", $auth_admin, function ($code) { generic_delete_item("Area", $code); } );
$app->delete("/elections/:id", $auth_admin, function ($id) { generic_delete_item("Elect", $id); } );
$app->delete("/users/:username", $auth_username_or_admin, "delete_user" );
$app->delete("/users/:username/datasets/:id", $auth_username_or_admin, "delete_user_dataset" );
$app->delete("/users/:username/datapoints/:id", $auth_username, "delete_user_dataset_datapoint" );
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

function authenticator($options) {
	return function() {};
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

function generic_get_list($class, $search_fields = null) {
	global $app;
	$class = "\\Dynavis\\Model\\" . $class;

	$params = defaults($app->request->get(), [
		"count" => 0,
		"start" => 0,
		"q" => null,
		"norm" => true
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];
	if(!is_null($search_fields) && !is_null($params["q"])) {
		$query = $params["norm"]
			? normalize_query($params["q"])
			: [$params["q"]];
	}

	$result = isset($query)
		? $class::query_items($count, $start, $query, $search_fields)
		: $class::list_items($count, $start);
	if(!$result) {
		$app->halt(400, "Invalid request parameters.");
	}
	$list = array_map(
		function ($item) use ($class) {
			return new $class((int) $item[$class::PRIMARY_KEY]);
		},
		$result["data"]
	);
	$total = $result["total"];

	$end = $start + $count;
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
		$app->halt(400, "Invalid data.");
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
		$app->halt(400, "Invalid data.");
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


// Officials

function get_official($id) {
	global $app;
	try {
		$official = new Official((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$families = $official->get_families();

	$obj = $official->jsonSerialize();
	$obj["families"] = [
		"total" => count($families),
		"data" => $families,
	];

	echo json_encode($obj);
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
		$app->halt(400, "Invalid data.");
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
			$app->halt(400, "Invalid data.");
		}
	}else{
		Database::get()->pdo->rollback();
		$app->halt(400, "Incomplete data.");
	}

	try {
		$family->add_member($official);
	}catch(DataException $e) {
		Database::get()->pdo->rollback();
		$app->halt(400, "Invalid data.");
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
	$members = $family->get_members();

	$obj = $family->jsonSerialize();
	$obj["members"] = [
		"total" => count($members),
		"data" => $members,
	];

	echo json_encode($obj);
}

function get_family_officials($id) {
	global $app;
	try {
		$family = new Family((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$members = $family->get_members();

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
		$app->halt(400, "Invalid data.");
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
		"q" => null,
		"norm" => true,
		"level" => null,
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];
	if(!is_null($params["q"])) {
		$query = $params["norm"]
			? normalize_query($params["q"])
			: [$params["q"]];
	}
	if(isset($params["level"])) $level = $params["level"];
	else $level = null;

	$result = isset($query)
		? Area::query_areas($count, $start, $query, $level)
		: Area::list_areas($count, $start, $level);
	if(!$result) {
		$app->halt(400, "Invalid request parameters.");
	}
	$areas = array_map(
		function ($item) {
			return new Area((int) $item[Area::PRIMARY_KEY]);
		},
		$result["data"]
	);
	$total = $result["total"];

	$end = $start + $count;
	if($end > $total) $end = $total;

	echo json_encode([
		"total" => $total,
		"start" => $start,
		"end" => $end,
		"data" => $areas,
	]);
}

function get_area_elections($code) {
	global $app;
	try {
		$area = new Area((int) $code);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$elections = $area->get_elections();

	echo json_encode([
		"total" => count($elections),
		"data" => $elections,
	]);
}

function put_area($code) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	$area = new Area((int)$code);
	if(!$area) {
		$app->halt(404);
	}

	$data["type"] = [
		"region" => 0,
		"province" => 1,
		"municipality" => 2,
		"barangay" => 3,
	][$data["level"]];
	unset($data["level"]);

	foreach ($data as $key => $value) {
		if(!in_array($key, Area::FIELDS)) {
			$app->halt(400, "Invalid property. " . $key);
		}
		$area->$key = $value;
	}
	try {
		$area->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data.");
	}

	echo json_encode($area);
}

function post_area() {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["code"], $data["name"], $data["level"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$parent = isset($data["parent_code"]) ? new Area((int) $data["parent_code"]) : null;
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid parent code.");
	}
	$area = new Area(["parent" => $parent]);
	$area->code = $data["code"];
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
		$app->halt(400, "Invalid data.");
	}

	$app->response->setStatus(201);
	echo json_encode($area);
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
		$area = new Area((int) $data["area_code"]);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid area code.");
	}
	try{
		$party = isset($data["party_id"]) ? new Party((int) $data["party_id"]) : null;
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid party ID.");
	}

	$elect = new Elect([
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
		$app->halt(400, "Invalid data.");
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


// Users

function get_user($username) {
	global $app;
	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
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
		$app->halt(400, "Invalid data.");
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

	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	$data["type"] = [
		"user" => 0,
		"admin" => 1,
	][$data["role"]];
	unset($data["role"]);

	foreach ($data as $key => $value) {
		if(!in_array($key, User::FIELDS)) {
			$app->halt(400, "Invalid property. " . $key);
		}
		$user->$key = $value;
	}
	try {
		$user->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data.");
	}

	echo json_encode($user);
}

function delete_user($username) {
	global $app;
	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	try {
		$user->delete();
	}catch(DataException $e) {
		$app->halt(400, $e->getMessage());
	}

	$app->response->setStatus(204);
}


// Datasets

function get_user_datasets($username) {
	global $app;
	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}
	$datasets = $user->get_datasets();

	echo json_encode([
		"total" => count($datasets),
		"data" => $datasets,
	]);
}

function get_user_dataset($username, $dataset_id) {
	global $app;
	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	try {
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	if($dataset->user_id != $user->get_id()) {
		$app->halt(404);
	}

	echo json_encode($dataset);
}

function get_user_dataset_datapoints($username, $dataset_id) {
	global $app;
	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	try {
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	if($dataset->user_id != $user->get_id()) {
		$app->halt(404);
	}

	$datapoints = $dataset->get_points();

	echo json_encode([
		"total" => count($datapoints),
		"data" => $datapoints,
	]);
}

function post_user_dataset($username) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["name"], $data["description"])) {
		$app->halt(400, "Incomplete data.");
	}

	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	$dataset = new Dataset(["user" => $user]);
	$dataset->name = $data["name"];
	$dataset->description = $data["description"];
	try {
		$dataset->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data.");
	}

	if(isset($_FILES["file"])) {
		Database::get()->pdo->beginTransaction();
		try {
			$dataset->file($_FILES["file"]);
		}catch(DataException $e) {
			Database::get()->pdo->rollBack();
			$app->halt(400, "Invalid file. " . $e->getMessage());
		}
		Database::get()->pdo->commit();
	}

	$app->response->setStatus(201);
	echo json_encode($dataset);
}

function post_user_dataset_datapoint($username, $dataset_id) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	try {
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	if($dataset->user_id != $user->get_id()) {
		$app->halt(404);
	}

	if(!isset($data["year"], $data["area_code"], $data["value"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$area = new Area((int) $data["area_code"]);
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
		$app->halt(400, "Invalid data.");
	}

	$app->response->setStatus(201);
	echo json_encode($datapoint);
}

function put_user_dataset($username, $dataset_id) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	try{
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404);
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
		$app->halt(400, "Invalid data.");
	}
}

function put_user_dataset_datapoint($username, $dataset_id, $datapoint_id) {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	try{
		$dataset = new Dataset((int) $dataset_id);
		if($dataset->user_id != $user->get_id()) {
			$app->halt(404);
		}
		$datapoint = new Datapoint((int) $datapoint_id);
		if($datapoint->dataset_id != $dataset_id) {
			$app->halt(404);
		}
	}catch(NotFoundException $e) {
		$app->halt(404);
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
		$app->halt(400, "Invalid data.");
	}
}

function delete_user_dataset($username, $dataset_id) {
	global $app;
	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	try{
		$dataset = new Dataset((int) $dataset_id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	if($dataset->user_id != $user->get_id()) {
			$app->halt(404);
	}

	try {
		$dataset->delete();
	}catch(DataException $e) {
		$app->halt(400, $e->getMessage());
	}

	$app->response->setStatus(204);
}

function delete_user_dataset_datapoint($username, $dataset_id, $datapoint_id) {
	global $app;
	$user = User::get_by_username($username);
	if(!$user) {
		$app->halt(404);
	}

	try{
		$dataset = new Dataset((int) $dataset_id);
		if($dataset->user_id != $user->get_id()) {
			$app->halt(404);
		}
		$datapoint = new Datapoint((int) $datapoint_id);
		if($datapoint->dataset_id != $dataset_id) {
			$app->halt(404);
		}
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	try {
		$datapoint->delete();
	}catch(DataException $e) {
		$app->halt(400, $e->getMessage());
	}

	$app->response->setStatus(204);
}


// Tokens

function post_token() {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(!isset($data["username"], $data["password"])) {
		$app->halt(400, "Incomplete data.");
	}

	$user = User::get_by_username($data["username"]);
	if(is_null($user) || !$user->check_password($data["password"])) {
		$app->halt(400, "Invalid username or password.");
	}

	$token = new Token(["user" => $user]);
	$token->save();

	Token::cleanup();

	$app->response->setStatus(201);
	echo json_encode($token);
}
