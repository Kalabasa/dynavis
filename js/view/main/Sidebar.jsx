"use strict";
define(["react", "InstanceCache", "jsx!view/main/ChoroplethSettingsPane", "jsx!view/main/TagCloudSettingsPane"], function(React, InstanceCache, ChoroplethSettingsPane, TagCloudSettingsPane) {
	return React.createClass({
 		mixins: [React.addons.LinkedStateMixin],

		getInitialState: function() {
			return {
				year: new Date().getFullYear(),
			};
		},

		componentWillMount: function() {
			var token = InstanceCache.get("Token", "session");
			token.on("change", function() {
				this.forceUpdate();
			}, this);
		},

		render: function() {
			var token = InstanceCache.get("Token", "session");
			var user = token ? token.get_user() : null;
			if(user) {
				var datasets_pane = (
					<div className="pane">
						<a className="button button-flat" href="#datasets">Manage datasets</a>
					</div>
				);
			}
			return (
				<div>
					{datasets_pane}
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