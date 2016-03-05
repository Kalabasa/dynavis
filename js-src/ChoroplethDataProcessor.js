"use strict";
define(["underscore", "jenks", "model/Area"], function(_, jenks, Area) {
	var CDP = function(bus) {
		this.bus = bus;
		this.datasets = null;
		this.level = null;
		this.year = null;

		this.bus.main_settings.on("update", this.update_main.bind(this));
		this.bus.choropleth_settings.on("update", this.update_dataset.bind(this));
	};

	CDP.prototype.update_main = function(settings) {
		if(settings.level) this.level = settings.level;
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
			var processed = _.map(this.datasets, function(d, i) {
				if(d) return this.process(d, i);
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

	CDP.prototype.process = function(dataset, i) {
		var datapoints = dataset.get_datapoints(this.year)
			.filter(function(p) {
				return Area.get_level(p.get("area_code")) == this.level;
			}, this);
		if(!datapoints.length) return null;
		
		var scales_hex = [
			["#fed5c9", "#ffa286", "#ff6d41", "#e43500"],
			["#caf2fe", "#87e4ff", "#41d4ff", "#00b1e4"],
		];

		var scales = _.map(scales_hex, function(scale_hex) {
			return _.map(scale_hex, function(hex) {
				var rr = hex.substr(1,2);
				var gg = hex.substr(3,2);
				var bb = hex.substr(5,2);
				return {r:parseInt(rr,16), g:parseInt(gg,16), b:parseInt(bb,16)};
			});
		});

		return {
			name: dataset.get("name"),
			min_year: dataset.get("min_year"),
			max_year: dataset.get("max_year"),
			year: this.year,
			datapoints: datapoints,
			classes: this.calculate_breaks(datapoints, 4, dataset, this.level, this.year),
			color_scale: scales[i],
		};
	};

	CDP.prototype.calculate_breaks = _.memoize(function(datapoints, n, dataset, level, year) {
		var data = _.chain(datapoints)
			.filter(function(p) {
				return p.get("value") !== null;
			})
			.map(function(p) { return p.get("value"); })
			.value();

		if(data.length > n + 1) {
			var breaks = jenks(data, n);
			if(breaks && !_.some(breaks, function(b){ return isNaN(b); })) return breaks;
		}

		var min = _.min(data);
		var max = _.max(data);
		breaks = [];
		for (var i = 0; i <= n; i++) {
			breaks.push(min + (max - min) * i / n);
		}
		return breaks;
	}, function(datapoints, n, dataset, level, year) {
		return n + ":" + dataset.id + "|" + level + "|" + year;
	});

	return CDP;
});