"use strict";
define(function(require) {
	var _ = require("underscore"),
		$ = require("jquery"),
		numf = require("numf"),
		React = require("react");

	return React.createClass({
		statics: {
			combine_colors: function(c1, c2) {
				return _.mapObject(c1, function(v,k) {
					var w = c2[k];
					// return Math.ceil((v + w) / 2); // alpha
					// return Math.min(v, w); // darken
					// return Math.ceil(v * w / 255); // multiply
					
					// v = 255 * 0.2 + v * 0.8;
					// w = 255 * 0.2 + w * 0.8;
					// return Math.min(Math.ceil(v * w * 1.5 / 255), 255); // lighten then multiply then brighten
					
					v = Math.min(v * 1.2, 255);
					w = Math.min(w * 1.2, 255);
					 return Math.ceil(v * w / 255); // brighten then multiply
				});
			},
		},

		getInitialState: function() {
			return {data: [null, null]};
		},

		componentDidMount: function() {
			this.width = $(React.findDOMNode(this).parentElement).width();
			this.props.bus.choropleth_data.on("update", this.update);
		},

		componentWillUnmount: function() {
			this.props.bus.choropleth_data.off("update", this.update);
		},

		render: function() {
			var margin = 5;
			var legend_width = this.width ? this.width - margin * 2 : 0;
			var legend_height = 0;

			if(_.every(this.state.data)) {
				legend_height = legend_width;

				var data_x = this.state.data[0];
				var data_y = this.state.data[1];
				var min_x = data_x.classes[0];
				var min_y = data_y.classes[0];
				var range_x = data_x.classes[data_x.classes.length - 1] - min_x;
				var range_y = data_y.classes[data_y.classes.length - 1] - min_y;

				// join x & y data on area code
				var sorted_x = _.sortBy(data_x.datapoints, function(d){ return d.get("area_code"); });
				var sorted_y = _.sortBy(data_y.datapoints, function(d){ return d.get("area_code"); });
				var ix = 0, iy = 0;
				var code_x = sorted_x[ix].get("area_code"),
					code_y = sorted_y[iy].get("area_code");
				var joined_datapoints = [];
				while(ix < sorted_x.length && iy < sorted_y.length) {
					if(code_x == code_y) {
						joined_datapoints.push([sorted_x[ix], sorted_y[iy]]);
						ix++; iy++;
						if(ix < sorted_x.length) code_x = sorted_x[ix].get("area_code");
						if(iy < sorted_y.length) code_y = sorted_y[iy].get("area_code");
					}else if(code_x < code_y){
						ix++;
						if(ix < sorted_x.length) code_x = sorted_x[ix].get("area_code");
					}else{ // code_y < code_x
						iy++;
						if(iy < sorted_y.length) code_y = sorted_y[iy].get("area_code");
					}
				}

				var scatterplot_margin = 45;
				var scatterplot_width = legend_width - scatterplot_margin;
				var scatterplot_height = legend_height - scatterplot_margin;
				var scatterplot_points = _.chain(joined_datapoints)
					.map(function(pair){ return {x: pair[0].get("value"), y: pair[1].get("value")}; })
					.uniq(false, function(point){ return "p" +
						Math.floor(point.x * scatterplot_width / range_x) + "," +
						Math.floor(point.y * scatterplot_height / range_y); })
					.value();

				var g = (
					<g transform={"translate("+margin+","+margin+")"}>
						<g id="scatterplot-class-colors">
							{_.map(_.initial(data_x.classes), function(cx,i) {
								var x = scatterplot_margin + (range_x == 0 ? 0 : scatterplot_width * (cx - min_x) / range_x);
								var w = range_x == 0 ? scatterplot_width : scatterplot_width * (data_x.classes[i+1] - cx) / range_x;
								var cx = data_x.color_scale[i];

								return _.map(_.rest(data_y.classes), function(cy,j) {
									var y = scatterplot_height * (range_y == 0 ? 0 : (1 - (cy - min_y) / range_y));
									var h = range_y == 0 ? scatterplot_height : scatterplot_height * (cy - data_y.classes[j]) / range_y;
									var cy = data_y.color_scale[j];
									var c = this.constructor.combine_colors(cx, cy);

									return <rect key={j}
										className="scatterplot-class-color"
										x={Math.floor(x)} y={Math.floor(y)} width={Math.ceil(w)} height={Math.ceil(h)}
										fill={"rgb("+c.r+","+c.g+","+c.b+")"}/>;
								}, this);
							}, this)}
						</g>
						<g id="scatterplot-point-shadows">
							{_.map(scatterplot_points, function(point, i) { // shadows
								var x = scatterplot_margin + (range_x == 0 ? 0 : scatterplot_width * (point.x - min_x) / range_x);
								var y = (range_y == 0 ? 0 : scatterplot_height * (1 - (point.y - min_y) / range_y));
								return <circle key={i}
									className="scatterplot-point-shadow"
									cx={x} cy={y} r={4}/>
							}, this)}
						</g>
						<g id="scatterplot-points">
							{_.map(scatterplot_points, function(point, i) {
								var x = scatterplot_margin + (range_x == 0 ? 0 : scatterplot_width * (point.x - min_x) / range_x);
								var y = (range_y == 0 ? 0 : scatterplot_height * (1 - (point.y - min_y) / range_y));
								return <circle key={i}
									className="scatterplot-point"
									cx={x} cy={y} r={3}/>
							}, this)}
						</g>
						<g id="scatterplot-labels-x" transform={"translate("+scatterplot_margin+","+scatterplot_height+")"}>
							{_.map(data_x.classes, function(c,i) {
								var x = scatterplot_width * (range_x == 0 ? 0 : (c - min_x) / range_x);
								return <text key={i}
									className="scatterplot-label scatterplot-label-x"
									x={x} y={0}>
									{numf.format(c)}
								</text>;
							}, this)}
						</g>
						<g id="scatterplot-title-x">
							<text className="scatterplot-title scatterplot-title-x" x={scatterplot_margin + scatterplot_width/2} y={legend_height}>{data_x.name}</text>
						</g>
						<g id="scatterplot-labels-y" transform={"translate("+scatterplot_margin+","+0+")"}>
							{_.map(data_y.classes, function(c,i) {
								var y = (range_y == 0 ? scatterplot_height : scatterplot_height * (1 - (c - min_y) / range_y));
								return <text key={i}
									className="scatterplot-label scatterplot-label-y"
									x={0} y={y}>
									{numf.format(c)}
								</text>;
							}, this)}
						</g>
						<g id="scatterplot-title-y">
							<text className="scatterplot-title scatterplot-title-y" x={0} y={scatterplot_height/2}>{data_y.name}</text>
						</g>
					</g>
				);
			}else{
				var index = _.findIndex(this.state.data);
				if(index >= 0) {
					legend_height = legend_width / 2;

					var dataset = this.state.data[index];

					var min = dataset.classes[0];
					var max = dataset.classes[dataset.classes.length - 1];
					
					// Freedmain-Diaconis rule for optimal number of bins in a histogram
					var bin_size = 2 * this.iqr(dataset.datapoints) * Math.pow(dataset.datapoints.length, -1/3);

					var counts = _.countBy(dataset.datapoints, function(p) {
						return Math.floor((p.get("value") - min) / bin_size);
					});
					var min_bin = Math.floor(min / bin_size);
					var max_bin = Math.floor(max / bin_size);
					var bins = 1 + max_bin - min_bin;

					var min_count = 0;//_.min(counts);
					var max_count = _.max(counts);

					var histogram_width = legend_width;
					var histogram_height = legend_height - 60;
					var bar_height = 20;

					var g = (
						<g transform={"translate("+margin+","+margin+")"}>
							<g id="histogram-bars">
								{_.map(_.pairs(counts), function(m) {
									var bin = m[0];
									var count = m[1];
									var w = histogram_width / bins;
									var h = histogram_height * (count - min_count) / (1 + max_count - min_count);
									return <rect key={m}
										className="histogram-bar"
										x={Math.floor(w * bin)} y={histogram_height - h}
										width={Math.ceil(w)} height={h} />;
								})}
							</g>
							<g id="histogram-class-colors" transform={"translate("+0+","+histogram_height+")"}>
								{_.map(_.initial(dataset.classes), function(c,i) {
									var range = max - min;
									var x = range == 0 ? 0 : legend_width * (c - min) / range;
									var w = range == 0 ? legend_width : legend_width * (dataset.classes[i+1] - c) / range;
									var c = dataset.color_scale[i];
									return <rect key={i}
										className="histogram-class-color"
										x={x} width={w} height={bar_height}
										fill={"rgb("+c.r+","+c.g+","+c.b+")"}/>;
								}, this)}
							</g>
							<g id="histogram-labels" transform={"translate("+0+","+histogram_height+")"}>
								{_.map(dataset.classes, function(c,i) {
									var range = max - min;
									var x = range == 0 ? 0 : legend_width * (c - min) / range;
									return <text key={i}
										className="histogram-label"
										x={x} y={bar_height}>
										{numf.format(c)}
									</text>;
								}, this)}
							</g>
							<g id="histogram-title">
								<text className="histogram-title" x={legend_width/2} y={legend_height}>{dataset.name}</text>
							</g>
						</g>
					);
				}
			}

			return <svg width={legend_width + margin * 2} height={legend_height + margin * 2}>{g}</svg>;
		},

		update: function(data) {
			this.setState({data: data});
		},

		iqr: function(datapoints) {
			var values = _.chain(datapoints)
				.filter(function(p){ return p.get("value") !== null; })
				.map(function(p){ return p.get("value"); })
				.sortBy()
				.value();

			var q1i = (values.length - 1) * 0.25;
			var v1 = values[Math.floor(q1i)];
			var v1n = values[Math.floor(q1i) + 1];
			var q1 = v1 + (v1n - v1) * (q1i % 1);

			var q3i = (values.length - 1) * 0.75;
			var v3 = values[Math.floor(q3i)];
			var v3n = values[Math.floor(q3i) + 1];
			var q3 = v3 + (v3n - v3) * (q3i % 1);

			return q3 - q1;
		},
	});
});