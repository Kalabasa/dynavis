"use strict";
define(["react", "model/DatasetCollection", "jsx!view/Modal", "jsx!view/main/DatasetChooser"], function(React, DatasetCollection, Modal, DatasetChooser) {
	return React.createClass({
		getInitialState: function() {
			return {
				dataset1: null,
				dataset2: null,
			};
		},

		componentWillUpdate: function(nextProps, nextState) {
			this.props.bus.choropleth_settings.emit("dataset", {
				dataset1: nextState.dataset1,
				dataset2: nextState.dataset2,
			});
		},

		render: function() {
			return (
				<div>
					Choropleth
					Dataset 1: {this.state.dataset1 ? this.state.dataset1.get("name") : null}
					<button className="pure-button" onClick={this.select_handler(1)}>Select dataset</button>
					Dataset 2: {this.state.dataset2 ? this.state.dataset2.get("name") : null}
					<button className="pure-button" onClick={this.select_handler(2)}>Select dataset</button>
				</div>
			);
		},

		select_handler: function(i) {
			var that = this;
			return function() {
				var dataset_collection = new DatasetCollection();
				dataset_collection.fetch();
				that.modal = Modal.open("Select dataset", (
					<DatasetChooser collection={dataset_collection} onSelect={function(dataset) {
						that.select_dataset(i, dataset);
					}}/>
				));
			}
		},

		select_dataset: function(i, dataset) {
			var s = {}
			s["dataset" + i] = dataset;
			this.setState(s);
			if(!dataset.get_datapoints().size()){
				dataset.get_datapoints().fetch();
			}
			this.modal.close();
		},
	});
});