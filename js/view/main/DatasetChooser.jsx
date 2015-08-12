"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		SearchControls = require("jsx!view/SearchControls"),
		DatasetChoice = require("jsx!view/main/DatasetChoice");

	return React.createBackboneClass({
		getInitialState: function() {
			return {
				selected: null,
			};
		},

		render: function() {
			var that = this;
			return (
				<div>
					<div className="clearfix">
						<a className="pull-left button button-flat" href="#datasets" onClick={this.handle_close}>Upload Own Dataset</a>
					</div>
					<SearchControls collection={this.collection()}/>
					<div className="dataset-chooser-list-container">
						<div className="dataset-chooser-list">
							{this.collection().map(function(dataset) {
								return <DatasetChoice key={dataset.cid} model={dataset} selected={that.state.selected===dataset} onClick={function(){ that.click_dataset(dataset); }}/>;
							})}
						</div>
						<div className="scroll-edge-fade"></div>
					</div>
					<div className="clearfix">
						<button className="pull-right button button-primary" onClick={this.handle_select} disabled={!this.state.selected}>Select</button>
					</div>
				</div>
			);
		},

		click_dataset: function(dataset) {
			if(this.state.selected === dataset) {
				// double-click
				this.props.onSelect(this.state.selected);
			}else{
				this.setState({selected: dataset});
			}
		},

		handle_close: function() {
			this.props.onSelect(null);
		},

		handle_select: function() {
			this.props.onSelect(this.state.selected);
		},
	});
});