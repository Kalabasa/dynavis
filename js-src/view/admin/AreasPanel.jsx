"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		FileInput = require("jsx!view/FileInput"),
		SearchControls = require("jsx!view/SearchControls"),
		PageControls = require("jsx!view/PageControls"),
		PanelToolbar = require("jsx!view/PanelToolbar"),
		AreaRow = require("jsx!view/admin/AreaRow"),
		ScrollToTopMixin = require("mixin/ScrollToTopMixin"),
		Notification = require("jsx!view/Notification"),
		ConfirmationDialog = require("jsx!view/ConfirmationDialog"),
		ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

	return React.createBackboneClass({
		mixins: [React.addons.LinkedStateMixin, ScrollToTopMixin],

		getInitialState: function() {
			return {
				upload_level: "region",
			};
		},

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
			return (
				<div className="body-panel clearfix">
					<PanelToolbar ref="toolbar" toggle_text="Add Data">
						<div className="pure-u-1-4 text-center pad">
							<h6>Add single row</h6>
							<button className="button" onClick={this.handle_add}>Add Row</button>
						</div>
						<div className="pure-u-3-8 text-center pad">
							<form ref="psgc_form" onSubmit={this.handle_upload_psgc}>
								<h6>Upload PSGC table</h6>
								<div className="label">CSV file</div>
								<div><FileInput ref="file_psgc" type="file" /></div>
								<input className="button button-primary" type="submit" value="Upload File" />
							</form>
						</div>
						<div className="pure-u-3-8 text-center pad">
							<form ref="geojson_form" onSubmit={this.handle_upload_geojson}>
								<h6>Update geometry</h6>
								<div className="label">GeoJSON</div>
								<div><FileInput ref="file_geojson" type="file" /></div>
								<select className="pure-u-1 input" valueLink={this.linkState("upload_level")} required>
									<option value="region">Regions</option>
									<option value="province">Provinces</option>
									<option value="municipality">Cities/Municipalities</option>
									<option value="barangay">Barangays</option>
								</select>
								<input className="button button-primary" type="submit" value="Update" />
								<button className="button button-flat button-complement" onClick={this.handle_delete_geojson}>Delete</button>
							</form>
						</div>
					</PanelToolbar>
					{!this.empty_data() ?
					<div>
						<SearchControls className="mar" ref="searcher" collection={this.collection()} />
						<ReactCSSTransitionGroup transitionName="fade">
							{this.collection().map(function(area) {
								return <AreaRow key={area.cid} model={area} />;
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
			ConfirmationDialog.open("Are you sure you want to delete all family data?", [
				{
					display: "Cancel",
					type: "close",
				},
				{
					display: "Delete All",
					type: "secondary",
					callback: function() {
						var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Deleting all areas...</span>, 0);
						$.ajax({
							url: that.collection().url,
							type: "DELETE",
							success: function(data){
								if(that.refs.toolbar) that.refs.toolbar.open();
								that.collection().fetch();
								Notification.replace(notif, <span><i className="fa fa-trash"/>&ensp;All areas deleted</span>, null, "success");
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

		handle_upload_psgc: function(e) {
			var that = this;
			e.preventDefault();

			var fd = new FormData();
			var file = this.refs.file_psgc.get_input().files[0];
			fd.append("file", file);

			var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Uploading {this.refs.file_psgc.get_filename()}...</span>, 0);

			$.ajax({
				url: this.collection().url,
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					if(that.refs.psgc_form) React.findDOMNode(that.refs.psgc_form).reset();
					if(that.refs.toolbar) that.refs.toolbar.close();
					that.collection().fetch();
					Notification.replace(notif, <span><i className="fa fa-check-circle"/>&ensp;Uploaded PSGC file: {that.refs.file_psgc.get_filename()}</span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Upload error: {that.refs.file_psgc.get_filename()}: {xhr.responseText}</span>, null, "error");
				},
			});
		},

		handle_upload_geojson: function(e) {
			var that = this;
			e.preventDefault();

			var fd = new FormData();
			var file = this.refs.file_geojson.get_input().files[0];
			fd.append("file", file);

			var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Updating {this.refs.file_geojson.get_filename()}...</span>, 0);

			$.ajax({
				url: "api.php/geojson/" + this.state.upload_level,
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					React.findDOMNode(that.refs.geojson_form).reset();
					that.refs.toolbar.close();
					Notification.replace(notif, <span><i className="fa fa-check-circle"/>&ensp;Updated GeoJSON: {that.refs.file_geojson.get_filename()}</span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Update error: {that.refs.file_geojson.get_filename()}: {xhr.responseText}</span>, null, "error");
				},
			});
		},

		handle_delete_geojson: function(e) {
			var that = this;
			e.preventDefault();

			var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Deleting {this.state.upload_level}...</span>, 0);

			$.ajax({
				url: "api.php/geojson/" + this.state.upload_level,
				type: "DELETE",
				success: function(data){
					React.findDOMNode(that.refs.geojson_form).reset();
					that.refs.toolbar.close();
					Notification.replace(notif, <span><i className="fa fa-check-circle"/>&ensp;Deleted GeoJSON: {that.state.upload_level}</span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Delete error: {that.state.upload_level}: {xhr.responseText}</span>, null, "error");
				},
			});
		},
	});
});