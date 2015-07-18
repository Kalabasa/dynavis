"use strict";
define(["jquery", "react", "InstanceCache", "typeahead", "react.backbone"], function($, React, InstanceCache) {
	return React.createBackboneClass({
		getInitialState: function() {
			return {
				value: "",
				selected: null,
			};
		},

		onModelChange: function() {
			if(this.model() && this.state.selected === this.model()) {
				this.setState({value: this.props.display(this.model().toJSON())});
			}
		},

		componentWillMount: function() {
			if(this.model()) {
				this.setState({
					value: this.props.display(this.model().toJSON()),
					selected: this.model(),
				});
			}else{
				this.setState(this.getInitialState());
			}
		},

		componentDidMount: function() {
			var that = this;

			var $input = $(React.findDOMNode(this.refs.input));
			$input.typeahead({highlight: true}, {
				limit: 6,
				highlight: true,
				display: that.props.display,
				source: function(q, sync, async) {
					var params = {
						string: q,
						limit: this.limit,
						qtypeahead: true,
					};
					InstanceCache.search(that.props.for, params,
						function(d) { sync(that.filter_search(d)); },
						function(d) { async(that.filter_search(d)); });
				},
			});
			$input.bind("typeahead:select typeahead:autocomplete", function(e, s) {
				that.handle_select(s);
			});
		},

		filter_search: function(data) {
			var that = this;
			if(this.collection()) {
				return _.filter(data, function(item) {
					return that.collection().get(item.id) == null;
				});
			}else{
				return data;
			}
		},

		render: function() {
			return (
				<input className={this.props.className} type="text" ref="input" value={this.state.value} onChange={this.handle_change} required={this.props.required} />
			);
		},

		handle_change: function(e) {
			this.setState({value: e.target.value, selected: null});
		},

		handle_select: function(item) {
			this.setState({value: this.props.display(item), selected: item});
		},

		get_or_create: function(options) {
			var that = this;
			if(this.state.selected) {
				options.callback(this.state.selected, false);
			}else if(this.state.value) {
				var attributes = options.attributes(this.state.value);
				if(!attributes) return;

				var normalizer = function(val) {
					return (typeof val === "string") ? val.toUpperCase() : val;
				};

				if(!options.search) {
					options.search = _.keys(attributes);
				}
				var match = _.mapObject(_.pick(attributes, options.search), normalizer);

				// Callback party!! Woo!

				var callback = function(data) {
					var found = _.find(data, function(o) {
						return _.isMatch(_.mapObject(o, normalizer), match);
					});

					if(found) {
						options.callback(found);
					}else{
						var model = new options.model(attributes);
						model.save(null, {
							patch: true,
							wait: true,
							success: function(model) {
								options.callback(model.toJSON(), true);
							},
							error: function() {
								console.error("Error model.save");
							},
						});
					}
				};

				var query = _.values(match).join(" ");
				InstanceCache.search(this.props.for, {string: query, limit:1}, callback);
			}else{
				options.callback(null, false);
			}
		},

		clear: function() {
			var $input = $(React.findDOMNode(this.refs.input));
			$input.typeahead("val", "");
			this.setState(this.getInitialState());
		},
	});
});