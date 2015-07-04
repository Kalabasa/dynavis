"use strict";
define(["backbone", "react"], function(Backbone, React) {
	return Backbone.Router.extend({
		routes: {
			"": "main"
		},
		main: function() {
			require([
				"jsx!view/main/MapPanel"
			], function(MapPanel) {
				React.render(<MapPanel />, document.getElementById("body"));
			});
		},
	});
});