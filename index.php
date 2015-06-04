<?php
require 'init.php';

$app = new \Slim\Slim(['debug' => true]);

$app->get('/test', function () {
});

$app->run();