"use strict";
define(["backbone", "model/Datapoint", "backbone-pagec"], function(Backbone, Datapoint) {
	return Backbone.PageableCollection.extend({
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
	});
});