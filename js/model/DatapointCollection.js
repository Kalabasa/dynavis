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

		find_datapoints: function(area_code, year, single) {
			single = single || false;
			area_code = ("000000000" + area_code).slice(-9);
			year = year.toString();

			var match_start = area_code.substr(2,2) == "00" ? 0 : 2;
			var area_code_match = area_code.substr(match_start);

			return (single ? this.find : this.filter).call(this, function(p) {
				return p.get("year") == year
					&& ("0"+p.get("area_code")).substr(match_start) == area_code_match;
			});
		},

		get_value: function(area_code, year) {
			var datapoint = this.find_datapoints(area_code, year, true);
			if(!datapoint) return null;
			
			var value = parseFloat(datapoint.get("value"));
			return isNaN(value) ? null : value;
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