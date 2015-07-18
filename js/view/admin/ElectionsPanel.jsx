"use strict";
define(["jquery", "react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/ElectionRow", "react.backbone"], function($, React, SearchControls, PageControls, ElectionRow) {
	return React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div className="body-panel">
					<form className="pure-form" onSubmit={this.handle_upload}>
						Upload election records (csv) <input ref="file" type="file" />
						<input className="button" type="submit" value="Upload" />
					</form>
					<SearchControls ref="searcher" collection={this.collection()} />
					<button className="button" onClick={this.handle_add}>Add</button>
					<div>
						{this.collection().map(function(election) {
							return <ElectionRow
								key={election.cid}
								model={election} />;
						})}
					</div>
					<PageControls className="text-center" collection={this.collection()} />
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
			var file = this.refs.file.getDOMNode().files[0];
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