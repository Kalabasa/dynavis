"use strict";
define(function(require) {
	var _ = require("underscore"),
		React = require("react"),
		InstanceCache = require("InstanceCache"),
		ChoroplethSettingsPane = require("jsx!view/main/ChoroplethSettingsPane"),
		TagCloudSettingsPane = require("jsx!view/main/TagCloudSettingsPane");

	return React.createClass({
 		mixins: [React.addons.LinkedStateMixin],

		getInitialState: function() {
			return {
				year: new Date().getFullYear(),
				year_input: new Date().getFullYear(),
				level: "region",
				playing: false,
			};
		},

		componentWillMount: function() {
			var token = InstanceCache.get_existing("Token", "session");
			token.on("change", function() {
				this.forceUpdate();
			}, this);

			this.props.bus.main_settings.emit("update", {
				year: this.state.year,
				level: this.state.level,
			});

			this.min_year = 0;
			this.max_year = this.state.year;

			this.choropleth_data = [null, null];
			this.tagcloud_data = null;
		},

		componentDidMount: function() {
			this.props.bus.choropleth_settings.on("update", this.update_choropleth_settings);
			this.props.bus.tagcloud_settings.on("update", this.update_tagcloud_settings);
		},

		componentWillUnmount: function() {
			this.props.bus.choropleth_settings.off("update", this.update_choropleth_settings);
			this.props.bus.tagcloud_settings.off("update", this.update_tagcloud_settings);
		},

		componentWillUpdate: function(nextProps, nextState) {
			var delta = _.omit(_.pick(nextState, "year", "level"), function(value, key, object) {
				return this.state[key] === value;
			}.bind(this));
			if(!_.isEmpty(delta)) this.props.bus.main_settings.emit("update", delta);
		},

		update_choropleth_settings: function(settings) {
			this.choropleth_data = [settings.dataset1, settings.dataset2];
			this.on_update();
		},
		update_tagcloud_settings: function(settings) {
			this.tagcloud_data = settings.dataset;
			this.on_update();
		},
		on_update: function() {
			var datasets = _.filter(this.choropleth_data.concat(this.tagcloud_data));
			if(_.isEmpty(datasets)) return;

			this.min_year = _.max(datasets, function(d){ return d.get("min_year"); }).get("min_year");
			this.max_year = _.min(datasets, function(d){ return d.get("max_year"); }).get("max_year");
			if(this.state.year > this.max_year) {
				this.setState({year: this.max_year, year_input: this.max_year});
			}else if(this.state.year < this.min_year) {
				this.setState({year: this.min_year, year_input: this.min_year});
			}
		},

		render: function() {
			var token = InstanceCache.get_existing("Token", "session");
			var user = token ? token.get_user() : null;
			if(user) {
				var datasets_pane = (
					<div key="pane_links" className="pane">
						<div className="pane-content">
							<a href="#datasets"><button className="pure-u-1 button button-flat">Manage datasets</button></a>
						</div>
					</div>
				);
			}
			var settings_pane = (
				<div key="pane_settings" className="pane">
					<h6 className="pane-header">Visualization Settings</h6>
					<div className="pane-content">
						<div className="pure-g">
							<select className="pure-u-1 input" onChange={this.handle_change_level} required>
								<option value="region">Regional level</option>
								<option value="province">Provincial level</option>
								<option value="municipality">Municipal level</option>
								<option value="barangay">Barangay level</option>
							</select>
						</div>
						<form className="pure-g form" onSubmit={this.handle_submit_year}>
							<input className="pure-u-2-3" type="number" valueLink={this.linkState("year_input")} required />
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
					{settings_pane}
				</div>
			);
		},

		handle_change_level: function(e) {
			this.setState({level: e.target.value});
		},

		handle_submit_year: function(e) {
			if(e) e.preventDefault();
			var year = parseInt(this.state.year_input, 10);
			if(year < this.min_year) {
				year = this.min_year;
			}else if(year > this.max_year) {
				year = this.max_year;
			}
			this.setState({year: year, year_input: year});
		},

		handle_play: function() {
			this.setState({playing: true});
			if(this.state.year >= this.max_year) {
				this.setState({year: this.min_year, year_input: this.min_year});
			}

			var delay = 2000; // TODO: wait for server before continuing
			setTimeout(step.bind(this), delay);

			function step() {
				if(!this.state.playing) return;

				var year = this.state.year + 1;
				this.setState({year: year, year_input: year});

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
			this.setState({year: this.min_year, year_input: this.min_year});
		},

		handle_forward: function() {
			this.setState({year: this.max_year, year_input: this.max_year});
		},
	});
});