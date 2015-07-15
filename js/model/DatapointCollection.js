"use strict";
define(["backbone", "model/Datapoint"], function(Backbone, Datapoint) {
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
			console.log({
				area_code: parseInt(area_code).toString(),
				year: parseInt(year).toString(),
			});
			var value = parseFloat(this.findWhere({
				area_code: parseInt(area_code).toString(),
				year: parseInt(year).toString(),
			}));
			return isNaN(value) ? null : value;
		},
	});
});