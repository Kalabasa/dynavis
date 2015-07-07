"use strict";
define(["react", "jsx!view/IndexedPageControls", "jsx!view/admin/AreaRow", "react.backbone"], function(React, IndexedPageControls, AreaRow) {
	return React.createBackboneClass({
		render: function() {
			return (
				<div>
					<h1>Areas</h1>
					<form onSubmit={this.handle_upload}>
						Upload PSGC list (csv) <input ref="file" type="file" />
						<input className="btn btn-default" type="submit" value="Upload" />
					</form>
					<IndexedPageControls ref="index" collection={this.collection()} />
					<button className="btn btn-default" onClick={this.handle_add}>Add</button>
					<ul>
						{this.collection().map(function(area) {
							return <AreaRow key={area.cid} model={area} />;
						})}
					</ul>
				</div>
			);
		},

		handle_add: function() {
			var that = this;
			if(this.refs.index.state.letter === null && this.collection().getPage() === 0) {
				that.collection().add({}, {at: 0});
			}else{
				this.refs.index.set_letter(null, {
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