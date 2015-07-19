"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		defaults: {
			dataset_id: null,
			year: null,
			area_code: null,
			family_id: null,
			value: null,
		},
	});
});