"use strict";
define(["require", "backbone", "InstanceCache", "model/DatapointCollection"], function(require, Backbone, InstanceCache, DatapointCollection) {
	return Backbone.Model.extend({
		urlRoot: function() {
			return "api.php/users/" + this.get("username") + "/datasets";
		},
		defaults: {
			username: null,
			type: null,
			name: null,
			description: null,
		},

		get_datapoints: function() {
			if(!InstanceCache) InstanceCache = require("InstanceCache");
			if(!this.datapoints) {
				var name = "DatapointCollection";
				this.datapoints = InstanceCache.get_existing(name, this.id);
			}
			if(!this.datapoints) {
				this.datapoints = new DatapointCollection(null, {dataset: this});
				InstanceCache.set(name, this.id, this.datapoints);
			}
			return this.datapoints;
		},
	});
});