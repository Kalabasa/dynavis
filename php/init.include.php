<?php
require_once __DIR__ . '/lib/Slim/Slim.php';
require_once __DIR__ . '/lib/medoo.min.php';

\Slim\Slim::registerAutoloader();

spl_autoload_register(function ($class) {
	$className = ltrim($class, '\\');
	$fileName  = __DIR__ . '/';
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
