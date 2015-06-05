<?php
use \Dynavis\Core\Entity;
use \Dynavis\Model\Official;
use \Dynavis\Model\Family;
use \Dynavis\Model\Party;
use \Dynavis\Model\Area;
use \Dynavis\Model\Elect;
use \Dynavis\Model\User;
use \Dynavis\Model\Dataset;
// use \Dynavis\Model\Datapoint;

\Slim\Route::setDefaultConditions([
	"id" => "\d+"
]);


//-----------------------------------------------------------------------------
// GET requests
//-----------------------------------------------------------------------------

// Officials
$app->get("/api/officials", function () { generic_get_list("Official"); } );
$app->get("/api/officials/:id", function ($id) { generic_get_item("Official", $id); } );
$app->get("/api/officials/:id/families", "get_official_families");

// Families
$app->get("/api/families", function () { generic_get_list("Family"); } );
$app->get("/api/families/:id", "get_family");

// Parties
$app->get("/api/parties", function () { generic_get_list("Party"); } );
$app->get("/api/parties/:id", "get_party");

// Areas
$app->get("/api/areas/:level", "get_areas")->conditions(["level" => "region|province|municipality|barangay"]);
$app->get("/api/areas/:id", function ($id) { generic_get_item("Area", $id); } );
$app->get("/api/areas/:id/officials", "get_area_officials");

// Elections
$app->get("/api/elections", function () { generic_get_list("Elect"); } );
$app->get("/api/elections/:id", function ($id) { generic_get_item("Elect", $id); } );

// Users
$app->get("/api/users", function () { generic_get_list("User"); } );
$app->get("/api/users/:id", function ($id) { generic_get_item("User", $id); } );
$app->get("/api/users/:id/datasets", "get_user_datasets");

// Datasets
$app->get("/api/datasets", function () { generic_get_list("Dataset"); } );
$app->get("/api/datasets/:id", function ($id) { generic_get_item("Dataset", $id); } );
$app->get("/api/datasets/:id/datapoints", "get_dataset_datapoints");


//-----------------------------------------------------------------------------
// POST requests
//-----------------------------------------------------------------------------

// Officials
$app->post("/api/officials", function () { generic_post_item("Official"); } );

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
	global $app;
	$app->request->post();
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

	$level_i = 0;
	switch ($level) {
		case "region": $level_i = 0; break;
		case "province": $level_i = 1; break;
		case "municipality": $level_i = 2; break;
		case "barangay": $level_i = 3; break;
	}

	$areas = array_map(
		function ($item) {
			return new Area((int) $item[Area::PRIMARY_KEY]);
		},
		Area::list_areas($count, $start, $level_i)
	);
	$total = Area::count($level_i);

	$end = $start + $count;
	if($end > $total) $end = $total;

	echo json_encode([
		"total" => $total,
		"start" => $start,
		"end" => $end,
		"data" => $areas,
	]);
}

function get_area_officials($id) {
	$area = new Area((int) $id);
	$officials = $area->get_officials();

	echo json_encode([
		"total" => count($officials),
		"data" => $officials,
	]);
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

// Datasets

function get_dataset_datapoints($id) {
	$dataset = new Dataset((int) $id);
	$datapoints = $dataset->get_points();

	echo json_encode([
		"total" => count($datapoints),
		"data" => $datapoints,
	]);
}
