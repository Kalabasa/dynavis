"use strict";
var components = components || {};
(function(){
	components.Sidebar = React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Siedbar</h1>
					<ul>
						<li><a href="#elections">Elections</a></li>
						<li><a href="#officials">Officials</a></li>
						<li><a href="#families">Families</a></li>
						<li><a href="#datasets">Datasets</a></li>
						<li><a href="#users">Users</a></li>
					</ul>
				</div>
			);
		},
	});
})();