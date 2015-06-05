<?php
require 'php/init.include.php';

use \Dynavis\Core\Entity;
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
]);

$app = new \Slim\Slim(["debug" => true]);

//-----------------------------------------------------------------------------
// GET requests
//-----------------------------------------------------------------------------

// Officials
$app->get("/officials", function () { generic_get_list("Official"); } );
$app->get("/officials/:id", function ($id) { generic_get_item("Official", $id); } );
$app->get("/officials/:id/families", "get_official_families");

// Families
$app->get("/families", function () { generic_get_list("Family"); } );
$app->get("/families/:id", "get_family");

// Parties
$app->get("/parties", function () { generic_get_list("Party"); } );
$app->get("/parties/:id", "get_party");

// Areas
$app->get("/areas/:level", "get_areas")->conditions(["level" => "region|province|municipality|barangay"]);
$app->get("/areas/:code", function ($code) { generic_get_item("Area", $code); } );
$app->get("/areas/:code/officials", "get_area_officials");

// Elections
$app->get("/elections", function () { generic_get_list("Elect"); } );
$app->get("/elections/:id", function ($id) { generic_get_item("Elect", $id); } );

// Users
$app->get("/users", function () { generic_get_list("User"); } );
$app->get("/users/:id", function ($id) { generic_get_item("User", $id); } );
$app->get("/users/:id/datasets", "get_user_datasets");

// Datasets
$app->get("/datasets", function () { generic_get_list("Dataset"); } );
$app->get("/datasets/:id", function ($id) { generic_get_item("Dataset", $id); } );
$app->get("/datasets/:id/datapoints", "get_dataset_datapoints");


//-----------------------------------------------------------------------------
// POST requests
//-----------------------------------------------------------------------------

$app->post("/officials", function () { generic_post_item("Official"); } );
$app->post("/families", function () { generic_post_item("Family"); } );
$app->post("/parties", function () { generic_post_item("Party"); } );
$app->post("/areas", "post_area");
$app->post("/elections", "post_election");
$app->post("/users", "post_user");
$app->post("/datasets", "post_dataset");
$app->post("/datasets/:id/datapoints", "post_dataset_datapoint");


//-----------------------------------------------------------------------------
// DELETE requests
//-----------------------------------------------------------------------------

$app->delete("/officials/:id", function ($id) { generic_delete_item("Official", $id); } );
$app->delete("/families/:id", function ($id) { generic_delete_item("Family", $id); } );
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
	$class = "\\Dynavis\\Model\\" . $class;

	global $app;
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
	$class = "\\Dynavis\\Model\\" . $class;
	$item = new $class((int) $id);
	echo json_encode($item);
}

function generic_post_item($class) {
	$class = "\\Dynavis\\Model\\" . $class;

	global $app;
	$data = $app->request->post();

	$item = new $class();
	foreach ($class::FIELDS as $field) {
		if(!isset($data[$field])) throw new Exception("Incomplete POST data.");
		$item->$field = $data[$field];
	}
	$item->save();
}

function generic_delete_item($class, $id) {
	$class = "\\Dynavis\\Model\\" . $class;
	$item = new $class((int)$id);
	$item->delete();
}

// Officials

function get_official_families($id) {
	$official = new Official((int) $id);
	$families = $official->get_families();

	echo json_encode([
		"total" => count($families),
		"data" => $families,
	]);
}

// Families

function get_family($id) {
	$family = new Family((int) $id);
	$members = $family->get_members();

	$obj = $family->jsonSerialize();
	$obj["members"] = [
		"total" => count($members),
		"data" => $members,
	];

	echo json_encode($obj);
}

// Parties

function get_party($id) {
	$party = new Party((int) $id);
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
	$area = new Area((int) $code);
	$officials = $area->get_officials();

	echo json_encode([
		"total" => count($officials),
		"data" => $officials,
	]);
}

function post_area() {
	global $app;
	$data = $app->request->post();

	if(!isset($data["code"], $data["name"], $data["level"])) throw new Exception("Incomplete POST data.");

	$parent = isset($data["parent_code"]) ? new Area((int) $data["parent_code"]) : null;
	$area = new Area(["parent" => $parent]);
	$area->code = $data["code"];
	$area->name = $data["name"];
	$area->type = [
		"region" => 0,
		"province" => 1,
		"municipality" => 2,
		"barangay" => 3,
	][$data["level"]];
	$area->save();
}

// Elections

function post_election() {
	global $app;
	$data = $app->request->post();

	if(!isset($data["official_id"], $data["year"], $data["year_end"], $data["position"], $data["votes"], $data["area_code"])) throw new Exception("Incomplete POST data.");

	$official = new Official((int) $data["official_id"]);
	$area = new Area((int) $data["area_code"]);
	$party = isset($data["party_id"]) ? new Party((int) $data["party_id"]) : null;

	$elect = new Elect([
		"official" => $official,
		"area" => $area,
		"party" => $party,
	]);
	$elect->year = (int) $data["year"];
	$elect->year_end = (int) $data["year_end"];
	$elect->position = $data["position"];
	$elect->votes = (int) $data["votes"];
	$elect->save();
}

// Users

function get_user_datasets($id) {
	$user = new User((int) $id);
	$datasets = $user->get_datasets();

	echo json_encode([
		"total" => count($datasets),
		"data" => $datasets,
	]);
}

function post_user() {
	global $app;
	$data = $app->request->post();

	if(!isset($data["username"], $data["password"])) throw new Exception("Incomplete POST data.");

	$user = new User();
	$user->username = $data["username"];
	$user->set_password($data["password"]);
	$user->type = 0;
	$user->save();
}

// Datasets

function get_dataset_datapoints($id) {
	$dataset = new Dataset((int) $id);
	$datapoints = $dataset->get_points();

	echo json_encode([
		"total" => count($datapoints),
		"data" => $datapoints,
	]);
}

function post_dataset() {
	global $app;
	$data = $app->request->post();

	if(!isset($data["name"], $data["description"])) throw new Exception("Incomplete POST data.");

	$user = isset($data["user_id"]) ? new Party((int) $data["user_id"]) : null;

	$dataset = new Dataset(["user" => $user]);
	$dataset->name = $data["name"];
	$dataset->description = $data["description"];
	$dataset->save();
}

function post_dataset_datapoint($id) {
	global $app;
	$data = $app->request->post();

	if(!isset($data["year"], $data["area_code"], $data["value"])) throw new Exception("Incomplete POST data.");

	$dataset = new Dataset((int) $id);
	$area = new Area((int) $data["area_code"]);

	$datapoint = new Datapoint([
		"dataset" => $dataset,
		"area" => $area,
	]);
	$datapoint->year = $data["year"];
	$datapoint->value = $data["value"];	
	$datapoint->save();
}