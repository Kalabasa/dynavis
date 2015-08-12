"use strict";
define(["model/Election"], function(Election) {
	return Election.extend({urlRoot: "api.php/elections"});
});