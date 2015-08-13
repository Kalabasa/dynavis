"use strict";
define(function(require) {
	var _ = require("underscore"),
		React = require("react", "react.backbone"),
		Notification = require("jsx!view/Notification"),
		ConfirmationDialog = require("jsx!view/ConfirmationDialog");

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
								<span className="pure-u-1-6 label">Uploaded by</span>
								<span className="pure-u-5-6 field">
									<a href={url_datasets}>{username}</a>
								</span>
							</div>
							<div className="field-group">
								<span className="pure-u-1-6 label">Range</span>
								<span className="pure-u-5-6 field">
									{this.model().get("min_year")}-{this.model().get("max_year")}
								</span>
							</div>
							<div className="field-group">
								<span className="pure-u-1-6 label">Level</span>
								<span className="pure-u-5-6 field">
									{_.chain(this.model().get("contained_levels"))
										.pick(function(v){ return v; }).keys()
										.map(function(k) {
											return {
												"region": "Regional",
												"province": "Provincial",
												"municipality": "Municipal",
												"barangay": "Barangay",
											}[k];
										})
										.values().join(", ")}
								</span>
							</div>
							<div className="pure-u-1 field text"><pre>{this.model().get("description")}</pre></div>
						</div>
						<div className="pure-u-1-6">
							<button className="pull-right button button-flat button-complement" onClick={this.handle_delete}>Delete</button>
						</div>
					</div>
				</div>
			);
		},

		handle_delete: function() {
			var that = this;
			ConfirmationDialog.open("Are you sure you want to delete this dataset?", [
				{
					display: "Cancel",
					type: "close",
				},
				{
					display: "Delete",
					type: "secondary",
					callback: function() {
						var name = that.model().get("name");
						var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Deleting {name}...</span>, 0);
						that.model().destroy({
							wait: true,
							success: function(){
								Notification.replace(notif, <span><i className="fa fa-trash"/>&ensp;{name} deleted</span>);
							},
							error: function(xhr) {
								Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Delete error: {xhr.responseText}</span>, null, "error");
							},
						});
					},
				},
			]);
		},
	});
});