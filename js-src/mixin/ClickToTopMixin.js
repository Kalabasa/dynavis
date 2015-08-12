"use strict";
define(["jquery", "react"], function($, React) {
	return {
		componentDidMount: function() {
			var $el = $(React.findDOMNode(this));
			$el.click(function(e) {
				var max = -Infinity;
				$el.siblings().each(function(i,s) {
					var z = parseInt($(s).css("z-index"), 10);
					if(max < z) max = z;
				});
				if(max === -Infinity) max = 0;
				$el.css("z-index", max + 1);
			});
		},
	};
});