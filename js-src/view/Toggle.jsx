"use strict";
define(["jquery", "react"], function($, React) {
	return React.createClass({
		render: function() {
			return (
				<span className="toggle" title={this.props.title}>
					<label>
						<input className="toggle-checkbox" type="checkbox" {...this.props} />
						<span className="toggle-lever"></span>
					</label>
				</span>
			);
		},
	});
});