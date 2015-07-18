"use strict";
define(["react", "react.backbone"], function(React) {
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
					<div>
						{this.collection().map(function(dataset) {
							return <button className="button" onClick={function() { that.select(dataset); }}>{dataset.get("name")}</button>
						})}
					</div>
					<div>
						<button className="button" onClick={this.handle_select}>Select</button>
					</div>
				</div>
			);
		},

		select: function(dataset) {
			this.setState({selected: dataset});
		},

		handle_select: function() {
			this.props.onSelect(this.state.selected);
		},
	});
});