"use strict";
define(["react", "jsx!view/Login"], function(React, Login) {
	return React.createClass({
		render: function() {
			return (
				<div>
					<Login model={this.props.token} />
					<ul>
						<li><a className="btn btn-link" href="#elections">Elections</a></li>
						<li><a className="btn btn-link" href="#officials">Officials</a></li>
						<li><a className="btn btn-link" href="#families">Families</a></li>
						<li><a className="btn btn-link" href="#areas">Areas</a></li>
						<li><a className="btn btn-link" href="#datasets">Datasets</a></li>
						<li><a className="btn btn-link" href="#users">Users</a></li>
					</ul>
				</div>
			);
		},
	});
});