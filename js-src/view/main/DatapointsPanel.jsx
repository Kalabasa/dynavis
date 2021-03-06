"use strict";
define(["react", "model/Dataset", "jsx!view/FileInput", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/PanelToolbar", "jsx!view/main/DatapointRow", "mixin/ScrollToTopMixin", "jsx!view/Notification", "react.backbone"], function(React, Dataset, FileInput, SearchControls, PageControls, PanelToolbar, DatapointRow, ScrollToTopMixin, Notification) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin, ScrollToTopMixin],

 		getInitialState: function() {
 			return {
 				name: this.model().get("name"),
 				description: this.model().get("description"),
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
			var table_header = (
				<div className="data-table-header">
					<div className="pure-g">
						<div className="pure-u-1-2 pad">Area</div>
						<div className="pure-u-1-4 pad">Year</div>
						<div className="pure-u-1-4 pad">Value</div>
					</div>
				</div>
			);
			return (
				<div className="body-panel">
					<div className="clearfix">
						<a className="pull-left button button-complement" href="#datasets">Back to Datasets</a>
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
					{!this.empty_data() ?
					<div>
						{/*<SearchControls ref="searcher" className="mar" collection={this.collection()} />*/}
						<PageControls className="text-center mar" collection={this.collection()} />
						{table_header}
						<ReactCSSTransitionGroup transitionName="fade">
							{this.collection().map(function(datapoint) {
								return <DatapointRow key={datapoint.cid} model={datapoint} />;
							})}
						</ReactCSSTransitionGroup>
						<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
					</div>
					: null}
				</div>
			);
		},

		empty_data: function() {
			return !this.collection().size() && /*(!this.refs.searcher || this.refs.searcher.state.query === null) && */this.collection().getPage() === 0;
		},

		handle_add: function() {
			var that = this;
			if(/*this.refs.searcher.state.query === null && */this.collection().getPage() === 0) {
				this.refs.toolbar.close();
				this.collection().add({}, {at: 0});
			}else{
				/*this.refs.searcher.set_query(null, {
					complete: function() {
						that.refs.toolbar.close();
						that.collection().add({}, {at: 0});
					},
				});*/
				this.collection().page(0, {
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
				url: this.model().url() + "/datapoints",
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					if(that.refs.form) React.findDOMNode(that.refs.form).reset();
					if(that.refs.toolbar) that.refs.toolbar.close();
					that.collection().fetch();
					Notification.replace(notif, <span><i className="fa fa-check-circle"/>&ensp;Uploaded datapoints: {that.refs.file.get_filename()}</span>, null, "success");
				},
				error: function(xhr) {
					Notification.replace(notif, <span><i className="fa fa-exclamation-circle"/>&ensp;Datapoints upload error: {that.refs.file.get_filename()}: {xhr.responseText}</span>, null, "error");
				},
			});
		},
	});
});