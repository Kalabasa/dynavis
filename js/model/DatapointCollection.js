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
			year = parseInt(year).toString();
			area_code = ("000000000" + area_code).slice(-9);
			// var reg_code = area_code.substr(0,2);
			var prov_code = area_code.substr(2,2);
			var mun_code = area_code.substr(4,2);
			var bar_code = area_code.substr(6,3);
			var match = prov_code == "00" ? [0,2] :
				mun_code == "00" ? [2,2] :
				bar_code == "000" ? [2,4] : [2,7];
			var area_code_match = area_code.substr(match[0], match[1]);
			var datapoint = this.find(function(p) {
				return p.get("year") == year
					&& ("0"+p.get("area_code")).substr(match[0]-9,match[1]) == area_code_match;
			});
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