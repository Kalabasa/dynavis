"use strict";
define(["react", "jsx!view/main/ChoroplethSettingsPane", "jsx!view/main/TagCloudSettingsPane"], function(React, ChoroplethSettingsPane, TagCloudSettingsPane) {
	return React.createClass({
 		mixins: [React.addons.LinkedStateMixin],

		getInitialState: function() {
			return {
				year: new Date().getFullYear(),
			};
		},

		render: function() {
			return (
				<div>
					<div className="pane">
						<a className="button button-flat" href="#datasets">Manage datasets</a>
					</div>
					<ChoroplethSettingsPane bus={this.props.bus} />
					<TagCloudSettingsPane bus={this.props.bus} />
					<form className="group pane form" onSubmit={this.handle_submit}>
						<input className="group-component" type="number" valueLink={this.linkState("year")} required />
						<input className="group-component button-primary" type="submit" value="Go" />
					</form>
				</div>
			);
		},

		handle_submit: function(e) {
			e.preventDefault();
			this.props.bus.main_settings.emit("update", {
				year: parseInt(this.state.year),
			});
		},
	});
});