"use strict";
define(["underscore", "jenks", "model/Area"], function(_, jenks, Area) {
	var CDP = function(bus) {
		this.bus = bus;
		this.datasets = null;
		this.level = null;
		this.year = null;

		this.bus.map_settings.on("update", this.update_map.bind(this));
		this.bus.main_settings.on("update", this.update_main.bind(this));
		this.bus.choropleth_settings.on("update", this.update_dataset.bind(this));
	};

	CDP.prototype.update_map = function(settings) {
		if(settings.level) this.level = settings.level;
		this.update();
	};
	CDP.prototype.update_main = function(settings) {
		if(settings.year) this.year = settings.year;
		this.update();
	};
	CDP.prototype.update_dataset = function(settings) {
		this.datasets = [settings.dataset1, settings.dataset2];
		this.update();
	};

	CDP.prototype.update = _.debounce(function() {
		if(!this.year || !this.level || !this.datasets) return;

		var callback = _.after(2, function() {
			var processed = _.map(this.datasets, function(d) {
				if(d) return this.process(d);
				return null;
			}, this);
			this.bus.choropleth_data.emit("update", processed);
		}.bind(this));

		_.each(this.datasets, function(d) {
			if(!d || d.get_datapoints(this.year).size()){
				callback();
			}else{
				d.get_datapoints(this.year).fetch({
					success: callback
				});
			}
		}, this);
	}, 0);

	CDP.prototype.process = function(dataset) {
		return {
			name: dataset.get("name"),
			year: this.year,
			datapoints: dataset.get_datapoints(this.year),
			classes: this.calculate_breaks(dataset, this.level, this.year, 4),
		};
	};

	CDP.prototype.calculate_breaks = _.memoize(function(dataset, level, year, n) {
		var datapoints = dataset.get_datapoints(year);
		
		year = year.toString();
		var data = datapoints.chain()
			.filter(function(p) {
				return p.get("year") == year
					&& p.get("value") !== null
					&& Area.get_level(p.get("area_code")) == level;
			})
			.map(function(p) { return parseFloat(p.get("value")); })
			.value();

		var breaks = jenks(data, n);
		if(breaks) return breaks;

		var min = datapoints.get_min_value();
		var max = datapoints.get_max_value();
		breaks = [];
		for (var i = 0; i <= n; i++) {
			breaks.push(min + (max-min) * i/n);
		}
		return breaks;
	}, function(dataset, level, year, n) {
		return dataset.id + "|" + level + "|" + year + "|" + n;
	});

	return CDP;
});