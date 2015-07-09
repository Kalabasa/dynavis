"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		defaults: {
			dataset_id: null,
			year: null,
			area_code: null,
			value: null,
		},
	});
});