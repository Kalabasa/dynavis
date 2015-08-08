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
			var close_button = null;
			if(this.state.dataset) {
				text = this.state.dataset.get("name");
				close_button = <button className="button button-complement button-flat button-close" onClick={this.handle_remove}>&times;</button>;
			}
			var button = <div><button className="button" onClick={this.handle_select}>{text}</button>{close_button}</div>;
			return (
				<div className="pane">
					<h6 className="pane-header">Tag Cloud Layer</h6>
					<div className="pane-content">
						{button}
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