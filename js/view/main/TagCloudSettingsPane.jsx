"use strict";
define(function(require) {
	var React = require("react"),
		DatasetCollection = require("model/DatasetCollection"),
		Modal = require("jsx!view/Modal"),
		DatasetChooser = require("jsx!view/main/DatasetChooser"),
		TagCloudLegend = require("jsx!view/main/TagCloudLegend");

	return React.createClass({
		getInitialState: function() {
			return {
				dataset: null,
			};
		},
		
		componentWillUpdate: function(nextProps, nextState) {
			this.props.bus.tagcloud_settings.emit("update", {
				dataset: nextState.dataset,
			});
		},

		render: function() {
			var text = "Select Dataset";
			var selection_button = null;
			if(this.state.dataset) {
				var selection_button = (
					<div className="pure-u-1 group group-no-table">
						<button className="pure-u-5-6 group-component one-line button" onClick={this.handle_select}>{this.state.dataset.get("name")}</button>
						<button className="pure-u-1-6 group-component button" onClick={this.handle_remove}><i className="fa fa-close"/></button>
					</div>
				);
			}else{
				var selection_button = (
					<div className="pure-u-1">
						<button className="pure-u-1 button" onClick={this.handle_select}>Select Dataset</button>
					</div>
				);
			}
			return (
				<div className="pane">
					<h6 className="pane-header">Tag Cloud Layer</h6>
					<div className="pane-content">
						{selection_button}
						<TagCloudLegend bus={this.props.bus}/>
					</div>
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
					that.modal.close();
					that.modal = null;
				}}/>
			));
		},

		handle_remove: function() {
			this.select_dataset(null);
		},

		select_dataset: function(dataset) {
			this.setState({dataset: dataset});
		},
	});
});