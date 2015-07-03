"use strict";
define(["react"], function(React) {
	return React.createClass({
		render: function() {
			return (
				<div>
					<h1>Siedbar</h1>
					<ul>
						<li>Manage my datasets</li>
						<li>Choropleth pane</li>
						<li>Tag cloud pane</li>
					</ul>
				</div>
			);
		},
	});
});