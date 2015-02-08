/********************************************************************************************/
/*																							*/
/*											jData											*/
/*											 0.1											*/
/*																							*/
/********************************************************************************************/

var jData = (function(){
	
	/****************************************************************/
	/*								Format							*/
	/****************************************************************/
	
	var Format = {}
	
	Format.uppercase = function(str) {
		return str.toUpperCase();
	}
	
	Format.lowercase = function(str) {
		return str.toLowerCase();
	}
	
	
	

	/****************************************************************/
	/*								Core							*/
	/****************************************************************/
	
	var JData = function(template, data) {
		if (template) this.template = template;
		if (data) this.data = data;
	}
	
	JData.prototype.toString = function() {
		if (this.formatted) {
			return this.formatted.toString();
		} else {
			return "";
		}
	}
	
	
	
	
	/****************************************************************/
	/*								Apply							*/
	/****************************************************************/
	
	JData.apply = function(template, data) {
		var jd = new JData(template, data);
		
		jd.apply(template);
		
		return jd;
	}
	
	JData.prototype.apply = function(template) {
		this.formatted = template;
		var data = this.data;
		var regexp = template.match(/\{ ?[^\{\}]+ ?\}[.a-zA-Z()]*/g);
		for (var r in regexp) {
			this.formatted = this.formatted.replace(regexp[r], transform(regexp[r], this.data));
		}
	}
	
	/* {name.first}.uppercase(), {name: {first: John}} => JOHN */
	function transform(el, data) {
		var extracted = extract(el);
		var data = parseTemplateValue(extracted.value, data);
		if (data != null) {
			if (extracted.format) {
				data = applyFormat(extracted.format, data);
			}
		} else {
			data = "";
		}
		
		return data;
	}
	
	/* {name.first}, {name: {first: John}} => John */
	function parseTemplateValue(templateValue, data) {
		var valuePath = templateValue.split(".");
		for (var i=0; i<valuePath.length; i++) {
			data = data[valuePath[i]];
		}
		
		return data;
	}
	
	/* uppercase, John => JOHN */
	function applyFormat(format, data) {
		for (var i=0; i<format.length; i++) {
			for (var j=0, f=Format; j<format[i].length; j++) {
				f = f[format[i][j]];
			}
			if (f) data = f(data);
		}
		
		return data;
	}
	
	/* {name}.uppercase() => {value: name, format: uppercase} */
	function extract(data) {
		var parsed = data.match(/^\{ ?(?:row.)?([a-zA-Z0-9\._]+) ?\}([.a-zA-Z()]*)$/);
		var extracted = {};
		if (parsed) {
			if (parsed[2]) {
				return { value : parsed[1], format : extractFormat(parsed[2]) }
			} else {
				return { value : parsed[1], format : null }
			}
		} else {
			return { value : data, format : null }
		}
	}
	
	/* phone.post() => [phone, post] */
	function extractFormat(formatRaw) {
		var re = formatRaw.match(/[^()]*\(\)/g);
		var formatArray = [];
		for (var r in re) {
			formatArray.push(re[r].match(/[a-zA-Z]+/g));
		}
		return formatArray;
	}
	
	
	
	
	/****************************************************************/
	/*								Map								*/
	/****************************************************************/
	
	JData.map = function(template, data) {
		var jd = new JData(template, data);
		
		jd.map(template);
		
		return jd;
	}
	
	JData.prototype.map = function(template) {
		for (var t in template) {
			this.formatted = template;
			var data = this.data;
			var regexp = template[t].match(/\{ ?[^\{\}]+ ?\}[.a-zA-Z()]*/g);
			for (var r in regexp) {
				this.formatted[t] = this.formatted[t].replace(regexp[r], transform(regexp[r], this.data));
			}
		}
	}
	
	
	
	return JData;
})();