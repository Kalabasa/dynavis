"use strict";
define(["react", "InstanceCache", "jsx!view/main/ChoroplethSettingsPane", "jsx!view/main/TagCloudSettingsPane"], function(React, InstanceCache, ChoroplethSettingsPane, TagCloudSettingsPane) {
	return React.createClass({
 		mixins: [React.addons.LinkedStateMixin],

		getInitialState: function() {
			return {
				year: new Date().getFullYear(),
				playing: false,
			};
		},

		componentWillMount: function() {
			var token = InstanceCache.get_existing("Token", "session");
			token.on("change", function() {
				this.forceUpdate();
			}, this);
			this.handle_submit();

			this.min_year = this.state.year;
			this.max_year = this.state.year;

			this.choropleth_data = [null, null];
			this.tagcloud_data = null;
		},

		componentDidMount: function() {
			this.props.bus.choropleth_settings.on("update", this.update_choropleth_settings);
			this.props.bus.tagcloud_settings.on("update", this.update_tagcloud_settings);

			this.props.bus.main_settings.emit("update", {year: this.state.year});
		},

		componentWillUnmount: function() {
			this.props.bus.choropleth_settings.off("update", this.update_choropleth_settings);
			this.props.bus.tagcloud_settings.off("update", this.update_tagcloud_settings);
		},

		update_choropleth_settings: function(settings) {
			this.choropleth_data = [settings.dataset1, settings.dataset2];
			_.defer(this.on_update);
		},
		update_tagcloud_settings: function(settings) {
			this.tagcloud_data = settings.dataset;
			_.defer(this.on_update);
		},
		on_update: function() {
			var datasets = _.filter(this.choropleth_data.concat(this.tagcloud_data));
			if(_.isEmpty(datasets)) return;

			this.min_year = _.max(datasets, function(d){ return d.get("min_year"); }).get("min_year");
			this.max_year = _.min(datasets, function(d){ return d.get("max_year"); }).get("max_year");
			if(this.state.year > this.max_year || this.state.year < this.min_year) {
				this.setState({year: this.max_year});
				this.props.bus.main_settings.emit("update", {year: this.max_year});
			}
		},

		render: function() {
			var token = InstanceCache.get_existing("Token", "session");
			var user = token ? token.get_user() : null;
			if(user) {
				var datasets_pane = (
					<div key="pane_links" className="pane">
						<div className="pane-content">
							<a className="button button-flat" href="#datasets">Manage datasets</a>
						</div>
					</div>
				);
			}
			var year_pane = (
				<div key="pane_year" className="pane">
					<h6 className="pane-header">Year</h6>
					<div className="pane-content">
						<form className="pure-g form" onSubmit={this.handle_submit}>
							<input className="pure-u-2-3" type="number" valueLink={this.linkState("year")} required />
							<input className="pure-u-1-3 button-primary" type="submit" value="Go" />
						</form>
						<div className="pure-g">
							<button className="pure-u-1-4 button" onClick={this.handle_backward}><i className="fa fa-step-backward"/></button>
							{this.state.playing
								? <button className="pure-u-1-2 button" onClick={this.handle_pause}><i className="fa fa-pause"/>&ensp; Pause</button>
								: <button className="pure-u-1-2 button" onClick={this.handle_play}><i className="fa fa-play"/>&ensp; Play</button>}
							<button className="pure-u-1-4 button" onClick={this.handle_forward}><i className="fa fa-step-forward"/></button>
						</div>
					</div>
				</div>
			);
			return (
				<div>
					{datasets_pane}
					<ChoroplethSettingsPane key="pane_choropleth" bus={this.props.bus} />
					<TagCloudSettingsPane key="pane_tagcloud" bus={this.props.bus} />
					{year_pane}
				</div>
			);
		},

		handle_submit: function(e) {
			if(e) e.preventDefault();
			var year = parseInt(this.state.year);
			if(year < this.min_year) {
				year = this.min_year;
				this.setState({year: year});
			}else if(year > this.max_year) {
				year = this.max_year;
				this.setState({year: year});
			}
			this.props.bus.main_settings.emit("update", {year: year});
		},

		handle_play: function() {
			this.setState({playing: true});
			if(this.state.year >= this.max_year) {
				this.setState({year: this.min_year});
				this.props.bus.main_settings.emit("update", {year: this.min_year});
			}

			var delay = 2000; // TODO: wait for server before continuing
			setTimeout(step.bind(this), delay);

			function step() {
				if(!this.state.playing) return;

				this.setState({year: this.state.year + 1});
				this.props.bus.main_settings.emit("update", {year: this.state.year});

				if(this.state.year + 1 >= this.state.max_year) {
					this.setState({playing: false});
				}else{
					setTimeout(step.bind(this), delay);
				}
			}
		},

		handle_pause: function() {
			this.setState({playing: false});
		},

		handle_backward: function() {
			this.setState({year: this.min_year});
			this.props.bus.main_settings.emit("update", {year: this.min_year});
		},

		handle_forward: function() {
			this.setState({year: this.max_year});
			this.props.bus.main_settings.emit("update", {year: this.max_year});
		},
	});
});