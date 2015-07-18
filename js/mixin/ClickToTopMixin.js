"use strict";
define(["jquery", "react"], function($, React) {
	return {
		componentDidMount: function() {
			var $el = $(React.findDOMNode(this));
			$el.click(function(e) {
				var max = -Infinity;
				$el.siblings().each(function(i,s) {
					var z = $(s).css("z-index");
					if(max < z) max = z;
				});
				if(max !== -Infinity) max = 0;
				$el.css("z-index", max+1);
			});
		},
	};
});