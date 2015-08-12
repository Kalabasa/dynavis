"use strict";
define(function(require) {
	return {
		format: function(n) {
			var abs = Math.abs(n);
			var s, m, d;
			if(abs >= 100000000) {
				m = 1/1000000000;
				d = 2;
				s = "B";
			}else if(abs >= 100000) {
				m = 1/1000000;
				d = 1;
				s = "M";
			}else if(abs >= 1000) {
				m = 1/1000;
				d = 1;
				s = "K";
			}else if(abs >= 0.1) {
				m = 1;
				d = 2;
				s = "";
			}else if(abs >= 0.01) {
				return n.toFixed(2);
			}else if(abs > 0){
				return n.toExponential(1);
			}else{
				return "0";
			}

			if((abs*m) % 1 < 0.1) return Math.round(n*m) + s;
			else return (n*m).toFixed(d) + s;
		},
	};
});