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
			min_year: null,
			max_year: null,
		},
		parse: function(r,o) {
			return {
				id: parseInt(r.id, 10),
				username: r.username,
				type: r.type,
				name: r.name,
				description: r.description,
				min_year: r.min_year ? parseInt(r.min_year, 10) : null,
				max_year: r.max_year ? parseInt(r.max_year, 10) : null,
			};
		},

		get_datapoints: function(year) {
			if(!InstanceCache) InstanceCache = require("InstanceCache");

			var datapoints = null;
			if(!datapoints) {
				var name = "DatapointCollection";
				var key = this.id + "." + year;
				datapoints = InstanceCache.get_existing(name, key);
			}
			if(!datapoints) {
				datapoints = new DatapointCollection(null, {dataset: this, year: year});
				InstanceCache.set(name, key, datapoints);
			}
			
			return datapoints;
		},
	});
});