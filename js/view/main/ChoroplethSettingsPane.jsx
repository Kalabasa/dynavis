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
			return (
				<div className="pane">
					Choropleth
					<div>
						<div>
							Dataset 1: {this.state.dataset1 ? this.state.dataset1.get("name") : null}
							<button className="button" onClick={this.remove_handler(1)}>&times;</button>
						</div>
						<button className="button" onClick={this.select_handler(1)}>Select dataset</button>
					</div>
					<div>
						<div>
							Dataset 2: {this.state.dataset2 ? this.state.dataset2.get("name") : null}
							<button className="button" onClick={this.remove_handler(2)}>&times;</button>
						</div>
						<button className="button" onClick={this.select_handler(2)}>Select dataset</button>
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