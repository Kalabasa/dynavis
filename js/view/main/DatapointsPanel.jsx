"use strict";
define(["react", "model/Dataset", "jsx!view/FileInput", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/PanelToolbar", "jsx!view/main/DatapointRow", "mixin/ScrollToTopMixin", "react.backbone"], function(React, Dataset, FileInput, SearchControls, PageControls, PanelToolbar, DatapointRow, ScrollToTopMixin) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin, ScrollToTopMixin],

 		getInitialState: function() {
 			return {
 				name: this.model().get("name"),
 				description: this.model().get("description"),
 			};
 		},

		render: function() {
			return (
				<div className="body-panel">
					<div className="clearfix">
						<a className="pull-left button button-complement" href="#datasets">Back</a>
					</div>
					<PanelToolbar ref="toolbar" toggle_text="Add Data">
						<div className="pure-u-1-2 text-center pad">
							<h6>Add single row</h6>
							<button className="button" onClick={this.handle_add}>Add Row</button>
						</div>
						<div className="pure-u-1-2 text-center pad">
							<form ref="form" onSubmit={this.handle_upload}>
								<h6>Upload additional datapoints</h6>
								<div className="label">CSV file</div>
								<div><FileInput ref="file" type="file" /></div>
								<input className="button button-primary" type="submit" value="Upload" />
							</form>
						</div>
					</PanelToolbar>
					<SearchControls className="mar" collection={this.collection()} />
					<ReactCSSTransitionGroup transitionName="fade">
						{this.collection().map(function(datapoint) {
							return <DatapointRow key={datapoint.cid} model={datapoint} />;
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

			$.ajax({
				url: this.model().url() + "/datapoints",
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					React.findDOMNode(that.refs.form).reset();
					that.refs.toolbar.close();
					that.collection().fetch();
				},
			});
		},
	});
});