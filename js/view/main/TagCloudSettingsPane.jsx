"use strict";
define(["react", "model/DatasetCollection", "jsx!view/Modal", "jsx!view/main/DatasetChooser"], function(React, DatasetCollection, Modal, DatasetChooser) {
	return React.createClass({
		getInitialState: function() {
			return {
				dataset: null,
			};
		},

		componentWillUpdate: function(nextProps, nextState) {
			var callback = function() {
				this.props.bus.tagcloud_settings.emit("dataset", {
					dataset: nextState.dataset,
				});
			}.bind(this);
			if(!nextState.dataset || nextState.dataset.get_datapoints().size()){
				callback();
			}else{
				nextState.dataset.get_datapoints().fetch({
					success: callback
				});
			}
		},

		render: function() {
			return (
				<div className="pane">
					Tag Cloud
					Dataset: {this.state.dataset ? this.state.dataset.get("name") : null}
					<button className="button button-complement button-flat button-close" onClick={this.handle_remove}>&times;</button>
					<button className="button" onClick={this.handle_select}>Select dataset</button>
				</div>
			);
		},

		handle_select: function() {
			var that = this;
			var dataset_collection = new DatasetCollection();
			dataset_collection.fetch({data: {type: "tag"}});
			that.modal = Modal.open("Select dataset", (
				<DatasetChooser collection={dataset_collection} onSelect={function(dataset) {
					that.select_dataset(dataset);
				}}/>
			));
		},

		handle_remove: function() {
			that.select_dataset(null);
		},

		select_dataset: function(dataset) {
			this.setState({dataset: dataset});
			this.modal.close();
		},
	});
});