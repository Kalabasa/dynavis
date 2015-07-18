"use strict";
define(["react", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/admin/AreaRow", "react.backbone"], function(React, SearchControls, PageControls, AreaRow) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div className="body-panel">
					<form onSubmit={this.handle_upload}>
						Upload PSGC list (csv) <input ref="file" type="file" />
						<input className="pure-button" type="submit" value="Upload" />
					</form>
					<SearchControls ref="searcher" collection={this.collection()} />
					<button className="pure-button" onClick={this.handle_add}>Add</button>
					<div>
						{this.collection().map(function(area) {
							return <AreaRow key={area.cid} model={area} />;
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