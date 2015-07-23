"use strict";
define(["jquery", "react"], function($, React) {
	return React.createClass({
		render: function() {
			return (
				<span className="toggle">
					<label>
						Off
						<input type="checkbox" {...this.props} />
						<span className="toggle-lever"></span>
						On
					</label>
				</span>
			);
		},
	});
});