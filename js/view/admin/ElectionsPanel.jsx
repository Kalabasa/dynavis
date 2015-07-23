"use strict";
define(["jquery", "react", "jsx!view/FileInput", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/ElectionRow", "mixin/ScrollToTopMixin", "react.backbone"], function($, React, FileInput, SearchControls, PageControls, ElectionRow, ScrollToTopMixin) {
	return React.createBackboneClass({
		mixins: [ScrollToTopMixin],

		render: function() {
			var that = this;
			return (
				<div className="body-panel">
					<div className="panel-toolbar pure-g">
						<div className="pure-u-1-3 text-center pad">
							<h6>Add single row</h6>
							<button className="button" onClick={this.handle_add}>Add Row</button>
						</div>
						<div className="pure-u-2-3 text-center pad">
							<form onSubmit={this.handle_upload}>
								<h6>Upload election records (csv)</h6>
								<div>
									<FileInput ref="file" type="file" />
								</div>
								<input className="button button-primary" type="submit" value="Upload File" />
							</form>
						</div>
					</div>
					<SearchControls ref="searcher" collection={this.collection()} />
					<div>
						{this.collection().map(function(election) {
							return <ElectionRow
								key={election.cid}
								model={election} />;
						})}
					</div>
					<PageControls className="text-center" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},

		handle_add: function() {
			var that = this;
			if(this.refs.searcher.state.query === null && this.collection().getPage() === 0) {
				that.collection().add({}, {at: 0});
			}else{
				this.refs.searcher.set_query(null, {
					complete: function() {
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
					that.collection().fetch();
				},
			});
		},
	});
});	