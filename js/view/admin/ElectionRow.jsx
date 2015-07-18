"use strict";
define(["react", "InstanceCache", "model/OfficialSingle", "model/Party", "jsx!view/TypeaheadInput", "jsx!view/OfficialName", "jsx!view/Name", "mixin/ClickToTopMixin", "react.backbone"], function(React, InstanceCache, OfficialSingle, Party, TypeaheadInput, OfficialName, Name, ClickToTopMixin) {
	return React.createBackboneClass({
 		mixins: [React.addons.LinkedStateMixin, ClickToTopMixin],
 		
		getInitialState: function() {
			return {
				edit: this.model().isNew(),
				position: this.model().get("position"),
				year: this.model().get("year"),
				year_end: this.model().get("year_end"),
				votes: this.model().get("votes"),
			};
		},

		render: function() {
			var display = function(item) {
				return item.name;
			};
			var display_official = function(item) {
				return item.surname + ", " + item.name;
			};

			var official_id = parseInt(this.model().get("official_id"));
			var area_code = parseInt(this.model().get("area_code"));
			var party_id = parseInt(this.model().get("party_id"));

			var official = InstanceCache.get("Official", official_id);
			var area = InstanceCache.get("Area", area_code);
			var party = isNaN(party_id) ? null : InstanceCache.get("Party", party_id);

			if(official) official.fetch();
			if(area) area.fetch();
			if(party) party.fetch();

			if(this.model().isNew() || this.state.edit) {
				if(!this.model().isNew()){
					var cancel_button = <button className="pull-right button" onClick={this.handle_cancel}>Cancel</button>;
				}
				return (
					<div className="edit data-row form">
						<div className="pure-g">
							<div className="pure-u-1-2">
								<div className="form-label">Official</div>
								<TypeaheadInput className="pure-u-1"
									for="Official"
									ref="official"
									display={display_official}
									model={official}
									required />
							</div>
							<div className="pure-u-1-2">
								<div className="form-label">Position</div>
								<input className="pure-u-1" type="text" valueLink={this.linkState("position")} />
							</div>
						</div>
						<div className="pure-g">
							<div className="pure-u-1-2">
								<div className="form-label">Area</div>
								<TypeaheadInput className="pure-u-1"
									for="Area"
									ref="area"
									display={display}
									model={area}
									required />
							</div>
							<div className="pure-u-1-4">
								<div className="form-label">Year</div>
								<input className="pure-u-1" type="number" valueLink={this.linkState("year")} required />
							</div>
							<div className="pure-u-1-4">
								<div className="form-label">Year end</div>
								<input className="pure-u-1" type="number" valueLink={this.linkState("year_end")} required />
							</div>
						</div>
						<div className="pure-g">
							<div className="pure-u-1-2">
								<div className="form-label">Votes</div>
								<input className="pure-u-1" type="number" valueLink={this.linkState("votes")} />
							</div>
							<div className="pure-u-1-2">
								<div className="form-label">Party</div>
								<TypeaheadInput className="pure-u-1"
									for="Party"
									ref="party"
									display={display}
									model={party} />
							</div>
						</div>
						<div className="pure-g">
							<div className="pure-u-1">
								<button className="pull-left button" onClick={this.handle_delete}>Delete</button>
								<button className="pull-right button pure-button-primary" onClick={this.handle_save}>Save</button>
								{cancel_button}
							</div>
						</div>
					</div>
				);
			}else{
				return (
					<div className="data-row container-fluid">
						<div className="pure-g">
							<div className="pure-u-5-6">
								<div className="pure-g">
									<OfficialName className="field pure-u-1 text-large" model={official} />
								</div>
								<div className="pure-g">
									<div className="pure-u-1-2">
										<div className="field">{this.model().get("position")}</div>
										<Name className="field" model={area} />
									</div>
									<div className="pure-u-1-2">
										<div className="field">{this.model().get("votes")} votes</div>
										<Name className="field" model={party} />
									</div>
								</div>
								<div className="pure-g">
									<div className="field pure-u-1">{this.model().get("year")} - {this.model().get("year_end")}</div>
								</div>
							</div>
							<div className="pure-u-1-6">
								<button className="pull-right button" onClick={this.handle_edit}>Edit</button>
							</div>
						</div>
					</div>
				);
			}
		},

		handle_edit: function() {
			this.setState({edit: true});
		},

		handle_cancel: function() {
			this.setState({edit: false});
		},

		handle_delete: function(e) {
			this.model().destroy({wait: true});
		},

		handle_save: function() {
			var that = this;

			var year = parseInt(this.state.year);
			var year_end = parseInt(this.state.year_end);
			if(isNaN(year) || isNaN(year_end)) {
				console.error("Invalid year format.")
				return;
			}
			if(year > year_end) {
				console.error("Invalid year range. " + year + "-" + year_end);
				return;
			}

			if(this.refs.area.state.selected == null) {
				console.error("No selected area.");
				return;
			}
			var area_code = this.refs.area.state.selected.code;

			var position = this.state.position || null;
			
			var votes = parseInt(this.state.votes);
			if(this.state.votes && isNaN(votes)) {
				console.error("Invalid votes format.");
				return;
			}

			var dummy = {};
			var party = dummy;
			var official = dummy;

			// Callback hell!!

			var callback = function() {
				if(official !== dummy && party !== dummy) {
					var party_id = party ? party.id : null;
					that.save(official.id, year, year_end, position, votes, area_code, party_id);
				}
			};

			this.refs.party.get_or_create({
				model: Party,
				attributes: function(str) {
					return {name: that.refs.party.state.value};
				},
				callback: function(item) {
					party = item;
					callback();
				},
			});

			this.refs.official.get_or_create({
				model: OfficialSingle,
				attributes: function(str) {
					var tokens = that.refs.official.state.value.match(/^\s*(.+?)\s*,\s*(.+?)\s*(?:"(.+?)")?\s*$/);
					if(!tokens || tokens.length <= 2) {
						console.error("Invalid official name format.");
						return null;
					}
					return {
						surname: tokens[1],
						name: tokens[2],
						nickname: tokens.length > 3 ? tokens[3] : null,
					};
				},
				search: ["surname", "name"],
				callback: function(item) {
					if(!item) {
						console.error("No official.");
						return;
					}
					official = item;
					callback();
				},
			});
		},

		save: function(official_id, year, year_end, position, votes, area_code, party_id) {
			var that = this;

			var new_attributes = {
				official_id: official_id,
				year: year,
				year_end: year_end,
				position: position,
				votes: votes,
				area_code: area_code,
				party_id: party_id,
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
				});
			}
		},
	});
});