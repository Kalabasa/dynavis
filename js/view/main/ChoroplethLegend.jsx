"use strict";
define(function(require) {
	var _ = require("underscore"),
		React = require("react");

	return React.createClass({
		getInitialState: function() {
			return {data: [null, null]};
		},

		componentWillMount: function() {
			this.props.bus.choropleth_data.on("update", this.update);
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
				if(index >= 0) {
					var dataset = this.state.data[index];
					_.countBy(dataset.datapoints, function(p) {
						var value = p.get("value");
					});
					var g = (
						<g>
						{_.map(dataset.datapoints, function(p, i) {
							return <rect x={i*10} width={10} height={10} />
						})}
						</g>
					);
				}
			}
			return <svg>{g}</svg>;
		},

		update: function(data) {
			this.setState({data: data});
		},
	});
});