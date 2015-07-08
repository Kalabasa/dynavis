"use strict";
define(["jquery", "react", "bootstrap"], function($, React) {
	var Modal = React.createClass({
		componentDidMount: function() {
			var that = this;
			$(React.findDOMNode(this)).modal();
			$(React.findDOMNode(this.refs.modal)).on("hidden.bs.modal", function() {
				that.props.onClose();
			});
		},

		render: function() {
			return (
				<div ref="modal" className="modal fade">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.handle_close}>&times;</button>
								<h4 className="modal-title">{this.props.title}</h4>
							</div>
							<div className="modal-body">
								{this.props.children}
							</div>
						</div>
					</div>
				</div>
			);
		},

		handle_close: function() {
			this.close();
		},

		close: function() {
			$(React.findDOMNode(this)).modal("hide");
		},
	});

	Modal.show = function(title, children) {
		var node = document.createElement("div");
		document.body.appendChild(node);
		var modal = React.createElement(Modal,
			{
				title: title,
				onClose: function() {
					React.unmountComponentAtNode(node);
					document.body.removeChild(node);
				},
			},
			{children}
		);
		React.render(modal, node);
		return modal;
	};

	return Modal;
});