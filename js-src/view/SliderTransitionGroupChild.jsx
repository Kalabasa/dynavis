"use strict";
define(["jquery", "react", "jquery.bez"], function($, React) {
	var ease_swift = $.bez([0.2, 0, 0.1, 1]);
	return React.createClass({
		componentWillAppear: function(done) {
			done();
		},

		componentWillEnter: function(done) {
			var $el = $(React.findDOMNode(this));
			var $buttons = $el.find("input[type=button],input[type=submit],input[type=reset],button");
			$buttons.prop("disabled", true);
			$el.hide().animate({
				height: "toggle", opacity: "toggle",
			}, 600, ease_swift, function(){
				$buttons.prop("disabled", false);
				done();
			});
		},

		componentWillLeave: function(done) {
			var $el = $(React.findDOMNode(this));
			$el.find("input[type=button],input[type=submit],input[type=reset],button").prop("disabled", true);
			$el.animate({
				height: 0, opacity: 0,
			}, 600, ease_swift, done);
		},

		render: function() {
			return <div>{this.props.children}</div>;
		},
	});
});