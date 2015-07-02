"use strict";
define(["jquery", "react", "model/Election", "jsx!view/PageControls", "jsx!view/admin/ElectionRow", "react.backbone"], function($, React, Election, PageControls, ElectionRow) {
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
					<PageControls collection={this.collection()} />
					<button onClick={this.handle_add}>Add</button>
					<ul>
						{this.collection().map(function(election) {
							return <ElectionRow
								key={election.id}
								model={election} />;
						})}
					</ul>
				</div>
			);
		},

		handle_add: function() {
			this.collection().add(new Election(), {at: 0});
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