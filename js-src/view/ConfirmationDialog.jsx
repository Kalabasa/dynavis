"use strict";
define(["underscore", "jquery", "react", "jsx!view/Modal", "bootstrap"], function(_, $, React, Modal) {
	var ConfirmationDialog = React.createClass({
		statics: {
			open: function(message, actions) {
				var node = document.createElement("div");
				document.body.appendChild(node);
				var dialog = React.createElement(ConfirmationDialog,{
					message: message,
					actions: actions,
					onClose: function() {
						React.unmountComponentAtNode(node);
						document.body.removeChild(node);
					},
				}, null);
				return React.render(dialog, node);
			},
		},

		componentDidMount: function() {
			var $this = $(React.findDOMNode(this));
			$this.modal();
			$this.on("hidden.bs.modal", function() {
				this.props.onClose();
			}.bind(this));
		},

		render: function() {
			var that = this;
			return (
				<div className="modal fade">
					<div className="modal-dialog modal-sm">
						<div className="modal-content">
							<div className="modal-body">
								<div className="text pad">
									{this.props.message}
								</div>
								<div className="clearfix">
									{_.chain(this.props.actions)
										.map(function(action, i) {
											var className = "mar button button-flat";
											className += i == 0 ? " pull-left" : " pull-right";
											
											if(action.type === "close") {
												// className += " button-flat";
											}else if(action.type === "primary") {
												className += " button-primary";
											}else if(action.type === "secondary") {
												className += " button-complement";
											}
											var original_callback = action.callback;
											action.callback = function() {
												if(original_callback) original_callback();
												that.close();
											};

											return <button className={className} onClick={action.callback}>{action.display}</button>;
										})
										.reverse()
										.value()}
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		},

		close: function() {
			$(React.findDOMNode(this)).modal("hide");
		},
	});
	return ConfirmationDialog;
});