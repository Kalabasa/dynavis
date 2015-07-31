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
			if(!this.collection().size()) {
				this.refs.toolbar.open();
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
							</form>
						</div>
					</PanelToolbar>
					{this.collection().size() ?
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

		handle_delete_all: function() {
			var that = this;
			var notif = Notification.open(<span>Deleting all areas...&ensp;<i className="fa fa-circle-o-notch fa-spin"/></span>, 0);
			$.ajax({
				url: this.collection().url,
				type: "DELETE",
				success: function(data){
					that.refs.toolbar.open();
					that.collection().fetch();
					Notification.replace(notif, <span>All areas deleted &ensp;<i className="fa fa-check-circle"/></span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span>Delete error: {xhr.responseText} &ensp;<i className="fa fa-exclamation-circle"/></span>, null, "error");
				},
			});
		},

		handle_add: function() {
			var that = this;
			if(!this.collection().size() || this.refs.searcher.state.query === null && this.collection().getPage() === 0) {
				this.refs.toolbar.close();
				this.collection().add({}, {at: 0});
			}else{
				this.refs.searcher.set_query(null, {
					complete: function() {
						that.refs.toolbar.close();
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

			var notif = Notification.open(<span>Uploading...&ensp;<i className="fa fa-circle-o-notch fa-spin"/></span>, 0);

			$.ajax({
				url: this.collection().url,
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					React.findDOMNode(that.refs.psgc_form).reset();
					that.refs.toolbar.close();
					that.collection().fetch();
					Notification.replace(notif, <span>PSGC file uploaded &ensp;<i className="fa fa-check-circle"/></span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span>Upload error: {xhr.responseText} &ensp;<i className="fa fa-exclamation-circle"/></span>, null, "error");
				},
			});
		},

		handle_upload_geojson: function(e) {
			var that = this;
			e.preventDefault();

			var fd = new FormData();
			var file = this.refs.file_geojson.get_input().files[0];
			fd.append("file", file);

			var notif = Notification.open(<span>Updating...&ensp;<i className="fa fa-circle-o-notch fa-spin"/></span>, 0);

			$.ajax({
				url: "api.php/geojson/" + this.state.upload_level,
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					React.findDOMNode(that.refs.geojson_form).reset();
					that.refs.toolbar.close();
					Notification.replace(notif, <span>GeoJSON updated &ensp;<i className="fa fa-check-circle"/></span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span>Update error: {xhr.responseText} &ensp;<i className="fa fa-exclamation-circle"/></span>, null, "error");
				},
			});
		},
	});
});