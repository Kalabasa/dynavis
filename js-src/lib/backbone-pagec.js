"use strict";
var Backbone = Backbone || {};
(function() {
	Backbone.PageableCollection = Backbone.Collection.extend({
		start: 0,
		per_page: 15,
		total: 0,

		initialize: function(models, options) {
			options = options || {};
			this.reset = true;
			this.per_page = options.per_page || this.per_page;
			this.total = options.total || this.total;
			this.params = options.params || {};
		},

		getPage: function() {
			return Math.ceil(this.start/this.per_page);
		},
		getTotalPages: function() {
			return Math.ceil(this.total/this.per_page);
		},

		resetParams: function() {
			this.params = {};
		},
		setParams: function(params) {
			this.params = params;
		},

		next: function(options) {
			if(this.start + this.per_page >= this.total) {
				this.start = this.per_page < this.total ? this.total - this.per_page : 0;
				console.error("Error next. No pages left.");
				return null;
			}else{
				this.start += this.per_page;
			}
			return this.fetch(options);
		},
		prev: function(options) {
			if(this.start <= 0) {
				this.start = 0;
				console.error("Error prev. No pages left.");
				return null;
			}else if(this.start <= this.per_page) {
				this.start = 0;
			}else{
				this.start -= this.per_page;
			}
			return this.fetch(options);
		},
		page: function(page, options) {
			if(page < 0 || page * this.per_page > this.total) {
				console.error("Error page. Out of bounds.");
				return null;
			}
			this.start = page * this.per_page;
			return this.fetch(options);
		},

		fetch: function(options) {
			var that = this;

			options = options || {};
			options.data = options.data || {}
			if(this.params) {
				_.each(this.params, function(v,k) {
					if(!(k in options.data)) options.data[k] = v;
				});
			}

			if(options.data.start === undefined) options.data.start = this.start;
			if(options.data.count === undefined) options.data.count = this.per_page;

			var success = options.success;
			options.success = function(c,r,o) {
				that.total = r.total;
				if(success) success(c,r,o);
			};

			return Backbone.Collection.prototype.fetch.call(this, options);
		},
	});
})();