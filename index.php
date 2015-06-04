<?php
require_once 'Slim/Slim.php';
\Slim\Slim::registerAutoloader();

spl_autoload_register(function ($class) {
	include 'model/' . $class . '.class.php';
});

$app = new \Slim\Slim(['debug' => true]);

$app->get('/test', function () {
	$u = new User(4);
});

$app->run();