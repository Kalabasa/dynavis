"use strict";
define(["underscore", "backbone", "model/Datapoint"], function(_, Backbone, Datapoint) {
	return Backbone.Collection.extend({
		model: Datapoint,
		initialize: function(models, options) {
			this.dataset = options.dataset;
		},
		url: function() {
			return this.dataset.url() + "/datapoints";
		},
		parse: function(data) {
			return data.data;
		},

		get_value: function(area_code, year) {
			var datapoint = this.findWhere({
				area_code: parseInt(area_code).toString(),
				year: parseInt(year).toString(),
			});
			if(!datapoint) return null;
			var value = parseFloat(datapoint.get("value"));
			return isNaN(value) ? null : value;
		},

		get_max_value: function() {
			if(this.max === undefined) {
				var max = -Infinity;
				this.forEach(function(p){
					var value = parseFloat(p.get("value"));
					if(!isNaN(value) && value > max) {
						max = value;
					}
				});
				this.max = max;
			}
			return this.max;
		},
		get_min_value: function() {
			if(this.min === undefined) {
				var min = Infinity;
				this.forEach(function(p){
					var value = parseFloat(p.get("value"));
					if(!isNaN(value) && value < min) {
						min = value;
					}
				});
				this.min = min;
			}
			return this.min;
		},
	});
});