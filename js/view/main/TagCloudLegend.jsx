"use strict";
define(function(require) {
	var _ = require("underscore"),
		$ = require("jquery"),
		React = require("react");

	return React.createClass({
		getInitialState: function() {
			return {data: null};
		},

		componentDidMount: function() {
			this.width = $(React.findDOMNode(this).parentElement).width();
			this.props.bus.tagcloud_data.on("update", this.update);
		},

		componentWillUnmount: function() {
			this.props.bus.tagcloud_data.off("update", this.update);
		},

		render: function() {
			var margin = 5;
			var legend_width = this.width ? this.width - margin * 2 : 0;
			var legend_height = 0;

			if(this.state.data) {
				var font_size_func = function(size) { return Math.sqrt(0.8 * size) + "em"; };
				var max = this.state.data.classes[this.state.data.classes.length - 1];
				var l2max = Math.ceil(Math.log(max) / Math.LN2);
				var step = 25;
				legend_height = l2max * step;

				var g = (
					<g transform={"translate("+margin+","+margin+")"}>
						{_.map(_.range(0, l2max), function(i) {
							var n = Math.ceil(Math.pow(2, i));
							return (
								<g key={i} transform={"translate(0,"+(i*step)+")"}>
									<text
										className="map-tag tagcloud-legend"
										x={20} y={10}
										textAnchor="end"
										fontSize={font_size_func(n)}>
										A
									</text>
									<text
										className="tagcloud-legend"
										x={40} y={10}
										textAnchor="start">
										{"size " + n}
									</text>
								</g>
							);
						})}
					</g>
				);
			}

			return <svg width={legend_width + margin * 2} height={legend_height + margin * 2}>{g}</svg>;
		},

		update: function(data) {
			this.setState({data: data});
		},
	});
});