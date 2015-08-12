"use strict";
define(["underscore", "backbone", "model/Datapoint"], function(_, Backbone, Datapoint) {
	return Backbone.Collection.extend({
		model: Datapoint,
		initialize: function(models, options) {
			this.dataset = options.dataset;
			this.year = options.year;
		},
		url: function() {
			return this.dataset.url() + "/datapoints";
		},
		parse: function(data) {
			return data.data;
		},

		get_max_value: function() {
			if(this.max_value === undefined) {
				this.max_value = this.reduce(function(max,p){
					var value = p.get("value");
					if(value !== null && value > max) {
						return value;
					}else{
						return max;
					}
				}, -Infinity);
			}
			return this.max_value;
		},
		get_min_value: function() {
			if(this.min_value === undefined) {
				this.min_value = this.reduce(function(min,p){
					var value = p.get("value");
					if(value !== null && value < min) {
						return value;
					}else{
						return min;
					}
				}, Infinity);
			}
			return this.min_value;
		},

		fetch: function(options) {
			options = options || {};
			options.data = options.data || {}
			if(options.data.year === undefined) options.data.year = this.year;
			return Backbone.Collection.prototype.fetch.call(this, options);
		},
	});
});