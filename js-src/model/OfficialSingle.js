"use strict";
define(["model/Official"], function(Official) {
	return Official.extend({urlRoot: "api.php/officials"});
});