"use strict";
define(["react", "leaflet"], function(React, L) {
	return React.createClass({
		componentDidMount: function() {
			this.map = L.map(this.getDOMNode(), {
			});
		},

		componentWillUnmount: function() {
			this.map = null;
		},

		render: function() {
			return (
				<div className="map-panel"></div>
			);
		},
	});
});