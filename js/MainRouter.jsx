"use strict";
define(["backbone", "react"], function(Backbone, React) {
	return Backbone.Router.extend({
		routes: {
			"": "main"
		},
		main: function() {
			React.render(<img />, document.getElementById("body"));
		},
	});
});