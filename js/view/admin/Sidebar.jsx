"use strict";
define(["react"], function(React) {
	return React.createClass({
		componentWillMount: function() {
			this.props.bus.router.on("route", this.on_route);
		},

		componentWillUnmount: function() {
			this.props.bus.router.off("route", this.on_route);
		},

		render: function() {
			return (
				<div>
					<ul ref="menu" className="menu">
						<li ref="elections"><a href="#elections">Elections</a></li>
						<li ref="officials"><a href="#officials">Officials</a></li>
						<li ref="families"><a href="#families">Families</a></li>
						<li ref="areas"><a href="#areas">Areas</a></li>
						<li ref="datasets"><a href="#datasets">Datasets</a></li>
						<li ref="users"><a href="#users">Users</a></li>
					</ul>
				</div>
			);
		},

		on_route: function(e) {
			$(React.findDOMNode(this.refs.menu)).children(".active").removeClass("active indirect");
			var $li = $(React.findDOMNode(this.refs[e.route]));
			$li.addClass("active");
			if(e.params[0]) {
				$li.addClass("indirect");
			}
		},
	});
});