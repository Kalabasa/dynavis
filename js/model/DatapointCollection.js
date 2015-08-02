"use strict";
define(["underscore", "backbone", "model/Datapoint"], function(_, Backbone, Datapoint) {
	return Backbone.Collection.extend({
		model: Datapoint,
		initialize: function(models, options) {
			this.dataset = options.dataset;
			this.year = options.year;
		},
		url: function() {
			return this.dataset.url() + "/datapoints/" + this.year;
		},
		parse: function(data) {
			return data.data;
		},

		get_max_value: function() {
			if(this.max_value === undefined) {
				var max = -Infinity;
				this.forEach(function(p){
					var value = parseFloat(p.get("value"));
					if(!isNaN(value) && value > max) {
						max = value;
					}
				});
				this.max_value = max;
			}
			return this.max_value;
		},
		get_min_value: function() {
			if(this.min_value === undefined) {
				var min = Infinity;
				this.forEach(function(p){
					var value = parseFloat(p.get("value"));
					if(!isNaN(value) && value < min) {
						min = value;
					}
				});
				this.min_value = min;
			}
			return this.min_value;
		},
	});
});