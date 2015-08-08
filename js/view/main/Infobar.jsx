"use strict";
define(function(require) {
	var _ = require("underscore"),
		numf = require("numf"),
		React = require("react"),
		InstanceCache = require("InstanceCache"),
		AreaElectionCollection = require("model/AreaElectionCollection"),
		Name = require("jsx!view/Name"),
		AreaElectionsList = require("jsx!view/main/AreaElectionsList"),
		AreaFamiliesList = require("jsx!view/main/AreaFamiliesList");

	return React.createClass({
		getInitialState: function() {
			return {
				selected: null,
				data: [null, null],
			};
		},

		componentDidMount: function() {
			this.props.bus.router.on("route", this.on_route);
			this.props.bus.main_settings.on("select", this.on_select);
			this.props.bus.main_settings.on("update", this.on_main_settings);
			this.props.bus.choropleth_data.on("update", this.on_choropleth_data);
		},

		componentWillUnmount: function() {
			this.props.bus.router.off("route", this.on_route);
			this.props.bus.main_settings.off("select", this.on_select);
			this.props.bus.main_settings.off("update", this.on_main_settings);
			this.props.bus.choropleth_data.off("update", this.on_choropleth_data);
		},

		render: function() {
			var area = null, elections = null;
			if(this.state.selected && this.state.selected.area_code) {
				area = InstanceCache.get("Area", this.state.selected.area_code, true);
				elections = new AreaElectionCollection(null, {area: area});
				elections.fetch();

				var area_bar = [
					(<h3 key="title" className="inline"><Name model={area}/></h3>),
					(<span key="variables">{_.map(_.filter(this.state.data), function(d, i) {
						var datapoints = this.filter_datapoints(d.datapoints, area.get("code"));
						if(datapoints.length) {
							var value = datapoints[0].get("value");
							return (
								<span key={i} title={value}>
									<span>{d.name}</span>
									<span>{numf.format(value)}</span>
								</span>
							);
						}else{
							return (
								<span key={i}>
									<span>{d.name}</span>
									<span>No Data</span>
								</span>
							);
						}
					}, this)}</span>),
				];
			}
			return (
				<div className="pure-g">
					<div className="pure-u-1 infobar-title">
						<div className="pure-u-4-5">
							{area_bar}
						</div>
						<div className="pure-u-1-5">
							<button className="pull-right button button-flat button-close" onClick={this.handle_close}>&times;</button>
						</div>
					</div>
					<div className="pure-u-1 infobar-content">
						<div className="pure-u-2-3">
							<AreaElectionsList bus={this.props.bus} collection={elections}/>
						</div>
						<div className="pure-u-1-3">
							<AreaFamiliesList bus={this.props.bus} collection={elections}/>
						</div>
					</div>
				</div>
			);
		},

		filter_datapoints: function(datapoints, area_code) {
			area_code = ("0" + area_code);
			var match_start = area_code.substr(2-9,2) === "00" ? 0 : 2;
			var area_code_match = area_code.substr(match_start-9);
			return datapoints.filter(function(p) {
				return ("0"+p.get("area_code")).substr(match_start-9) == area_code_match;
			});
		},

		on_select: function(selected) {
			if(this.state.selected && selected && this.state.selected.area_code == selected.area_code) {
				if(this.is_hidden()) this.show();
			}else{
				this.setState({selected: null});
				if(selected) {
					if(this.is_hidden()) {
						this.show();
						setTimeout(function() {
							this.setState({selected: selected});
						}.bind(this), 400);
					}else{
						this.setState({selected: selected});
					}
				}
			}
		},

		on_main_settings: function(settings) {
			if(settings.year) this.forceUpdate();
		},

		on_choropleth_data: function(data) {
			this.setState({data: data});
		},

		on_route: function(e) {
			this.hide();
		},

		handle_close: function() {
			this.hide();
			if(this.state.selected) setTimeout(this.state.selected.on_close, 400);
		},

		show: function() {
			$(React.findDOMNode(this).parentNode).addClass("show");
		},

		hide: function() {
			$(React.findDOMNode(this).parentNode).removeClass("show");
		},

		is_hidden: function() {
			return !$(React.findDOMNode(this).parentNode).hasClass("show");
		},
	});
});