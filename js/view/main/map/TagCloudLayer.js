"use strict";
define(["underscore", "leaflet"], function(_, L) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);
			this._dataset = null;
			this.year = new Date().getFullYear();
		},

		onAdd: function (map) {
			this.map = map;
			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		set_dataset: function(dataset) {
			this._dataset = dataset;
		},
	});
});