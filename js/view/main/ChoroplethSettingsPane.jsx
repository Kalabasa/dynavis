"use strict";
define(["react", "model/DatasetCollection", "jsx!view/Modal", "jsx!view/main/DatasetChooser"], function(React, DatasetCollection, Modal, DatasetChooser) {
	return React.createClass({
		getInitialState: function() {
			return {
				dataset1: null,
				dataset2: null,
			};
		},

		render: function() {
			return (
				<div>
					Choropleth
					Dataset 1: {this.state.dataset1 ? this.state.dataset1.get("name") : null}
					<button className="btn btn-default" onClick={this.select_handler(0)}>Select dataset</button>
					Dataset 2: {this.state.dataset2 ? this.state.dataset2.get("name") : null}
					<button className="btn btn-default" onClick={this.select_handler(1)}>Select dataset</button>
				</div>
			);
		},

		select_handler: function(i) {
			var that = this;
			return function() {
				var dataset_collection = new DatasetCollection();
				dataset_collection.fetch();
				that.modal = Modal.open("Test", (
					<DatasetChooser collection={dataset_collection} onSelect={function(dataset) {
						that.select_dataset(i, dataset);
					}}/>
				));
			}
		},

		select_dataset: function(i, dataset) {
			if(i == 0) {
				this.setState({dataset1: dataset});
			}else{
				this.setState({dataset2: dataset});
			}
			dataset.get_datapoints().fetch();
			this.modal.close();
		},
	});
});