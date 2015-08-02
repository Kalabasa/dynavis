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

		get_datapoints: function(year) {
			if(!InstanceCache) InstanceCache = require("InstanceCache");

			if(!this.datapoints) this.datapoints = {};
			var datapoints = this.datapoints[year];

			if(!datapoints) {
				var name = "DatapointCollection";
				var key = this.id + "." + year;
				datapoints = InstanceCache.get_existing(name, key);
			}
			if(!datapoints) {
				datapoints = new DatapointCollection(null, {dataset: this, year: year});
				InstanceCache.set(name, key, this.datapoints);
			}
			
			this.datapoints[year] = datapoints;
			return datapoints;
		},
	});
});