"use strict";
define(["react", "jsx!view/Notification", "react.backbone"], function(React, Notification) {
	return React.createBackboneClass({
		render: function() {
			var username = this.model().get("username");
			var url_datasets = "#users/" + username + "/datasets";
			return (
				<div className="data-row">
					<div className="pure-g">
						<div className="pure-u-5-6">
							<div className="field text-large">{this.model().get("name")}</div>
							<div className="field-group">
								<span className="label">Uploaded by</span>
								<span className="field">
									<a href={url_datasets}>{username}</a>
								</span>
							</div>
							<div className="field text">{this.model().get("description")}</div>
						</div>
						<div className="pure-u-1-6">
							<button className="pull-right button button-flat button-complement" onClick={this.handle_delete}>Delete</button>
						</div>
					</div>
				</div>
			);
		},

		handle_delete: function() {
			var name = this.model().get("name");
			var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Deleting {name}...</span>, 0);
			this.model().destroy({
				wait: true,
				success: function(){
					Notification.replace(notif, <span><i className="fa fa-trash"/>&ensp;{name} deleted</span>);
				},
				error: function(xhr) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Delete error: {xhr.responseText}</span>, null, "error");
				},
			});
		},
	});
});