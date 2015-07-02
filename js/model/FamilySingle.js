"use strict";
define(["model/Family"], function(Family) {
	return Family.extend({urlRoot: "api.php/families"});
});