"use strict";
define(["react", "model/Dataset", "jsx!view/FileInput", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/PanelToolbar", "jsx!view/main/DatasetBox", "react.backbone"], function(React, Dataset, FileInput, SearchControls, PageControls, PanelToolbar, DatasetBox) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],

 		getInitialState: function() {
 			return {
 				name: null,
 				description: null,
 			};
 		},

		render: function() {
			return (
				<div className="body-panel">
					<div className="clearfix">
						<a className="pull-left button button-complement" href="#">Back</a>
					</div>
					<PanelToolbar ref="toolbar" toggle_text="Add Data">
						<div className="pure-u-1 pad">
							<form onSubmit={this.handle_upload}>
								<h6>Upload dataset</h6>
								<div className="pure-g">
									<div className="pure-u-5-12">
										<div className="pure-g">
											<div className="pure-u-1 pad">
												<div className="label">CSV File</div>
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
										<textarea className="input" ref="description" valueLink={this.linkState("description")} />
									</div>
									<div className="pure-u-1-6 pad">
										<input className="button button-primary" type="submit" value="Upload" />
									</div>
								</div>
							</form>
						</div>
					</PanelToolbar>
					<SearchControls className="mar" collection={this.collection()} />
					<ReactCSSTransitionGroup transitionName="slider">
						{this.collection().map(function(dataset) {
							return <DatasetBox key={dataset.cid} model={dataset} />;
						})}
					</ReactCSSTransitionGroup>
					<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
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
			dataset.save(null, {
				success: function() {
					$.ajax({
						url: dataset.url() + "/datapoints",
						data: fd,
						processData: false,
						contentType: false,
						type: "POST",
						success: function(data){
							that.collection().fetch();
							that.setState(that.getInitialState());
						},
						error: function() {
							dataset.destroy();
						},
					});
				},
			});
		},
	});
});