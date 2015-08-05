"use strict";
define(function(require) {
	var React = require("react", "react.backbone"),
		InstanceCache = require("InstanceCache"),
		OfficialSingle = require("model/OfficialSingle"),
		Party = require("model/Party"),
		SliderTransitionGroupChild = require("jsx!view/SliderTransitionGroupChild"),
		TypeaheadInput = require("jsx!view/TypeaheadInput"),
		OfficialName = require("jsx!view/OfficialName"),
		Name = require("jsx!view/Name"),
		ClickToTopMixin = require("mixin/ClickToTopMixin"),
		Va = require("validator"),
		ValidationMixin = require("mixin/ValidationMixin"),
		ValidationMessages = require("jsx!view/ValidationMessages"),
		ReactTransitionGroup = React.addons.TransitionGroup;

	return React.createBackboneClass({
		mixins: [React.addons.LinkedStateMixin, ValidationMixin, ClickToTopMixin],
		
		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				position: this.model().get("position"),
				year: this.model().get("year"),
				year_end: this.model().get("year_end"),
				votes: this.model().get("votes"),
			};
		},

		componentWillMount: function() {
			this.official_name_regex = /^\s*(.+?)\s*,\s*(.+?)\s*(?:"(.+?)")?\s*$/;
		},

		getValidationSchema: function() {
			return {
				official_name: Va.lidator()
					.optional_if(function(name, others) { return others.official !== null; })
					.required().string().custom(function(name) {
						var tokens = name.match(this.official_name_regex);
						return tokens && tokens.length > 2;
					}.bind(this), "format invalid"),
				official: Va.lidator()
					.optional_if(function(official, others) { return others.official_name; })
					.required().object(),
				area: Va.lidator().required().object(),
				party: Va.lidator().object(),
				position: Va.lidator().string(),
				year: Va.lidator().required().integerish().lessThan({key: "year_end"}),
				year_end: Va.lidator().required().integerish(),
				votes: Va.lidator().integerish(),
			};
		},
		getObjectToValidate: function() {
			return {
				official_name: this.refs.official.state.value,
				official: this.refs.official.state.selected,
				area: this.refs.area.state.selected,
				party: this.refs.party.state.selected,
				position: this.state.position,
				year: this.state.year,
				year_end: this.state.year_end,
				votes: this.state.votes,
			};
		},
		getValidationElementMap: function() {
			return {
				official_name: React.findDOMNode(this.refs.official),
				official: React.findDOMNode(this.refs.official),
				area: React.findDOMNode(this.refs.area),
				party: React.findDOMNode(this.refs.party),
				position: React.findDOMNode(this.refs.position),
				year: React.findDOMNode(this.refs.year),
				year_end: React.findDOMNode(this.refs.year_end),
				votes: React.findDOMNode(this.refs.votes),
			};
		},
		validationCallback: function(key, valid, message) {
			// React.findDOMNode(this.refs.save).disabled = !valid;
		},

		render: function() {
			var display = function(item) {
				return item.name;
			};
			var display_official = function(item) {
				return item.surname + ", " + item.name;
			};

			var official_id = this.model().get("official_id");
			var area_code = this.model().get("area_code");
			var party_id = this.model().get("party_id");

			var official = official_id ? InstanceCache.get("Official", official_id, true) : null;
			var area = area_code ? InstanceCache.get("Area", area_code, true) : null;
			var party = party_id ? InstanceCache.get("Party", party_id, true) : null;

			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button className="pull-right button mar" type="reset" onClick={this.handle_cancel}>Cancel</button>;
				}
				return (
					<div className="edit data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="edit">
						<ValidationMessages validation={this.state.validation} />
						<div className="pure-g">
							<label className="pure-u-1-2 pad">
								<div className="label">Official</div>
								<TypeaheadInput className="pure-u-1"
									for="Official"
									ref="official"
									display={display_official}
									model={official}
									required />
							</label>
							<label className="pure-u-1-2 pad">
								<div className="label">Position</div>
								<input ref="position" className="pure-u-1" type="text" valueLink={this.linkState("position")} />
							</label>
						</div>
						<div className="pure-g">
							<label className="pure-u-1-2 pad">
								<div className="label">Area</div>
								<TypeaheadInput className="pure-u-1"
									for="Area"
									ref="area"
									display={display}
									model={area}
									required />
							</label>
							<label className="pure-u-1-4 pad">
								<div className="label">Year</div>
								<input ref="year" className="pure-u-1" type="number" valueLink={this.linkState("year")} required />
							</label>
							<label className="pure-u-1-4 pad">
								<div className="label">Year end</div>
								<input ref="year_end" className="pure-u-1" type="number" valueLink={this.linkState("year_end")} required />
							</label>
						</div>
						<div className="pure-g">
							<label className="pure-u-1-2 pad">
								<div className="label">Votes</div>
								<input ref="votes" className="pure-u-1" type="number" valueLink={this.linkState("votes")} />
							</label>
							<label className="pure-u-1-2 pad">
								<div className="label">Party</div>
								<TypeaheadInput className="pure-u-1"
									for="Party"
									ref="party"
									display={display}
									model={party} />
							</label>
						</div>
						<div className="pure-g">
							<div className="pure-u-1">
								<button className="pull-right button button-primary mar" type="submit" onClick={this.handle_save}>Save</button>
								{cancel_button}
								<button className="pull-left button button-complement mar" type="button" onClick={this.handle_delete}>Delete</button>
							</div>
						</div>
					</SliderTransitionGroupChild></ReactTransitionGroup>
					</div>
				);
			}else{
				var votes = this.model().get("votes");
				return (
					<div className="data-row form">
					<ReactTransitionGroup><SliderTransitionGroupChild key="display">
						<div className="pure-g">
							<div className="pure-u-5-6">
								<div className="pure-g field-group">
									<OfficialName className="pure-u-1 field text-large" model={official} />
								</div>
								<div className="pure-g">
									<div className="pure-u-1-2">
										<div className="field-group">
											<span className="pure-u-1-3 label">Position</span>
											<span className="pure-u-2-3 field">{this.model().get("position")}</span>
										</div>
										<div className="field-group">
											<span className="pure-u-1-3 label">Area</span>
											<Name className="pure-u-2-3 field" model={area} />
										</div>
										<div className="field-group">
											<span className="pure-u-1-3 label">Duration</span>
											<span className="pure-u-2-3 field">{this.model().get("year")} - {this.model().get("year_end")}</span>
										</div>
									</div>
									<div className="pure-u-1-2">
										<div className="field-group">
											<span className="pure-u-1-3 label">Votes</span>
											<span className="pure-u-2-3 field">{votes !== null ? votes : ""}</span>
										</div>
										<div className="field-group">
											<span className="pure-u-1-3 label">Party</span>
											<Name className="pure-u-2-3 field" model={party} />
										</div>
									</div>
								</div>
							</div>
							<div className="pure-u-1-6">
								<button className="pull-right button button-flat" onClick={this.handle_edit}>Edit</button>
							</div>
						</div>
					</SliderTransitionGroupChild></ReactTransitionGroup>
					</div>
				);
			}
		},

		handle_edit: function() {
			this.setState({edit: true});
		},

		handle_cancel: function() {
			this.resetValidation();
			this.setState({edit: false});
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},

		handle_save: function(e) {
			e.preventDefault();
			var that = this;

			if(!that.validate()) return;

			var dummy = {};
			var party = dummy;
			var official = dummy;
			var created_party = false;
			var created_official = false;

			// Callback hell!!

			var callback = function() {
				if(official !== dummy && party !== dummy) {
					var area = that.refs.area.state.selected;
					var position = that.state.position || null;
					var year = parseInt(that.state.year);
					var year_end = parseInt(that.state.year_end);
					var votes = parseInt(that.state.votes);
					that.save(official, year, year_end, position, votes, area, party, created_party, created_official);
				}
			};

			this.refs.party.get_or_create({
				model: Party,
				attributes: function(str) {
					return {name: that.refs.party.state.value};
				},
				callback: function(item, created) {
					party = item;
					created_party = created;
					callback();
				},
			});

			this.refs.official.get_or_create({
				model: OfficialSingle,
				attributes: function(str) {
					var tokens = that.refs.official.state.value.match(that.official_name_regex);
					return {
						surname: tokens[1],
						name: tokens[2],
						nickname: tokens.length > 3 ? tokens[3] : null,
					};
				},
				search: ["surname", "name"],
				callback: function(item, created) {
					official = item;
					created_official = created;
					callback();
				},
			});
		},

		save: function(official, year, year_end, position, votes, area, party, created_party, created_official) {
			var that = this;

			var new_attributes = {
				official_id: official.id,
				year: year,
				year_end: year_end,
				position: position,
				votes: votes,
				area_code: area.code,
				party_id: party ? party.id : null,
			};

			var patch = this.model().isNew()
				? new_attributes
				: _.omit(new_attributes, function(value, key, object) {
					return that.model().get(key) === value;
				});
			
			if(_.isEmpty(patch)) {
				this.setState({edit: false});
			}else{
				this.model().save(patch, {
					patch: !this.model().isNew(),
					wait: true,
					success: function() {
						that.setState({edit: false});
					},
					error: function() {
						if(created_party) party.destroy();
						if(created_official) official.destroy();
					},
				});
			}
		},
	});
});