"use strict";
define(function(require) {
	var React = require("react"),
		DatasetCollection = require("model/DatasetCollection"),
		Modal = require("jsx!view/Modal"),
		DatasetChooser = require("jsx!view/main/DatasetChooser"),
		ChoroplethLegend = require("jsx!view/main/ChoroplethLegend");

	return React.createClass({
		getInitialState: function() {
			return {
				dataset1: null,
				dataset2: null,
			};
		},

		shouldComponentUpdate: function(nextProps, nextState) {
			return nextState.dataset1 !== this.state.dataset1 || nextState.dataset2 !== this.state.dataset2;
		},

		componentWillUpdate: function(nextProps, nextState) {
			this.props.bus.choropleth_settings.emit("update", {
				dataset1: nextState.dataset1,
				dataset2: nextState.dataset2,
			});
		},

		render: function() {
			var datasets_list = [];
			var datasets = [this.state.dataset1, this.state.dataset2];
			for (var i = 0; i < datasets.length; i++) {
				var dataset = datasets[i];
				if(dataset) {
					datasets_list.push(
						<div key={i} className="pure-u-1 group">
							<button className="pure-u-7-8 group-component button" onClick={this.select_handler(i+1)}>{dataset.get("name")}</button>
							<button className="pure-u-1-8 group-component button" onClick={this.remove_handler(i+1)}><i className="fa fa-close"/></button>
						</div>
					);
				}else{
					datasets_list.push(
						<div key={i} className="pure-u-1">
							<button className="pure-u-1 button" onClick={this.select_handler(i+1)}>Select Dataset</button>
						</div>
					);
				}
			}
			return (
				<div className="pane">
					<h6 className="pane-header">Choropleth Layer</h6>
					<div className="pane-content">
						{datasets_list}
						<ChoroplethLegend bus={this.props.bus}/>
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
						that.modal = null;
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