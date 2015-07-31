"use strict";
define(["underscore", "jquery", "react"], function(_, $, React) {
	return React.createClass({
		getInitialState: function() {
			return {
				elections: 8,
				areas: 8,
				officials: 8,
				families: 8,
				datasets: 8,
				users: 8,

				region: 8,
				province: 8,
				municipality: 8,
				barangay: 8,

				area_datasets: 8,
				tag_datasets: 8,
			};
		},

		componentWillMount: function() {
			var that = this;

			var create_callback = function(key) {
				return function(data) {
					var s = {};
					s[key] = data.total;
					that.setState(s);
				};
			};

			_.each(["elections", "areas", "officials", "families", "datasets", "users"], function(x) {
				$.get("api.php/" + x, {count: 1}, create_callback(x), "json");
			});
			_.each(["region", "province", "municipality", "barangay"], function(x) {
				$.get("api.php/areas", {level: x, count: 1}, create_callback(x), "json");
			});
			_.each(["area", "tag"], function(x) {
				$.get("api.php/datasets", {type: x, count: 1}, create_callback(x + "_datasets"), "json");
			});
		},

		render: function() {
			var tiles = [
				{	name: "elections",
					contents: (
						<div className="tile">
							<h1 className="text-center">Elections</h1>
							<div className="pure-u-1 field">{this.state.elections} election records</div>
							<p className="text">Update election records</p>
						</div>
					),
				},
				{	name: "areas",
					contents: (
						<div className="tile">
							<h1 className="text-center">Areas</h1>
							<div className="pure-u-1-2 field">{this.state.region} regions</div>
							<div className="pure-u-1-2 field">{this.state.province} provinces</div>
							<div className="pure-u-1-2 field">{this.state.municipality} cities/municipalities</div>
							<div className="pure-u-1-2 field">{this.state.barangay} barangays</div>
							<p className="text">Update administrative subdivisions, PSGC codes, and GeoJSON</p>
						</div>
					),
				},
				{	name: "officials",
					contents: (
						<div className="tile">
							<h1 className="text-center">Officials</h1>
							<div className="pure-u-1 field">{this.state.officials} officials</div>
							<p className="text">Update officials data and family associations</p>
						</div>
					),
				},
				{	name: "families",
					contents: (
						<div className="tile">
							<h1 className="text-center">Families</h1>
							<div className="pure-u-1 field">{this.state.families} families</div>
							<p className="text">Update political families and members</p>
						</div>
					),
				},
				{	name: "datasets",
					contents: (
						<div className="tile">
							<h1 className="text-center">Datasets</h1>
							<div className="pure-u-1 field">{this.state.datasets} datasets</div>
							<p className="text">Manage user-uploaded and system-generated datasets</p>
						</div>
					),
				},
				{	name: "users",
					contents: (
						<div className="tile">
							<h1 className="text-center">Users</h1>
							<div className="pure-u-1 field">{this.state.users} users</div>
							<p className="text">Manage administrators and regular users</p>
						</div>
					),
				},
			];
			
			var message = null;
			var hide = [];
			if(this.state.areas == 0) {
				message = message || {
					title: "There is currently no area data in the database",
					contents: "The system requires a list of all administrative subdivisions of the Philippines along with corresponding PSGC codes and geographical boundary geometries.",
					action: "Add Data",
					link: "areas",
				};
				hide.push(_.findWhere(tiles, {name: "areas"}));
			}
			if(this.state.elections == 0) {
				message = message || {
					title: "There are no election records currently stored in the database",
					contents: "The system requires election data to function. Election records may be obtained from COMELEC.",
					action: "Add Records",
					link: "elections",
				};
				hide.push(_.findWhere(tiles, {name: "elections"}));
				hide.push(_.findWhere(tiles, {name: "officials"}));
				hide.push(_.findWhere(tiles, {name: "families"}));
			}
			if(this.state.families == 0) {
				message = message || {
					title: "There are no officials currently assigned as members of any political family",
					contents: "The system requires political family associations for the data visualization.",
					action: "Add Families",
					link: "families",
				};
				hide.push(_.findWhere(tiles, {name: "families"}));
			}
			if(this.state.tag_datasets == 0){
				message = message || {
					title: "There are currently no political dynasty indicators",
					contents: "Political dynasty indicators are used as input for the data visualization. These indicators are generated from the political family data stored in the database.",
					action: "Generate Indicators",
					link: "datasets",
				};
				if(this.state.datasets == 0){
					hide.push(_.findWhere(tiles, {name: "datasets"}));
				}
			}

			if(message) {
				var mel = (
					<div className="pure-g">
						<a href={"#" + message.link} className="pure-u-1 tile-container highlight">
							<div className="tile clearfix">
								<h6>{message.title}</h6>
								<p className="text">{message.contents}</p>
								<button className="pull-right button button-primary">{message.action}</button>
							</div>
						</a>
					</div>
				);
			}

			return (
				<div className="body-panel">
					{mel}
					<div className="pure-g">
						{tiles.map(function(tile) {
							var classes = "pure-u-1-2 tile-container";
							if(_.indexOf(hide, tile) >= 0) classes += " faded";
							return <a key={tile.name} href={"#" + tile.name} className={classes}>{tile.contents}</a>;
						})}
					</div>
				</div>
			);
		},
	});
});