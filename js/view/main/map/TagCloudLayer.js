"use strict";
define(["underscore", "leaflet"], function(_, L) {
	return L.LayerGroup.extend({
		initialize: function(layers) {
			L.LayerGroup.prototype.initialize.call(this, layers);
			this._current_geojson = null;
			this._dataset = null;
			this.year = new Date().getFullYear();
		},

		onAdd: function (map) {
			this.map = map;
			L.LayerGroup.prototype.onAdd.call(this, map);
		},

		set_dataset: function(dataset) {
			this._dataset = dataset;
			this.redraw();
		},

		replace_geojson: function(geojson) {
			this._current_geojson = geojson;
			this.redraw();
		},

		on_feature: function(feature, layer) {
			var that = this;

			var area_code = parseInt(feature.properties.PSGC, 10);
			layer.families = null;
		},

		redraw: function() {
			// Remove old tag layers
			var old_layers = this.getLayers();
			var n = old_layers.length;
			var c = 0;
			for (var i = 0; i < n; i++) {
				var t = i/n * 2000;
				if(c < 200 && this.map.getBounds().contains(old_layers[i].getLatLng())) {
					t = c++;
				}
				setTimeout(function(i, l) {
					this.removeLayer(l);
				}.bind(this), 1000 + t, i, old_layers[i]);
			}

			// Add new tag layers
			if(this._dataset) {
				var geojson_layers = this._current_geojson.getLayers();
				for (var i = 0; i < geojson_layers.length; i++) {
					setTimeout(function loop(l, geojson) {
						if(this._current_geojson == geojson) {
							if(l.getBounds().intersects(this.map.getBounds())) {
								this.tag_poly(l);
							}else{
								setTimeout(loop.bind(this), 100, l, geojson);
							}
						}
					}.bind(this), i % 1000, geojson_layers[i], this._current_geojson);
				}
			}
		},

		tag_poly: function(poly) {
			if(this._dataset) {
				var datapoints = this._dataset.get_datapoints();
				if(datapoints.size()) {
					loop.call(this, poly, datapoints, this._current_geojson);
				}else{
					datapoints.once("sync", loop.bind(this, poly, datapoints, this._current_geojson));
				}
			}

			function loop(poly, datapoints, geojson) {
				if(this._current_geojson == geojson) {
					if(poly.getBounds().intersects(this.map.getBounds())) {
						var area_code = parseInt(poly.feature.properties.PSGC);
						poly.datapoints = datapoints.find_datapoints(area_code, this.year);
						for (var i = 0; i < poly.datapoints.length; i++) {
							var p = poly.datapoints[i];
							var label = L.marker(poly.getBounds().getCenter(), {
								icon: L.divIcon({
									className: "map-label",
									html: p.get("family_id") + "<br/>" + p.get("value"),
								}),
							});
							this.addLayer(label);
						}
					}else{
						setTimeout(loop.bind(this), 100, poly, datapoints, geojson);
					}
				}
			}
		},
	});
});