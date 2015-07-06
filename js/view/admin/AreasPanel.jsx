"use strict";
define(["react", "jsx!view/IndexedPageControls", "jsx!view/admin/AreaRow", "react.backbone"], function(React, IndexedPageControls, AreaRow) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Areas</h1>
					<form onSubmit={this.handle_upload}>
						Upload PSGC list (csv) <input ref="file" type="file" />
						<input type="submit" value="Upload" />
					</form>
					<IndexedPageControls ref="index" collection={this.collection()} />
					<ul>
						{this.collection().map(function(area) {
							return <AreaRow key={area.cid} model={area} />;
						})}
					</ul>
				</div>
			);
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