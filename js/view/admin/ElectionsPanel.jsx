"use strict";
define(["jquery", "react", "jsx!view/FileInput", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/PanelToolbar", "jsx!view/admin/ElectionRow", "mixin/ScrollToTopMixin", "react.backbone"], function($, React, FileInput, SearchControls, PageControls, PanelToolbar, ElectionRow, ScrollToTopMixin) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

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
					{this.collection().size() ?
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

		handle_delete_all: function() {
			var that = this;
			$.ajax({
				url: this.collection().url,
				type: "DELETE",
				success: function(data){
					that.refs.toolbar.open();
					that.collection().fetch();
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

		handle_upload: function(e) {
			var that = this;
			e.preventDefault();

			var fd = new FormData();
			var file = this.refs.file.get_input().files[0];
			fd.append("file", file);

			$.ajax({
				url: this.collection().url,
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					React.findDOMNode(that.refs.upload_form).reset();
					that.refs.toolbar.close();
					that.collection().fetch();
				},
			});
		},
	});
});	