"use strict";
define(["jquery", "react", "jquery.bez"], function($, React) {
	var ease_swift = $.bez([0.2, 0, 0.1, 1]);
	return React.createClass({
		componentWillAppear: function(done) {
			done();
		},

		componentWillEnter: function(done) {
			$(React.findDOMNode(this)).hide().animate({
				height: "toggle", opacity: "toggle",
			}, 600, ease_swift, done);
		},

		componentWillLeave: function(done) {
			$(React.findDOMNode(this)).animate({
				height: 0, opacity: 0,
			}, 600, ease_swift, done);
		},

		render: function() {
			return <div>{this.props.children}</div>;
		},
	});
});