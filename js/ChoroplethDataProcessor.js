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
		
		var scales = [
			[{r:254,g:235,b:226},{r:251,g:180,b:185},{r:247,g:104,b:161},{r:174,g:1,b:126}],
			[{r:255,g:255,b:204},{r:194,g:230,b:153},{r:120,g:198,b:121},{r:35,g:132,b:67}],
		];

		return {
			name: dataset.get("name"),
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

		var breaks = jenks(data, n);
		if(breaks && !_.some(breaks, function(b){ return isNaN(b); })) return breaks;

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