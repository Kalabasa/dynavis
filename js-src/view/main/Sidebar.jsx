"use strict";
define(function(require) {
	var _ = require("underscore"),
		React = require("react"),
		InstanceCache = require("InstanceCache"),
		Area = require("model/Area"),
		ChoroplethSettingsPane = require("jsx!view/main/ChoroplethSettingsPane"),
		TagCloudSettingsPane = require("jsx!view/main/TagCloudSettingsPane");

	return React.createClass({
 		mixins: [React.addons.LinkedStateMixin],

		getInitialState: function() {
			return {
				year: new Date().getFullYear(),
				year_input: new Date().getFullYear(),
				level: "region",
				allowed_levels: {
					province: true,
					region: true,
					municipality: true,
					barangay: true,
				},
				playing: false,
				disabled: false,
			};
		},

		componentWillMount: function() {
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
			this.props.bus.router.on("route", this.on_route);
			this.props.bus.choropleth_settings.on("update", this.update_choropleth_settings);
			this.props.bus.tagcloud_settings.on("update", this.update_tagcloud_settings);
		},

		componentWillUnmount: function() {
			this.props.bus.router.off("route", this.on_route);
			this.props.bus.choropleth_settings.off("update", this.update_choropleth_settings);
			this.props.bus.tagcloud_settings.off("update", this.update_tagcloud_settings);
		},

		componentWillUpdate: function(nextProps, nextState) {
			var delta = _.omit(_.pick(nextState, "year", "level"), function(value, key, object) {
				return this.state[key] === value;
			}.bind(this));
			if(!_.isEmpty(delta)) this.props.bus.main_settings.emit("update", delta);
		},

		on_route: function(e) {
			this.setState({disabled: e.route !== "main"});
			if(e.route == "main") {
				this.setState({level: "region"});
			}
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
			if(_.isEmpty(datasets)) {
				this.min_year = 0;
				this.max_year = new Date().getFullYear();
				this.setState({
					allowed_levels: _.mapObject(this.state.allowed_levels, function(){ return true; })
				});
				return;
			}

			var year = this.state.year;
			this.min_year = _.max(datasets, function(d){ return d.get("min_year"); }).get("min_year");
			this.max_year = _.min(datasets, function(d){ return d.get("max_year"); }).get("max_year");
			if(this.state.year > this.max_year) {
				year = this.max_year;
				this.setState({year: this.max_year, year_input: this.max_year});
			}else if(this.state.year < this.min_year) {
				year = this.min_year;
				this.setState({year: this.min_year, year_input: this.min_year});
			}

			var allowed_levels = _.reduce(datasets, function(m,d){
				return _.mapObject(m, function(v,k){
					return v || d.get("contained_levels")[k];
				});
			}, _.mapObject(this.state.allowed_levels, function(){ return false; }));
			
			if(!_.isEqual(allowed_levels, this.state.allowed_levels)) {
				this.setState({allowed_levels: allowed_levels});
			}
			if(!allowed_levels[this.state.level]) {
				this.setState({level: _.chain(allowed_levels).keys().find(function(k){ return allowed_levels[k]; }).value()});
			}
		},

		render: function() {
			var settings_pane = (
				<div key="pane_settings" className="pane">
					<h6 className="pane-header">Visualization Settings</h6>
					<div className="pane-content pure-g">
						<select className="pure-u-1 input" value={this.state.level} onChange={this.handle_change_level} required disabled={this.state.disabled}>
							{this.state.allowed_levels.region ? <option value="region">Regional level</option> : null}
							{this.state.allowed_levels.province ? <option value="province">Provincial level</option> : null}
							{this.state.allowed_levels.municipality ? <option value="municipality">Municipal level</option> : null}
							{this.state.allowed_levels.barangay ? <option value="barangay">Barangay level</option> : null}
						</select>
						<form className="pure-u-1 group form" onSubmit={this.handle_submit_year}>
							<input className="pure-u-2-3 group-component" type="number" valueLink={this.linkState("year_input")} required disabled={this.state.disabled} />
							<input className="pure-u-1-3 group-component button-primary" type="submit" value="Go" disabled={this.state.disabled} />
						</form>
						{/* Time animation is unpolished. Controls are disabled.
						<div className="pure-u-1 group">
							<button className="pure-u-1-4 group-component button" onClick={this.handle_backward} disabled={this.state.disabled}><i className="fa fa-step-backward"/></button>
							{this.state.playing
								? <button className="pure-u-1-2 group-component button" onClick={this.handle_pause} disabled={this.state.disabled}><i className="fa fa-pause"/>&ensp; Pause</button>
								: <button className="pure-u-1-2 group-component button" onClick={this.handle_play} disabled={this.state.disabled}><i className="fa fa-play"/>&ensp; Play</button>}
							<button className="pure-u-1-4 group-component button" onClick={this.handle_forward} disabled={this.state.disabled}><i className="fa fa-step-forward"/></button>
						</div>
						*/}
					</div>
				</div>
			);
			return (
				<div>
					<ChoroplethSettingsPane key="pane_choropleth" bus={this.props.bus} disabled={this.state.disabled} />
					<TagCloudSettingsPane key="pane_tagcloud" bus={this.props.bus} disabled={this.state.disabled} />
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
			var to_step = _.after(2, function() {
				this.props.bus.choropleth_data.off("update", to_step);
				this.props.bus.tagcloud_data.off("update", to_step);
				this.setState({year_input: this.state.year});
				setTimeout(step.bind(this), 1000);
			}.bind(this));

			this.setState({playing: true});
			if(this.state.year >= this.max_year) {
				this.props.bus.choropleth_data.on("update", to_step);
				this.props.bus.tagcloud_data.on("update", to_step);
				this.setState({year: this.min_year});
			}else{
				step.call(this);
			}

			function step() {
				var year = this.state.year + 1;
				this.setState({year: year});

				if(year >= this.max_year) {
					this.setState({playing: false, year_input: year});
				}else{
					this.props.bus.choropleth_data.on("update", to_step);
					this.props.bus.tagcloud_data.on("update", to_step);
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