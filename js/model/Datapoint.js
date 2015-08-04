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
		parse: function(r,o) {
			return {
				dataset_id: r.dataset_id
					? parseInt(r.dataset_id, 10)
					: (this.collection && this.collection.dataset
						? parseInt(this.collection.dataset.id)
						: null),
				year: parseInt(r.year, 10),
				area_code: parseInt(r.area_code, 10),
				family_id: r.family_id ? parseInt(r.family_id, 10) : null,
				value: r.value ? parseFloat(r.value) : null,
			};
		},
	});
});