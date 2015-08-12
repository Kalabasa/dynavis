"use strict";
define(["underscore", "react"], function(_, React) {
	return React.createClass({
		render: function() {
			if(this.props.validation.valid) return <div></div>;
			return (
				<div className="validation-messages">
					{_.map(_.pairs(this.props.validation.messages), function(pair) {
						return <div className="text">{pair[0] + " " + pair[1]}</div>;
					})}
				</div>
			);
		},
	});
});