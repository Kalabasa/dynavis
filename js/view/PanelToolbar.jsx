"use strict";
define(["jquery", "react"], function($, React){
	return React.createClass({
		componentDidMount: function() {

		},

		render: function() {
			return (
				<div className="panel-toolbar panel-toolbar-closed">
					<div className="panel-toolbar-toggle">
						<button className="pull-right button button-primary mar" onClick={this.toggle}>
							{this.props.toggle_text}
						</button>
					</div>
					<div className="panel-toolbar-contents">
						<div className="pure-u-1">
							<button className="pull-right button button-flat button-close mar" onClick={this.toggle}>
								&times;
							</button>
						</div>
						<div className="pure-g">
							{this.props.children}
						</div>
					</div>
				</div>
			);
		},

		toggle: function() {
			$(React.findDOMNode(this)).toggleClass("panel-toolbar-closed");
		},
		open: function() {
			$(React.findDOMNode(this)).removeClass("panel-toolbar-closed");
		},
		close: function() {
			$(React.findDOMNode(this)).addClass("panel-toolbar-closed");
		},
	});
});