///////////////////////////////////////////////////////////////////////
//                StyleSheet Convenience Class

var styles = {
	sheet: undefined,	
	rules: {} ,
	getStyleSheet: function (unique_title) { 
		var i;
	  for(i=0; i<document.styleSheets.length; i++) {
	    if(document.styleSheets[i].title == unique_title) {
	      this.sheet = document.styleSheets[i]; }}
		if ( this.sheet != undefined ) {
			this.refreshRules(); }
		return this;
	},
	refreshRules: function ()
	{
		 var x,cr = this.sheet.cssRules;
		 for ( x in cr ){
			 this.rules[cr[x].selectorText]=x;}
		 this.rules.length = cr.length;
	},
	getRule: function (selector)
	{
		var ret = [] ;
		if ( this.rules.length != this.sheet.cssRules.length ) {
			this.refreshRules(); }
		if ( this.rules[selector] != undefined ) {
			ret.push(this.sheet.cssRules[this.rules[selector]]); }
		/*/for ( var x in cr )
		{
			if ( cr[x].selectorText != selector && cr[x].selectorText.match( selector ) )
				console.log( cr[x].selectorText );
			if ( cr[x].selectorText != undefined && cr[x].selectorText == selector )
				ret.push(cr[x]);
		} // */
		return ret;
	},
	setRule: function (selector,style)
	{
		var x,cr = this.sheet.cssRules;
		for ( x in cr )
		{
			if ( cr[x].selectorText == selector )
			{
				this.sheet.deleteRule(x);
				this.sheet.insertRule(selector+'{'+style+'}',x);
			}
		}
		return this;
	},
	addRule: function (selector, style )
	{
		if ( this.rules[selector] != undefined ) 
			return ; 
		this.sheet.insertRule(selector+'{'+style+'}',this.sheet.cssRules.length);
		this.rules[selector]=this.sheet.cssRules.length;
	},
	updateRule: function ( selector, prop_erties )
	{
		var props,x,r,i,rs = this.getRule( selector );
		if ( rs.length === 0 )
		{
			this.addRule ( selector, '' );
			rs = this.getRule ( selector );
			if ( rs.length < 1 ) 
				return; 
		}
		props = prop_erties;
		if ( typeof props !== "object" )
		{
			props = new Object() ;
			r = prop_erties.split(';');
			for ( x in r )
			{
				var parts = r[x].split(':',2);
				props[parts[0]] = parts[1];
			}
		}
		for ( i in rs )
		{
			if ( rs[i] === undefined ) 
				continue; 
			for ( x in props )
			{
				if ( props[x] === null || props[x].length == 0 ) {
					rs[i].style.removeProperty(x); }
				else {
					rs[i].style.setProperty( x, String(props[x]), null ); }
			}
		}
	}
};

function randomColor ()
{
	var s = '#';
	for ( var i=0; i<6; i++)
		s = s + Number( Math.round( Math.random() * 15 ) ).toString(16);
	return s;
}

function RGBtoHex ( c )
{
	var pad = function (n) { return n<16 ? '0'+Number(n).toString(16) : Number(n).toString(16) };
	var numbers = String(c).match(/([0-9]+),\s*([0-9]+),\s*([0-9]+)/);
	return '#' + pad ( numbers[1] ) + pad ( numbers[2] ) + pad ( numbers[3] ) ;
}


