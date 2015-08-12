"use strict";
define(["jquery", "react", "bootstrap"], function($, React) {
	var Modal = React.createClass({
		componentDidMount: function() {
			var $this = $(React.findDOMNode(this));
			$this.modal();
			$this.on("hidden.bs.modal", function() {
				this.props.onClose();
			}.bind(this));
		},

		render: function() {
			return (
				<div className="modal fade">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="pull-right button button-flat button-close" onClick={this.handle_close}>&times;</button>
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

	Modal.open = function(title, children) {
		var node = document.createElement("div");
		document.body.appendChild(node);
		var modal = React.createElement(Modal,{
			title: title,
			onClose: function() {
				React.unmountComponentAtNode(node);
				document.body.removeChild(node);
			},
		}, null, children);
		return React.render(modal, node);
	};

	return Modal;
});