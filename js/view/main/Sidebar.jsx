"use strict";
define(["react", "jsx!view/main/ChoroplethSettingsPane", "jsx!view/main/TagCloudSettingsPane"], function(React, ChoroplethSettingsPane, TagCloudSettingsPane) {
	return React.createClass({
		render: function() {
			return (
				<div>
					<div><a className="btn btn-link" href="#datasets">Manage datasets</a></div>
					<ChoroplethSettingsPane bus={this.props.bus} />
					<TagCloudSettingsPane bus={this.props.bus} />
				</div>
			);
		},
	});
});