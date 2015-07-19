"use strict";
define(["react", "model/DatasetCollection", "jsx!view/Modal", "jsx!view/main/DatasetChooser"], function(React, DatasetCollection, Modal, DatasetChooser) {
	return React.createClass({
		getInitialState: function() {
			return {
				dataset: null,
			};
		},

		componentWillUpdate: function(nextProps, nextState) {
			this.props.bus.tagcloud_settings.emit("dataset", {
				dataset: nextState.dataset,
			});
		},

		render: function() {
			return (
				<div className="pane">
					Tag Cloud
					Dataset: {this.state.dataset ? this.state.dataset.get("name") : null}
					<button className="button" onClick={this.handle_select}>Select dataset</button>
				</div>
			);
		},

		handle_select: function(i) {
			var that = this;
			var dataset_collection = new DatasetCollection();
			dataset_collection.fetch();
			that.modal = Modal.open("Select dataset", (
				<DatasetChooser collection={dataset_collection} onSelect={function(dataset) {
					that.select_dataset(dataset);
				}}/>
			));
		},

		select_dataset: function(dataset) {
			this.setState({dataset: dataset});
			if(!dataset.get_datapoints().size()){
				dataset.get_datapoints().fetch();
			}
			this.modal.close();
		},
	});
});