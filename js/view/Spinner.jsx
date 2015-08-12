"use strict";
define(["react"], function(React) {
	return React.createClass({
		// http://codepen.io/CSS3fx/pen/EfByo
		render: function() {
			// var size = this.props.size || 1;
			var size = 1;
			return (
				<svg className={"spinner-circular " + this.props.className} height={50 * size} width={50 * size} styl={this.props.style}>
					<circle className="spinner-path" cx={25 * size} cy={25 * size} r={19.9 * size} fill="none" strokeWidth={6 * size} strokeMiterlimit={10} />
				</svg>
			);
		},
	});
});