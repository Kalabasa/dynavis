"use strict";
define(["react", "jsx!view/FileInput", "jsx!view/SearchControls", "jsx!view/PageControls", "jsx!view/PanelToolbar", "jsx!view/admin/AreaRow", "mixin/ScrollToTopMixin", "react.backbone"], function(React, FileInput, SearchControls, PageControls, PanelToolbar, AreaRow, ScrollToTopMixin) {
	var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
	return React.createBackboneClass({
		mixins: [React.addons.LinkedStateMixin, ScrollToTopMixin],

		getInitialState: function() {
			return {
				upload_level: "region",
			};
		},

		render: function() {
			return (
				<div className="body-panel">
					<PanelToolbar ref="toolbar" toggle_text="Add Data">
						<div className="pure-u-1-4 text-center pad">
							<h6>Add single row</h6>
							<button className="button" onClick={this.handle_add}>Add Row</button>
						</div>
						<div className="pure-u-3-8 text-center pad">
							<form onSubmit={this.handle_upload_psgc}>
								<h6>Upload PSGC table</h6>
								<div className="label">CSV file</div>
								<div><FileInput ref="file_psgc" type="file" /></div>
								<input className="button button-primary" type="submit" value="Upload File" />
							</form>
						</div>
						<div className="pure-u-3-8 text-center pad">
							<form onSubmit={this.handle_upload_geojson}>
								<h6>Update geometry</h6>
								<div className="label">GeoJSON</div>
								<div><FileInput ref="file_geojson" type="file" /></div>
								<select className="pure-u-1 input" valueLink={this.linkState("upload_level")} required>
									<option value="region">Regions</option>
									<option value="province">Provinces</option>
									<option value="municipality">Cities/Municipalities</option>
									<option value="barangay">Barangays</option>
								</select>
								<input className="button button-primary" type="submit" value="Update" />
							</form>
						</div>
					</PanelToolbar>
					<SearchControls className="mar" ref="searcher" collection={this.collection()} />
					<ReactCSSTransitionGroup transitionName="slider">
						{this.collection().map(function(area) {
							return <AreaRow key={area.cid} model={area} />;
						})}
					</ReactCSSTransitionGroup>
					<PageControls className="text-center mar" collection={this.collection()} onNext={this.scroll_to_top} onPrev={this.scroll_to_top} />
				</div>
			);
		},

		handle_add: function() {
			var that = this;
			if(this.refs.searcher.state.query === null && this.collection().getPage() === 0) {
				this.refs.toolbar.close();
				that.collection().add({}, {at: 0});
			}else{
				this.refs.searcher.set_query(null, {
					complete: function() {
						that.refs.toolbar.close();
						that.collection().add({}, {at: 0});
					},
				});
			}
		},

		handle_upload_psgc: function(e) {
			var that = this;
			e.preventDefault();

			var fd = new FormData();
			var file = this.refs.file_psgc.getDOMNode().files[0];
			fd.append("file", file);

			$.ajax({
				url: this.collection().url,
				data: fd,
				processData: false,
				contentType: false,
				type: "POST",
				success: function(data){
					that.refs.toolbar.close();
					that.collection().fetch();
				},
			});
		},
	});
});