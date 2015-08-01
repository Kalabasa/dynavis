"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		Dataset = require("model/Dataset"),
		FileInput = require("jsx!view/FileInput"),
		SearchControls = require("jsx!view/SearchControls"),
		PageControls = require("jsx!view/PageControls"),
		PanelToolbar = require("jsx!view/PanelToolbar"),
		DatasetBox = require("jsx!view/main/DatasetBox"),
		Notification = require("jsx!view/Notification"),
		ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],

 		getInitialState: function() {
 			return {
 				name: null,
 				description: null,
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
				<div className="body-panel">
					<div className="clearfix">
						<a className="pull-left button button-complement" href="#">Back to Map</a>
					</div>
					<PanelToolbar ref="toolbar" toggle_text="Add Dataset">
						<div className="pure-u-1 pad">
							<form ref="form" onSubmit={this.handle_upload}>
								<h6>Upload dataset</h6>
								<div className="pure-g">
									<div className="pure-u-5-12">
										<div className="pure-g">
											<div className="pure-u-1 pad">
												<div className="label">CSV file</div>
												<div><FileInput ref="file" type="file" /></div>
											</div>
										</div>
										<div className="pure-g">
											<div className="pure-u-1 pad">
												<div className="label">Name</div>
												<input className="input" ref="name" type="text" valueLink={this.linkState("name")} required />
											</div>
										</div>
									</div>
									<div className="pure-u-5-12 pad">
										<div className="label">Description</div>
										<textarea className="input" ref="description" valueLink={this.linkState("description")} required />
									</div>
									<div className="pure-u-1-6 pad">
										<input className="button button-primary" type="submit" value="Upload" />
									</div>
								</div>
							</form>
						</div>
					</PanelToolbar>
					{this.collection().size() ?
					<div>
						<SearchControls className="mar" collection={this.collection()} />
						<ReactCSSTransitionGroup transitionName="fade">
							{this.collection().map(function(dataset) {
								return <DatasetBox key={dataset.cid} model={dataset} />;
							})}
						</ReactCSSTransitionGroup>
						<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
					</div>
					: null}
				</div>
			);
		},

		handle_upload: function(e) {
			var that = this;
			e.preventDefault();

			if(!this.state.name) {
				console.error("No name");
				return;
			}

			var fd = new FormData();
			var file = this.refs.file.get_input().files[0];
			fd.append("file", file);

			var dataset = new Dataset({
				username: this.collection().username,
				name: this.state.name,
				type: "area",
				description: this.state.description,
			});

			var notif = Notification.open(<span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Uploading metadata...</span>, 0);

			dataset.save(null, {
				success: function() {
					Notification.replace(notif, <span><i className="fa fa-circle-o-notch fa-spin"/>&ensp;Uploading data...</span>);
					$.ajax({
						url: dataset.url() + "/datapoints",
						data: fd,
						processData: false,
						contentType: false,
						type: "POST",
						success: function(data){
							React.findDOMNode(that.refs.form).reset();
							that.refs.toolbar.close();
							that.collection().fetch();
							that.setState(that.getInitialState());
							Notification.replace(notif, <span><i className="fa fa-check-circle"/>&ensp;Dataset uploaded</span>, null, "success");
						},
						error: function(xhr) {
							dataset.destroy();
							Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Datapoints upload error: {xhr.responseText}</span>, null, "error");
						},
					});
				},
				error: function(m,r,o) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Dataset upload error: {r.responseText}</span>, null, "error");
				},
			});
		},
	});
});