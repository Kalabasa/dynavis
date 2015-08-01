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
			var callback = _.after(2, function() {
				this.props.bus.choropleth_settings.emit("dataset", {
					dataset1: nextState.dataset1,
					dataset2: nextState.dataset2,
				});
			}).bind(this);
			_.each([nextState.dataset1, nextState.dataset2], function(dataset) {
				if(!dataset || dataset.get_datapoints().size()){
					callback();
				}else{
					dataset.get_datapoints().fetch({
						success: callback
					});
				}
			});
		},

		render: function() {
			var datasets_list = [];
			var datasets = [this.state.dataset1, this.state.dataset2];
			for (var i = 0; i < datasets.length; i++) {
				var dataset = datasets[i];
				var text = "Select Dataset";
				var close_button = null;
				if(dataset) {
					text = dataset.get("name");
					close_button = <button className="button button-complement button-flat button-close" onClick={this.remove_handler(i+1)}>&times;</button>;
				}
				datasets_list.push(
					<div><button className="button" onClick={this.select_handler(i+1)}>{text}</button>{close_button}</div>
				);
			}
			return (
				<div className="pane">
					<h6 className="pane-header">Choropleth Settings</h6>
					<div className="pane-content">
						{datasets_list}
					</div>
				</div>
			);
		},

		remove_handler: function(i) {
			var that = this;
			return function() {
				that.select_dataset(i, null);
			};
		},

		select_handler: function(i) {
			var that = this;
			return function() {
				var dataset_collection = new DatasetCollection();
				dataset_collection.fetch({data: {type: "area"}});
				that.modal = Modal.open("Select dataset", (
					<DatasetChooser collection={dataset_collection} onSelect={function(dataset) {
						that.select_dataset(i, dataset);
						that.modal.close();
					}}/>
				));
			};
		},

		select_dataset: function(i, dataset) {
			var s = {}
			s["dataset" + i] = dataset;
			this.setState(s);
		},
	});
});