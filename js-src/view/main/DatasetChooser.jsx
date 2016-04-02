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

		componentDidMount: function() {
			React.findDOMNode(this.refs.dataset_list).addEventListener("scroll", this.handle_scroll);
		},

		componentWillUnmount: function() {
			React.findDOMNode(this.refs.dataset_list).removeEventListener("scroll", this.handle_scroll);
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
						<div ref="dataset_list" className="dataset-chooser-list">
							{this.collection().map(function(dataset) {
								return <DatasetChoice key={dataset.cid} model={dataset} selected={that.state.selected===dataset} onClick={function(){ that.click_dataset(dataset); }}/>;
							})}
						</div>
						<div ref="scroll_edge_fade_top" className="scroll-edge-fade edge-fade-top"></div>
						<div ref="scroll_edge_fade_bottom" className="scroll-edge-fade edge-fade-bottom"></div>
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

		handle_scroll: function() {
			var $top_edge = $(React.findDOMNode(this.refs.scroll_edge_fade_top));
			var $bottom_edge = $(React.findDOMNode(this.refs.scroll_edge_fade_bottom));
			var $dataset_list = $(React.findDOMNode(this.refs.dataset_list));

			var threshold = 110;
			var top_offset = $dataset_list.scrollTop();
			var bottom_offset = $dataset_list[0].scrollHeight - (top_offset + $dataset_list.innerHeight());

			if (top_offset < threshold) {
				$top_edge.fadeTo(0, top_offset / threshold);
			} else {
				$top_edge.fadeTo(0, 1);
			}

			if (bottom_offset < threshold) {
				$bottom_edge.fadeTo(0, bottom_offset / threshold);
			} else {
				$bottom_edge.fadeTo(0, 1);
			}
		},
	});
});