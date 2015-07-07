"use strict";
define(["react", "jsx!view/Login"], function(React, Login) {
	return React.createClass({
		render: function() {
			return (
				<div>
					<Login model={this.props.token} />
					<ul>
						<li><a className="btn btn-link" href="#datasets">Manage datasets</a></li>
						<li>Choropleth pane</li>
						<li>Tag cloud pane</li>
					</ul>
				</div>
			);
		},
	});
});