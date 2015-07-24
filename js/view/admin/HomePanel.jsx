"use strict";
define(["react"], function(React) {
	return React.createClass({
		render: function() {
			return (
				<div className="body-panel text-center">
					<div className="pure-g">
						<a href="#elections" className="pure-u-1-2">
							<h1>Elections</h1>
							<p className="text">Update election records</p>
						</a>
						<a href="#areas" className="pure-u-1-2">
							<h1>Areas</h1>
							<p className="text">Update administrative subdivisions, PSGC, and GeoJSON</p>
						</a>
						<a href="#officials" className="pure-u-1-2">
							<h1>Officials</h1>
							<p className="text">Update officials data and family associations</p>
						</a>
						<a href="#families" className="pure-u-1-2">
							<h1>Families</h1>
							<p className="text">Update political families and members</p>
						</a>
						<a href="#datasets" className="pure-u-1-2">
							<h1>Datasets</h1>
							<p className="text">Manage user-uploaded and system-generated datasets</p>
						</a>
						<a href="#users" className="pure-u-1-2">
							<h1>Users</h1>
							<p className="text">Manage administrators and regular users</p>
						</a>
					</div>
				</div>
			);
		},
	});
});