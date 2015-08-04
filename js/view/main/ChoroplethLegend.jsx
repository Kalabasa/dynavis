"use strict";
define(function(require) {
	var _ = require("underscore"),
		$ = require("jquery"),
		React = require("react");

	return React.createClass({
		getInitialState: function() {
			return {data: [null, null]};
		},

		componentWillMount: function() {
			this.props.bus.choropleth_data.on("update", this.update);
		},

		componentDidMount: function() {
			this.width = $(React.findDOMNode(this).parentElement).width();
			this.height = this.width;
		},

		componentWillUnmount: function() {
			this.props.bus.choropleth_data.off("update", this.update);
		},

		render: function() {
			if(_.every(this.state.data)) {
				var g = (
					<g>
					</g>
				);
			}else{
				var index = _.findIndex(this.state.data);
				if(index >= 0 && this.state.data[index].datapoints.length) {
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

					var histogram_width = this.width;
					var histogram_height = this.height/2 - 40;
					var bar_height = 15;

					var g = (
						<g>
							<g>
								{_.map(_.pairs(counts), function(m) {
									var bin = m[0];
									var count = m[1];
									var w = histogram_width / bins;
									var h = histogram_height * (count - min_count) / (max_count - min_count);
									return <rect
										className="histogram-bar"
										x={w * bin}
										y={histogram_height - h}
										width={w}
										height={h} />
								})}
							</g>
							<g transform={"translate("+0+","+histogram_height+")"}>
								{_.map(_.initial(dataset.classes), function(c,i) {
									var range = max - min;
									var x = this.width * (c - min) / range;
									var w = this.width * (dataset.classes[i+1] - c) / range;
									var c = dataset.color_scale[i];
									return <rect
										className="histogram-class-color"
										x={x}
										width={w} height={bar_height}
										fill={"rgb("+c.r+","+c.g+","+c.b+")"}/>
								}, this)}
								{_.map(dataset.classes, function(c,i) {
									var x = this.width * (c - min) / (max - min);
									var anchor = i == 0 ? "start"
										: i == dataset.classes.length - 1 ? "end"
										: "middle";
									return <text
										className="histogram-label"
										x={x}
										y={bar_height}
										textAnchor={anchor}>
										{c.toFixed(2)}
									</text>
								}, this)}
							</g>
						</g>
					);
				}
			}
			return <svg width={this.width} height={this.height}>{g}</svg>;
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