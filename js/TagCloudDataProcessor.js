"use strict";
define(["underscore", "jenks", "model/Area", "ChoroplethDataProcessor"], function(_, jenks, Area, CDP) {
	var TCDP = function(bus) {
		this.bus = bus;
		this.dataset = null;
		this.level = null;
		this.year = null;

		this.bus.map_settings.on("update", this.update_map.bind(this));
		this.bus.main_settings.on("update", this.update_main.bind(this));
		this.bus.tagcloud_settings.on("update", this.update_dataset.bind(this));
	};

	TCDP.prototype.update_map = function(settings) {
		if(settings.level) this.level = settings.level;
		this.update();
	};
	TCDP.prototype.update_main = function(settings) {
		if(settings.year) this.year = settings.year;
		this.update();
	};
	TCDP.prototype.update_dataset = function(settings) {
		this.dataset = settings.dataset;
		this.update();
	};

	TCDP.prototype.update = _.debounce(function() {
		if(!this.year || !this.level || !this.dataset) return;
		var dataset = this.dataset ? this.process(this.dataset) : null;
		this.bus.tagcloud_data.emit("update", dataset);
	}, 0);

	TCDP.prototype.process = function(dataset) {
		var year = this.year.toString();
		return {
			name: dataset.get("name"),
			datapoints: dataset.get_datapoints().filter(function(p) {
				return p.get("year") == year;
			}),
			classes: this.calculate_breaks(dataset, this.level, this.year, 3),
		};
	};

	TCDP.prototype.calculate_breaks = CDP.prototype.calculate_breaks;

	return TCDP;
});