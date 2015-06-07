<?php
require 'php/init.include.php';

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

\Slim\Route::setDefaultConditions([
	"id" => "\d+",
	"code" => "\d{9}",
	"level" => "region|province|municipality|barangay",
]);

$app = new \Slim\Slim(["debug" => true]);

//-----------------------------------------------------------------------------
// GET requests
//-----------------------------------------------------------------------------

$app->get("/officials", function () { generic_get_list("Official"); } );
$app->get("/officials/:id", "get_official" )->name("officials");
$app->get("/officials/:id/families", "get_official_families");
$app->get("/families", function () { generic_get_list("Family"); } );
$app->get("/families/:id", "get_family")->name("families");
$app->get("/families/:id/officials", "get_family_officials");
// TODO: get official-family => true/false
$app->get("/parties", function () { generic_get_list("Party"); } );
$app->get("/parties/:id", "get_party")->name("parties");
$app->get("/areas/:level", "get_areas");
$app->get("/areas/:code", function ($code) { generic_get_item("Area", $code); } )->name("areas");
$app->get("/areas/:code/officials", "get_area_officials");
$app->get("/elections", function () { generic_get_list("Elect"); } );
$app->get("/elections/:id", function ($id) { generic_get_item("Elect", $id); } )->name("elects");
$app->get("/users", function () { generic_get_list("User"); } );
$app->get("/users/:id", function ($id) { generic_get_item("User", $id); } )->name("users");
$app->get("/users/:id/datasets", "get_user_datasets");
$app->get("/datasets", function () { generic_get_list("Dataset"); } );
$app->get("/datasets/:id", function ($id) { generic_get_item("Dataset", $id); } )->name("datasets");
$app->get("/datasets/:id/datapoints", "get_dataset_datapoints");


//-----------------------------------------------------------------------------
// POST requests
//-----------------------------------------------------------------------------

$app->post("/officials", function () { generic_post_item("Official", "officials"); } );
$app->post("/officials/:id/families", "post_official_family");
$app->post("/families", function () { generic_post_item("Family", "families"); } );
$app->post("/families/:id/officials", "post_family_official");
$app->post("/parties", function () { generic_post_item("Party", "parties"); } );
$app->post("/areas", "post_area");
$app->post("/elections", "post_election");
$app->post("/users", "post_user");
$app->post("/datasets", "post_dataset");
$app->post("/datasets/:id/datapoints", "post_dataset_datapoint");


//-----------------------------------------------------------------------------
// PUT requests
//-----------------------------------------------------------------------------

$app->put("/officials/:id", function ($id) { generic_put_item("Official", $id); } );
$app->put("/families/:id", function ($id) { generic_put_item("Family", $id); } );
$app->put("/parties/:id", function ($id) { generic_put_item("Party", $id); } );
$app->put("/areas/:code", function ($code) { generic_put_item("Area", $code); } );
$app->put("/elections/:id", function ($id) { generic_put_item("Elect", $id); } );
$app->put("/users/:id", function ($id) { generic_put_item("User", $id); } );
$app->put("/datasets/:id", function ($id) { generic_put_item("Dataset", $id); } );
$app->put("/datapoints/:id", function ($id) { generic_put_item("Datapoint", $id); } );


//-----------------------------------------------------------------------------
// DELETE requests
//-----------------------------------------------------------------------------

$app->delete("/officials/:id", function ($id) { generic_delete_item("Official", $id); } );
$app->delete("/officials/:id/families/:id", "delete_official_family");
$app->delete("/families/:id", function ($id) { generic_delete_item("Family", $id); } );
$app->delete("/families/:id/officials/:id", "delete_family_official");
$app->delete("/parties/:id", function ($id) { generic_delete_item("Party", $id); } );
$app->delete("/areas/:code", function ($code) { generic_delete_item("Area", $code); } );
$app->delete("/elections/:id", function ($id) { generic_delete_item("Elect", $id); } );
$app->delete("/users/:id", function ($id) { generic_delete_item("User", $id); } );
$app->delete("/datasets/:id", function ($id) { generic_delete_item("Dataset", $id); } );
$app->delete("/datapoints/:id", function ($id) { generic_delete_item("Datapoint", $id); } );

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

	$data = $app->request->post();

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

	$data = $app->request->put();

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
	$data = $app->request->post();

	try {
		$official = new Official((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	if(!isset($data["family_id"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$family = new Family((int) $data["family_id"]);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid family ID.");
	}
	try {
		$family->add_member($official);
	}catch(DataException $e) {
		$app->halt(400, "Invalid data.");
	}

	$app->response->setStatus(201);
	$app->response->headers->set("Location", "/officials/" . $id . "/families");
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
	$data = $app->request->post();

	try {
		$family = new Family((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}

	if(!isset($data["official_id"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$official = new Official((int) $data["official_id"]);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid official ID.");
	}
	try {
		$family->add_member($official);
	}catch(DataException $e) {
		$app->halt(400, "Invalid data.");
	}

	$app->response->setStatus(201);
	$app->response->headers->set("Location", "/families/" . $id . "/officials");
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
}

// Parties

function get_party($id) {
	global $app;
	try {
		$party = new Party((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$members = $party->get_members();

	$obj = $party->jsonSerialize();
	$obj["members"] = [
		"total" => count($members),
		"data" => $members,
	];

	echo json_encode($obj);
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

	$type = [
		"region" => 0,
		"province" => 1,
		"municipality" => 2,
		"barangay" => 3,
	][$level];

	$areas = array_map(
		function ($item) {
			return new Area((int) $item[Area::PRIMARY_KEY]);
		},
		Area::list_areas($count, $start, $type)
	);
	$total = Area::count($type);

	$end = $start + $count;
	if($end > $total) $end = $total;

	echo json_encode([
		"total" => $total,
		"start" => $start,
		"end" => $end,
		"data" => $areas,
	]);
}

function get_area_officials($code) {
	global $app;
	try {
		$area = new Area((int) $code);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$officials = $area->get_officials();

	echo json_encode([
		"total" => count($officials),
		"data" => $officials,
	]);
}

function post_area() {
	global $app;
	$data = $app->request->post();

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
	$data = $app->request->post();

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

// Users

function get_user_datasets($id) {
	global $app;
	try {
		$user = new User((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$datasets = $user->get_datasets();

	echo json_encode([
		"total" => count($datasets),
		"data" => $datasets,
	]);
}

function post_user() {
	global $app;
	$data = $app->request->post();

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
	$app->response->headers->set("Location", $app->urlFor("users", [User::PRIMARY_KEY => $user->get_id()]));
}

// Datasets

function get_dataset_datapoints($id) {
	global $app;
	try {
		$dataset = new Dataset((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(404);
	}
	$datapoints = $dataset->get_points();

	echo json_encode([
		"total" => count($datapoints),
		"data" => $datapoints,
	]);
}

function post_dataset() {
	global $app;
	$data = $app->request->post();

	if(!isset($data["name"], $data["description"])) {
		$app->halt(400, "Incomplete data.");
	}

	try{
		$user = isset($data["user_id"]) ? new Party((int) $data["user_id"]) : null;
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid user ID.");
	}

	Entity::$medoo->pdo->beginTransaction();

	$dataset = new Dataset(["user" => $user]);
	$dataset->name = $data["name"];
	$dataset->description = $data["description"];
	try {
		$dataset->save();
	}catch(DataException $e) {
		Entity::$medoo->pdo->rollBack();
		$app->halt(400, "Invalid data.");
	}

	if(isset($_FILES["file"])) {
		try {
			$dataset->file($_FILES["file"]);
		}catch(DataException $e) {
			Entity::$medoo->pdo->rollBack();
			$app->halt(400, "Invalid file.");
		}
	}

	Entity::$medoo->pdo->commit();

	$app->response->setStatus(201);
	$app->response->headers->set("Location", $app->urlFor("datasets", [Dataset::PRIMARY_KEY => $dataset->get_id()]));
}

function post_dataset_datapoint($id) {
	global $app;
	$data = $app->request->post();

	if(!isset($data["year"], $data["area_code"], $data["value"])) {
		$app->halt(400, "Incomplete data.");
	}

	try {
		$dataset = new Dataset((int) $id);
	}catch(NotFoundException $e) {
		$app->halt(400, "Invalid dataset ID.");
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
	$app->response->headers->set("Location", "/datasets/" . $id . "/datapoints");
}