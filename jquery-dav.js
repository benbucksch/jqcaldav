// Copyright (c) 2011, Rob Ostensen ( rob@boxacle.net )
// See README or http://boxacle.net/jqcaldav/ for license
jQuery.extend ({
    options : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'OPTIONS'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'OPTIONS',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			},
    head : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'OPTIONS'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'HEAD',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			},
	  propfind : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'PROPFIND'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
									 contentType: s.contentType,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'PROPFIND',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
		 },
		proppatch : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'PROPPATCH'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
									 contentType: s.contentType,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'PROPPATCH',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
		 },
		acl : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'ACL'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
									 contentType: s.contentType,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'ACL',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
		 },

    report : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'REPORT'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
					         cache: s.cache,
									 contentType: s.contentType,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'REPORT',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			},
    mkcalendar : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{contentType:'text/xml',type:'MKCALENDAR'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
									 contentType: s.contentType,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'MKCALENDAR',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			},
		move : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,origSettings,{type:'MOVE'});
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])}, 
									 contentType: s.contentType,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'MOVE',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			},
		del : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,origSettings,{type:'DELETE'});
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])}, 
									 contentType: s.contentType,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'DELETE',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			},
		put : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'PUT'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
									 contentType: s.contentType,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'PUT',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			},
		lock : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'LOCK'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
									 contentType: s.contentType,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'LOCK',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			},
		unlock : function( origSettings ) { 
		var s = jQuery.extend(true, {}, jQuery.ajaxSettings,{type:'UNLOCK'},origSettings);
				return jQuery.ajax ( { beforeSend: function (r){var h = s.headers;for (var i in h)r.setRequestHeader(i,h[i])},
									 cache: s.cache,
									 contentType: s.contentType,
                   data: s.data,
									 password: encodeURIComponent(s.password),
									 username: encodeURIComponent(s.username),
									 type: 'UNLOCK',
                   url: s.url,
									 success: s.success,
									 complete: s.complete,
									 }
						);
			}
});

(function( $ ){
	var methods = {
    init : function( options ) { this.options = options; $.fn.caldav.options = options; if ( ! $.fn.caldav.events ) { $.fn.caldav.entries = new Object; } 
			$.fn.caldav.eventTiming = new Array();
			$.fn.caldav.eventAverageTime = 100;
			$.fn.caldav.coalesceEvents = new Array ();
			$.fn.caldav.principals = new Array ;
			$.fn.caldav.principalMap = new Object ;
			$.fn.caldav.calendarData = new Array ;
			$.fn.caldav.locks = {};
			$.fn.caldav.xmlNSfield = 'localName';
			if ( document.documentElement.baseName ) // ie just has to be different
					$.fn.caldav.xmlNSfield = 'baseName';
			if ( $( this.options.loading ).length < 1 )
			{
				var loading = $('<div id="caldavloading" style="display:none;position:fixed;left:100%;top:100%;margin-top:-1em;margin-left:-4em;text-align: center; width:4em; background-color:blue;color:white;-moz-border-top-left-radius:.5em;-webkit-border-top-left-radius:.5em;border-top-left-radius:.5em;opacity:.5;z-index:100;" data-loading="0" >loading</div>');
				$(document.body).append(loading);
				this.options.loading = $('#caldavloading');
			}
			$(this.options.loading).data('loading',0);
			return this; },

    getCalendars : function( ) { 
			$.fn.caldav('findMyPrincipal', function () {
				$.fn.caldav('findDelagatedPrincipals', function () {
					$.fn.caldav.starting = $.fn.caldav.principals.length;
					for ( var i = 0; i < $.fn.caldav.principals.length; i ++ )
					{
						if ( String($.fn.caldav.principals[i].calendar).length < 3 )
						{
							$.fn.caldav.starting--;
							if ( $.fn.caldav.starting == 0 )
								if ( $.fn.caldav.options.calendars )
									$.fn.caldav.options.calendars($.fn.caldav.calendarData);
							continue;
						}
						$.fn.caldav('getCalendarData',{url:$.fn.caldav.principals[i].calendar}, function () {
							$.fn.caldav.starting--;
							if ( $.fn.caldav.starting == 0 )
								if ( $.fn.caldav.options.calendars )
									$.fn.caldav.options.calendars($.fn.caldav.calendarData);
						});
					}
				});
			});
		},

    getCalendarData : function( params, callback ) { 
			$.fn.caldav('spinner',true);
	    $.propfind ($.extend(true,{},jQuery.fn.caldav.options,params,{headers:{Depth:1},data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
			'<x0:propfind xmlns:x1="http://calendarserver.org/ns/" xmlns:x0="DAV:" xmlns:x3="http://apple.com/ns/ical/" xmlns:x2="urn:ietf:params:xml:ns:caldav" xmlns:x4="http://boxacle.net/ns/calendar/">' + "\n" +
			'<x0:prop>' + "\n" +
			'<x0:displayname/>' + "\n" +
			'<x0:principal-URL/>' + "\n" +
			'<x1:getctag/>' + "\n" +
			'<x2:calendar-description/>' + "\n" +
			'<x2:calendar-home-set/>' + "\n" +
			'<x2:calendar-user-address-set/>' + "\n" +
			'<x2:calendar-inbox-URL/>' + "\n" +
			'<x2:calendar-outbox-URL/>' + "\n" +
			'<x3:calendar-color/>' + "\n" +
			'<x3:calendar-order/>' + "\n" +
			'<x4:calendar-settings/>' + "\n" +
			'<x4:calendar-subscriptions/>' + "\n" +
			'<x0:resourcetype/>' + "\n" +
			'<x0:acl/>' + "\n" +
			'<x0:owner/>' + "\n" +
			'<x0:supported-privilege-set/>' + "\n" +
			'<x0:current-user-privilege-set/>' + "\n" +
			'<x0:principal-collection-set/>' + "\n" +
			'</x0:prop>' + "\n" +
			'</x0:propfind>' 
			,complete: function (r,s){
				$.fn.caldav('spinner',false);
			 	if (s=='success')
				{
					$(this).caldav('parseCalendars',r);
					if ( typeof(callback) == 'function' )
				    callback(r,s);
				}
				return false;
			}
		})); return this; },


		parseCalendars : function (r, callback ) { 
			var rcalendars = $("response resourcetype > ["+$.fn.caldav.xmlNSfield+"=calendar]",r.responseXML).closest('response'); 
			var baseurl = jQuery.fn.caldav.options.url.replace(/(\/\/[.a-zA-Z0-9-])\/.*$/, '$1');
			var s =0;
			if ( $.fn.caldav.calendarData && $.fn.caldav.calendarData.length > 0 )
				s = $.fn.caldav.calendarData.length;
			for (var i=0;i<rcalendars.length;i++)
			{
				var cuprincipal = $("owner > href",rcalendars[i]).text();
				$.fn.caldav.calendarData[s+i] = { xml: $(rcalendars[i]).clone(true),
				displayName: $("displayname",rcalendars[i]).text(),
				href: $("> href",rcalendars[i]).text(),
		 		url: ($("> href",rcalendars[i]).text().match(/^\//) ?
		 				baseurl.replace(/^(https?:\/\/[^\/]+).*$/,'$1') + $("> href",rcalendars[i]).text() : 	baseurl + $("> href",rcalendars[i]).text()),
				mailto: $("href:contains('mailto:')",rcalendars[i]).text().replace(/^mailto:/i,''),
				desc: $(rcalendars[i]).find("["+$.fn.caldav.xmlNSfield+"=calendar-description]").text(),
				ctag: $("*["+$.fn.caldav.xmlNSfield+"=getctag]",rcalendars[i]).text(),
				principal: cuprincipal, 
				color: $(rcalendars[i]).find("["+$.fn.caldav.xmlNSfield+"=calendar-color]").text().replace (/(#......)../,'$1'),
				order: $(rcalendars[i]).find("["+$.fn.caldav.xmlNSfield+"=calendar-order]").text(),};
				if ( $.fn.caldav.principalMap[cuprincipal] != undefined )
					$.fn.caldav.calendarData[s+i].principalName= $.fn.caldav.principalMap[cuprincipal].name;
			}
			//$.fn.caldav.calendarXML = $.extend(true,$.fn.caldav.calendarXml,$("response",r.responseXML));
			if ( $.fn.caldav.calendarXml == undefined )
				$.fn.caldav.calendarXml = $(r.responseXML);
			else
				$($.fn.caldav.calendarXml).append($("response",r.responseXML));
			return this;
		},
  
		findMyPrincipal: function (callback){
			$.fn.caldav('spinner',true);
				// DCS report on '<D:principal-match xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav"><D:self/><D:prop><D:displayname/><C:calendar-home-set/><C:calendar-user-address-set/></D:prop></D:principal-match>',
	//		$.propfind ($.extend(true,{},$.fn.caldav.options,{url:'/davical/htdocs/caldav.php/',headers:{Depth:1},data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
//'<propfind xmlns="DAV"><prop><principal-collection-set/><current-user-principal/></prop></propfind>',
			$.propfind ($.extend(true,{},$.fn.caldav.options,{headers:{Depth:0},data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
				'<propfind xmlns="DAV"><prop><principal-collection-set/><current-user-principal/></prop></propfind>',
				complete: function (r,s)
				{
					$.fn.caldav('spinner',false);
					if (s=='success')
				  {
						if ( r.responseXML.firstChild.baseName )
							$.fn.caldav.xmlNSfield = 'baseName';
	          if ( jQuery.fn.caldav.data == undefined )
		          jQuery.fn.caldav.data = {};
						$.fn.caldav.data.principalCollection = $.trim($('response > href:eq(0)',r.responseXML).text());
						$.fn.caldav.data.myPrincipal = $.trim($('response > href:eq(1)',r.responseXML).text());
						if ( ! $.fn.caldav.data.myPrincipal.match(/\//) ) 
						{
							$.fn.caldav('spinner',true);
							$.propfind ($.extend(true,{},$.fn.caldav.options,{url:$.fn.caldav.data.principalCollection,headers:{Depth:1},data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
								'<propfind xmlns="DAV"><prop><current-user-principal/></prop></propfind>',
								complete: function (r,s)
								{
									$.fn.caldav('spinner',false);
									var results = $('response',r.responseXML);
									for ( var i = 0; i < results.length; i++ )
										if ( $('href',results[i]).text() != $.fn.caldav.data.principalCollection )
											break;
									if ( i == results.length )
										return ;
									$.fn.caldav.data.myPrincipal = $.trim($('href',results[i]).text());
									if ( $.fn.caldav.data.myPrincipal.match(/\//) ) 
										$.fn.caldav('getMyPrincipalData',callback);
								}
							}));
						}
						else
							$.fn.caldav('getMyPrincipalData',callback);
					}
				}
			}));
		},

		getMyPrincipalData: function (callback){
			$.fn.caldav('spinner',true);
			$.propfind ($.extend(true,{},$.fn.caldav.options,{url:$.fn.caldav.data.myPrincipal,headers:{Depth:0},data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
				'<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav"><D:prop><D:displayname/><C:calendar-home-set/><C:calendar-user-address-set/></D:prop></D:propfind>',
				complete: function (r,s)
				{
					$.fn.caldav('spinner',false);
					jQuery.fn.caldav.data.principalDisplayName = $.trim($("["+$.fn.caldav.xmlNSfield+"=displayname]",r.responseXML).text());
					jQuery.fn.caldav.data.principalHome        = $.trim($("["+$.fn.caldav.xmlNSfield+"=calendar-home-set]:first",r.responseXML).text());
					$.fn.caldav.principals.push({
						href:$('response > href',r.responseXML).text(),
						calendar:$.trim($("["+$.fn.caldav.xmlNSfield+"=calendar-home-set]:first",r.responseXML).text()),
						name:$.trim($("["+$.fn.caldav.xmlNSfield+"=displayname]",r.responseXML).text()),
						email:$.trim($("href:contains('mailto:')",r.responseXML).text()).replace(/^mailto:/i,'')
					});
					$.fn.caldav.principalMap[$.trim($('response > href',r.responseXML).text())] = $.fn.caldav.principals[$.fn.caldav.principals.length-1];
					if ( typeof(callback) == 'function' )
						callback(r,s);
				}
			}));
		 },

		findDelagatedPrincipals: function (callback){
			$.fn.caldav('spinner',true);
			$.report ($.extend(true,{},$.fn.caldav.options,{url:$.fn.caldav.data.principalHome,data:'<?xml version="1.0" encoding="utf-8" ?>\n' +
'<expand-property xmlns="DAV:">' +
' <property name="calendar-proxy-write-for" xmlns="http://calendarserver.org/ns/"><property name="displayname"/><property name="principal-URL"/><property name="calendar-user-address-set" xmlns="urn:ietf:params:xml:ns:caldav"/></property>' +
' <property name="calendar-proxy-read-for" xmlns="http://calendarserver.org/ns/"><property name="displayname"/><property name="principal-URL"/><property name="calendar-user-address-set" xmlns="urn:ietf:params:xml:ns:caldav"/></property>' +
'</expand-property>',
				complete: function (r,s)
				{
					$.fn.caldav('spinner',false);
					if (s=='success')
				  {
						var results = $('response',r.responseXML);
						for ( var i = 0; i < results.length; i++ )
						{
							if ($.fn.caldav.principalMap[$.trim($('> href',results[i]).text())] != undefined )
								continue;
							$.fn.caldav.principals.push({
								href:$(results[i]).children('href:eq(0)').text(),
								calendar:$.trim($("["+$.fn.caldav.xmlNSfield+"=calendar-home-set]:first",r.responseXML).text()),
								name:$.trim($("["+$.fn.caldav.xmlNSfield+"=displayname]",results[i]).text()),
								email:$.trim($("href:contains('mailto:')",results[i]).text()).replace(/^mailto:/i,'')
							});
							$.fn.caldav.principalMap[$.trim($('> href',results[i]).text())] = $.fn.caldav.principals[$.fn.caldav.principals.length-1];
						}
						if ( typeof(callback) == 'function' )
							callback(r,s);
					}
				}
			}));
		},

		calendars : function( ) {  
			return $.fn.caldav.calendarData;
		},	

		principals : function( ) {  
			return $.fn.caldav.principals;
		},	
		
		searchPrincipals: function ( params, property ,name, callback ) { 
			$.fn.caldav('spinner',true);
			$.report ($.extend(true,{},$.fn.caldav.options,params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
				'<x1:principal-property-search xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:">'+
				'  <x1:property-search>'+
				'    <x1:prop>'+
				'  	  <x1:'+ property +'/>'+
				'    </x1:prop>'+
				'    <x1:match>'+ name +'</x1:match>'+
				'  </x1:property-search>'+
				'  <x1:prop>'+
				'    <x1:displayname/>'+
				'  </x1:prop>'+
				'</x1:principal-property-search>'
				,complete: function (r,s){ 
					$.fn.caldav('spinner',false);
							 	if (s=='success')
								{
									$(this).caldav('gotPrincipals',r,callback);
								} 
							}
			}));
			return this;
		},

		gotPrincipals: function (r, callback ) { 
			var entries = $('multistatus',r.responseXML).clone(true);
			if ( entries.length > 0 && typeof(callback) == 'function' )
				callback(entries);
			return this;
		},

		// properties should be an object with the properties names as the name with the namespace as the value
		// eg properties = { 'displayname': 'DAV:' }
		getProperties: function ( params, properties, callback ) { 
			$.fn.caldav('spinner',true);
			var namespaces = {'DAV:':'x0'};
			var count = 1, props = '',ns='xmlns:x0="DAV:" ';
			for ( var i in properties )
			{
				if ( namespaces[properties[i]] == undefined ) 
				{
					namespaces[properties[i]] = 'x' + count;
					ns = ns + 'xmlns:x' + count + '="' + properties[i] + '" ';
					count++;
				}
				props = props + '<' + namespaces[properties[i]] + ':' + i + '/>';
			}
			if ( params.headers == undefined )
				params.headers={Depth:0};
			$.propfind ($.extend(true,{},$.fn.caldav.options,params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
				'<x0:propfind '+ns+'>'+
				'  <x0:prop>'+
				props +
				'  </x0:prop>'+
				'</x0:propfind>'
				,complete: function (r,s){ 
						$.fn.caldav('spinner',false);
							 	if (s=='success')
									$(this).caldav('gotProperties',r,callback);
							}
			}));
			return this;
		},

		gotProperties: function (r, callback ) { 
			var entries = $('multistatus',r.responseXML).clone(true);
			if ( entries.length > 0 && typeof(callback) == 'function' )
				callback(entries);
			return this;
		},

		getEvents: function ( params, start, end, cal ) { 
			if ( $.fn.caldav.coalesceEvents[cal] == undefined  )
				$.fn.caldav.coalesceEvents[cal] = {params:params,start:start,end:end};
			else
			{
				if ( $.fn.caldav.coalesceEvents[cal].start > start )
					$.fn.caldav.coalesceEvents[cal].start = start;
				if ( $.fn.caldav.coalesceEvents[cal].end < end )
					$.fn.caldav.coalesceEvents[cal].end = end;
			}
			if ( ! $.fn.caldav.coalesceEvents[cal].timeout )
			{
				var delayedCall =  function (cal){ 
					$.fn.caldav('getCoalescedEvents',
						$.fn.caldav.coalesceEvents[cal].params,
						$.fn.caldav.coalesceEvents[cal].start,
						$.fn.caldav.coalesceEvents[cal].end,
						cal); delete $.fn.caldav.coalesceEvents[cal]; };//.cal = cal;
				//var boundCall = delayedCall.bind(this); 
				$.fn.caldav.coalesceEvents[cal].timeout = window.setTimeout (function (){delayedCall(cal)},$.fn.caldav.eventAverageTime);
			}
			return this;
		},

		getCoalescedEvents: function ( params, start, end, cal ) {
			var requestTiming = new Date().getTime();
			$.fn.caldav('spinner',true);
			$.report ($.extend(true,{},$.fn.caldav.options,params,{headers:{depth:1},data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
				'<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:">'+
				'  <x1:prop>'+
				'    <x0:calendar-data/>'+
				'    <x1:resourcetype/>'+
				'    <x1:getetag/>'+
				'  </x1:prop>'+
				'  <x0:filter>'+
				'    <x0:comp-filter name="VCALENDAR">'+
				'      <x0:comp-filter name="VEVENT">'+
				'        <x0:time-range start="'+ $.fn.caldav('formatDate',start) +'" end="'+ $.fn.caldav('formatDate',end) +'"/>'+
				'      </x0:comp-filter>'+
				'    </x0:comp-filter>'+
				'  </x0:filter>'+
				'</x0:calendar-query>'
				,complete: function (r,s){ $.fn.caldav.eventTiming.push(new Date().getTime() - requestTiming); 
				if ( $.fn.caldav.eventTiming.length > $.fn.caldav.calendarData.length * 2 ) { var at =0; for ( var i=0;i<$.fn.caldav.eventTiming.length;i++)at+=$.fn.caldav.eventTiming[i];
					$.fn.caldav.eventAverageTime = at / $.fn.caldav.eventTiming.length;
					var trash = $.fn.caldav.eventTiming.shift();}
					if ( cal != undefined ) { r.cal = 0 + cal; }
					$.fn.caldav('spinner',false);
				 	if (s=='success')
					{
						if (  $('response prop *['+$.fn.caldav.xmlNSfield+'=calendar-data]',r.responseXML).closest('propstat').find('status').text().match(/404/) )
						{
							var hrefs = [];
							var updates = $('href',r.responseXML);
							for ( var i=0; i< updates.length; i++ )
								hrefs.push($(updates[i]).text());
							$(this).caldav( 'multiget', params.url, cal, hrefs, start, end );
						}
						else
							$(this).caldav( 'parseEvents', r, start, end );
					} 
				}
			}));
			return this;
		},

		parseEvents : function ( r, start, end ) { 
			var entries = $('response prop *['+$.fn.caldav.xmlNSfield+'=calendar-data]',r.responseXML);
			var e = new Array;
			var href,etag;
			for (var i=0;i<entries.length;i++)
			{
				href = $("href",$(entries[i]).closest('response')).text();
				etag = $("getetag",$(entries[i]).closest('response')).text();
				if ( href.length > 0 )
				{
					$.fn.caldav.entries[href] = $(entries[i]).text();
					e[i] = { href: href, text: $(entries[i]).text(), etag: etag };
				}
			}
			if ( e.length > 0 )
				$.fn.caldav.options.events( e ,r.cal, start, end );
			return this;
		},

		syncCollection: function ( cal, start, end )
		{ 
			if ( ! $.fn.caldav.calendarData[cal] )
				return;
			var params = {url:$.fn.caldav.calendarData[cal].href};
			if ( ! $.fn.caldav.calendarData[cal].synctoken )
				var data = '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
					'<D:sync-collection xmlns:D="DAV:"><D:sync-token/><D:limit><D:nresults>1</D:nresults></D:limit><D:prop><D:getetag/></D:prop></D:sync-collection>';
			else
				var data = '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
					'<D:sync-collection xmlns:D="DAV:"><D:sync-token>'+$.fn.caldav.calendarData[cal].synctoken+'</D:sync-token><D:prop><D:getetag/></D:prop></D:sync-collection>';
			$.report ($.extend(true,{},$.fn.caldav.options,params,{headers:{depth:1},data:data,
				complete: function (r,s){ 
					if ( $.fn.caldav.calendarData[cal].synctoken && $('href',r.responseXML).length > 0 )
					{
						var hrefs = [];
						var updates = $('href',r.responseXML);
						for ( var i=0; i< updates.length; i++ )
						{
							if ( ! String($(updates[i]).siblings('status').text()).match(/404/) ) 
								hrefs.push($(updates[i]).text());
							else
								if ( typeof($.fn.caldav.options.eventDel) == "function" )
									$.fn.caldav.options.eventDel($(updates[i]).text());
						}
						if ( hrefs.length > 0 )
							$(this).caldav( 'multiget', params.url, cal, hrefs, start, end );
					}
					$.fn.caldav.calendarData[cal].synctoken = $('sync-token',r.responseXML).text(); 
				}}));
		},

		multiget: function ( url, cal, hrefs, start, end ) { 
				var multiget = '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
							'<x0:calendar-multiget xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:"><x1:prop><x0:calendar-data/><x1:getetag/></x1:prop>';
						for ( var i=0; i< hrefs.length; i++ )
							multiget = multiget + '<x1:href>'+hrefs[i]+'</x1:href>';
						multiget = multiget + '</x0:calendar-multiget>';
						$.report ($.extend(true,{},$.fn.caldav.options,{url:url,headers:{depth:1},data:multiget,
							complete: function (r,s){
								$.fn.caldav('spinner',false);
								if ( cal != undefined ) { r.cal = 0 + cal; }
								if (s=='success')
									$(this).caldav( 'parseEvents', r, start, end );
							}}));
		},

		getToDos: function ( params, cal ) { 
			$.fn.caldav('spinner',true);
			$.report ($.extend(true,{},$.fn.caldav.options,params,{headers:{depth:1},data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
				'<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:">'+
				'  <x1:prop>'+
				'    <x0:calendar-data/>'+
				'    <x1:resourcetype/>'+
				'  </x1:prop>'+
				'  <x0:filter>'+
				'    <x0:comp-filter name="VCALENDAR">'+
				'      <x0:comp-filter name="VTODO">'+
				'      </x0:comp-filter>'+
				'    </x0:comp-filter>'+
				'  </x0:filter>'+
				'</x0:calendar-query>'
				,complete: function (r,s){ if ( cal != undefined ) { r.cal = 0 + cal; }
					$.fn.caldav('spinner',false);
				 	if (s=='success')
						$(this).caldav('parseTodos',r);
				}
			}));
			return this;
		},

		parseTodos : function (r ) { 
			var entries = $('response prop *['+$.fn.caldav.xmlNSfield+'=calendar-data]',r.responseXML);
			var e = new Array;
			for (var i=0;i<entries.length;i++)
			{
				href = $("href",$(entries[i]).closest('response')).text();
				if ( href.length > 0 )
				{
					$.fn.caldav.entries[href] = $(entries[i]).text();
					e[i] = { href:href,text: $(entries[i]).text()};
				}
			}
			if ( e.length > 0 )
				$.fn.caldav.options.todos(e,r.cal);
			return this;
		},
  
		updateCollection: function ( params, cal, props ) { 
			var ns = 'xmlns:x1="http://apple.com/ns/ical/"';
			var nsArray = ["DAV:","http://apple.com/ns/ical/"];
			var str = '';
			for ( var i in props )
			{
				if ( props[i].ns != undefined )
				{
					if ( nsArray.indexOf(props[i].ns) == -1 )
					{	
						n = nsArray.length; 
						ns = ns + ' xmlns:x' + n + '="' + props[i].ns + '"';
						nsArray.push(props[i].ns); 
					}
					else
					{
						n = nsArray.indexOf(props[i].ns);
					}
					str = str + '<x'+n+':'+props[i].name+'>'+props[i].value+'</x'+n+':'+props[i].name+'>';
				}
				else
					n = 0;
			}
			if ( $.fn.caldav.calendarData[cal] != undefined )
				var url=$.fn.caldav.calendarData[cal].href;
			else
				var url=cal;
			$.proppatch ($.extend(true,{},$.fn.caldav.options,{url:url},params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
				'<x0:propertyupdate xmlns:x0="DAV:" '+ns+'>'+
					'<x0:set>'+
						'<x0:prop>'+
							str +
						'</x0:prop>'+
					'</x0:set>'+
				'</x0:propertyupdate>'
				,complete: function (r,s){
					$.fn.caldav('spinner',false);
					if (s=='success')
						$(this).caldav('updated',r);
				}
			}));
			return this;
		},

		setACL: function ( params, cal, props ) { 
			var ns = 'xmlns:x1="urn:ietf:params:xml:ns:caldav"';
			var nsArray = ["DAV:","urn:ietf:params:xml:ns:caldav"];
			var str = '';
			for ( var i in props )
			{
				if ( props[i].ns != undefined )
				{
					if ( nsArray.indexOf(props[i].ns) == -1 )
					{	
						n = nsArray.length; 
						ns = ns + ' xmlns:x' + n + '="' + props[i].ns + '"';
						nsArray.push(props[i].ns); 
					}
					else
					{
						n = nsArray.indexOf(props[i].ns);
					}
					str = str + '<x'+n+':'+props[i].name+'>'+props[i].value+'</x'+n+':'+props[i].name+'>';
				}
				else
					n = 0;
			}
			if ( $.fn.caldav.calendarData[cal] != undefined )
				var url=$.fn.caldav.calendarData[cal].href;
			else
				var url=cal;
			$.proppatch ($.extend(true,{},$.fn.caldav.options,{url:url},params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
				'<x0:acl xmlns:x0="DAV:" '+ns+'>'+
					'<x0:ace>'+
						'<x0:prop>'+
							str +
						'</x0:prop>'+
					'</x0:ace>'+
				'</x0:acl>'
				,complete: function (r,s){
					if (s=='success')
						$(this).caldav('updated',r);
				}
			}));
			return this;
		},

		lock: function ( url, timeout, callback ) { 
			var to = timeout?timeout:600;
			var data = '<?xml version="1.0" encoding="utf-8"?>' + "\n" +
				'<D:lockinfo xmlns:D="DAV:">'+
					'<D:lockscope><D:exclusive/></D:lockscope>'+
						'<D:locktype><D:write/></D:locktype>'+
						'<D:owner>'+
							'<D:href>'+$.fn.caldav.data.principalHome +'</D:href>'+
						'</D:owner>'+
				'</D:lockinfo>';
			$.lock ($.extend(true,{},$.fn.caldav.options,{url:url},{headers:{Depth:0,Timeout:'Second-'+to},contentType:'text/xml; charset="utf-8"',
							data:data,complete: function (r,s){
					if (s=='success')
					{
						if ( r.status == 200 || r.status == 201 )
						{ 
							var to = Number(String($("["+$.fn.caldav.xmlNSfield+"=timeout]",r.responseXML).text()).replace(/second-/i,''));
							var cancel = window.setTimeout (function(){delete $.fn.caldav.locks[url];},to*1000);
							$.fn.caldav.locks[url] = {token:r.getResponseHeader('Lock-Token'),timeout:to,taken:$.now(),unsetlock:cancel };
						}
						else
							if ( typeof(callback) == 'function' )
								callback(r,s);
					}
					else
						if ( typeof(callback) == 'function' )
							callback(r,s);
				}
			}));
		},
		
		unlock: function ( url ) { 
			if ( $.fn.caldav.locks[url] && $.fn.caldav.locks[url].timeout > ( $.now() - $.fn.caldav.locks[url].taken ) / 1000 )
				var token = $.fn.caldav.locks[url].token;
			else
				return ;
			window.clearTimeout($.fn.caldav.locks[url].unsetlock);
			$.unlock ($.extend(true,{},$.fn.caldav.options,{url:url},{headers:{'Lock-Token':token},
				complete: function (r,s){
					if (s!='success')
					{
						r.abort();
						return false;
					}
				}
			}));
		},

		makeCalendar: function ( params, cal, props ) { 
			var ns = 'xmlns:x2="http://apple.com/ns/ical/"';
			var nsArray = ["urn:ietf:params:xml:ns:caldav","DAV:","http://apple.com/ns/ical/"];
			var str = '';
			for ( var i in props )
			{
				if ( props[i].ns != undefined )
				{
					if ( nsArray.indexOf(props[i].ns) == -1 )
					{	
						n = nsArray.length; 
						ns = ns + ' xmlns:x' + n + '="' + props[i].ns + '"';
						nsArray.push(props[i].ns); 
					}
					else
					{
						n = nsArray.indexOf(props[i].ns);
					}
					str = str + '<x'+n+':'+props[i].name+'>'+props[i].value+'</x'+n+':'+props[i].name+'>';
				}
				else
					n = 0;
			}
			$.mkcalendar ($.extend(true,{},$.fn.caldav.options,params,{data:'<?xml version="1.0" encoding="utf-8"?>' + "\n" +
				'<x0:mkcalendar xmlns:x0="urn:ietf:params:xml:ns:caldav" xmlns:x1="DAV:" '+ns+'>'+
				'  <x1:set>'+
				'    <x1:prop>'+
					str +
				'      <x0:supported-calendar-component-set><x0:comp name="VEVENT"/><x0:comp name="VTODO"/><x0:comp name="VJOURNAL"/></x0:supported-calendar-component-set>'+
				'    </x1:prop>'+
				'  </x1:set>'+
				'</x0:mkcalendar>'
				,complete: function (r,s){
					$.fn.caldav('spinner',false);
					if (s=='success')
						$(this).caldav('madeCalendar',r);
				}
			}));
			return this;
		},

		delCalendar : function( cal ) { 
			$.fn.caldav('spinner',true);
			if ( cal.length > 3 )
				url=cal;
			else
				url=$.fn.caldav.calendarData[cal].href;
			var tmpOptions = $.extend(true,{},jQuery.fn.caldav.options);
			tmpOptions.url = url;
			delete tmpOptions.headers;
		  $.options ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
				if ( s != "success" && s != "notmodified" ) 
				{
					$.fn.caldav('spinner',false);
					if ( $.fn.caldav.options.deletedCalendar.apply != undefined ) 
						$.fn.caldav.options.deletedCalendar(r,s);
					return ;
				}
			  $.del ($.extend(true,tmpOptions,{data:null,headers:{Depth: "infinity"},complete: function (r,s){
					$.fn.caldav('spinner',false);
					if ( $.fn.caldav.options.deletedCalendar != undefined &&$.fn.caldav.options.deletedCalendar.apply != undefined ) 
						$.fn.caldav.options.deletedCalendar(cal,r,s);}
				}))
			}}));
			return this;
		},	
		
		putEvent : function( params , content ) {  	
			$.fn.caldav('spinner',true);
			var tmpOptions = $.extend(true,{},jQuery.fn.caldav.options,params);
			if ( $.fn.caldav.locks[params.url] )
			{
				if ( tmpOptions.headers == undefined ) tmpOptions.headers = {};
				tmpOptions.headers['If']= $.fn.caldav.locks[params.url].token;
			  $.put ($.extend(true,tmpOptions,{contentType:'text/calendar',data:content,complete: function (r,s){
					$.fn.caldav('spinner',false);
					$.fn.caldav('unlock',params.url);
					$.fn.caldav.options.eventPut(r,s);
					}
				}));
			}
			else
			{
			  $.head ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
					if ( r.status != 404 )
						tmpOptions.headers['If-Match']=r.getResponseHeader('ETag');
				  $.put ($.extend(true,tmpOptions,{contentType:'text/calendar',data:content,complete: function (r,s){
						$.fn.caldav('spinner',false);
						$.fn.caldav.options.eventPut(r,s);}
					}))
				}}));
			}
			return this;
		},	

		putNewEvent : function( params , content ) {  	
			$.fn.caldav('spinner',true);
			var tmpOptions = $.extend(true,{url:params.url},jQuery.fn.caldav.options);
			delete tmpOptions.headers;
			tmpOptions.url = params.url;
		  $.head ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
				if ( r.status != 404 )
					params.url = params.url.replace(/(\..{1,8})?$/,'-1$1');
			  $.put ($.extend(true,{},jQuery.fn.caldav.options,params,{contentType: 'text/calendar',data:content,complete: function (r,s){
					$.fn.caldav('spinner',false);
					$.fn.caldav.options.eventPut(r,s);}
				}));
				return false;
			}}));
			return this;
		},	

		delEvent : function( params ) {  	
			$.fn.caldav('spinner',true);
			var tmpOptions = $.extend(true,{},jQuery.fn.caldav.options,params);
			if ( $.fn.caldav.locks[params.url] )
			{
				if ( tmpOptions.headers == undefined ) tmpOptions.headers = {};
				tmpOptions.headers['If']= $.fn.caldav.locks[params.url].token;
				  $.del ($.extend(true,tmpOptions,{data:null,complete: function (r,s){
						$.fn.caldav('spinner',false);
						delete $.fn.caldav.locks[params.url];
						$.fn.caldav.options.eventDel(params.url);}
					}));
			}
			else
			{
				delete tmpOptions.headers;
			  $.head ($.extend(true,tmpOptions,{contentType:undefined,headers:{},data:null,complete: function (r,s){
					if ( r.status != 200 && r.status != 207 )
					{ r.abort(); 
						$.fn.caldav('spinner',false);
						return false; }
					tmpOptions.headers={'If-Match':r.getResponseHeader('ETag')};
				  $.del ($.extend(true,tmpOptions,{data:null,complete: function (r,s){
						$.fn.caldav('spinner',false);
						$.fn.caldav.options.eventDel(params.url);}
					}))
				}}));
			}
			return this;
		},	
		
		moveEvent : function( params ) {  	
			$.fn.caldav('spinner',true);
			if ( $.fn.caldav.locks[params.url] )
				params.headers['If']= $.fn.caldav.locks[params.url].token;
		  $.move ($.extend(true,{},jQuery.fn.caldav.options,params,{complete: function (r,s){
				$.fn.caldav('spinner',false);
				if ( $.fn.caldav.locks[params.url] )
					delete $.fn.caldav.locks[params.url];
				$.fn.caldav.options.eventPut(r,s);}
			}));
			return this;
		},	

		madeCalendar : function( content ) {  	
			console.log ( 'made calendar' + content ); 
			return this;
		},	

		logout : function( ) {  	
			$.fn.caldav('spinner',true);
			for ( var i in $.fn.caldav.locks )
				$.fn.caldav('unlock',i);
			$.fn.caldav.options.username = 'logout';
			$.fn.caldav.options.password = 'logout';
		  var req = $.options ({url:$.fn.caldav.options.url+'logout',username:$.fn.caldav.options.username,password:$.fn.caldav.options.password,
				complete: function (r,s){
					$.fn.caldav('spinner',false);
					$.fn.caldav.options.url = undefined;
					$.fn.caldav.principals = undefined;
					$.fn.caldav.calendarData = undefined;
					$.fn.caldav.calendarXml = $("response",r.responseXML);
					if ( $.fn.caldav.options.logout != undefined && $.fn.caldav.options.logout.apply != undefined )
						$.fn.caldav.options.logout( r,s );
					return false;
					},
				error: function (r,s){
					$.fn.caldav('spinner',false);
					$.fn.caldav.options.url = undefined;
					$.fn.caldav.principals = undefined;
					$.fn.caldav.calendarData = undefined;
					$.fn.caldav.calendarXml = undefined; 
					if ( $.fn.caldav.options.logout != undefined && $.fn.caldav.options.logout.apply != undefined )
						$.fn.caldav.options.logout( r,s );
					return false;
					},
			});
			req.abort ();
			$.fn.caldav('spinner',false);
			$.fn.caldav.options.url = undefined;
			$.fn.caldav.principals = undefined;
			$.fn.caldav.calendarData = undefined;
			$.fn.caldav.calendarXml = undefined; 
			return this;
		},	

		updated : function( content ) {  	
			//console.log ( 'update calendar' + content ); 
			return this;
		},	
   
		spinner: function ( i )
		{
			if ( i ) 
				$($.fn.caldav.options.loading).show().data('loading',($($.fn.caldav.options.loading).data('loading')+1));
			else
			{
				$($.fn.caldav.options.loading).data('loading',($($.fn.caldav.options.loading).data('loading') -1));
				if ( ( $($.fn.caldav.options.loading).data('loading') + 0 )< 1 )
					$($.fn.caldav.options.loading).hide();
			}
		},

		formatDate : function( ds ) {  	
	 function pad(n){return n<10 ? '0'+n : n}
		 var d = new Date(ds);
		 return d.getUTCFullYear() + '' 
      + pad(d.getUTCMonth()+1) + '' 
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours()) + ''
      + pad(d.getUTCMinutes()) + ''
      + pad(d.getUTCSeconds())+'Z';
		},	
  };
	
  $.fn.caldav = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.caldav' );
    }    
 } 
})( jQuery );


