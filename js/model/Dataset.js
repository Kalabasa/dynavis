"use strict";
define(["backbone", "model/DatapointCollection"], function(Backbone, DatapointCollection) {
	return Backbone.Model.extend({
		urlRoot: function() {
			return "api.php/users/" + this.get("username") + "/datasets";
		},
		defaults: {
			username: null,
			name: null,
			description: null,
		},
		get_datapoints: function() {
			if(!this.datapoints) this.datapoints = new DatapointCollection(null, {dataset: this});
			return this.datapoints;
		},
	});
});