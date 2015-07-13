"use strict";
define(["react", "model/Dataset", "jsx!view/SearchControls", "jsx!view/main/DatasetBox", "react.backbone"], function(React, Dataset, SearchControls, DatasetBox) {
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
					<a className="btn btn-link" href="#">Back</a>
					<h1>Datasets</h1>
					<form onSubmit={this.handle_upload}>
						Upload dataset
						Name <input	className="form-control" ref="name" type="text" valueLink={this.linkState("name")} required />
						Description <input	className="form-control" ref="description" type="text" valueLink={this.linkState("description")} />
						File (csv) <input ref="file" type="file" />
						<input className="btn btn-default" type="submit" value="Upload" />
					</form>
					<SearchControls collection={this.collection()} />
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