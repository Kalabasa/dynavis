"use strict";
define(["underscore", "jenks", "model/Area", "ChoroplethDataProcessor"], function(_, jenks, Area, CDP) {
	var TCDP = function(bus) {
		this.bus = bus;
		this.dataset = null;
		this.level = null;
		this.year = null;

		this.bus.main_settings.on("update", this.update_main.bind(this));
		this.bus.tagcloud_settings.on("update", this.update_dataset.bind(this));
	};

	TCDP.prototype.update_main = function(settings) {
		if(settings.level) this.level = settings.level;
		if(settings.year) this.year = settings.year;
		this.update();
	};
	TCDP.prototype.update_dataset = function(settings) {
		this.dataset = settings.dataset;
		this.update();
	};

	TCDP.prototype.update = _.debounce(function() {
		if(!this.year || !this.level) return;

		var callback = function(){
			var processed = this.dataset ? this.process(this.dataset) : null;
			this.bus.tagcloud_data.emit("update", processed);
		}.bind(this);

		if(this.dataset.get_datapoints(this.year).size()){
			callback();
		}else{
			this.dataset.get_datapoints(this.year).fetch({
				success: callback
			});
		}
	}, 0);

	TCDP.prototype.process = function(dataset) {
		var datapoints = dataset.get_datapoints(this.year)
			.filter(function(p) {
				return Area.get_level(p.get("area_code")) == this.level;
			}, this);
		if(!datapoints.length) return null;
		
		return {
			name: dataset.get("name"),
			min_year: dataset.get("min_year"),
			max_year: dataset.get("max_year"),
			year: this.year,
			datapoints: datapoints,
			classes: this.calculate_breaks(datapoints, 3, dataset, this.level, this.year),
		};
	};

	TCDP.prototype.calculate_breaks = CDP.prototype.calculate_breaks;

	return TCDP;
});