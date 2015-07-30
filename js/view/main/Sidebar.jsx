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
					<div key="pane_links" className="pane">
						<a className="button button-flat" href="#datasets">Manage your datasets</a>
					</div>
				);
			}
			return (
				<div>
					{datasets_pane}
					<ChoroplethSettingsPane key="pane_choropleth" bus={this.props.bus} />
					<TagCloudSettingsPane key="pane_tagcloud" bus={this.props.bus} />
					<form key="pane_year" className="pane pure-g form" onSubmit={this.handle_submit}>
						<input className="pure-u-2-3" type="number" valueLink={this.linkState("year")} required />
						<input className="pure-u-1-3 button-primary" type="submit" value="Go" />
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