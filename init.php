<?php
require_once 'Slim/Slim.php';
require_once 'medoo.min.php';
require_once 'db_config.php';

\Slim\Slim::registerAutoloader();

spl_autoload_register(function ($class) {
	$className = ltrim($class, '\\');
	$fileName  = '';
	$namespace = '';
	if ($lastNsPos = strripos($className, '\\')) {
		$namespace = substr($className, 0, $lastNsPos);
		$className = substr($className, $lastNsPos + 1);
		$fileName  .= str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
	}
	$fileName .= str_replace('_', DIRECTORY_SEPARATOR, $className) . '.class.php';

	if (file_exists($fileName)) {
		require $fileName;
	}
});
