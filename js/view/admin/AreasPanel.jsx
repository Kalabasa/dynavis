"use strict";
define(["react", "jsx!view/FileInput", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/PanelToolbar", "jsx!view/admin/AreaRow", "mixin/ScrollToTopMixin", "react.backbone"], function(React, FileInput, SearchControls, PageControls, PanelToolbar, AreaRow, ScrollToTopMixin) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			return (
				<div className="body-panel">
					<PanelToolbar ref="toolbar" toggle_text="Add Data">
						<div className="pure-u-1-3 text-center pad">
							<h6>Add a single row</h6>
							<button className="button" onClick={this.handle_add}>Add Row</button>
						</div>
						<div className="pure-u-2-3 text-center pad">
							<form onSubmit={this.handle_upload}>
								<h6>Upload PSGC table (csv)</h6>
								<div><FileInput ref="file" type="file" /></div>
								<input className="button button-primary" type="submit" value="Upload File" />
							</form>
						</div>
					</PanelToolbar>
					<SearchControls className="mar" ref="searcher" collection={this.collection()} />
					<ReactCSSTransitionGroup transitionName="slider">
						{this.collection().map(function(area) {
							return <AreaRow key={area.cid} model={area} />;
						})}
					</ReactCSSTransitionGroup>
					<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},

		handle_add: function() {
			var that = this;
			if(this.refs.searcher.state.query === null && this.collection().getPage() === 0) {
				this.refs.toolbar.close();
				that.collection().add({}, {at: 0});
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
			var file = this.refs.file.getDOMNode().files[0];
			fd.append("file", file);

			$.ajax({
				url: this.collection().url,
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					that.refs.toolbar.close();
					that.collection().fetch();
				},
			});
		},
	});
});