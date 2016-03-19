"use strict";
define(function(require) {
	var $ = require("jquery"),
		React = require("react", "react.backbone"),
		FileInput = require("jsx!view/FileInput"),
		SearchControls = require("jsx!view/SearchControls"),
		PageControls = require("jsx!view/PageControls"),
		PanelToolbar = require("jsx!view/PanelToolbar"),
		ElectionRow = require("jsx!view/admin/ElectionRow"),
		ScrollToTopMixin = require("mixin/ScrollToTopMixin"),
		Notification = require("jsx!view/Notification"),
		ConfirmationDialog = require("jsx!view/ConfirmationDialog"),
		ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		componentDidMount: function() {
			this.onModelChange();
		},
		onModelChange: function() {
			if(this.refs.toolbar) {
				if(this.empty_data()) this.refs.toolbar.open();
				else this.refs.toolbar.close();
			}
			this.forceUpdate();
		},

		render: function() {
			var that = this;
			return (
				<div className="body-panel clearfix">
					<PanelToolbar ref="toolbar" toggle_text="Add Data">
						<div className="pure-u-1-3 text-center pad">
							<h6>Add a single row</h6>
							<button className="button" onClick={this.handle_add}>Add Row</button>
						</div>
						<div className="pure-u-2-3 text-center pad">
							<form ref="upload_form" onSubmit={this.handle_upload}>
								<h6>Upload election records</h6>
								<div className="label">CSV file</div>
								<div><FileInput ref="file" type="file" /></div>
								<input className="button button-primary" type="submit" value="Upload File" />
							</form>
						</div>
					</PanelToolbar>
					{!this.empty_data() ?
					<div>
						<SearchControls className="mar" ref="searcher" collection={this.collection()} />
						<ReactCSSTransitionGroup transitionName="fade">
							{this.collection().map(function(election) {
								return <ElectionRow
									key={election.cid}
									model={election} />;
							})}
						</ReactCSSTransitionGroup>
						<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
						<button className="pull-right button button-complement mar" onClick={this.handle_delete_all}>Delete All</button>
					</div>
					: null}
				</div>
			);
		},

		empty_data: function() {
			return !this.collection().size() && (!this.refs.searcher || this.refs.searcher.state.query === null) && this.collection().getPage() === 0;
		},

		handle_delete_all: function() {
			var that = this;
			ConfirmationDialog.open("Are you sure you want to delete all records?", [
				{
					display: "Cancel",
					type: "close",
				},
				{
					display: "Delete All",
					type: "secondary",
					callback: function() {
						var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Deleting all election records and related data...</span>, 0);
						$.ajax({
							url: that.collection().url,
							method: "POST", // Fake method for compatibility
							headers: { "X-HTTP-Method-Override": "DELETE" },
							success: function(data){
								if(that.refs.toolbar) that.refs.toolbar.open();
								that.collection().fetch();
								Notification.replace(notif, <span><i className="fa fa-trash"/>&ensp;All election records and related data deleted</span>, null, "success");
							},
							error: function(xhr) {
								Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Delete error: {xhr.responseText}</span>, null, "error");
							},
						});
					},
				},
			]);
		},

		handle_add: function() {
			var that = this;
			if(!this.collection().size() || this.refs.searcher.state.query === null && this.collection().getPage() === 0) {
				this.refs.toolbar.close();
				this.collection().add({}, {at: 0});
			}else{
				this.refs.searcher.set_query(null, {
					complete: function() {
						if(that.refs.toolbar) that.refs.toolbar.close();
						that.collection().add({}, {at: 0});
					},
				});
			}
		},

		handle_upload: function(e) {
			var that = this;
			e.preventDefault();

			var fd = new FormData();
			var file = this.refs.file.get_input().files[0];
			fd.append("file", file);

			var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Uploading {this.refs.file.get_filename()}...</span>, 0);

			$.ajax({
				url: this.collection().url,
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					if(that.refs.upload_form) React.findDOMNode(that.refs.upload_form).reset();
					if(that.refs.toolbar) that.refs.toolbar.close();
					that.collection().fetch();
					Notification.replace(notif, <span><i className="fa fa-check-circle"/>&ensp;Uploaded election records: {that.refs.file.get_filename()}</span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Upload error: {that.refs.file.get_filename()}: {xhr.responseText}</span>, null, "error");
				},
			});
		},
	});
});	