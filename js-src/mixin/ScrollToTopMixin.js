"use strict";
define(["jquery", "react"], function($, React) {
	return {
		scroll_to_top: function(smooth) {
			var $el = $(React.findDOMNode(this));
			if(smooth) {}
			$el.parent().scrollTop(0);
		},
	};
});