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

$app->get("/officials", function () { generic_get_list("Official"); } );
$app->get("/officials/:id", "get_official" )->name("officials");
$app->get("/officials/:id/families", "get_official_families");
$app->get("/families", function () { generic_get_list("Family"); } );
$app->get("/families/:id", "get_family")->name("families");
$app->get("/families/:id/officials", "get_family_officials");
$app->get("/parties", function () { generic_get_list("Party"); } );
$app->get("/parties/:id", function ($id) { generic_get_item("Party", $id); })->name("parties");
$app->get("/parties/:id/elections", "get_party_elections");
$app->get("/areas/:level", "get_areas");
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

$app->post("/officials", $auth_admin, function () { generic_post_item("Official", "officials"); } );
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
$app->delete("/families/:family_id/officials/:id", $auth_admin, "delete_family_official");
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


// Generic

function generic_get_list($class) {
	global $app;
	$class = "\\Dynavis\\Model\\" . $class;

	$params = defaults($app->request->get(), [
		"count" => 100,
		"start" => 0,
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];

	$list = array_map(
		function ($item) use ($class) {
			return new $class((int) $item[$class::PRIMARY_KEY]);
		},
		$class::list_items($count, $start)
	);
	$total = $class::count();

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
	$app->response->headers->set("Location", $app->urlFor($name, [$class::PRIMARY_KEY => $item->get_id()]));
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

	if(!isset($data["id"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$family = new Family((int) $data["id"]);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid family ID.");
	}
	try {
		$family->add_member($official);
	}catch(DataException $e) {
		$app->halt(400, "Invalid data.");
	}

	$app->response->setStatus(201);
	echo json_encode($family);
}

function delete_official_family($official_id, $family_id) {
	global $app;
	try {
		$official = new Official((int) $official_id);
		$family = new Family((int) $family_id);
		$family->remove_member($official);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}catch(DataException $e) {
		$app->halt(404);
	}

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
	global $app;
	try {
		$family = new Family((int) $family_id);
		$official = new Official((int) $official_id);
		$family->remove_member($official);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}catch(DataException $e) {
		$app->halt(404);
	}

	$app->response->setStatus(204);
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

function get_areas($level) {
	global $app;
	$params = defaults($app->request->get(), [
		"count" => 100,
		"start" => 0,
	]);

	$start = (int) $params["start"];
	$count = (int) $params["count"];

	$areas = array_map(
		function ($item) {
			return new Area((int) $item[Area::PRIMARY_KEY]);
		},
		Area::list_areas($count, $start, $level)
	);
	$total = Area::count($level);

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
	$app->response->headers->set("Location", $app->urlFor("areas", [Area::PRIMARY_KEY => $area->get_id()]));
}


// Elections

function post_election() {
	global $app;
	$data = json_decode($app->request->getBody(), TRUE);
	if(is_null($data)) {
		$app->halt(400, "Malformed data.");
	}

	if(isset($_FILES["file"])) {
		return post_elections_file($_FILES["file"]);
	}

	if(!isset($data["official_id"], $data["year"], $data["year_end"], $data["position"], $data["votes"], $data["area_code"])) {
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
	$elect->position = $data["position"];
	$elect->votes = (int) $data["votes"];
	try {
		$elect->save();
	}catch(DataException $e) {
		$app->halt(400, "Invalid data.");
	}

	$app->response->setStatus(201);
	$app->response->headers->set("Location", $app->urlFor("elections", [Elect::PRIMARY_KEY => $elect->get_id()]));
}

function post_elections_file($file) {
	// TODO: file upload
	global $app;
	$app->halt(501);
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
	$app->response->headers->set("Location", $app->urlFor("users", ["username" => $user->username]));
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
			$app->halt(400, "Invalid file.");
		}
		Database::get()->pdo->commit();
	}

	$app->response->setStatus(201);
	$app->response->headers->set("Location", $app->request->getRootUri() . "/users/".urlencode($username)."/datasets/".$dataset->get_id());
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
	$app->response->headers->set("Location", $app->request->getRootUri() . "/users/".urlencode($username)."/datasets/".$dataset_id."/datapoints/".$datapoint->get_id());
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
