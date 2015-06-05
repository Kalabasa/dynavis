<?php
require 'init.php';

$app = new \Slim\Slim(["debug" => true]);
include "api.php";
$app->run();
