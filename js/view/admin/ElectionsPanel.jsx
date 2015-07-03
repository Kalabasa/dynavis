"use strict";
define(["jquery", "react", "jsx!view/PageControls", "jsx!view/admin/ElectionRow", "react.backbone"], function($, React, PageControls, ElectionRow) {
	return React.createBackboneClass({
		render: function() {
			var that = this;
			return (
				<div>
					<h1>Elections</h1>
					<form onSubmit={this.handle_upload}>
						Upload election records (csv) <input ref="file" type="file" />
						<input type="submit" value="Upload" />
					</form>
					<PageControls ref="pager" collection={this.collection()} />
					<button onClick={this.handle_add}>Add</button>
					<ul>
						{this.collection().map(function(election) {
							return <ElectionRow
								key={election.cid}
								model={election} />;
						})}
					</ul>
				</div>
			);
		},

		handle_add: function() {
			var that = this;
			if(this.collection().getPage() === 0) {
				that.collection().add({}, {at: 0});
			}else{
				this.collection().page(0, {
					complete: function() {
						that.collection().add({}, {at: 0});
					},
				});
			}
		},

		handle_upload: function(e) {
			e.preventDefault();

			var fd = new FormData();
			var file = this.refs.file.getDOMNode().files[0];
			fd.append("file", file );

			$.ajax({
				url: "api.php/elections",
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					this.collection().fetch();
				},
			});
		},
	});
});	