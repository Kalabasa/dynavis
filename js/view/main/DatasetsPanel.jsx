"use strict";
define(["react", "model/Dataset", "jsx!view/PageControls", "jsx!view/admin/DatasetBox", "react.backbone"], function(React, Dataset, PageControls, DatasetBox) {
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin],

 		getInitialState: function() {
 			return {
 				name: null,
 				description: null,
 			};
 		},

		render: function() {
			return (
				<div>
					<a href="#">Back</a>
					<h1>Datasets</h1>
					<form onSubmit={this.handle_upload}>
						Upload dataset
						Name <input ref="name" type="text" valueLink={this.linkState("name")} required />
						Description <input ref="description" type="text" valueLink={this.linkState("description")} />
						File (csv) <input ref="file" type="file" />
						<input type="submit" value="Upload" />
					</form>
					<PageControls collection={this.collection()} />
					<ul>
						{this.collection().map(function(dataset) {
							return <DatasetBox key={dataset.cid} model={dataset} />;
						})}
					</ul>
				</div>
			);
		},

		handle_upload: function(e) {
			var that = this;
			e.preventDefault();

			if(!this.state.name) {
				console.error("No name");
				return;
			}

			var fd = new FormData();
			var file = this.refs.file.getDOMNode().files[0];
			fd.append("file", file);

			var dataset = new Dataset({
				username: this.collection().username,
				name: this.state.name,
				description: this.state.description,
			});
			dataset.save(null, {
				success: function() {
					$.ajax({
						url: dataset.url() + "/datapoints",
						data: fd,
						processData: false,
						contentType: false,
						type: "POST",
						success: function(data){
							that.collection().fetch();
							that.setState(that.getInitialState());
						},
					});
				},
			});
		},
	});
});