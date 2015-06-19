"use strict";
var components = components || {};
(function(){
	components.Sidebar = React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Siedbar</h1>
					<ul>
						<li><a href="#users">Users</a></li>
						<li><a href="#things">things</a></li>
						<li><a href="#stuff">stuff</a></li>
						<li><a href="#">click</a></li>
					</ul>
				</div>
			);
		},
	});
})();