"use strict";
define(["react", "jsx!view/Login", "jsx!view/main/ChoroplethSettingsPane"], function(React, Login, ChoroplethSettingsPane) {
	return React.createClass({
		render: function() {
			return (
				<div>
					<Login model={this.props.token} />
					<div><a className="btn btn-link" href="#datasets">Manage datasets</a></div>
					<ChoroplethSettingsPane />
					<div>Tag cloud pane</div>
				</div>
			);
		},
	});
});