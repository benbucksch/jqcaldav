// Copyright (c) 2011, Rob Ostensen ( rob@boxacle.net )
// See README or http://boxacle.net/jqcaldav/ for license
var cd,hw,fhw,jqcaldavPath,localTimezone,debug=false,alerts=[],timezoneInit = false;
var settings={twentyFour:true,start:Zero().setUTCHours(6),end:Zero().setUTCHours(22),'update frequency':300,weekStart:0};
var months,weekdays,dropquestion,deletequestion,fieldNames,valueNames,subscriptions;
settings.start = new Date(Zero().setUTCHours(6));
settings.end = new Date(Zero().setUTCHours(22));
var abbvr={abbv:[],names:[],offsets:[],count:0};
function loadTZ ( )
{
	if ( abbvr.count < 1 )
	{
		$.ajax({url:jqcaldavPath+'tz/abbvr.tz',async:false, dataType:"text",success:function(d){
			var t = String(d).split ("\n");
			abbvr.count=t.length;
			for (var i=0;i<t.length;i++)
			{
				var p = t[i].split(',');
				abbvr.abbv.push(p[0]);
				abbvr.names.push(p[1]);
				abbvr.offsets.push(Number(p[2]));
			}
		}});
	}
}
function getTZ ( d )
{
	if ( ! d || ! d.getDate )
		var d = new Date();
	var offset = 0 - ( parseInt(d.getTimezoneOffset()/60)*100 + d.getTimezoneOffset()%60 );
	var ab = d.toLocaleString().replace(/^.*\s/,'');
	if ( debug ) console.log( 'searching ' + abbvr.abbv.length + ' timezones for ' + ab + ' (' + offset + ') found ' + abbvr.abbv.indexOf(ab)  );
	for ( var i = 0; i < abbvr.abbv.length; i++ )
	{	
		if ( abbvr.offsets[i] == offset )
			return {abbv:abbvr.abbv[i],name:abbvr.names[i],offset:abbvr.offsets[i]};
	}
	return false;
}

var defaults={ui:{calendar:"Calendars",todos:"To Do","add":"Add",settings:"Settings",subscribe:"Subscribe",today:"Today",week:"Week",month:"Month",start:"Day Starts",end:"Day Ends",twentyFour:"24 Hour Time",username:'Username',password:'Password','go':'go','New Event':'New Event',"alarm":"alarm","done":"Done","delete":"Delete","name":"name","color":"color","description":"description","url":"url","privileges":"privileges","logout":"Logout","new calendar":"New Calendar","yes":"yes","no":"no","logout error":"Error logging out, please CLOSE or RESTART your browser!","owner":"Owner","subscribed":"Subscribed","lock failed":"failed to acquire lock, may not be able to save changes",loading:'working','update frequency':'update frequency'},
	months:["January","February","March","April","May","June","July","August","September","October","November","December"],
	weekdays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
	dropquestion:["Do you want to move",["All occurences","This one occurence"]],
	deletequestion:["Do you want to delete ",["All occurences","Delete this one occurence"]],
	deleteCalQuestion:["Are you sure you want to delete ",["No","Delete Calendar"]],
	fieldNames:{summary:"summary",dtstart:"from",dtend:"to",duration:"duration",rrule:"repeat",rdate:"repeat on",transp:"busy",due:"due",completed:"completed",
		status:"status",resources:"resources",priority:"priority","percent-complete":"percent complete",location:"location",geo:"coordinates",description:"description",
		comment:"comment","class":"class",categories:"catagories",attach:"attachment",attendee:"attendee",contact:"contact",organizer:"organizer","related-to":"related to", 
		url:"url",action:"action",repeat:"repeat",trigger:"trigger","last-modified":"last modified","request-status":"request status",},
	valueNames:{"TRANSPARENT":"transparent","OPAQUE":"opaque","TENTATIVE":"tentative","CONFIRMED":"confirmed","CANCELLED":"cancelled","NEEDS-ACTION":"needs-action",
		"COMPLETED":"completed","IN-PROCESS":"in-process","DRAFT":"draft","FINAL":"final","CANCELLED":"cancelled","PUBLIC":"public","PRIVATE":"private",
		"CONFIDENTIAL":"confidential","AUDIO":"sound","DISPLAY":"message","NONE":"none"},
	"durations":{"minutes before":"minutes before","hours before":"hours before","days before":"days before","weeks before":"weeks before","minutes after":"minutes after","hours after":"hours after","days after":"days after","weeks after":"weeks after","on date":"on date"},
	"recurrenceUI":{"YEAR":"year","MONTH":"month","WEEK":"week","DAI":"day","HOUR":"hour","MINUTE":"minute","SECOND":"second","day":"day","time":"time","times":"times","until":"until","every":"every","on":"on"},
	"privileges":{"all":"all","bind":"bind","unbind":"unbind","unlock":"unlock","read":"read","acl":"acl","free-busy":"free-busy","privileges":"privileges","write":"write","content":"content","properties":"properties","acl":"acl","schedule-send":"schedule-send","invite":"invite","reply":"reply","freebusy":"freebusy","schedule-deliver":"schedule-deliver","invite":"invite","reply":"reply","query-freebusy":"query-freebusy"}};

var ui=defaults.ui, months=defaults.months, weekdays=defaults.weekdays, dropquestion=defaults.dropquestion,
deletequestion=defaults.deletequestion, deleteCalQuestion=defaults.deleteCalQuestion, fieldNames=defaults.fieldNames, valueNames= defaults.valueNames,privileges=defaults.privileges ,durations=defaults.durations;
var recurrenceUI=defaults.recurrenceUI;

$(document).ready ( function () {
		var here = $('.jqcaldav:eq(0)');
		jqcaldavPath = $('script[src*=jqcaldav]').attr('src').replace(/jqcaldav.js/,'');
		$.ajax({url:jqcaldavPath+String(navigator.language?navigator.language:navigator.userLanguage).toLowerCase()+'.js',async:false, dataType:"json",success:function(d){
			if (d.ui != undefined){ui=d.ui;months=d.months;weekdays=d.weekdays;dropquestion=d.dropquestion;
				deletequestion=d.deletequestion;fieldNames=d.fieldNames;valueNames=d.valueNames;durations=d.durations;
				recurrenceUI=d.recurrenceUI;deleteCalQuestion=d.deleteCalQuestion;privileges=d.privileges;}
			else
				{ui=defaults.ui; months=defaults.months; weekdays=defaults.weekdays; dropquestion=defaults.dropquestion;
				deletequestion=defaults.deletequestion; fieldNames=defaults.fieldNames; valueNames= defaults.valueNames;recurrenceUI=d.recurrenceUI;}},error:function()
				{ui=defaults.ui; months=defaults.months; weekdays=defaults.weekdays; dropquestion=defaults.dropquestion;
				deletequestion=defaults.deletequestion; fieldNames=defaults.fieldNames; valueNames= defaults.valueNames; recurrenceUI=defaults.recurrenceUI;}
		});
		if ( $('.jqcaldav:eq(0)').data('debug') == 'true' ) debug = true;
		if ( $('.jqcaldav:eq(0)').data('wait') != 'true' ) 
		{
			$(here).append('<form id="cal_login" ><div style="max-width: 40%; min-width: 16em;margin: 30%; margin-top:1em; padding: 2em; -moz-border-radius: 1.5em; -webkit-border-radius: 1.5em; border-radius: 1.5em; ' +
				'-moz-box-shadow: 0px 0px 10px #888; -webkit-box-shadow: 0px 0px 10px #888; box-shadow: 0px 0px 10px #888; "><div id="cal_login_wrapper"><div style="text-align:center"><span style="width:50%;margin-left: -3em;display: block;float:left;'+
				'text-align: right; padding-right: 1em;">'+ui.username+'</span><input id="name" size="20" style="float: left;" autofocus /></div><div style="clear: left;text-align:center;"><span style="width:50%;margin-left: -3em;'+
				'display: block;float:left;text-align: right; padding-right: 1em;">'+ui.password+'</span><input id="pass" size="20" type="password" style="float: left;"/></div><div><input id="go" size="20" type="button" value="'+ui.go+'" style="float: left;" /></div><div>&nbsp;</div></div></div></form>');
				$('#cal_login input:eq(0)').focus();
				$('#cal_login').submit(function(e){console.log('doinging it');doit(e);return false;});
				$('#cal_login #go').click(function (e){doit(e); return false; });
				$('#cal_login input').keypress(function (e){if (e.keyCode=='13'){doit(e); return false; }});
		}
		if ( debug ) console.log(ui);
		loadTZ();
		localTimezone = getTZ();
		if ( debug ) console.log('local timezone should be: ' + localTimezone.name);
		} );

function visible ( e )
{
	var p = $(e).parents('body').andSelf();
	return $.grep(p,function(a,i){return $(a).css('display')!='none'}).length==p.length?true:false;
}

combine = function ( obj, o ) 
{
	for ( var x in o )
		if ( ! obj[x] )
			obj[x] = o[x];
	return obj; 
}

var extdepth = 0;

function doit ( e )
{
	if ( $('.jqcaldav:eq(0)').data('wait') == 'true' ) 
	{
		if ( $('.jqcaldav:eq(0)').data('username').length < 3 && $('.jqcaldav:eq(0)').data('password').length < 3 )
			return;
	}
	else if ( $('#name').val().length < 3 && $('#pass').val().length < 3 )
		return;
	else
	{
		$('.jqcaldav:eq(0)').data('username',$('#name').val());
		$('.jqcaldav:eq(0)').data('password',$('#pass').val());
	}
	if ( $('#wcal').length > 0 )
		$('#calwrap').remove();
	$('#cal_login').fadeOut(99);
	var loading = $('<div id="caldavloading1" style="display:none;position:fixed;left:100%;top:100%;margin-top:-1em;margin-left:-4em;text-align: center; width:4em; background-color:black;color:white;-moz-border-top-left-radius:.5em;-webkit-border-top-left-radius:.5em;border-top-left-radius:.5em;opacity:.5;z-index:100;" data-loading="0" ><span>'+ui.loading+'</span></div>').appendTo(document.body);
	window.setTimeout(function()
	{
		cd = $(document).caldav ( { url: $('.jqcaldav:first').data('caldavurl'), username:$('.jqcaldav:eq(0)').data('username'), password:$('.jqcaldav:eq(0)').data('password'), events: addEvents, todos: addToDos,eventPut: eventPut, eventDel: removeEvent, deletedCalendar: deletedCalendar, logout: logout, loading: $('#caldavloading1')}, loginFailed );
		$.fn.caldav.options.calendars = gotCalendars;
		$(document).caldav('getCalendars', {});

		$(window).unload ( logoutClicked ); 
		if ( timezoneJS && timezoneJS != undefined && timezoneJS.timezone != undefined && timezoneInit == false ) 
		{
			timezoneInit = true;
			timezoneJS.timezone.zoneFileBasePath = jqcaldavPath+'tz';
			timezoneJS.timezone.init();
		}
	},100);
	e.stopPropagation();
	return false;
}

function loginFailed (r,s)
{
	r.abort();
	$('#name,#pass').css('background-color', 'red').animate({'background-color': '#FFF'}, 300);
}

function logoutClicked ()
{
	if ( $('#calwrap').length > 0 || $.fn.caldav.options.username )
		$(document).caldav ( 'logout' );
}

function logout ()
{
	window.clearInterval($('#wcal').data('updateInterval'));
	for ( var i in alerts )
		window.clearTimeout(alerts[i]);
	$('#calwrap').remove();
	$('#cal_login').fadeIn();
	$('#name').val('');
	$('#pass').val('');
}

function gotCalendars ()
{
	if ( $('#wcal').length < 1 )
	{
		var ph = $.fn.caldav.collectionData[$.fn.caldav.principals[$.fn.caldav.principalMap[$.fn.caldav.data.myPrincipal]].cal].xml;
		var s = $('*['+$.fn.caldav.xmlNSfield+'=calendar-settings]:first',ph).text();
		if ( s.length > 20 )
		{
			$.extend(true,settings,JSON.parse( s ));
			settings.start = Zero().parseDate(settings.start);
			settings.end = Zero().parseDate(settings.end);
			if ( settings.calendars != undefined ) 
			{
				var tf = /false/i;
				for ( var i in settings.calendars )
				{
					if ( settings.calendars[i] !== false )
					{
						if ( tf.test(settings.calendars[i] ) )
							settings.calendars[i] = false;
						else
							settings.calendars[i] = true;
					}
				}
			}
		}
		$('.jqcaldav:first').append(buildcal());
		$(window).resize ( resize);
		$('#wcal').animate({scrollTop: ($('#calt tr:first')[0].clientHeight + 1)},250);
		$('#calpopup').removeData('clicked');
		resize();
		s = $('*['+$.fn.caldav.xmlNSfield+'=calendar-subscriptions]:first',ph).text();
		if ( s.length > 20 )
		{
			var nsubscriptions = JSON.parse( s );
			for ( var i in nsubscriptions )
			{	
				if ( nsubscriptions[i] == undefined  )
					continue;
				if ( subscriptions == undefined || ! subscriptions instanceof Object )
					subscriptions = [{name:nsubscriptions[i].name,url:nsubscriptions[i].url,'color':nsubscriptions[i].color,'order':nsubscriptions[i].order,'description':nsubscriptions[i].description}];
				else
					subscriptions.push({name:nsubscriptions[i].name,url:nsubscriptions[i].url,'color':nsubscriptions[i].color,'order':nsubscriptions[i].order,'description':nsubscriptions[i].description});
				fetchCalendar (nsubscriptions[i].url,nsubscriptions[i].name,nsubscriptions[i].color,nsubscriptions[i].order,nsubscriptions[i].description);
			}
		}
		if ( settings['update frequency'] > 0 )
		{
			calendarSync();
			$('#wcal').data('updateInterval',window.setInterval(calendarSync,settings['update frequency']*1000));
		}
	}
}

function calendarSync ()
{
	var cals = $(document).caldav('calendars');
	// TODO add getctag/sync token periodic check to refresh changed events
	// http://tools.ietf.org/html/draft-daboo-webdav-sync-05#section-3.1
	for ( var i=0; i< cals.length; i++)
	{
		// the dates used here are ONLY for client side so we know when to insert returned events 
		$(document).caldav('syncCollection',i,$('#wcal').data('firstweek'),$('#wcal').data('lastweek'));
	}
}

function eventPut(r,s)
{
	if ( s != 'success' )
	{
		alert ('failed to save event to server');
		console.log(r);
	}
}

function draggable (e)
{
	$(e).addClass('draggable');
	$(e).bind('mousedown',function (evt)
			{
				if ( ! $(evt.target).hasClass('draggable') )
					return;
				if ( evt.pageX > $(this).offset().left + $(this).outerWidth() * .9 && evt.pageY > $(this).offset().top + $(this).outerHeight() * .9 )
					return true; // silly firefox 
				$(document.body).data('caldrag',{e:evt.target,x:evt.pageX-$(this).offset().left,y:evt.pageY-$(this).offset().top});
				var drag = function (evt) { var offsets = $(document.body).data('caldrag'); $(offsets.e).offset({left:evt.pageX-offsets.x,top:evt.pageY-offsets.y});return false;};
				$(document).bind('mouseup',function (evt) {$(document).unbind('mousemove',drag);$(document).unbind(evt); });
				$(document).bind('mousemove',drag);
				return false;
			});
}

var resize_delay=0,resize_time=50;
function resize ()
{
	$('#calsidebar, #caltodo').css({height: window.innerHeight });
	$('#callist').css({height:window.innerHeight- ( $('.sidetitle').height() + $('.calfooter').height() ) } );
	//$('#wcal,#calh,#calheader').css({width: $('#calwrap').width() - ( $('#calsidebar').width() +1 + $('#caltodo').width() +7 )} );
	$('#wcal').css({height: ( window.innerHeight - ( $('#wcal')[0].offsetTop + 2) ) });
	$('.timeline').css({height: ( window.innerHeight - ( $('#wcal')[0].offsetTop + 2) ) });
	if ( resize_delay != 0 )
		window.clearTimeout(resize_delay);
	resize_delay = window.setTimeout(update_weekview,resize_time);
	updateTimeline();
	//update_weekview();
}

function update_weekview ()
{
	//resize_delay=0;
	var started = new Date();
	var oldTop =  $('#wcal').scrollTop()/$('#wcal').height();
	styles.getStyleSheet ( 'calstyle' );
  var iH = ( window.innerHeight - ( $('#wcal')[0].offsetTop + 40) );
	styles.updateRule('.weekview .week',{height: iH +'px'});
	styles.updateRule('.weekview .weeknum',{height: iH +'px'});
	styles.updateRule('.weekview .week .day',{height: iH +'px'});
	styles.updateRule('.weekview .week ul.hoursbg',{height: iH +'px'});
	styles.updateRule('.weekview .week .day ul.eventlist',{height: iH +'px'});
	var startt = settings.start.getLongMinutes();
	var endt = settings.end.getLongMinutes();
	var oH = ( iH ) / ( (endt-startt) / 100 );  
	styles.updateRule ( '.hoursbg > li', {height: oH + 'px' });
	window.setTimeout(function(){$('#wcal').scrollTop($('#wcal').height()*oldTop);},300);
	resize_time = (new Date()).getTime() - started.getTime();
}

function calSettings (e)
{
	var ul = $('<ul></ul>');
	$(ul).append ('<li><span></span><span class="header">'+ui.settings+'</span></li>');
	var props  = {"start":"Day Starts","end":"Day Ends","twentyFour":"24 Hour Time",'update frequency':'update frequency','weekStart':'Week Starts on'} ;
	var ptypes = {'start':'time'      ,'end':'time'    ,'twentyFour':'bool'        ,'update frequency':'number'          ,'weekStart':'day'} ;
	for ( var i in props )
		$(ul).append ('<li><span class="label">'+ui[i]+'</span><span class="value data'+ptypes[i]+'" tabindex="0" contenteditable="true" >'+printValue(settings[i],ptypes[i])+'</span></li>');
	$('.value',ul).click(calFieldClick);
	$('#caldialog').empty();
	$('#caldialog').append(ul);
	draggable ( $('#caldialog') );
	$('#caldialog').show();
	$('#caldialog li span:contains(name) + span').focus();
	$('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
	$('.calpopup .done').bind ('click keypress',function (e) {
				if ( e.keyCode > 0 )
					if ( e.keyCode != 32 && e.keyCode != 13 )
						return ;
				if ( saveSettings(true) == true ) 
				{
					$('.calpopup').fadeOut();
					$('#wcal').removeData('popup'); 
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
				}
			}
			);
	$('#wcal').data('popup','#caldialog');
	$('#wcal').data('clicked', e.target);
	$(document).click( $('#wcal').data('edit_click') ); 
	$(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function saveSettings (dialog)
{
	if ( dialog )
	{
		var props  = {'start':'Day Starts','end':'Day Ends','twentyFour':'24 Hour Time','update frequency':'update frequency','weekStart':'Week Starts on'} ;
		var ptypes = {'start':'time'      ,'end':'time'    ,'twentyFour':'bool'        ,'update frequency':'number'          ,'weekStart':'day'} ;
		for ( var i in props )
		{
			settings[i] = getValue( $('#caldialog li span:contains('+ui[i]+') + span'), ptypes[i] );
		}
	}
	var s = $.extend(true,{},settings);
	s.start = s.start.DateString();
	s.end = s.end.DateString();
	var t = {0:{ns:"http://boxacle.net/ns/calendar/",name:'calendar-settings',value:JSON.stringify(s)}};
	var cals = $(document).caldav('calendars');
	var url = '';
	for ( var i in cals )
	{
		if ( cals[i].mailto.match(RegExp($('#name').val(),'i')) )
		{
			url = cals[i].principal;
			break ;
		}
	}
	$(document).caldav('updateCollection', {url:$.fn.caldav.data.principalHome},$.fn.caldav.data.principalHome,t);
	return true;
}

function printValue( val , type )
{
	switch ( type )
	{
		case 'bool':
			return val?ui['yes']:ui['no'];
		case 'text':
			return val;
		case 'number':
			return val;
		case 'day':
			return weekdays[val];
		case 'time':
			return  val.prettyTime();
		case 'date':
		case 'datetime':
			return  val.prettyDate();
	}
}

function getValue( ele , type )
{
	switch ( type )
	{
		case 'bool':
			return $(ele).text()==ui['yes'];
		case 'text':
			return $(ele).text();
		case 'number':
			return Number($(ele).text());
		case 'day':
			return weekdays.indexOf ($(ele).text());
		case 'time':
			return  Zero().parsePrettyTime($(ele).text()) ;
		case 'date':
		case 'datetime':
			return  (new Date()).parsePrettyDate($(ele).text());
	}
}

function colorClicked ( e )
{
	var t = '<div class="colorpicker" >';
	for ( var i = 1; i<=30; i++ )
		t = t + '<span class="color'+i+'"></span>';
	t = t + '</div>';
	var c = $(t);
	$('span',c).click(function(e){ 
		var color = RGBtoHex($(e.target).css('background-color'));
		$(e.target).closest('.value').text(color); 
		$(e.target).closest('.colorpicker').remove(); 
		return false; });
	$(e.target).blur(function (e){$(e.target).children('.colorpicker').remove();});
	$(e.target).append(c);
	var p = $(e.target).position ( );
	$(c).css({left:p.left+$(e.target).outerWidth()});
}

function calFieldClick(e)
{
	var cp = $($('#wcal').data('popup'));
	var label = $(e.target).prev().text();
	var props  = {'start':'Day Starts','end':'Day Ends','twentyFour':'24 Hour Time','update frequency':'update frequency','weekStart':'Week Starts on'} ;
	var propOptions  = {'twentyFour':[ui['yes'],ui['no']]} ;
	propOptions.weekStart = weekdays;
	for ( var i in props )
		if ( ui[i] == label )
			break;
	if ( propOptions[i] != undefined && propOptions[i].length > 0 )
	{
		var options = propOptions[i];
		var currentValue = $(e.target).text();
		var txt = '<div class="completionWrapper"><div class="completion">';
		for ( var j = 0; j < options.length; j++ )
			txt = txt + '<div'+ (options[j]==currentValue?' class="selected" ':'') +'>'+options[j]+'</div>';
		txt = txt + '</div></div>';
		var comp = $(txt);
		$(comp).children().click(function(evt){$(evt.target).parent().parent().next().text($(evt.target).text());
			$(evt.target).parent().parent().fadeOut(function(){$(this).remove();});
			popupOverflowAuto();
			return false;
		});
		$(e.target).bind('keydown',function (e2){ 
			e2.spaceSelects = true; 
			e2.search = true; 
			e2.removeOnEscape = true; 
			var k = keyboardSelector(e2);
			if ( k == 'cancel' )
			{
				$('#wcal').data('eatCancel',true);
				$(this).unbind('blur');
				popupOverflowAuto();
				e2.stopPropagation();
				return false;
			}
			else if ( $(k).length == 1 )
			{
				$(this).unbind('blur');
				$(this).text($(k).text());
				$(this).prev().fadeOut(function(){$(this).remove();});
				popupOverflowAuto();
				var ret = e2.which==9;	
				return ret;
			}	
			else
				return k;
			},false);
		$(comp).css({top:$(e.target).position().top,left:$(e.target).position().left,'margin-left':'2em'});
		$(e.target).bind('blur',function(evt){$(evt.target).prev().fadeOut(function(){$(this).remove();});popupOverflowAuto();$(this).unbind(evt);});
		popupOverflowVisi();
		$(e.target).before(comp);
	}
}

function subscribeCalendar (e)
{
	var ul = $('<ul></ul>');
	var props ={'a':'name','b':'url','c':'color','d':'description','order':'order'} ;
	for ( var i in props )
		$(ul).append ('<li><span class="label">'+ui[props[i]]+'</span><span class="value" tabindex="0" contenteditable="true">'+(i=='a'?'New Calendar':'')+'</span></li>');
	$('#caldialog').empty();
	$('#caldialog').append(ul);
	draggable ( $('#caldialog') );
	$('#caldialog').show();
	$('#caldialog li span:contains('+ui.name+') + span').focus();
	$('#caldialog li span:contains('+ui.color+') + span').click ( colorClicked );
	$('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
	$('.calpopup .done').bind ('click keypress',function (e) {
				if ( e.keyCode > 0 )
					if ( e.keyCode != 32 && e.keyCode != 13 )
						return ;
				if ( saveSubscription() == true ) 
				{
					$('.calpopup').fadeOut();
					$('#wcal').removeData('popup'); 
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
				}
			}
			);
	$('#wcal').data('popup','#caldialog');
	$('#wcal').data('clicked', e.target);
	$(document).click( $('#wcal').data('edit_click') ); 
	$(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function saveSubscription ()
{
	var cal = $('#caldialog ul').data('calendar');
	var name = $('#caldialog li span:contains('+ui.name+') + span').text();
	var url = $('#caldialog li span:contains('+ui.url+') + span').text();
	var color = $('#caldialog li span:contains('+ui.color+') + span').text();
	var order = $('#caldialog li span:contains('+ui.order+') + span').text();
	var description = $('#caldialog li span:contains('+ui.description+') + span').text();
	if ( cal != undefined )
	{
		var cals = $('#wcal').data('subscribed');
		for ( var j in subscriptions )
			if ( subscriptions[j].url == cals[cal].url && ( subscriptions[j].name == cals[cal].name || subscriptions[j].name == cals[cal].displayName ) )
				subscriptions[j] = {name:name,url:url,'color':color,'order':order,'description':description};
	}
	else if ( subscriptions == undefined || ! subscriptions instanceof Object )
		subscriptions = [{name:name,url:url,'color':color,'order':order,'description':description}];
	else
		subscriptions.push({name:name,url:url,'color':color,'order':order,'description':description});
	var purl = '';
	var cals = $(document).caldav('calendars');
	for ( var j in cals )
	{
		if ( cals[j].mailto.match(RegExp($('#name').val(),'i')) )
		{
			purl = cals[j].principal;
			break ;
		}
	}
	var t = {0:{ns:"http://boxacle.net/ns/calendar/",name:'calendar-subscriptions',value:JSON.stringify(subscriptions)}};
	$(document).caldav('updateCollection', {url:purl},purl,t);
	if ( cal == undefined )
		fetchCalendar (url,name,color,order,description);
	else
	{
		var ss = styles.getStyleSheet ( 'calstyle' );
		ss.updateRule ( '.calendar'+cal ,{ color: color }  );
		ss.updateRule ( '.calendar'+cal +':hover',{ 'background-color': color } );
		ss.updateRule ( '.calendar'+cal +'bg',{ 'background-color': color } );
		$('#callist .calendar' + cal).attr('order',order);
		$('#callist .calendar' + cal).attr('title',description);
		$('#callist .calendar' + cal + ' span').text(name);
		eventSort($('#callist .calendar' + cal).parent());
	}
	return true;
}

function addSubscribedCalendar(name,color,order,description,url)
{
	var cparent = $('#calsidebar li:contains(Subscribed) > ul');
	var cals = $(document).caldav('calendars');
	var scals = $('#wcal').data('subscribed');
	if ( typeof scals != "object" ) {scals = []; scals[cals.length]={};}
	var i = null;
	for ( var j in scals )
		if ( scals[j].url == url && scals[j].name == name )
			i = j;
	if ( i == null )
	{
		var i=0; for ( var j=0; j<scals.length; j++ ) if ( scals[j]!=undefined)i++;
		var i = cals.length + i + 1 ;
	}
	var ss = styles.getStyleSheet ( 'calstyle' );
	ss.updateRule ( '.calendar'+i ,{ color: color }  );
	ss.updateRule ( '.calendar'+i +':hover',{ 'background-color': color } );
	ss.updateRule ( '.calendar'+i +'bg',{ 'background-color': color } ); 
	if ( ! cparent.length )
	{
		$('<li class="open"  ><span>'+ui.subscribed+'</span><ul data-mailto="Subscribed" ></ul></li>').appendTo('#calsidebar > ul');
		var cparent = $('#calsidebar li:contains('+ui.subscribed+') > ul');
		$('#calsidebar li:contains('+ui.subscribed+') > span').click (function (){$('li.selected',$(this).parent()).toggleClass('selected');$(this).parent('li').toggleClass('open');$(this).parent('li').toggleClass('closed');});
	}
	var ce = $('<li class="calendar'+i+'" order="'+order+'" title="'+description+'"><input type="checkbox" id="calendar'+i+'" checked="true" /><span >'+name+'</span></li>');
	$(ce).dblclick (editCalendar);
	$('input',ce).change(toggleCalendar);
	$(cparent).append(ce);
	eventSort(cparent);
	if ( settings.calendars != undefined && settings.calendars[url] != undefined && settings.calendars[url] == false )
	{
		$('input',ce).attr('checked',false);
		var ss = styles.getStyleSheet ( 'calstyle' );
		ss.updateRule ( '#wcal .day .event.calendar'+i ,{ opacity: 0 }  );
		ss.updateRule ( '#wcal .day .event.calendar'+i +'bg',{ opacity: 0 } );
		ss.updateRule ( '#wcal .day .event.calendar'+i ,{ display: 'none' }  );
		ss.updateRule ( '#wcal .day .event.calendar'+i +'bg',{ display:'none' } );
	}
	return i;
}

function fetchCalendar ( curl, name, color, order, description )
{
	$.get($('.jqcaldav').data('calproxyurl')+curl).complete(function (req) {
		data = req.responseText;
		var cal = addSubscribedCalendar(name,color,order,description,curl);
		var scals = $('#wcal').data('subscribed');
		if ( typeof scals != "object" ) scals = {};
		scals[cal]={    
			src: curl,
			order: order,
			displayName: name,
			desc: description,
			color: color,
			url: curl,
      events: new iCal ( data ) };
		if ( debug ) console.log(scals[cal].events.length );
		$('#wcal').data('subscribed',scals); 
		addSubscribedEvents(cal, $('#wcal').data('firstweek'),$('#wcal').data('lastweek'));
	});
}

function addCalendar (e)
{
	var ul = $('<ul data-calendar="new" ></ul>');
	var props ={'a':'name','b':'color','c':'description','e':'order','d':'owner'} ;
	var cals = $(document).caldav('calendars');
	var c = $('#callist li.selected'); 
	if ( c.length > 0 )
		c = $(c).attr('class').match(/calendar(\d+)/)[1];
	else
		c = 0;
	for ( var i in props )
		$(ul).append ('<li><span class="label">'+ui[props[i]]+'</span><span class="value" tabindex="0" contenteditable="true">'+(i=='a'?ui['new calendar']:'')+'</span></li>');
	$('span:contains('+ui.owner+') ~ .value',ul).attr('data-principal',cals[c].principal);
	$('span:contains('+ui.color+') ~ .value',ul).text( randomColor() );
	$('span:contains('+ui.color+') ~ .value',ul).click( colorClicked );
	$('span:contains('+ui.owner+') ~ .value',ul).text(cals[c].principalName);
	$('span:contains('+ui.owner+') ~ span',ul).keydown(completePrincipal);
	$('span:contains('+ui.owner+') ~ span',ul).before('<div class="completionWrapper"><div class="completion"></div></div>');
	var li = $('<li><span class="label">'+ui.privileges+'</span></li>'); 
	$(li).append ( '<div class="completionWrapper"><div class="completion"></div></div><span class="value" data-principal="new principal" contenteditable="true">'+ui.add+'</span>' );
	$('span:[data-principal="new principal"]',li).focus(function(e){if ($(this).text()==ui.add)$(this).text('');});
	$('span:[data-principal="new principal"]',li).blur(function(e)
		{
			if ($(this).text()=='')$(this).text(ui.add);
			if ( $(this).attr('data-principal').length > 1 && $(this).attr('data-principal') != "new principal" )
			{
				$(this).prev().before(privilegeBox($('<ace><principal><href>'+$(this).attr('data-principal')+'</href></principal></ace>')));
				$(this).attr('data-principal','new principal');
				$(this).removeData('principal');
				$(this).text(ui.add);
			}
		});
	$('span:[data-principal="new principal"]',li).keydown(completePrincipal);
	$(ul).append ( li );
	$('#caldialog').empty();
	$('#caldialog').append(ul);
	draggable ( $('#caldialog') );
	$('#caldialog').show();
	$('#caldialog li span:contains('+ui.name+') + span').focus();
	$('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
	$('.calpopup .done').bind ('click keypress',function (e) {
				if ( e.keyCode > 0 )
					if ( e.keyCode != 32 && e.keyCode != 13 )
						return ;
				if ( saveCalendar() == true ) 
				{
					$('.calpopup').fadeOut();
					$('#wcal').removeData('popup'); 
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
				}
			}
			);
	$('#wcal').data('popup','#caldialog');
	$('#wcal').data('clicked', e.target);
	$(document).click( $('#wcal').data('edit_click') ); 
	$(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function selectCalendar (e)
{
	var c = $('#callist li.selected'); 
	$(c).removeClass('selected');
	var c = $(this);
	$(c).addClass('selected');
	settings['selectedCalendar'] = $(c).attr('class').match(/calendar(\d+)/)[1];
	saveSettings(false);
}

function toggleCalendar ()
{
	var ss = styles.getStyleSheet ( 'calstyle' );
	var i = this.id;
	if ( ! this.checked ) 
	{
		ss.updateRule ( '#wcal .day .event.'+i ,{ opacity: 0, height: 0 }  );
		ss.updateRule ( '#wcal .day .event.'+i +'bg',{ opacity: 0, height: 0 } );
		window.setTimeout(function(){ss.updateRule ( '#wcal .day .event.'+i ,{ display: 'none' }  );
		ss.updateRule ( '#wcal .day .event.'+i +'bg',{ display:'none' } );},250);
	}
	else 
	{
		ss.updateRule ( '#wcal .day .event.'+i ,{ display: 'block' }  );
		ss.updateRule ( '#wcal .day .event.'+i +'bg',{ display: 'block' } );
		window.setTimeout(function(){ss.updateRule ( '#wcal .day .event.'+i ,{ opacity: 1, height: null }  );
		ss.updateRule ( '#wcal .day .event.'+i +'bg',{ opacity: 1, height: null } );},100);
	}
	var cals = $(document).caldav('calendars');
	var scals = $('#wcal').data('subscribed');
	if ( settings['calendars'] == undefined )
		settings['calendars'] = {};
	$.each($('#callist input'),function (i,v)
	{
		var num = $(v).attr('id').match(/(\d+)/)[1];
		if ( cals[num] )
			settings['calendars'][cals[num].url] = this.checked?'true':'false';
		else
			settings['calendars'][scals[num].url] = this.checked?'true':'false';
	});
	saveSettings(false);
}

function editCalendar (e)
{
	var c = $(e.target).parents('li').attr('class').match(/calendar(\d+)/)[1];
	var ul = $('<ul data-calendar="' + c + '" ></ul>');
	var props ={'displayName':'name','color':'color','order':'order','desc':'description'} ;
	var cals = $(document).caldav('calendars');
	var noprivs = false;
	if ( cals[c] == undefined )
	{
		cals = $('#wcal').data('subscribed');
		props.url='url';
		noprivs = true;
	}
	for ( var i in props )
		$(ul).append ('<li><span class="label">'+ui[props[i]]+'</span><span class="value" data-prop="' + props[i] + 
				'" data-value="' + cals[c][i] + '" contenteditable="true">'+ cals[c][i] +'</span></li>');
	if ( ! noprivs )
	{
		var acl = $('acl > ace:has(href)',cals[c].xml);
		var supported_acl = $('supported-privilege-set',cals[c].xml);
		var li = $('<li><span class="label" privileges="true" >'+ui.privileges+'</span></li>'); 
		$(li).hover(function(){$($('#wcal').data('popup')).css({overflow:'visible'});},function(){$($('#wcal').data('popup')).css({overflow:'auto'});});
		for (i=0;i<acl.length;i++)
		{
			$(li).append (  privilegeBox(acl[i])  );
		}
		$(li).append ( '<div class="completionWrapper"><div class="completion"></div></div><span class="value" data-principal="new principal" contenteditable="true">'+ui.add+'</span>' );
		$('span:[data-principal="new principal"]',li).focus(function(e){$($('#wcal').data('popup')).css({overflow:'visible'});if ($(this).text()==ui.add)$(this).text('');});
		$('span:[data-principal="new principal"]',li).blur(function(e)
			{
				$($('#wcal').data('popup')).css({overflow:'auto'});
				if ($(this).text()=='')$(this).text(ui.add);
				if ( $(this).attr('data-principal').length > 1 && $(this).attr('data-principal') != "new principal" )
				{
					$(this).prev().before(privilegeBox($('<ace><principal><href>'+$(this).attr('data-principal')+'</href></principal></ace>')));
					$(this).attr('data-principal','new principal');
					$(this).removeData('principal');
					$(this).text(ui.add);
				}
			});
		$('span:[data-principal="new principal"]',li).keydown(completePrincipal);
		$(ul).append ( li );
	}
	$('#caldialog').empty();
	$('#caldialog').css({overflow:'auto'});
	$('[data-prop=color]',ul).click ( colorClicked );
	$('#caldialog').append(ul);
	draggable ( $('#caldialog') );
	$('#caldialog').show();
	$('#caldialog li span:contains(name) + span').focus();
	$('#caldialog').append('<div class="button delete" tabindex="0">'+ui['delete']+'</div>');
	$('#caldialog').append('<div class="button done" tabindex="0" >'+ui.done+'</div>');
	$('#caldialog .button').bind ('click keypress',function (e) {
				if ( e.keyCode > 0 )
					if ( e.keyCode != 32 || e.keyCode != 13 )
						return ;
				if ( noprivs && $(this).hasClass('done') && saveSubscription() == true )  
				{
					$(e.target).closest('.calpopup').fadeOut();
					$('#wcal').removeData('popup'); 
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
				}
				else if ( $(this).hasClass('done') && saveCalendar() == true )   
				{
					$(e.target).closest('.calpopup').fadeOut();
					$('#wcal').removeData('popup'); 
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
				}
				if ( $(this).hasClass('delete') && delCalendar() == true ) 
				{
					$(e.target).closest('.calpopup').fadeOut();
					$('#wcal').removeData('popup'); 
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
				}
			}
			);
	$('#wcal').data('popup','#caldialog');
	$('#wcal').data('clicked', e.target);
	$(document).click( $('#wcal').data('edit_click') ); 
	$(document).keyup( $('#wcal').data('edit_keyup') ); 
}

function privilegeBox ( acl )
{
	var privd = {
		all:['bind','unbind','unlock'],
		read:['acl','free-busy','privileges'],
		write:['content','properties','acl'],
		'schedule-send':['invite','reply','freebusy'],
		'schedule-deliver':['invite','reply','query-freebusy']};
	var who = $('<span class="value privilegeOwner" data-principal="'+ $('principal',acl).text().trim() + '" >'+ $('principal',acl).text().trim() + '</span>' );

	$(document).caldav ('getProperties',{url: $('principal',acl).text().trim() },{'displayname':'DAV:'},
			function (a)
			{
				var matches = new Array;
				var text='';
				var m = $('response',a);
				var url = $('href:first',m).text().trim();
				var newtext = $('.privilegeOwner[data-principal="'+url+'"]')[0];
				newtext.childNodes[0].textContent = $('displayname',m).text().trim();
			});

	var box = $('<ul class="privilegeBox"></ul>');
	for ( var i in privd )
	{
		var hasPriv = $('grant ' + i ,acl).length>0?'granted':'';
		var granted = $('grant ' + i ,acl).length>0?'yes':'no';
		var li = $( '<li class="'+hasPriv+'" data-granted="'+granted+'" data-priv="'+i+'">'+i+'</li>');
		var line = $( '<ul></ul>');
		for ( var j=0;j<privd[i].length;j++)
		{
			var p = i=='all'?privd[i][j]:i+'-'+privd[i][j];
			if (p=='schedule-deliver-query-freebusy')
				p = 'schedule-query-freebusy';
			var hasPriv = $('grant ' + p ,acl).length>0?'granted':'';
			var granted = $('grant ' + p ,acl).length>0?'yes':'no';
			$(line).append('<li class="'+hasPriv+'" data-granted="'+granted+'" data-priv="'+p+'">' + privileges[privd[i][j]] + '</li>' );
		}
		$(li).append(line);
		$(box).append(li);
	}
	$('li',box).click(function (){$(this).toggleClass('granted');return false});
	$(who).append(box);
	return who;
}

function saveCalendar (e)
{
	var cd = $('#caldialog');
	var cal = $('#caldialog ul').data('calendar');
	var props ={'displayname':'name','calendar-color':'color','calendar-description':'description','calendar-order':'order'} ;
	var ns ={'displayname':'DAV:','calendar-color':'http://apple.com/ns/ical/','calendar-description':'urn:ietf:params:xml:ns:caldav','calendar-order':'http://apple.com/ns/ical/'} ;
	var edited = false;
	var modified = {};
	for ( var i in props ) 
	{
		var v = $('.label:contains('+ ui[props[i]] +') ~ .value',cd); 
		if ( $(v).length > 0 && $(v).text() != $(v).data('value') )
		{
			modified[i] = {name:i,value:$(v).text(),ns:ns[i]};
			edited = true;
		}
	}
	var privd = ['all','bind','unbind','unlock','read','read-acl','read-free-busy','read-privileges','write','write-content','write-properties','write-acl','schedule-send','schedule-send-invite','schedule-send-reply','schedule-send-freebusy','schedule-deliver','schedule-deliver-invite','schedule-deliver-reply','schedule-query-freebusy'];
	
	var principals = $('.label:contains('+ ui.privileges +') ~ .privilegeOwner',cd);
	for ( var p=0; p<principals.length; p++)
	{
		var owner = $(principals[p]).data('principal');
		var privs = [];
		var mod = false;
		for ( var j in privd )
		{
			var cp = $('li[data-priv="'+privd[j] +'"]',principals[p]);
			var g = $(cp).hasClass('granted');
			var pg = $(cp).data('granted');
			if ( g )
				privs.push(privd[j]);
			if ( ( g && pg == 'no' ) || ( ! g && pg == 'yes' ) )
				mod = true;
		}
		if ( mod )
			console.log('privileges changed for ' + owner,privs);
	}
	if ( cal == 'new' )
	{
		var v = $('.label:contains('+ ui.owner +') ~ .value',cd); 
		var owner = $(v).data('principal');
		var ownerName = $(v).text();
		var url = owner + guid();
		var cals = $(document).caldav('calendars');
		var p = $('#callist > li > span:contains('+ownerName+')').next();
		var i = cals.length;

		var color = modified['calendar-color'].value;
		console.log( 'color ' + color );
		var ss = styles.getStyleSheet ( 'calstyle' );
		ss.updateRule ( '.calendar'+i ,{ color: color }  );
		ss.updateRule ( '.calendar'+i +':hover',{ 'background-color': color } );
		ss.updateRule ( '.calendar'+i +'bg',{ 'background-color': color } );
		
		cals[i] = {};
		cals[i].order = modified['calendar-order'].value;
		cals[i].displayName = modified['displayname'].value;
		cals[i].desc = modified['calendar-description'].value;
		cals[i].href = url + '/';
		cals[i].url = $('.jqcaldav:first').data('caldavurl').replace(/([a-z])\/.*$/,'$1') +  url + '/'; 
		var ce = $('<li class="calendar'+i+'" order="'+cals[i].order+'" title="'+cals[i].desc+'"><input type="checkbox" id="calendar'+i+'" checked="true" /><span >'+cals[i].displayName+'</span></li>');
		$(ce)[0].addEventListener('drop',calDrop,true);
		$(ce)[0].addEventListener('dragenter', calDragEnter,true);
		$(ce)[0].addEventListener('dragover', calDragOver,true);
		$(ce).click (selectCalendar);
		$(ce).dblclick (editCalendar);
		$(ce).data(cals[i]);
		$(p).append(ce);
		eventSort(p);
	}
	else
	{
		if ( modified['calendar-color'] != undefined )
		{
			var color = modified['calendar-color'].value;
			var ss = styles.getStyleSheet ( 'calstyle' );
			ss.updateRule ( '.calendar'+cal ,{ color: color }  );
			ss.updateRule ( '.calendar'+cal +':hover',{ 'background-color': color } );
			ss.updateRule ( '.calendar'+cal +'bg',{ 'background-color': color } );
		}
		if ( modified['calendar-order'] != undefined )
		{
			$('#callist .calendar' + cal).attr('order',modified['calendar-order'].value);
			eventSort( $('#callist .calendar' + cal).parent() );
		}
		if ( modified['calendar-description'] != undefined )
			$('#callist .calendar' + cal).attr('title',modified['calendar-description'].value);
	}
	if ( edited )
	{
		console.log(modified); 
		if ( cal == 'new' )
			$(document).caldav('makeCalendar', {url:url},cal,modified);
		else
			$(document).caldav('updateCollection', {},cal,modified);
	}
	return true;
}

function delCalendar (e)
{
	var calendar = $('#caldialog > ul').data('calendar');
	var noprivs = false;
	var cals = $(document).caldav('calendars');
	if ( cals[calendar] == undefined )
	{
		cals = $('#wcal').data('subscribed');
		noprivs = true;
	}
	$('#wcal').data('drop-question',calendar);
	questionBox(deleteCalQuestion[0] + cals[calendar].displayName ,deleteCalQuestion[1],
					function(e) {
						var calendar = $('#wcal').data('drop-question');
						$('#wcal').removeData('drop-question');
						if ( e == 1 )
						{
							var cals = $(document).caldav('calendars');
							if ( cals[calendar] == undefined )
							{
								var cals = $('#wcal').data('subscribed');
								$('.calendar' + calendar).remove();
								for ( var j in subscriptions )
									if ( subscriptions[j] != undefined && subscriptions[j].url == cals[calendar].url && subscriptions[j].name == cals[calendar].displayName )
										subscriptions[j];
								delete cals[calendar];
								$('#wcal').data('subscribed',cals);
								var purl = '';
								var cals = $(document).caldav('calendars');
								for ( var j in cals )
								{
									if ( cals[j].mailto.match(RegExp($('#name').val(),'i')) )
									{
										purl = cals[j].principal;
										break ;
									}
								}
								var t = {0:{ns:"http://boxacle.net/ns/calendar/",name:'calendar-subscriptions',value:JSON.stringify(subscriptions)}};
								$(document).caldav('updateCollection', {url:purl},purl,t);
							}
							else
								$(document).caldav('delCalendar', calendar); 
						}
						return ;
					} );
	return true;
}

function deletedCalendar (c, r,s)
{
	if ( s == 'success' );
		$('.calendar' + c ).remove();
}

function completePrincipal(e)
{
	if ( ( e.keyCode == 13 || e.keyCode == 9 ) && $(e.target).prev().find('.selected').length > 0  )
	{
		$(e.target).text($(e.target).prev().find('.selected').text());
		$(e.target).attr('data-principal',$(e.target).prev().find('.selected').attr('data-href'));
		$(e.target).prev().children('.completion').empty();
		$(e.target).removeData('matches');
		$(e.target).blur();
		e.preventDefault();
		return false;
	}
	else if ( ( e.keyCode == 13 || e.keyCode == 9 ) && $(e.target).text().length > 1 && $(e.target).data('matches') )
	{
		$(e.target).text($(e.target).data('matches')[0].name);
		$(e.target).attr('data-principal',$(e.target).data('matches')[0].href);
		$(e.target).prev().children('.completion').empty();
		$(e.target).blur();
		e.preventDefault();
		return false;
	}
	else if ( e.keyCode == 13 )
	{
		e.preventDefault();
		return false;
	}
	else if ( e.keyCode == 40 ) // down arrow
	{
		if ( $(e.target).prev().children('.completion').children('.selected').length > 0 )
			$(e.target).prev().children('.completion').children('.selected').removeClass('selected').next().addClass('selected');
		else
			$(e.target).prev().children('.completion').children().first().addClass('selected');
		e.preventDefault();
		return false;
	}
	else if ( e.keyCode == 38 ) // uparrow
	{
		if ( $(e.target).prev().children('.completion').children('.selected').length > 0 )
			$(e.target).prev().children('.completion').children('.selected').removeClass('selected').prev().addClass('selected');
		else
			$(e.target).prev().children('.completion').children().last().addClass('selected');
		e.preventDefault();
		return false;
	}
	var s;
	if ( e.keyCode == 8 )
	{	
		s = $(e.target).text().slice(0,-1);
		if ( $(e.target).text().length < 1 )
		{ 
			e.preventDefault();
			return false;
		}
	}
	else
		s = $(e.target).text()+String.fromCharCode(e.keyCode);
	if ( s.length > 1 )
	{
		$(document).caldav ('searchPrincipals',{url: $('.jqcaldav:first').data('caldavurl')},'displayname',s,
			function (a)
			{
				var matches = new Array;
				var text='';
				var m = $('response',a);
				for (var i=0;i<m.length;i++)
				{
					matches.push({name:$('displayname',m[i]).text(),href:$('href',m[i]).text()});
					text += '<div data-href="'+$('href',m[i]).text()+'">' + $('displayname',m[i]).text() + '</div>';
				}
				$(e.target).data('matches',matches);
				var off = $(e.target).position();
				$(e.target).prev().css({top:off.top,left:off.left});
				$(e.target).prev().children('.completion').html(text);
				$(e.target).prev().children('.completion').children().first().addClass('selected');
				$(e.target).prev().children('.completion').children().click(function(a){$(e.target).text(a.target.textContent);
					$(e.target).attr('data-principal',$(a.target).attr('href'));
					$(a.target).parent().empty();
					a.stopPropagation();
					a.preventDefault();
			    return false;
					});
			});
	}
	else if ( $(e.target).prev().children('.complteion').children().length > 0 )
		$(e.target).prev().children('.completion').empty();
}

function keyboardSelector (e)
{	
	var et = $(e.target).prev().children('.completion');
	$('.highlighted',et).removeClass('highlighted');
	switch ( e.keyCode )
	{
		case 40:// ) // down arrow
			if ( $('.selected',et).length > 0 )
				$('.selected',et).removeClass('selected').next().addClass('selected');
			else
				$(et).children().first().addClass('selected');
			e.preventDefault();
			return false;
		case 38:  // uparrow
			if ( $('.selected',et).length > 0 )
				$('.selected',et).removeClass('selected').prev().addClass('selected');
			else
				$(et).children().last().addClass('selected');
			e.preventDefault();
			return false;
		case 32:  // space
			if ( e.spaceSelects !== true )
				return true;
		case 13:  // enter prevent default on enter
			e.preventDefault();
		case 9: 	// HTAB do not prevent default on tab
			return $('.selected',et); //return jquery object even if empty
		case 8: 	// prevent backspacing past the beginning of the field 
			return $(e.target).text().length == 0 ;
		case 27: // escape
			if ( e.removeOnEscape === true )
				$(this).prev().fadeOut(function(){$(this).remove();});
			else
				$(et).empty();
			e.preventDefault();
			return 'cancel';
	}
	if ( e.search === true && ! e.altKey && ! e.ctrlKey && ! e.metaKey && String.fromCharCode(e.keyCode).match(/[A-Za-z0-9.,:\=+-]/) )
	{
		var n = $.now();
		var lkt = $(e.target).data('lastKeypressTime');
		$(e.target).data('lastKeypressTime',n);
		e.preventDefault();
		$('.selected',et).removeClass('selected');
		var st = '';
		if ( n - lkt < 500 )
			st = $(e.target).data('lastKeypressString');
		st = st + String.fromCharCode(e.keyCode);
		$(e.target).data('lastKeypressString',st);
		var RE = new RegExp('^'+st,'i');
		var matches = $(et).children().filter(function(index){return RE.test($(this).text())});
		var RE = new RegExp(st,'i');
		if ( $(matches).length == 0 )
			matches = $(et).children().filter(function(index){return RE.test($(this).text())});
		if ( $(matches).length == 1 )
			$(matches).addClass('selected');
		else if ( $(matches).length > 1 )
			$(matches).addClass('highlighted');
		return false;
	}
	return true;
}

function addEvents ( e ,c, start, end )
{
	var dRX = /([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?[Zz]?/;
	for ( var i=0;i<e.length;i++ )
	{
		if ( e[i].text.length < 10 )
			continue ;
		var em = new String(e[i].text);
		var parsed = new iCal ( em );
		parsed.eTag =e[i].etag;
		for ( var ev in parsed.ics )
		{
			insertEvent ( e[i].href, parsed.ics[ev], c, start, end );
		}
	}
}

function addToDos ( e ,c )
{
	var dRX = /([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?[Zz]?/;
	for ( var i=0;i<e.length;i++)
	{
		if ( e[i].length < 10 )
			continue ;
		var em = new String(e[i].text);
		var parsed = new iCal ( em );
		for ( var ev in parsed.ics )
		{
			insertTodo ( e[i].href, parsed.ics[ev], c );
		}
	}
}

function addSubscribedEvents( c, start, end )
{
	var scals = $('#wcal').data('subscribed');
	if ( c < 0 )
	{
		for ( var s in scals )
			for ( var e in scals[s].events.ics )
				if ( scals[s].events.ics[e].TYPE == 'vevent' &&
						( scals[s].events.ics[e].vcalendar.vevent.dtstart.DATE > start && 
							scals[s].events.ics[e].vcalendar.vevent.dtstart.DATE < end ) )
					insertEvent(scals[s]['src']+'_event-'+e,scals[s].events.ics[e],s,start,end);
	}
	else
	{
		s = c;
		for ( var e in scals[s].events.ics )
			if ( scals[s].events.ics[e].TYPE == 'vevent' && 
					( scals[s].events.ics[e].vcalendar.vevent.dtstart.DATE > start && 
						scals[s].events.ics[e].vcalendar.vevent.dtstart.DATE < end ) )
				insertEvent(scals[s]['src']+'_event-'+e,scals[s].events.ics[e],s,start,end);
	}
}

var eventcount = 0;
function insertEvent ( href, icsObj, c, start, end , current)
{
	var desc = '';
	var now = (new Date()).getTime();
	if ( typeof end != "object" &&  typeof start != object && ( end < $('#wcal').data('firstweek' ) || start > $('#wcal').data('lastweek') ) )  
		return ;
	if ( icsObj.vcalendar.vevent == undefined && current == undefined )
	{
		for ( var i =0; i < icsObj.vcalendar.length; i++ )
			insertEvent ( href, icsObj, c, start, end, etag , i );
		return;	
	}
	else if ( icsObj.vcalendar.vevent == undefined && current > -1  )
		var cevent = icsObj.vcalendar[current].vevent;
	else
		var cevent = icsObj.vcalendar.vevent;
	if ( cevent.rrule != undefined )
	{
		var expan = cevent.rrule.RECURRENCE.expandRecurrence(cevent.dtstart.VALUE,dateAdd(end,'d',7));
	}
	var estart = cevent.dtstart.DATE;
	if ( cevent.dtend != undefined )
		var eend = cevent.dtend.DATE;
	else if ( cevent.duration != undefined )
		var eend = cevent.dtstart.DATE.addDuration ( cevent.duration.VALUE );
	else
		return;
	// make sure millisecond differences don't effect event durations
	var tdiff = Math.floor ( ( eend - estart ) / 100 ) * 100 ;
	var run = new Array ();
	if ( expan != undefined )
	{
		for ( var i in expan )
			if ( expan[i] > start && expan[i] < end )
				run[i] = expan[i];
	}
	else
		run[estart.DayString()] = estart;
	var otherOcurrences = $('#wcal li[uid='+cevent.uid.VALUE+'][original=0]');
	for ( var i in run )
	{
		var estart = run[i]; 
		if ( cevent.exdate != undefined )
		{
			if ( cevent.exdate.DATES )
			{
				if ( $.grep(cevent.exdate.DATES,function (v,i)
							{
								return cevent.exdate.DATES[i].getTime()==estart.getTime()?true:false;
							}).length > 0 )
					continue;
			}
			else if ( cevent.exdate.DATE.getTime() == estart.getTime() )
				continue;
		}
		if ( otherOcurrences.length )
		{
			var cont = false;
			for ( var z=0;z<otherOcurrences.length;z++ )
			{
				var oo = $(otherOcurrences[z]).data('ics');
				if ( oo.vcalendar.vevent == undefined  )
				{
					for ( var zz in oo.vcalendar )
						if ( oo.vcalendar[zz].vevent['recurrence-id'] != undefined && oo.vcalendar[zz].vevent['recurrence-id'].DATE == estart ) { cont = true; }
				}
				else
					if ( oo.vcalendar.vevent['recurrence-id'] != undefined && oo.vcalendar.vevent['recurrence-id'].DATE == estart ) cont = true;
			}
			if ( cont ) continue;
		}
		if ( cevent.summary && cevent.summary.VALUE != undefined )
			var summary = cevent.summary.VALUE;
		else
			var summary = '';
		/////////// handle alarms
		if ( cevent.valarm != undefined && estart.getTime() > now - 86400000 && estart.getTime() < now + 86400000 * 40 )
		{
			var alarms = [];
			if ( cevent.valarm.action != undefined )
				alarms.push(cevent.valarm);
			else
				alarms = cevent.valarm;
			for ( var A in alarms )
			{
				if ( debug ) console.log ( 'adding alert for ' + summary );
				if ( alarms[A].trigger != undefined && alarms[A].action.VALUE == "AUDIO" || alarms[A].action.VALUE == "DISPLAY" )
				{
					if ( alarms[A].trigger.DURATION != undefined )
					{
						if ( alarms[A].trigger.PROP && alarms[A].trigger.PROP.related && alarms[A].trigger.PROP.related == 'END' )
							var atime = new Date(eend.getTime()).localTzApply();
						else
							var atime = new Date(estart.getTime()).localTzApply();
						atime.addDuration(alarms[A].trigger.DURATION);
					}
					else if ( alarms[A].trigger.DATE != undefined )
					{
						var atime = alarms[A].trigger.DATE;
					}
					else 
						continue ;
					var atext = '';
					if ( alarms[A].description != undefined )
						atext = alarms[A].description;
					else
						atext = summary + ' ' + (atime.getTime()-now>86400000?estart.prettyDate():estart.prettyTime());
					if ( atime.getTime()-now <= 0 )
						continue;
					if (debug)console.log('alert in ' + ( atime.getTime()-now )/1000 + ' seconds: ' + atext ); 
					alerts.push(window.setTimeout(function(){$('#calalertsound')[0].play();alert(atext);alerts.shift();},atime.getTime()-now));
				}
			}
		}
		if ( tdiff <= 86400000 ) 
		{
			if ( tdiff < 86400000 )
			{
				desc = estart.prettyTime() + ' ';
				var time = estart.TimeString();
			}
			else
				var time = 0; 

			desc += summary; 
			var transp = cevent.transp!=undefined?cevent.transp.VALUE:'TRANSPARENT';
			var status = cevent.status!=undefined?'status="'+cevent.status.VALUE+'"':'';
			var duration = 0+parseInt(tdiff/900000)*15;
			if ( duration >= (settings.end.getLongMinutes() - settings.start.getLongMinutes() )/25*15 )
				duration = 1;
			var etime = parseInt(time/10000)*100;
			etime = etime + Math.round((parseInt(time/100)-etime )/15) * 15 ;
			var entry = new Array;
			if ( cevent['recurrence-id'] != undefined )
			{
				var entry = $('#day_' + cevent['recurrence-id'].DATE.DayString() + ' li[uid='+cevent.uid.VALUE+']' ).detach();
				var recurencesMoved = $('#wcal').data('cal'+c+href); 
				if ( typeof recurencesMoved != "object" )
					recurencesMoved = new Object ();
				recurencesMoved[cevent['recurrence-id'].VALUE] = eventcount;
				$('#wcal').data('cal'+c+href,recurencesMoved); 
				var b = true;
			}
			if ( entry.length == 0 )
				var entry = $('<li class="event calendar' + c + ' time' + etime + '" data-duration="' + duration + '" draggable="true" data-time="' + time + '" href="' + href + '" eventcount="'+eventcount+'" uid="' + cevent.uid.VALUE + '" instance="' + estart.DateString() +  '" transparent="' + transp + '" '+status+' >'+desc+'</li>');
			//if ( time == 0 )
			//	$(entry).addClass('calendar' + c + 'bg');
			$(entry).data('ics', icsObj);
			$(entry).attr('sequence',0);
			if ( cevent.sequence != undefined )
				$(entry).attr('icssequence',cevent.sequence.VALUE);
			if ( cevent['recurrence-id'] != undefined )
				$(entry).attr('original',0);
			else
				$(entry).attr('original',1);
			$(entry).click(	eventClick );
			if ( $(entry).length == 0 )
				continue;
			$(entry)[0].addEventListener('dragstart',calDragStart,true);
			$(entry)[0].addEventListener('dragend',calDragEnd,true);
			$(entry).hover(eventHover,eventMouseout);
			if ( $('#calendar'+c).val() )
				$(entry).hide();
			if ( $('#day_' +  estart.DayString() + ' li[href="'+href+'"]' ).length < 1 )
			{
				if ( $('#calendar'+c).val() )
					$(entry).appendTo($('#day_' +  estart.DayString() + ' ul.eventlist' )).fadeIn();
				else
					$(entry).appendTo($('#day_' +  estart.DayString() + ' ul.eventlist' ));
				$(entry).attr('style','');
				eventcount++;
				eventSort($('#day_' +  estart.DayString() + ' ul.eventlist' ));
			}
			else
			{
				$(entry).show();
				$('#day_' +  estart.DayString() + ' li[href="'+href+'"]' ).replaceWith(entry);
				eventcount++;
				eventSort($('#day_' +  estart.DayString() + ' ul.eventlist' ));
			}
		}
		else 
		{
			var time = '0.'+ estart.DayString() ; 
			desc += summary; 
			var transp = cevent.transp!=undefined?cevent.transp.VALUE:'OPAQUE';
			var entry = new Array;
			var currentevent = eventcount;
			if ( cevent['recurrence-id'] != undefined )
			{
				var entry = $('#day_' + cevent['recurrence-id'].DATE .DayString() + ' li[uid='+cevent.uid.VALUE+']' ).detach();
				var currentevent = $(entry).attr('eventcount');
				$('[eventcount='+$(entry).attr('eventcount')+']').remove();
			}
			var entry = $('<li class="event calendar' + c + ' calendar' + c + 'bg" draggable="true" data-time="' + time + '" href="' + href + '" eventcount="'+currentevent+'" uid="' + cevent.uid.VALUE + '" instance="' + estart.DateString() + '" transparent="' + transp + '" >'+desc+'</li>');
			if ( current != undefined )
				icsObj.current = current;
			$(entry).data('ics', icsObj);
			if ( cevent['recurrence-id'] != undefined )
				$(entry).attr('original',0);
			else
				$(entry).attr('original',1);
			if ( cevent.sequence != undefined )
				$(entry).attr('icssequence',cevent.sequence.VALUE);
			$(entry).addClass('multiday');
			$(entry).click(	eventClick );
			$(entry)[0].addEventListener('dragstart',calDragStart,true);
			$(entry)[0].addEventListener('dragend',calDragEnd,true);
			$(entry).hover(eventHover,eventMouseout);
			if ( $('#calendar'+c).val() )
				$(entry).hide();
			eventcount++;
			for (var j=0;j*86400000<tdiff;j++)
			{
				var nd = new Date(estart.getTime()+j*86400000);
				var cloned  = $(entry).clone(true);
				$(cloned).attr('sequence',j);
				if ( j == 0 )
					$(cloned).addClass('eventstart');
				if ( (j+1)*86400000 >= tdiff )
					$(cloned).addClass('eventend');
				$(cloned)[0].addEventListener('dragstart',calDragStart,true);
				$(cloned)[0].addEventListener('dragend',calDragEnd,true);
				if ( $('#day_' +  nd.DayString() + ' li[href="'+href+'"]' ).length < 1 )
				{	
					if ( $('#calendar'+c).val() )
						$(cloned).appendTo($('#day_' +  nd.DayString() + ' ul.eventlist' )).fadeIn();
					else
						$(cloned).appendTo($('#day_' +  nd.DayString() + ' ul.eventlist' ));
					$(cloned).attr('style','');
					eventSort($('#day_' +  nd.DayString() + ' ul.eventlist' ));
				}
				if ( j == 0 )
					$(entry).html('&nbsp;');
			}
		}
	}
}

function insertTodo ( href, icsObj, c  )
{
	var sortorder = icsObj.vcalendar.vtodo['x-apple-sort-order'];
	var desc = '';
	desc += icsObj.vcalendar.vtodo.summary.VALUE; 
	var entry = $('<li class="event calendar' + c + '" data-time="' + sortorder + '" href="' + href + '" uid="' + icsObj.vcalendar.vtodo.uid.VALUE + '" draggable="true" >'+desc+'</li>');
	$(entry)[0].addEventListener('dragstart',calDragStart,true);
	$(entry)[0].addEventListener('dragend',calDragEnd,true);
	$(entry).data('ics', icsObj );
	$(entry).hover(eventHover,eventMouseout);
	$(entry).click(eventClick); 
	$(entry).hide();
	if ( $('#caltodo ul li[href="' + href + '"]').length > 0 )
		$('#caltodo ul li[href="' + href + '"]').remove();
	$(entry).appendTo($('#caltodo ul' )).fadeIn();
	eventSort($('#caltodo ul' ));
}

function updateIcs ( href, ics , cal )
{   
	var t,cald = $('.jqcaldav:eq(0)').data('ics'+cal); 
	var i = ics.vcalendar;
	if ( typeof cald != "object" )
		cald = {cal:cal,vtimezone:{},vevent:{},vtodo:{},vjournal:{},hrefs:{},uid:{}};
	if ( i.vtimezone != undefined && cald.vtimezone[i.vtimezone.tzid.VALUE] == undefined )
		cald.vtimezone[i.vtimezone.tzid.VALUE] = $.extend(true,{},i.vtimezone);
	if ( i.vevent != undefined && cald.vevent[i.vevent.uid.VALUE+''+i.vevent.sequence!=undefined?i.vevent.sequence.VALUE:''] == undefined )
	{	
		var t = $.extend(true,{},i.vevent);
		cald.vevent[i.vevent.uid.VALUE+''+i.vevent.sequence!=undefined?i.vevent.sequence.VALUE:''] = t;
	}
	if ( i.vtodo != undefined && cald.vtodo[i.vtodo.uid.VALUE+''+i.vtodo.sequence!=undefined?i.vtodo.sequence.VALUE:''] == undefined )
	{	
		var t = $.extend(true,{},i.vtodo);
		cald.vtodo[i.vtodo.uid.VALUE+''+i.vtodo.sequence!=undefined?i.vtodo.sequence.VALUE:''] = t;
	}
	if ( i.vjournal != undefined && cald.vjournal[i.vjournal.uid.VALUE+''+i.vjournal.sequence!=undefined?i.vjournal.sequence.VALUE:''] == undefined )
	{
		var t = $.extend(true,{},i.vjournal);
		cald.vjournal[i.vjournal.uid.VALUE+''+i.vjournal.sequence!=undefined?i.vjournal.sequence.VALUE:''] = t;
	}
	if ( cald.hrefs[href] == undefined )
		cald.hrefs[href] = new Array;
	cald.hrefs[href].push(t);
	if ( cald.uid[t.uid] == undefined )
		cald.uid[t.uid] = new Array;
	cald.uid[t.uid].push(t);
	$('.jqcaldav:eq(0)').data('ics'+cal,cald); 
}

function calDragEnter(event) 
{ 
	var type='';
	if ( event.dataTransfer != undefined )
	{
		if ( event.dataTransfer.dropEffect == 'none' && ! event.altKey )
			event.dataTransfer.dropEffect = 'move'; 
		else if ( event.dataTransfer.dropEffect == 'none' && event.altKey )
			event.dataTransfer.dropEffect = 'copy'; 
		//event.dataTransfer.effectAllowed = 'copyMove'; 
		type = event.dataTransfer.getData('type');
	}
	if ( $('#wcal').has(event.target) && ! $('#caltodo').has(event.target) && ( event.target instanceof HTMLTableCellElement || event.target instanceof HTMLUListElement ) )
	{
		$('.drop').removeClass('drop');
		$('#caldrop').detach().prependTo($(event.target).closest('td'));
		$(event.target).closest('td').addClass('drop');
	}
	else if ( $('#caltodo').has(event.target) ) 
	{
		$(event.target).closest('ul').addClass('drop');
	}
	$('#wcal').addClass('dragging');
	event.preventDefault(); 
	event.stopPropagation();
	return false;
}

function calDragLeave(event) 
{
	event.preventDefault(); 
	event.stopPropagation();
	return false
}

function calDragOver(event) 
{
	if ( event.dataTransfer != undefined )
	{
		if ( event.dataTransfer.dropEffect == 'none' && ! event.altKey )
			event.dataTransfer.dropEffect = 'move'; 
		else if ( event.dataTransfer.dropEffect == 'none' && event.altKey )
			event.dataTransfer.dropEffect = 'copy'; 
		event.dataTransfer.effectAllowed = 'copyMove'; 
		type = event.dataTransfer.getData('type');
	}
	var e = $(event.target).closest('.drop');
	if ( e.length )
	{
		if ( $('#wcal').data('dragging') != undefined )
		{
			var hide = $($('#wcal').data('dragging')).attr('class').match(/calendar\d+bg/);
			if ( $($('#wcal').data('dragging')).data('duration') == 1 )
				hide = true;
			else
				hide = false;
			var s = $(e).offset();
			if ( $(event.target).parents('#wcal').length > 0 )
			{
				if ( ! hide && ( $('#wcal.weekview').length > 0 || ( event.pageX - s.left ) < ( e[0].clientWidth / 3 ) ) )
				{
					var t = (settings.start.getLongMinutes() + Math.round ( ((settings.end.getLongMinutes()-settings.start.getLongMinutes())/100) * ( (event.pageY - s.top ) / e[0].clientHeight ) ) * 100) / 100;
					var d = new Date();
					d.setUTCMinutes(0);
					d.setUTCHours(t);
					$('#caldrop').text(d.prettyTime());
					$('#caldrop').css('top',(s.top + ((e[0].clientHeight-$('#caldrop')[0].clientHeight) / ((settings.end.getLongMinutes()-settings.start.getLongMinutes())/100) ) * (t-(settings.start.getLongMinutes()/100)) )+'px');
					$('#caldrop').css('left',s.left+e[0].clientWidth/3+'px');
					$('#caldrop').css('width',e[0].clientWidth*2/3+'px');
					$('#caldrop').show();
				}
				else
					$('#caldrop').hide();
			}
			else
				$('#caldrop').hide();
		}
	}
	event.preventDefault(); 
	event.stopPropagation();
	return false;
}

function calDrop(e) 
{
    // drop the data
		//console.log(e);
		e.preventDefault();
		$('#wcal').removeClass('dragging');
		$(e.target).closest('td').removeClass('drop');
		var old = $('#wcal').data('dragging');
		e.preventOK = true;
		if ( e.currentTarget != undefined )
			e.cTarget = e.currentTarget;
		if ( old != undefined && $(old).data('ics').vcalendar.vevent.rrule != undefined && e.moveAll == undefined )
		{
			$('#wcal').data('drop-question',e);
			questionBox(dropquestion[0],dropquestion[1],
					function(e) {
						var evt = $('#wcal').data('drop-question');
						$('#wcal').removeData('drop-question');
						evt.moveAll = e == 0 ? true : false ;
						calDrop(evt);
					} );
			return false;
		}
		if ($('#caldrop').css('display') == 'none' || $(old).attr('class').match(/calendar\d+bg/) )
			var newtime = undefined ;
		else
			var newtime = (new Date()).parsePrettyTime($('#caldrop').text());
		$('.drop').removeClass('drop');
		$('#caldrop').detach().hide().appendTo('#wcal');
		if ( old != null )
		{
			var sb = $(e.target).parents('#callist').length; 
			if ( sb >= 1 )
			{
				$('#wcal').removeData('dragging');
				var src = $(old).attr('href');
				var ics = $(old).data('ics');
				var c = $(e.target).closest('li').first().attr('class').match(/calendar(\d+)/)[1];
				if ( ! e.altKey )
					$('[href="'+src+'"]').detach();
				var cals = $(document).caldav('calendars');
				var cal  = $(old).attr('class').match (/calendar([0-9]+)\s?/);
				if ( cal[1] != undefined )
				{
					if ( ! e.altKey )
					{  // move the event
						var params = { url:cals[cal[1]].url.replace(/(.*?\.[a-zA-Z]+)\/.*/,'$1'+src),
							headers:{Destination:cals[c].url+src.replace(/^.*\//,''),Overwrite:'F','Content-type':undefined},
							username:$('#name').val(),password:$('#pass').val()};
						$(document).caldav('moveEvent',params ); 
					}
					else
					{  // copy the event
						var params = { url:cals[c].url+src.replace(/^.*\//,''),
							headers:{'If-None-Match':'*'},
							username:$('#name').val(),password:$('#pass').val()};
						$(document).caldav('putNewEvent',params,ics.PARENT.toString() );
					}
					insertEvent(cals[c].href+src.replace(/^.*\//,''),ics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
				}
			}
			else
			{
				var np = $(e.cTarget).closest('td');
				$('#wcal').removeData('dragging');
				var src = $(old).attr('href');
				var ics = $(old).data('ics');
				var c = $(old).attr('class').match(/calendar(\d+)/)[1];
				var d1 = (new Date()).parseDate($(old).closest('td').attr('id').match(/day_(\d+)/)[1]);
				var d2 = (new Date()).parseDate($(np).closest('td').attr('id').match(/day_(\d+)/)[1]);
				var tdiff = ics.vcalendar.vevent.dtend.DATE.getTime() - ics.vcalendar.vevent.dtstart.DATE.getTime() ;	
				if ( e.moveAll === false )
				{
					$(old).detach();
					var nics = $.extend(true,{},ics);
					nics.vcalendar.vevent.dtstamp = (new Date()).DateString ( );
					nics.vcalendar.vevent.sequence.VALUE++;
					var start = d1;
					var expan = ics.vcalendar.vevent.rrule.RECURRENCE.expandRecurrence(ics.vcalendar.vevent.dtstart.VALUE,dateAdd(start,'d',2));
					delete nics.vcalendar.vevent.rrule;
					delete nics.vcalendar.vevent.exdate;
					for ( var i in expan )
						if ( expan[i] >= start)
						{
							var estart = expan[i];
							break ;
						}
					nics.vcalendar.vevent['recurrence-id'] = nics.PARENT.newField ('RECURRENCE-ID',estart,nics.vcalendar.vevent.dtstart.PROP); 
					var nstart = new Date ( estart.getTime() + ( d2.getTime() - d1.getTime() ) ); 
					if ( newtime != undefined )
						nstart.setUTCHours( newtime.getUTCHours() ); 
					var dur = ics.vcalendar.vevent.dtend.DATE.getTime() - ics.vcalendar.vevent.dtstart.DATE.getTime() ;	
					var nend = new Date ( estart.getTime() + dur );
					nics.vcalendar.vevent.dtstart = nics.PARENT.newField ( 'dtstart', nstart, nics.vcalendar.vevent.dtstart.PROP );
					nics.vcalendar.vevent.dtend = nics.PARENT.newField ( 'dtend', nstart, nics.vcalendar.vevent.dtstart.PROP );
					nics.PARENT = ics.PARENT;
					ics.PARENT.push ( nics.vcalendar );
					var params = { url:src};
					$(document).caldav('putEvent',params,ics.PARENT.toString() ); 
					insertEvent(src,nics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
					return ;
				}
				else if ( e.moveAll === true )
				{
					$('li[uid="'+ics.vcalendar.vevent.uid.VALUE+'"][original=1][href="'+src+'"]').detach();
					var tdiff = d2.getTime() - d1.getTime() ;
					if ( ics.vcalendar.vevent.rrule.RECURRENCE.UNTIL != undefined )
						ics.vcalendar.vevent.rrule.RECURRENCE.UNTIL = (new Date()).DateString ( new Date ( (new Date()).parseDate(ics.vcalendar.vevent.rrule.RECURRENCE.UNTIL).getTime() + tdiff ) );
				}
				else
				{
					var tdiff = ics.vcalendar.vevent.dtend.DATE.getTime() - ics.vcalendar.vevent.dtstart.DATE.getTime() ;	
					$(old).detach();
					$('li[uid="'+ics.vcalendar.vevent.uid.VALUE+'"][original=1][href="'+src+'"]').detach();
				}
				var tdiff = d2.getTime() - d1.getTime() ;
				if ( newtime != undefined )
					tdiff += ( newtime.getUTCHours() - (ics.vcalendar.vevent.dtstart.DATE.getUTCHours())) * 3600000;
				ics.vcalendar.vevent.dtstart.ORIGDATE = ics.vcalendar.vevent.dtstart;
				ics.vcalendar.vevent.dtstart.UPDATE ( new Date ( ics.vcalendar.vevent.dtstart.DATE.getTime() + tdiff ) );
				ics.vcalendar.vevent.dtend.UPDATE ( new Date ( ics.vcalendar.vevent.dtend.DATE.getTime() + tdiff ) );
				var params = { url:src};
				$(document).caldav('putEvent',params,ics.PARENT.toString() ); 
				insertEvent(src,ics,c,$('#wcal').data('firstweek' ),$('#wcal').data('lastweek'));
			}
		}
		else
		{
			// * XXX TODO FIXME clipboard events should work!
			if ( e.dataTransfer != undefined )
				var dt = e.dataTransfer;
			else if ( e.originalEvent.dataTransfer != undefined )
				var dt = e.originalEvent.dataTransfer;
			else
				var dt = { files: undefined };
			if ( window.File && window.FileReader && window.FileList && dt.files.length > 0 )
			{
				var sb = $(e.target).parents('#callist').length; 
				var f = dt.files[0];
				var cReader = new FileReader();
				if ( sb >= 1 )
					cReader.calendar = $(e.target).closest('li').first().attr('class').match(/calendar(\d+)/)[1];
				cReader.onload = function (evt) {
						var c = $('#callist li.selected'); 
						if ( evt.target.calendar != undefined )
							c = evt.target.calendar;
						else if ( c.length > 0 )
							c = $(c).attr('class').match(/calendar(\d+)/)[1];
						else 
							c = 0;
						var cals = $(document).caldav('calendars');
						var src  = cals[c].href + guid() ;
						var params = { url:src};
						$(document).caldav('putNewEvent',params,evt.target.result); 
						var ic = new iCal ( String  ( evt.target.result ) );
						insertEvent(src ,ic.ics[0],c,$('#wcal').data('firstweek'),$('#wcal').data('lastweek'));
						};
				cReader.readAsText(f, "UTF-8");
			}
			else
			{
				console.log(dt.types);
				console.log(dt.files);
	    	var data = dt.getData('text/plain');
	    	var data1 = dt.getData('com.apple.pasteboard.promised-file-url');
	    	var data2 = dt.getData('Text');
				console.log(data);
	    	//var data1 = e.dataTransfer.getData(data);
				//console.log(data1);
				//var ical = parseiCal ( data );
			}
		}
}

function calDragStart(event)
{
	if (event.target instanceof HTMLLIElement) {
		var cal = $(event.target).attr('class').match(/calendar(\d+)/)[1];
		var cals = $(document).caldav('calendars');
		if ( cals[cal] == undefined )
		{
			event.preventDefault();
			return false;
		}
		if ( $('#wcal').has(this) )
      event.dataTransfer.setDragImage(event.target,($(event.target).width()*(2/3)),1);
		else
      event.dataTransfer.setDragImage(event.target);
		var ics = $(event.target).data('ics').PARENT.printiCal();
    event.dataTransfer.setData('text/calendar', ics );
    event.dataTransfer.setData('type', ics.TYPE );
    event.dataTransfer.setData('Text', ics );
		if ( cals[cal] != undefined )
		  event.dataTransfer.setData('DownloadURL', 'text/calendar:event.ics:' + $('.jqcaldav:eq(0)').data('caldavurl') + $(event.target).attr('href') );
		$('#wcal').data('dragging', $(event.target));
		$('#wcal').addClass('dragging');
		$('#calpopup').hide();
		$('#calpopupe').remove();
		if ( cals[cal] != undefined )
		  event.dataTransfer.effectAllowed = 'copyMove'; // only allow copy or move
		else
		  event.dataTransfer.effectAllowed = 'copy'; // only allow copy on subscribed calendars
		return true;
	} else {
      event.preventDefault(); // don't allow selection to be dragged
	}
}

function calDragEnd(e) 
{
	$('#caldrop').hide();
	$('.drop').removeClass('drop');
	//$('#wcal').removeData('dragging');
	$('#wcal').removeClass('dragging');
}

function newevent (e)
{
	$('#calpopupe').remove();
	$('#calpopup').clone(true).attr('id','calpopupe').removeClass('left right bottom').appendTo('#calwrap');
	$('#wcal').data('popup','#calpopupe');
	$('#calpopup').hide();
	$('#calpopupe').hide();
	$('#calpopupe .value').attr('contentEditable',true);
	$('#calpopupe .value').attr('spellcheck','true');
	$(document).click( $('#wcal').data('edit_click') ); 
	$(document).keyup( $('#wcal').data('edit_keyup') ); 

	var pop = $('#calpopupe');
	var c = $('#callist li.selected'); 
	if ( c.length > 0 )
		c = $(c).attr('class').match(/calendar(\d+)/)[1];
	else
		c=0;
	var type;
	if ( $(e.target).closest('td') )
	{
		var d = (new Date()).parseDate($(e.target).closest('td').attr('id').match(/day_(\d+)/)[1]);
		type = 'event';
	}
	else if ( $(e.target).closest('div').attr('id') == 'caltodo' )
	{
		type = 'todo';
	}

	var ics = new iCal();
	ics = ics.ics[0];
	ics.vcalendar['v'+type].uid = ics.PARENT.newField('UID',guid());
	$(pop).data('ics',ics);
	$(pop).attr('href', '+&New Event');
	$(pop).empty();
	$(pop).append('<div class="button done" tabindex="0">'+ui.done+'</div>');
	$('.calpopup .done').bind ('click keypress',function (e) {
				if ( e.keyCode > 0 )
					if ( e.keyCode != 32 || e.keyCode != 13 )
						return ;
				if ( eventEdited() == true ) 
				{
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keydown',$('#wcal').data('edit_keyup')); 
				}
			}
			);
	var ul = $('<ul></ul>');
	$(ul).append('<li><span class="label">'+fieldNames.summary+'</span><span class="value">'+ui['New Event']+'</span></li>');
	
	d.setUTCHours((new Date()).getHours());
	$(ul).append('<li><span class="label">'+fieldNames.dtstart+'</span><span class="value">'+d.prettyDate() +'</span></li>');
	d.setUTCHours(d.getUTCHours()+1);
	$(ul).append('<li><span class="label">'+fieldNames.dtend+'</span><span class="value">'+d.prettyDate() +'</span></li>');
	$(pop).append(ul);
	var off = $(e.target).offset();
	var popoff = {width: 280, height: 330 };
	if ( off.left + e.target.offsetWidth + popoff.width > window.innerWidth )
	{	$(pop).css({left:(off.left - (popoff.width+17))}); $(pop).removeClass('left').removeClass('right'); }
	else
	{	$(pop).css({left:off.left + e.target.offsetWidth});$(pop).removeClass('right').addClass('left'); }
	if ( off.top + popoff.height > window.innerHeight )
	{	$(pop).css({top:(off.top-(popoff.height-100))}); $(pop).addClass ('bottom'); }
	else
	{	$(pop).css({top: off.top }); $(pop).removeClass('bottom'); }

	$('#calpopupe .value,.evheader').attr('contentEditable',true);
	$('#calpopupe .evheader').focus();
	$('#calpopupe .value,.evheader').attr('spellcheck','true');
	$('#calpopupe').data('event', '#calpopupe' );
	$('#calpopupe').data('ics',ics);
	draggable ( $('#calpopupe') );
	$('#wcal').data('clicked', $(pop));
	$(document).click( $('#wcal').data('edit_click') );
	$(document).keyup( $('#wcal').data('edit_keyup') );
	$('#calpopupe').show();
}

function eventHover (e) 
{
	if ( $('#wcal').data('clicked') == e.target || $('#wcal').data('dragging') != undefined )
		return ;
	var pop = $('#calpopup');
	if ( $('#wcal').data('popup') )
		return ;
	$('#wcal').data('popup','#calpopup');
	$(pop).data('event', e.target);
	var d = $(e.target).data('ics');

	$(pop).empty();
	var ul = $('<ul></ul>').appendTo(pop);
	
	if ( d.vcalendar.vevent != undefined )
	{
		var estart = d.vcalendar.vevent.dtstart.DATE;
		var eend = d.vcalendar.vevent.dtend.DATE;
		var tdiff = eend - estart;
		if ( d.vcalendar.vevent.rrule != undefined )
		{
			var start = (new Date()).parseDate($(e.target).attr('instance'));
			var expan = d.vcalendar.vevent.rrule.RECURRENCE.expandRecurrence(d.vcalendar.vevent.dtstart.VALUE,dateAdd(start,'d',2));
			var run = new Array ();
			if ( expan != undefined )
			{
				for ( var i in expan )
					if ( expan[i] >= start)
					{
						estart = expan[i];
						break ;
					}
				eend = new Date ( estart.getTime() + tdiff );
			}
		}
		
		var missing= new Array (),type = 'vevent', duration=false;
		var props = [];
		props.push('summary');
		if ( tdiff == 86400000 ) 
			duration = true;
		props.push('ESTART');
		props.push('EEND');
		for ( var x in d.PARENT.components.vevent.optional){props.push(d.PARENT.components.vevent.optional[x]); }
		if ( d.vcalendar[type].valarm != undefined )
		{
			props.push('valarm');
		}
		d.vcalendar[type]['ESTART'] = d.PARENT.newField('DTSTART',estart);
		d.vcalendar[type]['EEND'] = d.PARENT.newField('DTEND',eend);
	}
	else if ( d.vcalendar.vtodo != undefined )
	{	
		var props = [],type = 'vtodo';
		props.push('summary');
		for ( var x in d.PARENT.components.vtodo.required){props.push(d.PARENT.components.vtodo.required[x]); }
		for ( var x in d.PARENT.components.vtodo.optional){props.push(d.PARENT.components.vtodo.optional[x]); }
	}
	var used = [];
	for ( var x in props )
	{
		var extra = '';
		switch ( props[x] )
		{
			case 'ESTART':
				var extra = duration?'extra="'+recurrenceUI.on+'"':'';
				var label = fieldNames['dtstart'];
				break;
			case 'EEND':
				var extra = duration?'extra="'+recurrenceUI.until+'"':'';
				var label = fieldNames['dtend'];
				break;
			case 'DURATION':
				var label = fieldNames['duration'];
				break;
			case 'valarm':
				used.push(props[x]);
				var li = $('<li><span class="label alarm" >'+ui.alarm+'</span></li>');
				$(li).append(printAlarm(d.vcalendar[type][props[x]]));
				$(ul).append(li);
				continue;
			default:
				if ( used.indexOf(props[x]) != -1 )
					continue;
				if ( props[x] == 'dtend' && x != 'to' && x != 'until' )
					continue;
				if ( ! d.PARENT.fields[props[x]] && props[x] != 'summary' )
					continue;
				else if ( ! d.PARENT.fields[props[x]].visible )
					continue;
				var label = fieldNames[props[x]];
				used.push(props[x]);
		}
		if ( d.vcalendar[type][props[x]] )
		{
			if ( d.vcalendar[type][props[x]].length > 1 )
				$(ul).append('<li><span class="label '+props[x]+'" '+extra+' >'+label+'</span><span class="value" data-value="'+d.vcalendar[type][props[x]] +'" >'+d.vcalendar[type][props[x]] +'</span></li>');
			else
				$(ul).append('<li><span class="label '+props[x]+'" '+extra+' >'+label+'</span><span class="value" data-value="'+d.vcalendar[type][props[x]] +'" >'+d.vcalendar[type][props[x]] +'</span></li>');
		}
		else if ( props[x] == 'summary' )
			$(ul).append('<li><span class="label '+props[x]+'" '+extra+' >'+label+'</span><span class="value" data-value="" ></span></li>');
	}
	var off = $(e.target).offset();
	var popoff = {width: 280, height: 330 };
	if ( off.left + e.target.offsetWidth + popoff.width > window.innerWidth )
	{$(pop).css({left:(off.left - (popoff.width+30))}); $(pop).removeClass('left').addClass('right'); }
	else
	{	$(pop).css({left:off.left + e.target.offsetWidth+9});$(pop).removeClass('right').addClass('left'); }
	if ( off.top + popoff.height - 40 > window.innerHeight )
	{	$(pop).css({top:(off.top-(popoff.height-100))}); $(pop).addClass ('bottom'); }
	else
	{		$(pop).css({top: off.top }); $(pop).removeClass('bottom'); }
	$(pop).show();
}

function eventMouseout()
{
	$('#calpopup').hide();
	if ( $('#wcal').data('popup') == '#calpopup') 
		$('#wcal').removeData('popup');
}

function eventClick(e)
{
	$('#calpopupe').remove();
	e.stopPropagation();
	eventHover(e);
	var cp = $($('#wcal').data('popup'));
	var href = $($(cp).data('event')).attr('href');
	var cals = $(document).caldav('calendars');
	var c = $($(cp).data('event')).attr('class').match(/calendar(\d+)/)[1];
	if ( cals[c] != undefined ) 
		$(document).caldav('lock',href,600,function(){});
	$('#calpopup').clone(true).attr('id','calpopupe').removeClass('left right bottom').appendTo('#calwrap');
	$('#wcal').data('popup','#calpopupe');
	$('#calpopupe').data('overflow',0);
	$('#calpopup').hide();
	var lh = $('#calpopupe').innerHeight() - $('#calpopupe').height();
	if ( $('#calpopupe > ul').outerHeight()  + lh * 1.5 + 10 > $('#calpopupe').height() )
		$('#calpopupe').height($('#calpopupe > ul').outerHeight()  + lh * 1.5 + 10);
	$('#calpopupe').data('fields',fieldNames);
	$('#calpopupe > ul').append('<li><div class="completionWrapper"><div class="completion"></div></div><span class="add button dropdown">'+ui.add+'</span></li>');
	$('#calpopupe .value').focus(fieldClick);
	$('#calpopupe .add').click(addField);
	$('#calpopupe').css('opacity',1);
	if ( cals[c] != undefined ) 
	{
		$('#calpopupe').append('<div class="button delete" tabindex="0">'+ui['delete']+'</div>');
	$('#calpopupe').append('<div class="button done" tabindex="0">'+ui.done+'</div>');
	$('#calpopupe .done').bind ('click keypress',function (e) {
				if ( e.keyCode > 0 )
					if ( e.keyCode != 32 || e.keyCode != 13 )
						return ;
				if ( eventEdited() == true ) 
				{
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keydown',$('#wcal').data('edit_keyup')); 
				}
			}
			);
	$('#calpopupe .delete').bind ('click keypress',function (e) {
				if ( e.keyCode > 0 )
					if ( e.keyCode != 32 || e.keyCode != 13 )
						return ;
				var t = $($('#calpopupe').data('event'));
				var c = $(t).attr('class').match(/calendar(\d+)/)[1];
				var src = $(t).attr('href');
				var cals = $(document).caldav('calendars');
				eventDeleted(e);	
				$(document).unbind('click',$('#wcal').data('edit_click')); 
				$(document).unbind('keydown',$('#wcal').data('edit_keyup')); 
				$('#calpopupe').hide();
				$('#calpopupe').remove();
				$('#wcal').removeData('clicked');
			}
			);
		$('#calpopupe .value,.evheader,#calpopupe .action,#calpopupe .length').attr('contentEditable',true);
		$('#calpopupe .value,.evheader').attr('spellcheck','true');
		$('#calpopupe .value:first').focus();
	}
	draggable ( $('#calpopupe') );
	$('#calpopupe').show();
	$('#wcal').data('clicked', e.target);
	$(document).click( $('#wcal').data('edit_click') ); 
	$(document).keyup( $('#wcal').data('edit_keyup') ); 
	//return false;
}

function fieldClick(e)
{
	var cp = $($('#wcal').data('popup'));
	var d = $($(cp).data('event')).data('ics');
	var label = $(e.target).prev().text();
	for ( var i in fieldNames )
		if ( fieldNames[i] == label )
			break;
	if ( d.PARENT.fields[i] && d.PARENT.fields[i].values && d.PARENT.fields[i].values[d.TYPE] && d.PARENT.fields[i].values[d.TYPE].length> 0 )
	{
		var options = d.PARENT.fields[i].values[d.TYPE];
		var currentValue = $(e.target).text();
		var txt = '<div class="completionWrapper"><div class="completion"><div class="remove" text="'+ui['delete']+'"></div>';
		for ( var j = 0; j < options.length; j++ )
			txt = txt + '<div'+ (valueNames[options[j]]==currentValue?' class="selected" ':'') +'>'+valueNames[options[j]]+'</div>';
		txt = txt + '</div></div>';
		var comp = $(txt);
		$(comp).children().click(function(evt){$(evt.target).parent().parent().next().text($(evt.target).text());
			$(evt.target).parent().parent().fadeOut(function(){$(this).remove();popupOverflowAuto();});
			return false;
		});
		$(e.target).bind('keydown',function (e2){ 
			e2.spaceSelects = true; 
			e2.search = true; 
			e2.removeOnEscape = true; 
			var k = keyboardSelector(e2);
			if ( k == 'cancel' )
			{
				$('#wcal').data('eatCancel',true);
				$(this).unbind('blur');
				popupOverflowAuto();
				e2.stopPropagation();
				return false;
			}
			else if ( $(k).length == 1 )
			{
				$(this).unbind('blur');
				$(this).text($(k).text());
				$(this).prev().fadeOut(function(){$(this).remove();popupOverflowAuto();});
				var ret = e2.which==9;	
				return ret;
			}	
			else
				return k;
			},false);
		$(comp).css({top:$(e.target).position().top,left:$(e.target).position().left,'margin-left':'2em'});
		$(e.target).bind('blur',function(evt){$(evt.target).prev().fadeOut(function(){$(this).remove();popupOverflowAuto();});$(this).unbind(evt);});
		popupOverflowVisi();
		$(e.target).before(comp);
	}
}

function addField(e)
{
	if ( $(this).prev().children('.completion').children().length > 0 ) 
	{
		$(this).prev().children('.completion').empty();
		return;
	}
	$(e.target).focus();
	var off = $(e.target).position();
	$(e.target).prev().css({top:off.top-$(e.target).height()*10,left:off.left+$(e.target).outerWidth()});
	var cp = $($('#wcal').data('popup'));
	var c = $($(cp).data('event')).attr('class');
	var d = $($(cp).data('event')).data('ics');
	var cF = $('.label',cp);
	var currentFields=[];
	for ( var i in fieldNames )
	{
		var labels = $('.label:contains('+ fieldNames[i] +')',cp);
		for ( var j=0;j<labels.length;j++ )
			if ( $(labels[j]).text() == fieldNames[i] )
				currentFields.push(i);
	}
	var type = d.TYPE.toLowerCase();
	var allfields = $.extend(true,{},d.PARENT.fields);
	allfields.valarm={max:-1,visible:true};
	var possibleFields = d.PARENT.components[type].optional.slice();
	possibleFields.push('valarm');
	var showFields = [];
	for ( var j in possibleFields )
	{
		var i = possibleFields[j];
		if ( ! allfields[i].visible )
			continue ;
		if ( allfields[i].max == -1 )
			showFields.push(i);
		if ( allfields[i].max == 1 && currentFields.indexOf(i) == -1 )
			showFields.push(i);
	}
	if ( showFields.length < 1 )
		return;
	$(cp).css({overflow:'visible'});
	showFields.sort(function(a,b){if(fieldNames[a]>fieldNames[b]) return 1; if(fieldNames[a]<fieldNames[b]) return -1; return 0;});
	var txt = '';
	for ( var i = 0; i < showFields.length; i++ )
		txt = txt + '<div data-field="'+showFields[i]+'" >'+fieldNames[showFields[i]]+'</div>';
	$(this).prev().children('.completion').append(txt);
	$(this).prev().children('.completion').children().click(function(e)
		{
			var txt = $('<li><span class="label">'+$(this).text()+'</span><span class="value" contenteditable="true" spellcheck="true"></span></li>');
			if ( $(this).text() == ui.alarm )
			{
				var plus = $('<span><span class="alarm"><span class="action" contenteditable="true">'+valueNames.AUDIO+'</span><span class="value" contenteditable="true">15</span><span class="length" contenteditable="true" >'+durations['minutes before']+'</span></span></span>').append($('<span class="plus">'+ui.add+'</span>').click(function(){$(this).before('<span class="alarm"><span class="action" contenteditable="true">'+valueNames.AUDIO+'</span><span class="value" contenteditable="true">15</span><span class="length" contenteditable="true" >'+durations['minutes before']+'</span><span class="related" contenteditable="true" >'+valueNames.START+'</span></span>');$('.action,.length,.related',$(this).prev()).bind('click, focus',alarmFieldClick);}));
				$('.value',txt).replaceWith(plus);
				$('.action,.length,.related',txt).bind('click, focus',alarmFieldClick);
				var cp = $(this).closest('li').before(txt);
			}
			else
			{
				$('.value',txt).focus(fieldClick);
				var cp = $(this).closest('li').before(txt);
				$(cp).prev().children('.value').focus();
			}
			$(e.target).parent().empty();
			popupOverflowAuto();
			return false;
		});
	$(e.target).keydown(function (e2){ 
			e2.spaceSelects = true; 
			e2.search = false; 
			var k = keyboardSelector(e2);
			if ( k == 'cancel' )
			{
				$(e.target).prev().empty();
				popupOverflowAuto();
				return false;
			}
			if ( $(k).length == 1 )
			{
				var txt = $('<li><span class="label">'+$(k).text()+'</span><span class="value" contenteditable="true" spellcheck="true"></span></li>');
				if ( $(this).text() == ui.alarm )
				{
					var plus = $('<span></span>').append($('<span class="plus">'+ui.add+'</span>').click(function(){$(this).before('<span class="alarm"><span class="action" contenteditable="true">'+valueNames.AUDIO+'</span><span class="value" contenteditable="true">15</span><span class="length" contenteditable="true" >'+durations['minutes before']+'</span><span class="related" contenteditable="true" >'+valueNames.START+'</span></span>');}));
					$('.value',txt).replaceWith(plus);
					var cp = $(this).closest('li').before(txt);
					$('.action,.length,.related',cp).bind('click, focus',alarmFieldClick);
				}
				else
				{
					$('.value',txt).focus(fieldClick);
					var cp = $(this).closest('li').before(txt);
					$(cp).prev().children('.value').focus();
				}
				$(k).parent().empty();
				popupOverflowAuto();
				return false;
			}
			else
				return k;
			});

	
	console.log(showFields);
}

function printAlarm(a)
{
	var alarms = [];
	if ( a.action != undefined )
		alarms.push(a);
	else
		alarms = a;
	console.log( alarms.length + ' alarms' );
	var ret  = $('<span><span>');
	for ( var A in alarms )
	{
		if ( alarms[A].trigger != undefined && alarms[A].action.VALUE == "AUDIO" || alarms[A].action.VALUE == "DISPLAY" )
		{
			if ( alarms[A].trigger.DURATION != undefined )
			{
				var atime = alarms[A].trigger.DURATION;
				if ( atime.minutes > 0 )
					var avalue = atime.minutes,type='minutes';
				if ( atime.hours > 0 )
					var avalue = atime.hours,type='hours';
				if ( atime.days > 0 )
					var avalue = atime.days,type='days';
				if ( atime.weeks > 0 )
					var avalue = atime.weeks,type='weeks';
				if ( atime.negative )
					var type = type + ' before';
				else
					var type = type + ' after';
			}
			else if ( alarms[A].trigger.DATE != undefined )
			{
				var avalue = alarms[A].trigger.DATE.prettyDate();
				var type = 'on date';
			}
			else 
				continue ;
			var atext = '';
			if ( alarms[A].description != undefined )
				atext = alarms[A].description;
			var related = valueNames.START;
			if ( alarms[A].trigger.PROP && alarms[A].trigger.PROP.related && alarms[A].trigger.PROP.related != undefined )
				related = valueNames[alarms[A].trigger.PROP.related];
			$(ret).append('<span class="alarm"><span class="action" contenteditable="true" data-value="'+alarms[A].action.VALUE+'" >'+valueNames[alarms[A].action.VALUE]+
					'</span><span class="value" contenteditable="true" >'+avalue+'</span><span class="length" contenteditable="true" >'+durations[type]+'</span>'+
					'<span class="related" contenteditable="true" >'+related+'</span></span>');
		}
	}
	var plus = $('<span class="plus">'+ui.add+'</span>').click(function(){ var n = $('<span class="alarm"><span class="action" contenteditable="true" >'+valueNames.AUDIO+'</span><span class="value" contenteditable="true" >15</span><span class="length" contenteditable="true" >'+durations['minutes before']+'</span><span class="related" contenteditable="true" >'+valueNames.START+'</span></span>');$('.action,.length,.related',n).bind('click, focus',alarmFieldClick);$(this).before(n);});
	$(ret).append(plus);
	$('.action,.length,.related',ret).bind('click, focus',alarmFieldClick);
	return ret;
}

function alarmEdited ( valarm , data, event ) 
{
	var alarms = [],add=false;
	var edited = false;
	if ( valarm != undefined && valarm.action != undefined )
		alarms.push(valarm);
	else if ( valarm != undefined && valarm.length > 1 )
		alarms = valarm;
	else
		add = true;
	var a = $('span > span.alarm',data);
	for ( var i=0; i < a.length; i++ )
	{
		if ( $('.action',a[i]).text() == valueNames['NONE'] )
		{
			if ( alarms[i] != undefined )
				alarms[i] = undefined ;
			continue;
		}
		if ( alarms[i] == undefined )
		{
			alarms[i] = {BEGIN:true,UPDATED:true};
			add = true;
		}
		var value = $('.value',a[i]).text();
		var action = $('.action',a[i]).text();
		var related = $('.related',a[i]).text();
		var length = $('.length',a[i]).text();
		for ( var j in valueNames ) 
			if ( valueNames[j] == action )
				break;
		action = j;
		for ( var j in durations ) 
			if ( durations[j] == length )
				break;
		length = j;
		for ( var j in valueNames ) 
			if ( valueNames[j] == related )
				break;
		related = j;
		if ( alarms[i].action == undefined )
		{
			alarms[i].action = event.PARENT.newField('action',action);
			alarms[i].action.PARENT = alarms[i]; 
			edited = true;
		}
		else if ( alarms[i].action.VALUE != action )
		{
			alarms[i].action.UPDATE(action);
			edited = true;
		}
		if ( length == 'on date' )
		{
			if ( alarms[i].trigger == undefined || alarms[i].trigger.DURATION != undefined )
			{
				alarms[i].trigger = event.PARENT.newField('trigger',Zero().parsePrettyDate(value),{VALUE:'DATE-TIME',RELATED:undefined});
				alarms[i].trigger.PARENT = alarms[i]; 
				edited = true;
			}
			else
			{
				alarms[i].trigger.UPDATE(Zero().parsePrettyDate(value));
				edited = true;
			}
		}
		else
		{
			var dur = parseDuration(value+' '+length);
			console.log(dur);
			if ( alarms[i].trigger == undefined || alarms[i].trigger.DATE != undefined )
			{
				alarms[i].trigger = event.PARENT.newField('trigger',dur);
				alarms[i].trigger.PARENT = alarms[i]; 
				edited = true;
			}
			else if ( alarms[i].trigger.DURATION != dur )  
			{
				alarms[i].trigger.UPDATE(dur);
				edited = true;
			}
			if ( alarms[i].trigger.PROP != undefined )
			{
				if ( ! alarms[i].trigger.PROP.related || alarms[i].trigger.PROP.related != related )
				{
					alarms[i].trigger.PROP.related = related;
					edited = true;
				}
			}
			else
			{
					alarms[i].trigger.PROP= {'related': related};
					edited = true;
			}
		}
	}
	if ( add )
	{
		edited = true;
		if ( alarms.length == 1 )
			event.vcalendar[event.TYPE].valarm = alarms[0];
		else
			event.vcalendar[event.TYPE].valarm = alarms;
	}
	return edited;
}

function alarmFieldClick(e)
{
	console.log( 'boo' );
	var f = {length:['minutes before','hours before','days before','weeks before','minutes after','hours after','days after','weeks after','on date'],
					action:['AUDIO','DISPLAY','NONE'],related:['START','END']};
	var options = f[$(e.target).attr('class')]; 
	if ($(e.target).attr('class') == 'length' ) 
		var list = durations;
	else
		var list = valueNames;
	var currentValue = $(e.target).text();
	var txt = '<div class="completionWrapper"><div class="completion">';
	for ( var j = 0; j < options.length; j++ )
		txt = txt + '<div'+ (list[options[j]]==currentValue?' class="selected" ':'') +'>'+list[options[j]]+'</div>';
	txt = txt + '</div></div>';
	var comp = $(txt);
	$(comp).children().click(function(evt){$(evt.target).parent().parent().next().text($(evt.target).text());
		var z = undefined;
		for ( var i in durations ) if ( $(evt.target).text() == durations[i] ) z = i;
		var ics =$($($('#wcal').data('popup')).data('event')).data('ics');
		if ( z == 'on date' )
			$(evt.target).parent().parent().prev().text(ics.vcalendar[ics.TYPE].ESTART.DATE.prettyDate()); 
		else if ( z != undefined )
			$(evt.target).parent().parent().prev().text(z.match(/(weeks|days|hours)/)?1:15);
		$(evt.target).parent().parent().fadeOut(function(){$(this).remove();popupOverflowAuto();});
		return false;
	});
	$(e.target).bind('keydown',function (e2){ 
		e2.spaceSelects = true; 
		e2.search = false; 
		e2.removeOnEscape = true; 
		var k = keyboardSelector(e2);
		if ( k == 'cancel' )
		{
			$('#wcal').data('eatCancel',true);
			$(this).unbind('blur');
			popupOverflowAuto();
			e2.stopPropagation();
			return false;
		}
		else if ( $(k).length == 1 )
		{
			$(this).unbind('blur');
			$(this).text($(k).text());
			$(this).prev().fadeOut(function(){$(this).remove();popupOverflowAuto();});
			var ret = e2.which==9;	
			return ret;
		}	
		else
			return k;
		},false);
	$(comp).css({top:$(e.target).position().top,left:$(e.target).position().left,'margin-left':'2em'});
	$(e.target).bind('blur',function(evt){$(evt.target).prev().fadeOut(function(){$(this).remove();popupOverflowAuto();});$(this).unbind(evt);});
	popupOverflowVisi();
	$(e.target).before(comp);
}

function eventEdited (e)
{
	var edited = false;
	// TODO add undo/redo preferrably with the html5 DOM undoManager
	//window.undoManager.add(e.target,'edited event');
	var cp = $($('#wcal').data('popup'));
	if ( $(cp).attr('id') != 'calpopupe')
	{
		$(cp).hide();
		return false;
	}
	var evt = $(cp).data('event');
	var c = $($(cp).data('event')).attr('class');
	if ( c != undefined && c.match(/calendar(\d+)/) )
		c = c.match(/calendar(\d+)/)[1];
	else
	{
		var c = $('#callist li.selected'); 
		if ( c.length > 0 )
			c = $(c).attr('class').match(/calendar(\d+)/)[1];
		else
			c = 0;
	}
	var d = $($(cp).data('event')).data('ics');
	if ( ! d instanceof Object )
		return false;
	var mod = '',dmod = false;
	if ( d.vcalendar.vevent != undefined && $('span:contains('+fieldNames.dtstart+') + span',cp).length )
	{
		var dts = (new Date()).parsePrettyDate ( $('span:contains('+fieldNames.dtstart+') + span',cp).text() );
		var dte = (new Date()).parsePrettyDate ( $('span:contains('+fieldNames.dtend+') + span',cp).text() );
		if ( dts > dte )
		{
			$('span:contains('+fieldNames.dtend+') + span',cp).css('outline','1px solid red').attr('tabindex',-1).focus();
			return false;
		}
	}
	if (  $('span:contains('+fieldNames.duration+') + span',cp).text() == fieldNames.duration )
	{
		var datefields = {on:'dtstart','all day':'dtend'};
	}
	else
		var datefields = {from:'dtstart',to:'dtend',due:'due',completed:'completed'};
	if ( d.vcalendar.vevent != undefined )
	{
		var props = d.PARENT.components.vevent.required.concat(d.PARENT.components.vevent.optional);
		var missing= new Array (),type = 'vevent';
	}	
	else if ( d.vcalendar.vtodo != undefined )
		var props = {summary:'summary',due:'due',completed:'completed',category:'category',location:'location',url:'url',note:'description'}, missing= new Array (),type = 'vtodo';
	for ( var x in props )
	{
		var label = fieldNames[props[x]];
		var element = $('span:contains('+label+') + span',cp);
		if ( $(element).length )
		{
			var element = $('span:contains('+label+') + span',cp)[0];
			if	( d.vcalendar[type][props[x]] == undefined )
				d.vcalendar[type][props[x]] = d.PARENT.newField( props[x] );
			if ( $(element).data('value') == $(element).text() )
				continue ;
			if ( d.vcalendar[type][props[x]] == $(element).text() )
				continue ;
			if ( $(element).text() == '' )
				if ( d.PARENT.components.vevent.required.indexOf ( props[x] ) > -1 )
					continue ;
				else
					delete d.vcalendar[type][props[x]];
			else
				d.vcalendar[type][props[x]].UPDATE ( $(element).text(), $(element).data('value')  );
			if ( debug ) console.log ( 'modified prop ' + props[x] + ' with display name ' + label + ' from type ' + type + "\n  from " + d.vcalendar[type][props[x]] + "\n    to " + $(element).text() );
			mod += props[x];
			edited=true;
		}
	}
	// handle alarms
	if ( d.vcalendar[type].valarm != undefined || $('span:contains('+ui.alarm+')').length > 0 )
	{
		if ( d.vcalendar[type].valarm == undefined )
			d.vcalendar[type].valarm = {BEGIN:true,UPDATED:true};
		var ale = alarmEdited(d.vcalendar[type].valarm, $('li > span:contains('+ui.alarm+')',cp).parent(),d);
		if (ale)
			edited = true;
	}

	if ( edited )
	{
		var href = $(evt).attr('href');
		d.vcalendar[type].dtstamp.UPDATE ( ( new Date()) );
		d.vcalendar[type].sequence.VALUE++;
		var cals = $(document).caldav('calendars');
		if ( href != '+&New Event' )
		{
			$('[href="'+$(evt).attr('src')+'"]').fadeOut('fast',function (){$(evt).remove();  } );
			$(document).caldav('putEvent',{url:href},d.PARENT.printiCal (  )); 
		}
		else
		{
			href = $(document).caldav('calendars')[c].href + d.vcalendar.vevent.uid + '.ics'; 
			var params = { url:href};
			$(document).caldav('putNewEvent',params,d.PARENT.printiCal (  )); 
		}
		if ( d.TYPE == 'vevent' )
			insertEvent(href,d,c,$('#wcal').data('firstweek'),$('#wcal').data('lastweek'));
		if ( d.TYPE == 'vtodo' )
			insertTodo(href,d,c);
	}
	else
		if ( $(evt).attr('href') != '+&New Event' )
			$(document).caldav('unlock',$(evt).attr('href') );
	$('#calpopupe').hide();
	$('#wcal').removeData('popup');
	$('#wcal').removeData('clicked');
	return true;
}

function removeEvent (href)
{
	$('[href="'+href+'"]').fadeOut('fast',function (){$(this).remove();  } );
}

function eventDeleted (e)
{
	var edited = false;
	// TODO add undo/redo preferrably with the html5 DOM undoManager
	//window.undoManager.add(e.target,'edited event');
	
	var t = $($('#wcal').data('clicked'));
	if ( ! $(t).length )
		t = $('#wcal').data('deleting');
	var c = $(t).attr('class').match(/calendar(\d+)/)[1];
	var src = $(t).attr('href');
	var cals = $(document).caldav('calendars');
	var cp = $($('#wcal').data('popup'));
	var d = $(t).data('ics');
	if ( ! d instanceof Object )
		return false;
	if ( d.TYPE =='vtodo' )
	{
		var params = { url:src};
		$(document).caldav('delEvent',params); 
		//$(t).remove();
	}
	else if ( d.vcalendar.vevent.rrule == undefined  && d.vcalendar.vevent['recurrence-id'] == undefined )
	{
		var params = { url:src};
		$(document).caldav('delEvent',params); 
		//$(t).remove();
	}
	else if ( e.all == undefined )
	{
		$('#wcal').data('deleting',t);
		$('#wcal').data('drop-question',e);
		questionBox(deletequestion[0],deletequestion[1],
				function(e) {
					var evt = $('#wcal').data('drop-question');
					$('#wcal').removeData('drop-question');
					if ( e == -1 ) 
					{
						$('#wcal').removeData('popup');
						$('#wcal').removeData('clicked');
						return false;
					}
					evt.all = e == 0 ? true : false ;
					eventDeleted(evt);
				} );
		return ;
	}
	else if ( e.all == true )
	{
		var params = { url:src};
		$(document).caldav('delEvent',params); 
		$('[href="'+$(t).attr('href')+'"]').fadeOut('fast',function (){$(this).remove();  } );
	}
	else if ( e.all == false )
	{
		if ( d.vcalendar.vevent['recurrence-id'] != undefined )
		{
			d.DELETE();
		}
		else
		{
			var tz = $.extend(true,{},d.vcalendar.vevent.dtstart.PROP);
			if ( d.vcalendar.vevent.exdate == undefined )
				d.vcalendar.vevent.exdate = d.PARENT.newField('EXDATE',$(t).attr('instance'),tz);
			else
				d.vcalendar.vevent.exdate.UPDATE($(t).attr('instance'),tz);
		}
		var href = $(t).attr('href');
		$(t).fadeOut('fast',function (){$(t).remove();  } );
		var params = { url:href};
		$(document).caldav('putEvent',params,d.PARENT.printiCal (  )); 
		// add exdate
	}
	else
		console.log('logic error deleting event');
	$('#wcal').removeData('popup');
	$('#wcal').removeData('clicked');
	return true;
}

function eventSort( e )
{
	var events = $(e).children('li');
	$(events).detach();
	events.sort(function (a,b)
			{
				if ( $(a).hasClass('multiday') && $(b).hasClass('multiday') )
					return Zero().parseDate($(a).attr('instance')).getTime() - Zero().parseDate($(b).attr('instance')).getTime();
				else if ( $(a).hasClass('multiday') )
					return -1; 
				else if ( $(b).hasClass('multiday') )
					return 1; 
				else if ( $(a).attr('order') )
					return $(a).attr('order') - $(b).attr('order'); 
				else 
					return $(a).data('time') - $(b).data('time'); 
			});
	$(e).append(events);
}

function popupOverflowVisi()
{
	var c = Number($($('#wcal').data('popup')).data('overflow')) + 1;
	$($('#wcal').data('popup')).data('overflow',c);
	$($('#wcal').data('popup')).css({overflow:'visible'});
}

function popupOverflowAuto()
{
	var c = Number($($('#wcal').data('popup')).data('overflow')) - 1;
	$($('#wcal').data('popup')).data('overflow',c);
	if ( c == 0 )
		$($('#wcal').data('popup')).css({overflow:'auto'});
}

function scrollCal (d) 
{
	var fw=$('#wcal').data('firstweek');
	var lw=$('#wcal').data('lastweek');
	var od = new Date(d.getTime());
	var ed = new Date(d.getTime());
	if ( ! $('#wcal').hasClass('weekview') )
	{
		od.add ('d', -7-parseInt( $('#wcal')[0].clientHeight / $('.today')[0].clientHeight /2 ) * 7);
		ed.add ('w', parseInt( $('#wcal')[0].clientHeight / $('.today')[0].clientHeight /2 ) +1 );
	}
	var nd = new Date(d.getTime());
	if ( od < fw )
	{	
		var s = fw;
		nd.setDate(nd.getDate()-28);
		while ( s > nd )
		{ 
			$('#calt').prepend(buildweek(s));
			s.setDate(s.getDate()-7);
		}
		$('#wcal').data('firstweek',s);
	}
	if ( ed > lw )
	{
		var s = lw;
		while ( s < ed || $('#day_'+ d.DayString() ).length == 0 )
		{ 
			$('#calt').append(buildweek(s));
			s.setDate(s.getDate()+7);
		}
		$('#wcal').data('lastweek',s);
	}
	
	var day = $('#day_'+ d.DayString() ); 
	$('#wcal').scrollTop ( day[0].offsetTop - (( $('#wcal')[0].clientHeight /2) -($('.today')[0].clientHeight /2 )) );

	var currentweek = $('.weeknum.currentweek');
	var centerrow = $('#calt tr:eq(' + Math.floor( ($('#wcal').scrollTop() + $('#wcal')[0].clientHeight / 2 ) / $('#calt tr:eq(0)')[0].clientHeight ) + ') .weeknum');
	$(currentweek).removeClass('currentweek');
	$(centerrow).addClass('currentweek');
	var row = $('.header:last',$(centerrow).parent());
	if ( $(row).length < 1 )
		return;
	$('#calmonthname').text($(row).attr('month'));
	var year = $(row).parent().attr('id').replace(/day_([0-9]{4}).*/,'$1');
	$('#calyearname').text( year );
}

function currentWeek ( returnDate )
{
	var st = $('#wcal').scrollTop();
	var oh = $('#calt tr:eq(0)')[0].clientHeight;
	if ( $('#wcal').hasClass('weekview') )
		var row = Math.round( st / oh );
	else
		var row = Math.round( (st + ($('#wcal')[0].clientHeight -oh)/ 2 ) / oh );
	if ( returnDate )
	{
		var d = new Date();
		var ds = $('#wcal tr:eq(' + parseInt ( row ) + ') .day:eq(0)').attr('id').replace(/day_/,'');
		d.parseDate (ds);
		return d;
	}
	else
		return row ;
}

function buildcal(d)
{
	if ( d != undefined )
		s = d;
	else
		s = new Date();
	s.setDate(s.getDate()-7);
	$(document.body).append ('<div id="em" style="postion:absolute; float: left; left: -5000; top: 100; width: 1em; height: 1em; overflow: hidden; background: none; margin:0; padding: 0; border: none; outline: none;">&nbsp;</div>');
	calstyle();
	var calwrap = $('<div id="calwrap"><audio id="calalertsound" src="SweetAlertSound2.wav" type="audio/wave" preload="auto" autobuffer ></audio></div>');
	$(calwrap).data('tabindex',10);
	calwrap.nextIndex = function (){var t = $(this).data('tabindex'); t++; $(this).data('tabindex',t); return t; };
	
	var sidebar = $('<div id="calsidebar" ><div class="sidetitle">'+ui.calendar+'</div></div>');
	var sideul = $('<ul id="callist"  ></ul>');
	var cals = $(document).caldav('calendars');
	for (var i=0;i<cals.length;i++)
	{
		if ( cals[i].principalName == undefined || cals[i].principalName == '' )
			continue;
		var cparent = $('li:contains('+cals[i].principalName+') > ul',sideul);
		if ( ! cparent.length )
		{
			$('<li class="open"  ><span>'+cals[i].principalName+'</span><ul data-mailto="'+cals[i].mailto+'" ></ul></li>').appendTo(sideul);
			var cparent = $('li:contains('+cals[i].principalName+') > ul',sideul);
		}
		var ce = $('<li class="calendar'+i+'" order="'+cals[i].order+'" title="'+cals[i].desc+'"><input type="checkbox" id="calendar'+i+'" checked="true" /><span >'+ cals[i].displayName+'</span></li>');
		$(ce)[0].addEventListener('drop',calDrop,true);
		$(ce)[0].addEventListener('dragenter', calDragEnter,true);
		$(ce)[0].addEventListener('dragover', calDragOver,true);
		$(ce).click (selectCalendar);
		$(ce).dblclick (editCalendar);
		$(ce).data(cals[i]);
		$(cparent).append(ce);
		eventSort(cparent);
		var ss = styles.getStyleSheet ( 'calstyle' );
		if ( settings.calendars != undefined && settings.calendars[cals[i].url] != undefined && settings.calendars[cals[i].url] == false )
		{
			$('#calendar'+i,cparent).attr('checked',false);
			ss.addRule ( '#wcal .day .event.calendar'+i ,' opacity: 0 '  );
			ss.addRule ( '#wcal .day .event.calendar'+i +'bg',' opacity: 0 ' );
			ss.addRule ( '#wcal .day .event.calendar'+i ,' display: none; '  );
			ss.addRule ( '#wcal .day .event.calendar'+i +'bg',' display:none; ' );
		}
		else
		{
			ss.addRule ( '#wcal .day .event.calendar'+i ,' opacity: 1 }'  );
			ss.addRule ( '#wcal .day .event.calendar'+i +'bg',' opacity: 1 ' );
			ss.addRule ( '#wcal .day .event.calendar'+i ,'  '  );
			ss.addRule ( '#wcal .day .event.calendar'+i +'bg',' ' );
		}
	}
	var selectedcal = 0; // TODO restore selected calendar from last login
	if ( settings['selectedCalendar'] != undefined )
		selectedcal = settings['selectedCalendar'];
	$('input:eq('+selectedcal+')',sideul).parent().addClass('selected');
	$('input',sideul).change(toggleCalendar);
	$('li > span',sideul).click (function (e){
		if ( $(this).next().length > 0 && $(this).next()[0].nodeName == 'UL' && e.pageX > $(this).offset().left+$(this).width() - $(this).height() * 2.25 )
		{	
			var mailto = $(this).next().data('mailto');
			var principal = $(document).caldav('principals')[mailto];
			console.log ( principal );

		}
		else
		{	$('li.selected',$(this).parent()).toggleClass('selected');$(this).parent('li').toggleClass('open');$(this).parent('li').toggleClass('closed');}});
	$(sidebar).append(sideul);
	$(sidebar).append('<div class="calfooter group" tabindex="2"><div id="addcalendar" class="button" >'+ui.add+'</div><div id="calsettings" class="button" >'+ui.settings+'</div><div id="calsubscribe" class="button" >'+ui.subscribe+'</div></div>');
	$('#addcalendar',sidebar).click(addCalendar); 
	$('#calsettings',sidebar).click(calSettings); 
	$('#calsubscribe',sidebar).click(subscribeCalendar); 
	$(calwrap).append(sidebar);
	$(calwrap).append('<div id="calcenter" ><div id="calheader" tabindex="6"><span id="gototoday" class="button" >'+ui.today+'</span><span id="weekview" class="button" >'+ui.week+'</span><span id="calmonthname">' + months[s.getMonth()] + '</span><span id="calyearname">' + s.getFullYear() + '</span><span id="logout" class="button" >'+ui.logout+'</span></div>');
	$('#gototoday',calwrap).click(function(){var d = new Date(); scrollCal ( d );return false;} );
	$('#logout',calwrap).click(function(){ logoutClicked(); return false;} );
	$('#weekview',calwrap).click(function()
		{
			var oh = $('#wcal tr:eq(0)')[0].clientHeight;
			d = currentWeek ( true );	
			if($(this).text()=='Week')
			{
				$(this).text('Month');
				$('#wcal').data('dayHeight',oh);
				$('#wcal').addClass('weekview');
				scrollCal ( d );
			}
			else
			{
				$(this).text('Week');
				var dh = $('#wcal').data('dayHeight');
				var w = currentWeek ();
				var st = $('#wcal').scrollTop();
				//var row = Math.round( (st + ($('#wcal')[0].clientHeight -oh)/ 2 ) / oh );
				//var centerrow = $('#calt tr:eq(' + Math.round( (st + (oh-rows[0].clientHeight) / 2 ) / rows[0].clientHeight ) + ') .weeknum');
				var offset = Math.round( ( $('#wcal')[0].clientHeight/2 ) - dh / 2); 
				console.log ( dh + 'dayheight');
				$('#wcal').scrollTop(dh*w - offset);
				$('#wcal').removeClass('weekview');
				$('.currentweek').removeClass('currentweek');
				$('#calt tr:eq(' + w + ') .weeknum').addClass('currentweek');
			}
			currentTimeIndicator();
		});
	$('#calmonthname',calwrap).click(function(e){
			if ( e.pageX < $(this).offset().left + $(this).innerWidth() / 2 )
				var month = -1;
			else 
				var month = 1;
			var nm = $.inArray($(this).text(),months) + month;
			var nd = new Date ($('#calyearname').text() , nm , 7,0,0,0) ;
			scrollCal ( nd );
		});
	$('#calyearname',calwrap).click(function(e){
			if ( e.pageX < $(this).offset().left + $(this).innerWidth() / 2 )
				var year = -1;
			else 
				var year = 1;
			var nm = $.inArray($('#calmonthname').text(),months) ;
			var nd = new Date (($('#calyearname').text()-0)+year , nm , 7,0,0,0) ;
			scrollCal ( nd );
		});
	var calh = $('<table id="calh"></table>');
	var days = $('<thead class="days"></thead>');
	var tr = $('<tr></tr>');
	var day = settings.weekStart;
	for ( var i=0;i<7;i++)
	{ 
		$(tr).append('<td>' + weekdays[day] + '</td>');
		day++;
		if ( day > 6 )
			day = 0;
	}
	$(days).append(tr);
	$(calh).append(days);
	$('#calheader',calwrap).append(calh);
	$('#calheader',calwrap).bind('edit_keyup',function (e){ 
		var month =	$.inArray($('#calmonthname').text(),months);
		var year = $('#calyearname').text();
		if ( e.keyCode == 40 ) // down arrow
		{
			$('#wcal').scrollTop( $('#day_'+(year+''+(month+1))+'1').position().top );
		}
		else if ( e.keyCode == 38 ) // down arrow
		{
			$('#wcal').scrollTop( $('#day_'+(year+''+(month+1))+'1').position().top );
		}
		else
			return true;
		e.preventDefault();
		return false;
		});
	var todobar = $('<div id="caltodo" tabindex="8"><div class="sidetitle">'+ui.todos+'</div><ul></ul></div>');
	$('ul', todobar).dblclick(newevent);
	var v = $('ul', todobar);	
	$(v).bind('drop',calDrop);
	$(v).bind('dragenter', calDragEnter);
	$(v).bind('dragleave', calDragLeave);
	$(v).bind('dragover', calDragOver);
	$(calwrap).append(todobar);
	
	var cal = $('<div id="wcal" tabindex=7"><div id="caldrop" style="display:none;"><div></div></div></div>');
	cal[0]['recur'] = new Array;
	var startt = settings.start.getLongMinutes();
	var endt = settings.end.getLongMinutes();
	var ul = $('<ul class="hoursbg"></ul>');
	var d = new Date();
	d.setUTCMinutes(0);
	for ( var i=startt;i<=endt;i+=100)
	{
		d.setUTCHours(i/100);
		$(ul).append ( '<li class="time'+i+'" data-duration="60">'+d.prettyTime()+'</li>' );
	}	
	hw = $('<div class="hourswrapper"></div>').append(ul);
	$(document.body).append(hw);
	fhw = $('.hourswrapper').clone(true);
	hw = $(fhw).clone(true);
	$('li',hw).empty();

	$(cal).data('tabindex',5000);
	cal.nextIndex = function (){var t = $(this).data('tabindex'); t++; $(this).data('tabindex',t); return t; };
	$('#caldrop',cal)[0].addEventListener('dragenter', calDragOver,true);
	$('#caldrop',cal)[0].addEventListener('dragleave', calDragOver,true);
	$('#caldrop',cal)[0].addEventListener('dragover', calDragOver,true);
	var pop = $('<div id="calpopup" class="calpopup left" style="display:none;" data-clicked=0 ></div>');
	$(pop).appendTo(calwrap);
	$(pop).clone(true).attr('id','caldialog').removeClass('left').appendTo(calwrap);
	$(cal).data('edit_click',function ( e ){ var box = $('#wcal').data('popup');
			if ( $('#wcal').data('clicked') != e.target && $(e.target).parents(box).length < 1 && e.target != $(box)[0] )
			{
					var href = $($(box).data('event')).attr('href');
					if ( String(href).length > 1 && $.fn.caldav.locks[href] != undefined )
						$(document).caldav('unlock',href);
					$('#wcal').removeData('clicked');
					$('#wcal').removeData('popup'); 
					$(box).fadeOut();
					$(document).unbind('click',$('#wcal').data('edit_click')); 
					$(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
			} } 
			);
	$(cal).data('edit_keyup',function (e){ 
			if ( e.keyCode == 27 ) 
			{
				if ( $('#wcal').data('eatCancel') ){$('#wcal').removeData('eatCancel'); return}
				var box = $('#wcal').data('popup'); 
				var href = $($(box).data('event')).attr('href');
				if ( String(href).length > 1 && $.fn.caldav.locks[href] != undefined )
					$(document).caldav('unlock',href);
				$(box).fadeOut(); 
				$('#wcal').removeData('popup'); 
				$('#wcal').removeData('clicked'); 
				$(document).unbind('keyup',$('#wcal').data('edit_keyup')); 
				$(document).unbind('click',$('#wcal').data('edit_click'));
				$('#wcal').removeData('popup');
				$('#wcal').removeData('clicked'); 
			} 
			if ( e.keyCode == 13 && $(e.target).attr('multiline') != true )
			{
				e.stopPropagation();
				return false;
			}
		} 
			);

	var startdate = new Date(s.toString());
	startdate.setDate(startdate.getDate() -7);
	$(cal).data('firstweek',startdate); 
	var calt = $('<table id="calt"></table>');
	var rows = Math.ceil( window.innerHeight / 96 ) + 2;
	if ( rows < 3 )
		rows = 3;
	for ( var i=0;i<rows;i++)
	{ 
		$(calt).append(buildweek(s));
		s.setDate(s.getDate()+7);
	}
	$('#day_'+ (new Date()).DayString(),calt).addClass('today');
	$(cal).data('lastweek',s);
	$(cal).data('created',Date.now());
	$(cal).scroll(function() {
		var sh = $(this)[0].scrollHeight - 15;
		var st = $(this).scrollTop();
		var oh = $(this)[0].clientHeight;
		var ost = $(cal).data ('st');
		if ( ! ost )
			$(cal).data ('st',st);
		if ( Math.abs ( st - ost ) > 5 )
		{
			var rows = $('#calt tr:eq(0)');
			if ( $('#wcal').hasClass('weekview') )
				var centerrow = $('#calt tr:eq(' + Math.round( st  / rows[0].clientHeight ) + ') .weeknum');
			else
				var centerrow = $('#calt tr:eq(' + Math.round( (st + (oh-rows[0].clientHeight) / 2 ) / rows[0].clientHeight ) + ') .weeknum');
			if ( $(centerrow).length == 0 )
				var centerrow = $('#calt tr:last');
			var currentweek = $('.weeknum.currentweek');
			if ( centerrow != currentweek )
			{
				$(currentweek).removeClass('currentweek');
				$(centerrow).addClass('currentweek');
			}
			var row = $('.header:last',$(centerrow).parent());
			$('#calmonthname').text($(row).attr('month')); 
			var year = $(row).parent().attr('id').replace(/day_([0-9]{4}).*/,'$1');
			$('#calyearname').text( year );
			updateTimeline(); 
			$(cal).data ('st',st);
		}
		if (sh - st <= oh) {
			var s=$('#wcal').data('lastweek');
			for ( var i=1;i<3;i++)
			{ 
				$('#calt').append(buildweek(s));
				s.setDate(s.getDate()+7);
			}
			$('#wcal').data('lastweek',s);
		}
		else if ( st < 45 && ost )
		{
			var s=$('#wcal').data('firstweek');
			var start = s;
			for ( var i=1;i<3;i++)
			{ 
				$('#wcal').scrollTop ($('#wcal').scrollTop() + $('#calt tr:first')[0].clientHeight );
				$('#calt').prepend(buildweek(s));
				s.setDate(s.getDate()-7);
			}
			$('#wcal').data('firstweek',s);
		}
	});
	$(cal).append(calt);
	$('#calcenter',calwrap).append(buildtimeline());
	$('#calcenter',calwrap).append(cal);
	
	$('.timeline li',calwrap).click (function (e){
		scrollCal($(this).parents('.timeline').data('date'));
	});

	currentTimeIndicator();
	window.setInterval(currentTimeIndicator,3000);

	var cals = $(document).caldav('calendars');
	for ( var i=0;i<cals.length;i++)
	{
		$(document).caldav('getToDos', { url:cals[i].url,username:$('#user').val(),password:$('#pass').val()},i);
	}
	
	return calwrap;
}

function calstyle ()
{
	var calcolors = '';
	var cals = $(document).caldav('calendars');
	for ( var i=0;i<cals.length;i++)
	{
		calcolors = calcolors + ' .calendar' + i + ' { color: ' + cals[i].color + '; border-right-color: ' + cals[i].color + ';   }' ;
		calcolors += '.calendar' + i + ':hover { background-color: ' + cals[i].color + '; }' ;
		calcolors += '.calendar' + i + 'bg { color: white; background-color: ' + cals[i].color + '; border-right-color: ' + cals[i].color + '; }' ;
	}
	
	//$('.caldialog .databool').live('click',function(e){$(this).toggleClass('boolselected');});

	var startt = settings.start.getLongMinutes();
	var endt = settings.end.getLongMinutes();
	var wvs = '';
	for ( var i=startt;i<=endt;i+=100)
	{
		var z = 100*((i-startt)/(endt-startt)); 
		wvs = wvs + '.weekview .time'+i + ' { position: absolute; top:' + z + '% }' + "\n";
		z = 100*((i-startt+25)/(endt-startt+100)); 
		wvs = wvs + '.weekview .time'+(i+15) + ' { position: absolute; top:' + z + '% }' + "\n";
		z = 100*((i-startt+50)/(endt-startt+100)); 
		wvs = wvs + '.weekview .time'+(i+30) + ' { position: absolute; top:' + z + '% }' + "\n";
		z = 100*((i-startt+75)/(endt-startt+100)); 
		wvs = wvs + '.weekview .time'+(i+45) + ' { position: absolute; top:' + z + '% }' + "\n";
	}
	for ( var i=endt;i<=2400;i+=100)
	{
		if ( i > endt )
			wvs = wvs + '.weekview .time'+i + ' { position: absolute; bottom: 0 }' + "\n";
		wvs = wvs + '.weekview .time'+(i+15) + ' { position: absolute; bottom: 0 }' + "\n";
		wvs = wvs + '.weekview .time'+(i+30) + ' { position: absolute; bottom: 0 }' + "\n";
		wvs = wvs + '.weekview .time'+(i+45) + ' { position: absolute; bottom: 0 }' + "\n";
	}
	var pct = 100/( ( ( (endt)-startt ) / 100 ) * 4 ) ;
	var c = 0;
	for ( var i=15;i<=(endt-startt);i+=15)
	{
		c+=pct;
		wvs = wvs + '.weekview .week .day .eventlist li.event[data-duration="'+i+'"] {height:'+ c + '%; max-height:100% }' + "\n";
	}

	var cs = '<style title="calstyle" type="text/css">' + "\n" +
	"body > .hourswrapper { display: none; } \n" +
	'#calwrap { font-family: Helvetica, sans-serif;  clear: both; clear-after:bottom; position: absolute; top:0; left: 0; width: 100%; height: 100%; overflow: hidden; background-color: #FFF; '+
		'/* display: -webkit-box;display: -moz-box;display: box; -webkit-box-orient: horizontal; -webkit-box-pack: justify; -moz-box-orient: horizontal; -moz-box-pack: justify; box-orient: horizontal; box-pack: justify; */ }' + "\n" + 
	calcolors +
	
	'#caldialog {position:absolute; z-index: 100; top: 10em; left: 5em; width: 350px; height: 300px; border:1px solid #AAA; background:#FFF; overflow: visible; font-size: 11pt; '+
		'-moz-border-radius:5px; -webkit-border-radius:5px; border-radius:5px;  -moz-box-shadow: 3px 3px 10px #888; -webkit-box-shadow: 3px 3px 10px #888; box-shadow: 3px 3px 10px #888; '+
		'-webkit-transform: translate(13px,-20px); -moz-transform: translate(13px,-20px); transform: translate(13px,-20px);} ' + "\n" +	

	'#calcenter { float: left; /*-moz-box-flex: 3; -webkit-box-flex: 3; box-flex: 3;*/ height: 100%; width: 70%; overflow: hidden; }' + "\n" +
	'#calh { width: 100%; table-layout: fixed; overflow-x: hidden; border-spacing:0; padding:0; margin:0; border:0; color: #666; padding-right:1px; font-size: 80%; }' + "\n" + 
	"#calh .days td { display: table-cell; float: none; }\n" + 
	'#gototoday { position: absolute; left: 0em; font-size: 12pt; width: 4em;}' + "\n" +
	'#weekview { position: absolute; left: 7em; font-size: 12pt; width: 4em;}' + "\n" +
	'#logout { position: absolute; right: 4em; font-size: 12pt; width: 4em;}' + "\n" +
	'#calt { width:100%; border-spacing:0; padding:0; margin:0; border:0; table-layout: fixed; }' + "\n" + 
	'#calsidebar { float: left; /* -moz-box-flex: 1; -webkit-box-flex: 1; box-flex: 1; */ position: relative; width: 15%; min-height: 6em; height: 100%; background-color: #EFEFFF; '+
		'background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAABCAYAAAAW/mTzAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUSURBVAiZY/z06dN/BiTAy8vLCABHcQP/jGwD2gAAAABJRU5ErkJggg==\'); '+
		'border-right: 1px solid #AAA; overflow: hidden; margin-right: -1px; }' + "\n" +
	'#calsidebar * { resize: none; } ' + "\n" +
	'#calsidebar > .sidetitle { font-size: 200%; font-weight: lighter; border: none !important; border-bottom:1px solid #AAA !important; text-align: center; padding:1px 0 14pt 0; margin:0;}' + "\n" +
	'#calsidebar > ul { position: relative; display: block; margin: 0; padding: 0px; list-style-type: none; overflow-x: hidden; overflow-y: scroll; padding-top: 1em; margin-right: -1.2em; height: 100%; } ' + "\n" +
	'#calsidebar > ul > li { margin-left: 0; padding: 0;  padding-bottom: .5em; -webkit-transition-property: all; -webkit-transition-duration: 1.4s;  -moz-transition-property: all; -moz-transition-duration: 1.4s; transition-property: all; transition-duration: 1.4s;  } ' + "\n" +
	'#calsidebar > ul > li:last-child { margin-bottom: 2em; } ' + "\n" +
	'#calsidebar > ul > li > span:hover:after { content: "edit"; position: absolute: right: 0; float: right; display: block; width: 3.5em; } ' + "\n" +
	'#calsidebar > ul > li > span { color: #666; margin:0;padding:0;padding-left: 12px; display: block; width: 100%; position: relative; font-size: 9pt; letter-spacing: -0.01em; text-transform: uppercase; '+
		'-webkit-transition-property: all; -webkit-transition-duration: .4s; -moz-transition-property: all; -moz-transition-duration: .4s; transition-property: all; transition-duration: .4s; } ' + "\n" +
	//'#calsidebar > ul > li.closed > span   { color: #888; } ' + "\n" +
	'#calsidebar > ul > li.closed > ul  { height: 0px;   } ' + "\n" +
	'#calsidebar > ul > li > span:before   { content: ""; display: block; position: absolute; left: 1px; width:0; height:0; border-color: #666 transparent transparent transparent; border-style: solid; border-width: 7px 4px 4px 4px; '+
		'-webkit-transition-property: all; -webkit-transition-duration: .4s; -moz-transition-property: all; -moz-transition-duration: .4s; -o-transition-property: all; -o-transition-duration: .4s; transition-property: all; transition-duration: .4s; '+
		'-webkit-transform: translate(0px, 3px) rotate(0deg) ; -moz-transform: translate(0px,3px) rotate(0deg) ; transform: rotate(0deg) ; } ' + "\n" +
	'#calsidebar > ul > li.closed > span:before { border-color: #666 transparent transparent transparent; -webkit-transform: translate(3px, 1px) rotate(-90deg) ; -moz-transform: translate(3px, 1px) rotate(-90deg) ;  -o-transform: translate(3px, -1px) rotate(-90deg) ; -ms-transform: translate(3px, 1px) rotate(-90deg); transform: translate(3px, 1px) rotate(-90deg) ; } ' + "\n" +
	'#calsidebar > ul li:hover { background: none; } ' + "\n" +
	'#calsidebar > ul > li > ul { margin-left: 0em; padding-left: 0; overflow-y: hidden; resize: none; -webkit-transition-property: height; -webkit-transition-duration: .4s; '+
		'-moz-transition-property: all; -moz-transition-duration: .4s; transition-property: all; transition-duration: .4s;  } ' + "\n" +
	'#calsidebar > ul > li > ul > li { margin-left: 0; padding-left: 1.5em; list-style-type: none; padding-top: .12em; padding-bottom: .12em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; } ' + "\n" +
	'#calsidebar > ul > li > ul > li.selected { background: #CCD; background: -moz-linear-gradient(top, #CCD 0%, #AAA 100%); background: -webkit-gradient(linear, left top, left bottom, from(#CCD), to(#AAA)); background: -webkit-linear-gradient(top, #CCD 0%, #AAA 100%); background: linear-gradient(top, #CCD 0%, #AAA 100%); text-shadow: 0 1px 1px rgba(255,255,255,0.75), 0 -1px 1px rgba(0,0,0,0.1); } ' + "\n" +
	
	'#calsidebar > .calfooter { position: absolute; bottom:0; padding: 0; margin: 0; width: 100%; /* display: -webkit-box;display: -moz-box;display: box; -webkit-box-orient: horizontal; -webkit-box-pack: justify; -moz-box-orient: horizontal; -moz-box-pack: justify; box-orient: horizontal; box-pack: justify; */ max-height: 1.25em;  overflow: hidden; }' + "\n" +
	'.calfooter > DIV { overflow: hidden; -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s; }' + "\n" +
	'.calfooter > DIV:hover { -moz-box-shadow: inset 0px 0px 3px 0px #aaa; -webkit-box-shadow: inset 0px 0px 3px 0px #aaa; box-shadow: inset 0px 0px 3px 0px #aaa;} ' + "\n" +
	
	'#caltodo {  float: right;  width: 15%;  overflow-x: hidden; min-height: 6em; height: 100%; background-color: #EFEFFF; border-left: 1px solid #AAA; margin-left: -1px; margin-right: 0; '+
		'background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAABCAYAAAAW/mTzAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUSURBVAiZY/z06dN/BiTAy8vLCABHcQP/jGwD2gAAAABJRU5ErkJggg==\'); }' + "\n" +
	'#caltodo > .sidetitle { font-size: 200%; font-weight: lighter; border-bottom:1px solid #AAA; text-align: center; padding: 0 0 .6em 0; margin:0;}' + "\n" +
	'#caltodo ul { position: absolute; width: 100%; top: 3.6em; bottom: 0; overflow-x: hidden; overflow-y: auto; margin: 0; padding: 0px; list-style: none; } ' + "\n" +
	'#caltodo ul li { overflow: hidden; display: block; margin: 0; padding: 0; padding-left: 0; margin-bottom: .75em; line-height: 1.2em; list-style-type: none;  } ' + "\n" +

	'#wcal { width: 100%; overflow: scroll; float: left; overflow-x: hidden; height:24em; border-spacing:0; padding:0; margin:0; margin-left: 0.95em; margin-right: -9px; border:0; border-top: 1px solid #AAA; border-left: 1px solid #AAA; border-bottom: 1px solid #AAA; }' + "\n" + 
	
	'.calpopup { overflow: auto; } ' + "\n" +
	'.calpopup * { overflow: hidden; } ' + "\n" +
	'.calpopup ul { margin:0; padding:1em; max-width: 100%; overflow: hidden; }' + "\n" +
	'.calpopup li { margin:0; padding:0; list-style: none; list-style-type: none; font-size:9pt; }' + "\n" +
	'.calpopup > ul > li { clear: both; }' + "\n" +
	'.calpopup > ul > li:first-child span:first-child { display: none; }' + "\n" +
	'.calpopup > ul > li:first-child span { font-size: 14pt; color: #004; padding-bottom: .75em;}' + "\n" +
	'.calpopup .label { margin:0; padding:0; display: block; float: left; width: 5.5em; text-align: right; color: #777; font-weight: bold; padding-right: 3px; margin-top: 6px;clear: left; }' + "\n" +
	'.calpopup .value { resize: none; outline: none; margin:0; padding:0; padding-right: 2px; padding-left: 4px; min-width: 3em; min-height: 1em; display: block; float: left; margin-top: 6px; margin-bottom: 2px; }' + "\n" +
	'.calpopup .value:hover { outline: 1px solid #AAA; resize: both;}' + "\n" +
	'.calpopup .value:focus { outline: none; -moz-box-shadow: 1px 1px 3px #888; -webkit-box-shadow: 1px 1px 3px #888; box-shadow: 1px 1px 3px #888; resize: none; }' + "\n" +
	'.calpopup .value:focus:hover { resize:both; }' + "\n" +
	'.calpopup .alarm { resize: none; outline: none; margin:0; padding:0; padding-right: 2px; padding-left: 4px; min-width: 3em; min-height: 1em; display: block; float: left; margin-top: 6px; margin-bottom: 2px; }' + "\n" +
	'.calpopup .alarm .value { resize: none; outline: none; margin:0; padding:0; padding-right: .1em; padding-left: .1em; display: inline; float: none; }' + "\n" +
	'.calpopup .alarm .plus { display: block; float: left; padding-right: 2px; padding-left: 4px; } ' + "\n" +
	'.alarm span { resize: none; outline: none; margin:0; padding:0; padding-right: .1em; padding-left: .1em; }' + "\n" +

	//'.calpopup .label[extra] { outline: 1px solid blue; content: "XX" ; }' + "\n" +
	//'.calpopup .label.EEND[extra] + .value { color: white; content: ""; }' + "\n" +
	
	'.calpopup .privilegeOwner:nth-last-child(n+2):after { content: ","; padding-right: 0.15em; }' + "\n" +
	'.calpopup .add { position: absolute; bottom: 10px; left: 10px;}' + "\n" +
	'.calpopup .dropdown { padding-right: 1.5em; padding-left: 1em; }' + "\n" +
	'.dropdown:after   { content: ""; display: block; position: absolute; right: 5px; width:0; height:0; border-color: #666 transparent transparent transparent; border-style: solid; border-width: 8px 4px 1px 4px;  '+
		' -webkit-transform: translate(0px, -1em) ; -moz-transform: translate(0px,-1em) ; transform: translate(0px,-1em); } ' + "\n" +
	'.calpopup .done { position: absolute; bottom: 10px; right: 10px; }' + "\n" +
	'.calpopup .delete { position: absolute; bottom: 10px; right: 80px; }' + "\n" +
	'.button { text-align: center; padding: 0.1em 1.25em 0.1em 1.25em; border: 1px solid #888; border-bottom: 1px solid #AAA; '+
		'-webkit-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px; font-size: 9pt; '+
		'background:  -moz-linear-gradient(top, #FFF 0%,#dadada 55%,#dddddd 100%); background: -webkit-gradient(linear, left top, left bottom, from(#FFF),color-stop(0.55,#dadada), to(#dddddd) ); }' + "\n" +
	'.group { padding-left: 1px; padding-right: 1px; display: -webkit-box;display: box; -webkit-box-orient: horizontal; -webkit-box-pack: center; -moz-box-orient: horizontal; -moz-box-pack: center; box-orient: horizontal; box-pack: center; -moz-box-align: baseline; box-orient: horizontal; box-align: baseline; -moz-box-flex: 1; } '+"\n"+
	'.group .button { border-right: 0px; display: inline; display: -webkit-box; display: box;  -webkit-box-flex: 1; box-flex: 1; -webkit-border-radius: 0px; -moz-border-radius: 0px; border-radius: 0px; -moz-box-orient: horizontal; -moz-box-pack: center; }' + "\n" +
	'.group .button:first-child { border-right: 0px; -webkit-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px;  border-top-right-radius: 0px;  border-bottom-right-radius: 0px;  }' + "\n" +
	'.group .button:last-child { border-right: 1px solid #888; -webkit-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px;  border-top-left-radius: 0px;  border-bottom-left-radius: 0px;  }' + "\n" +
	'.question { padding-bottom: 1em; width: 100% } ' + "\n" +
	'.box2 { position: relative;width: 100% } ' + "\n" +
	'.box2 > * { position: relative; float: left;  margin-right: 1%; width: 48.9%; } ' + "\n" +
	'.box3 { position: relative; width: 100%; } ' + "\n" +
	'.box3 > * { position: relative; float: left; margin-right: 1%; width: 32.3%; } ' + "\n" +

	'#calheader { position: relative; width: 100%; font-weight: lighter; text-align: center; margin-left:2.5em; padding-right: 2em; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }' + "\n" +
	'#calyearname { font-size: 200%; position: relative; }' + "\n" +
	'#calmonthname { padding-right: 1em; font-size: 200%; position: relative; }' + "\n" +
	'#calmonthname:hover:before { content: "<"; position: absolute; left:-.7em; margin-top: -.1em; color: #aaa;}' + "\n" +
	'#calmonthname:hover:after  { content: ">"; position: absolute; margin-top: -0.1em; color: #aaa;}' + "\n" +
	'#calyearname:hover:before { content: "<"; position: absolute; margin-top: -.1em; left:-.7em; color: #aaa;}' + "\n" +
	'#calyearname:hover:after  { content: ">"; position: absolute; margin-top: -.1em; color: #aaa;}' + "\n" +
	'.week { width:100%; margin:0; padding:0; height:6em; padding-bottom: 1px; }' + "\n" +
	'.weeknum { width: 1.5em; border-top: 1px solid #AAA; border-right:1px solid #AAA; height: 6em; vertical-align: top; overflow: hidden; padding: 0; position: relative; -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s;  }' + "\n" +
	'.currentweek { background-color: #efefff; }' + "\n" +
	'.weekview .weeknum { width: 3em; }' + "\n" +
	'.weekview .currentweek { background-color: none; }' + "\n" +
	'.weeknum:before { content: attr(weeknum); width: 100%; display: block; text-align: center; position: relative; margin-top: -0.5em; top: 50%; z-index: 5; }' + "\n" +
	'.weekview .week { width:100%; margin:0; padding:0; height:20em; padding-bottom: 1px; }' + "\n" +
	'.weekview td.weeknum:before { margin-top: -1.15em; }' + "\n" +
	//'.weekview td.weeknum:before { height: 0; overflow: visible;top: .5em; margin-top: 0; }' + "\n" +
	'.days { width: 100%; }' + "\n" +
	'.days TR { width: 100%; }' + "\n" +
	'.days TD {  padding:0; margin:0; width: 14%; display: block; float: left; text-align: center; font-weight: lighter; padding-right: 2px; padding-bottom: 4px;} ' + "\n" +
	'.days TD:first-child { padding-left: 1px; } ' + "\n" +
	'.day { display: table-cell; padding:0; margin:0; width: 14%; border-top: 1px solid #AAA; border-right:1px solid #AAA; height: 6em; max-height: 6em; vertical-align: top; overflow: hidden;' + "\n" +
    ' } ' + "\n" +
		//' -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s;} ' + "\n" + 
	'.weekview .week .day { height: 100%; max-height: 100%; }' + "\n" +
	'.week:first-child .day { border-top: none !important; } ' + "\n" +
	'.day:hover { background-color: #F2F6FF !important; }' + "\n" +
	'.day > .header { position: relative; top:0; margin: 0.2em; height: 1.1em; float:right; width: 100%; text-align: right; z-index:10; }' + "\n" + //border-left: 1px solid black; border-bottom: 1px solid black; -moz-border-bottom-left-radius: 5px; -webkit-border-bottom-left-radius: 5px; border-radius-bottom-left: 5px; }' +
	'.day1 > .header:before { content: attr(month); margin-left: .2em; float: left; text-align: left; white-space: nowrap; color: grey; font-weight: lighter;  }' + "\n" +
	'.month1,.month3,.month5,.month7,.month9,.month11 { background-color: #FFF } ' + "\n" +
	'.month0,.month2,.month4,.month6,.month8,.month10,.month12 { background-color: #EEF; } ' + "\n" +
	'.today { background-color: #DDF !important; } ' + "\n" + 
	'.day ul.eventlist { width: 100%; padding: 0; margin: 0; margin-top: 1.4em; min-height: 5em; max-height: 5em; list-style-type: none; }' + "\n" +
	'.hourswrapper { display: none; position: relative; height:0; } ' + "\n" +
	'.weekview .week ul.hoursbg { position: absolute; width: 100%; padding: 0; margin: 0; margin-top: 1.4em; list-style-type: none; height: 100%; color: #CCC; }' + "\n" + 
	'.weekview div.hourswrapper { display: block; }' + "\n" + 
	'.weekview div.hourswrapper .hoursbg li { display: block; width: 100%; text-align: right; white-space: pre; overflow: hidden; }' + "\n" + 
	'.weekview .day div.hourswrapper .hoursbg li { content:""; }' + "\n" + 
	'.weekview div.hourswrapper .hoursbg li:nth-child(2n+1) { background-color: rgba(75%,75%,75%,0.35); width: 100%; }' + "\n" + 
	'.weekview .week .day ul.eventlist { position: relative; max-height: 100%; z-index: 2; }' + "\n" + 
	'.weekview .day ul.eventlist li.event:hover { z-index: 3; }' + "\n" + 
	'.day ul.eventlist > li { width: 100%; float:left; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+6), .day ul.eventlist > li:nth-last-child(1n+6) ~ li { width: 50%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+11), .day ul.eventlist > li:nth-last-child(1n+11) ~ li { width: 33.34%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+16), .day ul.eventlist > li:nth-last-child(1n+16) ~ li { width: 25%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+21), .day ul.eventlist > li:nth-last-child(1n+21) ~ li { width: 20%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+26), .day ul.eventlist > li:nth-last-child(1n+26) ~ li { width: 16.7%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+31), .day ul.eventlist > li:nth-last-child(1n+31) ~ li { width: 14.28%; } ' +	"\n" + 



	'.weekview .day ul.eventlist > li[data-duration] { padding-left: 0; border-right-width: 13px; width: 100%; }' + "\n" + 
	'#caltodo .event { margin:0; margin-top: 0; padding-left: .3em; padding-top: .2em; padding-bottom: .2em; display: list-item; font-size: 10pt; vertical-align: top; height: 1.1em; overflow: hidden; text-overflow: ellipsis; ' + "\n" +
		' -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s;} ' + "\n" + 
	
	'.day .event { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; width: 100%; max-width: 100%; white-space: nowrap; text-overflow: ellipsis; margin:0; margin-top: 0; padding-left: .7em; font-size: 10pt; vertical-align: top; max-height: 1.1em; overflow: hidden; ' + "\n" +
		'  min-height: 3px; ' + "\n" +
		' -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s;} ' + "\n" + 
	
	'#wcal .event:before                          { content: " "; font-face: times; width: 0px; position: relative; display: block; float: left; height: 1.1em; margin-left: -.7em; border-left: .15em solid; border-right: .15em solid; }' + "\n" +
	'#wcal .event[transparent=TRANSPARENT]:before { content: " "; font-face: times; width: 4px; position: relative; display: block; float: left; height: .15em; margin-left: -.7em; border: none; border-top: .471em double; border-bottom: .471em double;  }' + "\n" +
	"#wcal .event[status=CANCELLED] { text-decoration: line-through; } \n" +
	"#wcal .day ul li.event[status=TENTATIVE] { opacity: 0.75; border-bottom: 2px solid gold; } \n" +
	"#wcal .day ul li.event[status=CONFIRMED] { opacity: 0.75; border-bottom: 0px solid green; } \n" +
	'.event:hover { color: white;  -webkit-box-flex: 0; -moz-box-flex: 0; box-flex: 0; min-height: 1em; }' + "\n" +
	'.week .day ul.eventlist > li.multiday { width: 100%;  }' + "\n" +
	'.eventstart.event:before { content:none !important;  }' + "\n" +
	'.eventstart { -webkit-box-flex: 0; -moz-box-flex: 0; box-flex: 0; text-wrap: none; -moz-border-radius: .5em 0px 0px .5em; -webkit-border-radius: .5em 0px 0px .5em; border-radius: .5em 0px 0px .5em; } ' + "\n" +
	'.eventend { -webkit-box-flex: 0; -moz-box-flex: 0; box-flex: 0; padding:0px !important; -moz-border-radius: 0px .5em .5em 0px; -webkit-border-radius: 0px .5em .5em 0px; border-radius: .0px .5em .5em 0px; } ' + "\n" +
	
	'#calpopup,#calpopupe,.calpopup {position:absolute; z-index: 10;  width: 280px; min-height: 300px; border:1px solid #AAA; background:#FFF; font-size: 11pt; -moz-border-radius:5px; -webkit-border-radius:5px; border-radius:5px; '+
		'-moz-box-shadow: 3px 3px 10px #888; -webkit-box-shadow: 3px 3px 10px #888; box-shadow: 3px 3px 10px #888; -webkit-transform: translate(3px,-20px); -moz-transform: translate(3px,-20px); transform: translate(3px,-20px);}' + "\n" +
	'#calpopup { overflow: visible; } ' + "\n" +
	'.calpopupe { min-width: 200px; min-height: 150px;   } ' + "\n" +
	'.calpopup { padding: 0.5em;resize:both; -webkit-transition-property: display; -webkit-transition-duration: 0.2s; -moz-transition-property: display; -moz-transition-duration: .2s; transition-property: display; transition-duration: .2s;}' + "\n" + 
	'.calpopup * { resize:none; } ' + "\n" +
	'.calpopup .granted { color: green; border-bottom: 2px solid green; }' + "\n" +
	'.calpopup .granted li { color: green; border-bottom: 2px solid green; }' + "\n" +
	'.calpopup.left:before { content: ""; position: absolute; display: block; top: 20px; left:-9px; width: 15px; height:15px; border:1px solid #AAA;  background:#FFF; '+
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; z-index: -10; '+
		'-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); transform: rotate(45deg); z-index: 0;} ' + "\n" +
	'.calpopup.left:after { content: ""; position: absolute; display: block; top: 13px; left: 0; width: 15px; height:30px; background:#FFF; z-index: 10;} ' + "\n" +
	'.calpopup.right:before { content: ""; position: absolute; display: block; top: 20px; right:-9px; width: 15px; height:15px; border:1px solid #AAA;  background:#FFF; '+
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; z-index: -10; '+
			'-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); transform: rotate(45deg); z-index: 0;} ' + "\n" +
	'.calpopup.right:after { content: ""; position: absolute; display: block; top: 13px; right:0; width: 15px; height:30px; background:#FFF; z-index: 10;} ' + "\n" +

	'.calpopup.left.bottom:before { content: ""; position: absolute; display: block; top: 250px; left:-9px; width: 15px; height:15px; border:1px solid #AAA;  background:#FFF; '+
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; z-index: -10; '+
		'-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); transform: rotate(45deg); z-index: 0;} ' + "\n" +
	'.calpopup.left.bottom:after { content: ""; position: absolute; display: block; top: 243px; width: 15px; height:30px; background:#FFF; z-index: 10;} ' + "\n" +
	'.calpopup.right.bottom:before { content: ""; position: absolute; display: block; top: 250px; right:-9px; width: 15px; height:15px; border:1px solid #AAA;  background:#FFF; '+
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; z-index: -10; '+
		'-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); transform: rotate(45deg); z-index: 0;} ' + "\n" +
	'.calpopup.right.bottom:after { content: ""; position: absolute; display: block; top: 243px; right:0; width: 15px; height:30px; background:#FFF; z-index: 10;} ' + "\n" +

	'.databool { content: "" !important; } ' + "\n" +
	'.databool.boolselected:before { content: marker("disc"); color: blue; } ' + "\n" +

	'.event[data-time^="0."] { color: white !important; } ' + "\n" +
	'#wcal .event[data-time^="0."]:before { display: none;  } ' + "\n" +
	'.privilegeBox { position: absolute; display: none; background-color: white; border: 1px solid #999; width: 32em;}' + "\n" +
	'.privilegeOwner:hover .privilegeBox { display: block; }' + "\n" +
	'.privilegeBox li { border-bottom: 2px solid white; }' + "\n" +
	'.privilegeBox > ul >li { width:100%; clear: both; }' + "\n" +
	'.privilegeBox * { padding:0; margin: 0; color: #AAA; }' + "\n" +
	'.privilegeBox li ul { display: inline; position: relative; width: 22.5em;  }' + "\n" +
	'.privilegeBox li li { float:right ; width: 7.5em; }' + "\n" +
	'.completionWrapper { position: absolute; top:0; margin:0; margin-top: 2em; z-index: 100; padding: 0; min-height:0 ; max-width: ; min-width: 0; overflow: hidden; padding-right: -1em; ' + "\n" +
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; } '+ "\n" +
	'.completion { z-index: 100; padding: 0; min-height:0 ; max-height: 20em; min-width: 0;background: white; overflow-y: auto ; overflow-x: hidden; padding-right: 19px; margin-right: -18px; }' + "\n" +
	'.completion div:first-child {margin: 0 0 0 0; } ' + "\n" +
	'.completion div { width: 110%; margin: 0; padding: .3em; white-space: pre; padding-left: .5em; padding-right: .5em; -moz-transition-property: all; -moz-transition-duration: .2s; -webkit-transition-property: all; -webkit-transition-duration: .2s; transition-property: all; transition-duration: .2s; } ' + "\n" +
	'.completion div:hover { background: #AAA !important; } ' + "\n" +
	'.completion:hover div.selected { background: none; } ' + "\n" +
	'.completion div.selected { background: #AAA; } ' + "\n" +
	'.completion div.highlighted { background: #BBA; } ' + "\n" +
	'.completion div.remove { height: 1em; } ' + "\n" +
	'.completion div.remove:after { content: attr(text); color: #787878; } ' + "\n" +
	

	'.timeline { margin: 0 ; padding:0; width: 1em; position: absolute; bottom: 1px; height: 100%;   } ' + "\n" +
	'.timeline ol { list-style-type: none; margin: 0 ; margin-left: -0.08em; padding:0; width: 1.5em; position: absolute; bottom: 1px; height: 100%; } ' + "\n" +
	'.timeline ol:hover { padding-top: 0; -webkit-transition: all 0.2s; -moz-transition: all 0.2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition: all 0.2s; } ' + "\n" +
	'.timeline ol li.line { position: absolute; height: 1em; top: 0; right: 0.4em; text-align: right; margin: 0; padding:0; width: 2.5em; font-size: 100% !important; '+
		'color: green; -webkit-transition: none 0.0s; -moz-transition: all 0.2s; transition: all 0.2s; -moz-transition-property: all; -moz-transition-duration: .2s; z-index: 2; } ' + "\n" +
	'.timeline ol li.current { position: absolute; height: 0; left: 0; margin-top: 0; margin-left: 2px; padding:0; width: 0.85em; font-size: 100% !important; '+
		'border-top: 2px solid red; -webkit-transition: none 0.0s; -moz-transition: all 0.2s; transition: all 0.2s; -moz-transition-property: all; -moz-transition-duration: .2s; z-index: 1; } ' + "\n" +
	'.timeline li { list-style-type: none; margin: 0 ; padding:0; color: #999; position: relative; height: 10.15%; width:1em; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; '+
		'-webkit-transition: all 0.2s; -moz-transition: all 0.2s; transition: all 0.2s; overflow: hidden ; white-space: nowrap; -moz-transition-property: all; -moz-transition-duration: .2s; z-index: 3; padding-top: 40%; border-color: #999; } ' + "\n" +
	'.timeline li span { padding:0; margin:0; display: block; position: absolute; margin-bottom: -0.5em; bottom: 50%; font-size: 120%; } ' + "\n" +
	'.timeline li:nth-child(2n+1) { color: #9898C8; border-color: #9898C8; } ' + "\n" +
	'.timeline li.hover120 { font-size: 150%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible;border-left: 1px solid; } ' + "\n" +
	'.timeline li.hover165 { font-size: 200%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible;border-left: 2px solid; } ' + "\n" +
	'.timeline li.hover200 { font-size: 300%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible; border-left: 4px solid; } ' + "\n" +
	'.timeline li.hover200 span { } ' + "\n" +
	'.timeline li.hover165a { font-size: 200%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible; border-left: 2px solid; } ' + "\n" +
	'.timeline li.hover120a { font-size: 150%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible; border-left: 1px solid; } ' + "\n" +
	'#calcurrenttime { position: absolute; height: 0; left: 1px; margin: 0;  padding:0; width: 110%; border-bottom: 1px solid red; '+
		'-webkit-transition: none 0.0s; -moz-transition: all 0.2s; transition: all 0.2s; -moz-transition-property: all; -moz-transition-duration: .2s; z-index: 1; } ' + "\n" +
	'.weekview #calcurrenttime { margin-top: 1em; } '+"\n"+
	wvs +

	'#callightbox { position: absolute; top:0; left:0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 20;} ' + "\n" +
	".colorpicker { position: absolute; width: 8em; height: 7em; background-color: white; z-index: 99;} \n" +
	".colorpicker span { display: block; float: left; width: 1em; height: 1em; margin: 0.2em 0.166em 0.2em 0.166em;  } \n" + 
	".color1  { background-color: #000088; } .color2  { background-color: #008800; } .color3  { background-color: #880000; } .color4  { background-color: #008888; } .color5  { background-color: #880088; } .color6  { background-color: #888800; } \n" + 
	".color7  { background-color: #4444CC; } .color8  { background-color: #44CC44; } .color9  { background-color: #CC4444; } .color10 { background-color: #44CCCC; } .color11 { background-color: #CC44CC; } .color12 { background-color: #CCCC44; } \n" +
	".color13 { background-color: #0000FF; } .color14 { background-color: #00FF00; } .color15 { background-color: #FF0000; } .color16 { background-color: #00FFFF; } .color17 { background-color: #FF00FF; } .color18 { background-color: #FFFF00; } \n" + 
	".color19 { background-color: #4444FF; } .color20 { background-color: #44FF44; } .color21 { background-color: #FF4444; } .color22 { background-color: #44FFFF; } .color23 { background-color: #FF44FF; } .color24 { background-color: #FFFF44; } \n" + 
	".color25 { background-color: #8888FF; } .color26 { background-color: #88FF88; } .color27 { background-color: #FF8888; } .color28 { background-color: #88FFFF; } .color29 { background-color: #FF88FF; } .color30 { background-color: #FFFF88; } \n" + 

	
	'#caldrop { position: absolute; top: 0; left: 0; text-align: right; margin: 0; padding: 0; background: white; border-bottom: 1px solid red; width: 30%; height: 1em;  z-index: 99; }' + "\n" +
	"#caldavloading1 span { -webkit-text-fill-color: transparent; display: block; width: 200%; margin-left: -50%; background-position: -3.5em 0; \n"+
  "  -webkit-animation-name: 'colorcycle'; -webkit-animation-duration: 2s; -webkit-animation-iteration-count: infinite; -webkit-animation-timing-function: ease; \n"+
	" background-image: -webkit-gradient(linear,left top,right top,color-stop(0, #555),color-stop(0.4, #555),color-stop(0.5, white),color-stop(0.6, #555),color-stop(1, #555));\n"+
	" background-image: -webkit-linear-gradient(left ,#555 0%, #555 40%, white 50%, #555 60%, #555 100% ); \n"+
	" background-image: -moz-linear-gradient(left ,#555 %0,#555 40%, white 50%, #555 60%, #555 100%); background-image: linear-gradient(left ,#555 %0,#555 40%, white 50%, #555 60%, #555 100%); \n" +
	" -webkit-background-clip: text; } \n "+
  "@-webkit-keyframes 'colorcycle' { from { background-position: -3.5em 0; } to { background-position: 3.5em 0; } }: \n"+
	'</style>';
	$(document.body).append(cs);
}

function questionBox ( question, answers, callback )
{
	$('#calpopupd').remove();
	var popup = $('#calpopup').clone(true).attr('id','calpopupd').removeClass('left right bottom');
	var litebox = $('<div id="callightbox"></div>').append (popup);
	$(litebox).appendTo('#calwrap');
	$('#wcal').data('popupe','#calpopupd');
	$('#calpopup').hide();
	$('#calpopupd').empty();
	$('#calpopupd').css({opacity:1,height: 'auto','min-height':'5em',padding: '1em'});
	$('#calpopupd').append('<div class="question">'+question+'</div>');
	var box = $('<div class="box'+answers.length+'"></div>');
	for ( var i=0;i<answers.length;i++)
	{
		$(box).append('<span><div class="button">'+answers[i]+'</div></span>');
	}
	$('.button',box).click(function(){var t =answers.indexOf($(this).text()); $('#callightbox').remove(); callback(t);});
	$(document.body).keypress(function(e){if (e.keyCode == 27){ $('#callightbox').remove(); callback(-1); return false;}});
	$('#calpopupd').append(box);
	$('#calpopupd').show();
	$('#calpopupd').css({position:'absolute',top:window.innerHeight/2-$('#calpopupd').height()/2,left:window.innerWidth/2-$('#calpopupd').width()/2,'z-index':99});
}

function buildtimeline ()
{
	var s = new Date();
	var b = s.getFullYear() - 5;
	var e = s.getFullYear() + 5;
	var redline = function (e){$('.line',this).css({top:e.pageY  - $(this).offset().top - ($('.line').height()/2)});
			if ($('.timeline').data('date') !=undefined)$('.line').html(($('.timeline').data('date').getMonth()+1)+'&nbsp;&mdash;');}
	var div = $('<div class="timeline" ></div');
	var ol = $('<ol></ol>');
	for ( var i=b;i<e;i++)
	{
		$(ol).append('<li class="year'+i+'" ><span>&mdash;' + i + '</span></li>');
	}
	$(ol).append('<li class="current"></li>');
	$('li',ol).hover( function (e){
      $(this).addClass('hover200');
      $(this).prev().addClass('hover165');
      $(this).prev().prev().addClass('hover120');
      $(this).next().addClass('hover165a').next().addClass('hover120a');
      $(this).mousemove(function(e){
        var y = Math.round ( 10.5 * ((e.pageY - $(this).offset().top) / $(this).height() ) );
        $('.timeline').data('date',new Date(Number($(this).text().replace(/[^0-9]/g,'')),y,1));
        });
    },function (e){
      $(this).removeClass('hover200').prev().removeClass('hover165').prev().removeClass('hover120');
      $(this).next().removeClass('hover165a').next().removeClass('hover120a');
      $(this).unbind ( 'mousemove' );
    });
    $(ol).hover( function (e){
        if ( $('.line',this).length == 0 ){$(this).append('<li class="line"></li>');}
        $(this).mousemove(redline);
      },function (e){
        $(this).unbind ( 'mousemove' );
        $('.line',this).remove();
        $('.display',this).empty();
      }); 
	$(div).append(ol);
	return div;
}

function updateTimeline()
{
	var st = $('#wcal').scrollTop();
	var rows = $('#calt tr:eq(0)');
	var row = $('#calt tr:eq(' + Math.floor( st / rows[0].clientHeight ) + ') .header:last');
	if ( $(row).length < 1 )
		return;
	var year = $(row).parent().attr('id').replace(/day_([0-9]{4}).*/,'$1');
	var month = $(row).parent().attr('id').replace(/day_....([0-9]{2}).*/,'$1');
	var tl = $('.timeline li.year'+year);
	if ( $(tl).length > 0 )
		$('.timeline li.current').css('top',$(tl).position().top + $(tl).height()*(month/12));
}

function currentTimeIndicator()
{
	var d = new Date ();
	var dy = new Date ();
	//dy.localTzApply();
	var h = ( d.getHours() ) * 100;
	if ( h > settings.end.getLongMinutes() || h < settings.start.getLongMinutes() && $('#calcurrenttime').length > 0)
	{
		$('#calcurrenttime').remove();
		return ;
	}
	if ( $('#calcurrenttime').length == 0 )
		$('#day_' + dy.DayString() + ' .header' ).append('<div id="calcurrenttime"></div>');
	var p = $('#calcurrenttime').closest('.day');
	if ( $(p).attr('id') != 'day_' + dy.DayString() )
		$(p).detach().appendTo('#day_' + dy.DayString() + ' .header' );
	h = h + ( d.getMinutes()/60) * 100;
	var percent = ((h)-settings.start.getLongMinutes())/(settings.end.getLongMinutes()-settings.start.getLongMinutes());
	var offset = $('.eventlist',p).outerHeight() - $('.eventlist',p).innerHeight();
	$('#calcurrenttime').css('top',offset+$('.eventlist',p).innerHeight()*percent);
}

var subStart=null,subEnd=null;
function buildweek(d,get)
{
	var start = new Date(d.getFullYear(),d.getMonth(),(d.getDate()-d.getDay()+settings.weekStart)), y = new Date(d.getFullYear(),0,1);
	var weeknum = (start.getTime() - y.getTime())/1000;
	weeknum = weeknum / 604800;
	weeknum = Number(weeknum+1).toFixed(0); // TODO fix calculation if year starts after thursday
	//var week = $('<tr class="week week'+weeknum+'"><div class="weeknum"> week'+weeknum+'</div></tr>');
	var week = $('<tr class="week week'+weeknum+'"></tr>');
	$(week).append('<td class="weeknum" weeknum="'+weeknum+'"></td>');
	$(week).children().append($(fhw).clone(true));
	for ( var i=0;i<7;i++)
	{ 
		$(week).append(buildday(start));
		start.setDate(start.getDate()+1);
	}
	$('ul',week).dblclick(newevent);
	$('td',week).dblclick(newevent);
	$.each($('td',week),function (i,v){
		$(v).bind('drop',calDrop);
		$(v).bind('dragenter', calDragEnter);
		$(v).bind('dragleave', calDragLeave);
		$(v).bind('dragover', calDragOver);});
	//$(week).append($('<span class="placeholder"></span>'));
	start = new Date(d.getFullYear(),d.getMonth(),(d.getDate()-d.getDay()));
	start.setTime(start.getTime()-60000*start.getTimezoneOffset());
	var end = new Date(d.getFullYear(),d.getMonth(),((d.getDate()-d.getDay())+7));
	end.setTime((end.getTime()-1)-60000*end.getTimezoneOffset());
	var cals = $(document).caldav('calendars');
	for ( var i=0;i<cals.length;i++)
	{
		$(document).caldav('getEvents', { url:cals[i].url,username:$('#user').val(),password:$('#pass').val()},start,end,i);
	}
	if ( subStart != null )
	{
		if ( subStart > start )
			subStart = start;
		if ( subEnd < end )
			subEnd = end;
	}
	else
	{
		subStart = start;
		subEnd = end;
		window.setTimeout(function(){ addSubscribedEvents(-1, subStart,subEnd); subStart=null;subEnd=null;},350); 
	}
	return week;
}

function buildday (d)
{
	var day = $('<td class="day day'+ d.getDate() +' weekday'+ d.getDay() +' month'+ (d.getMonth()+1) +'" id="day_'+ d.DayString() +'" ><div class="header" month="'+ months[d.getMonth()] +'" >'+ d.getDate() +'</div><ul class="eventlist"></ul></td>');
	$(day).prepend($(hw).clone(true));
	return day;
}

function guid()
{ 
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				    return v.toString(16);
						}).toUpperCase();
}

///////////////////////////////////////////////////////////////////////
//                iCal Handling accepts files or fragments

var iCal = function ( text ) {
	this.prototype = Array.prototype;
	this.icsTemplate = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//jqCalDav\nCALSCALE:GREGORIAN\nBEGIN:VEVENT\nSUMMARY:New Event\nDTEND;VALUE=DATE:19700101\nTRANSP:TRANSPARENT\nDTSTART;VALUE=DATE:19700101\nDTSTAMP:19700101T000000Z\nSEQUENCE:0\nEND:VEVENT\nEND:VCALENDAR";

	this.components = { 
		vcalendar:{required:['version','prodid',['vevent','vtodo','vjournal','vfreebusy']],optional:['calscale','method','vtimezone']},
		vevent:{required:['dtstamp','uid','dtstart'],optional:['dtend','duration','class','created','description','geo','last-modified','location','organizer','priority','sequence','status','summary','transp','url','recurrence-id','attach','attendee','categories','comment','contact','exdate','request-status','related-to','resources','rdate','rrule','request-status']},
		vtodo:{required:['dtstamp','uid'],optional:['dtstart','class','completed','created','description','geo','last-modified','location','organizer','percent-complete','priority','sequence','status','summary','url','recurrence-id','attach','attendee','categories','comment','contact','exdate','request-status','related-to','resources','rdate','rrule','request-status']},
		vjournal:{required:['dtstamp','uid'],optional:['dtstart','class','created','description','last-modified','organizer','sequence','status','summary','url','recurrence-id','attach','attendee','categories','comment','contact','exdate','request-status','related-to','resources','rdate','rrule','request-status']},
		vfreebusy:{required:['dtstamp','uid'],optional:['contact','dtstart','dtend','organizer','url','attendee','comment','freebusy','request-status']},
		valarm:{required:['action','trigger'],optional:['description','duration','repeat','attach','summary',,'attendee']},
		vtimezone:{required:['tzid','dtstart','tzoffsetto','tzoffsetfrom'],optional:['last-modified','tzurl','standard','daylight','tzname','comment','rdate']},
		daylight:{required:['dtstart','tzoffsetto','tzoffsetfrom'],optional:['last-modified','tzurl','tzname','comment','rdate','rrule']},
		standard:{required:['dtstart','tzoffsetto','tzoffsetfrom'],optional:['last-modified','tzurl','tzname','comment','rdate','rrule']}
	};
	this.fields = {
		version:{max:1,visible:false,type:'text','default':'2.0'},
		prodid:{max:1,visible:false,type:'text','default':'-//jqCalDav'},
		calscale:{max:1,visible:false,type:'text','default':'GREGORIAN'},
		summary:{max:1,visible:true,type:'text'},
		dtstart:{max:1,visible:true,type:'date'},
		dtend:{max:1,visible:true,type:'date'},
		duration:{max:1,visible:true,type:'duration'},
		rrule:{max:1,visible:true,type:'recurrence'},
		rdate:{max:-1,visible:true,type:'rdate'},
		'recurrence-id':{max:1,visible:false,type:'date'},
		transp:{max:1,visible:true,type:'text',values:{vevent:['TRANSPARENT','OPAQUE']},'default':'TRANSPARENT'},
		freebusy:{max:-1,visible:false,type:'period'},
		due:{max:1,visible:true,type:'date'},
		completed:{max:1,visible:true,type:'date'},
		status:{max:1,visible:true,type:'text',values:{vevent:['TENTATIVE','CONFIRMED','CANCELLED'],vtodo:['NEEDS-ACTION','COMPLETED','CANCELLED','IN-PROCESS'],vjournal:['DRAFT','FINAL','CANCELLED']}},
		resources:{max:-1,visible:true,type:'text'},
		priority:{max:1,visible:true,type:'integer',range:{vevent:[0,9],vtodo:[0,9]}},
		'percent-complete':{max:1,visible:true,type:'integer',range:{vtodo:[0,100]}},
		location:{max:1,visible:true,type:'text'},
		geo:{max:1,visible:true,type:'latlon'},
		description:{max:1,visible:true,type:'text'},
		comment:{max:-1,visible:true,type:'text'},
		'class':{max:1,visible:true,type:'text',values:{vevent:["PUBLIC","PRIVATE","CONFIDENTIAL"],vtodo:["PUBLIC","PRIVATE","CONFIDENTIAL"],vjournal:["PUBLIC","PRIVATE","CONFIDENTIAL"]}},
		categories:{max:-1,visible:true,type:'text'},
		attach:{max:-1,visible:true,type:'text'}, // actually it could be a uri
		method:{max:1,visible:false,type:'text'},
		tzid:{max:1,visible:false,type:'text'},
		tzname:{max:-1,visible:false,type:'text'},
		tzoffsetfrom:{max:1,visible:false,type:'integer'},
		tzoffsetto:{max:1,visible:false,type:'integer'},
		tzurl:{max:1,visible:false,type:'uri'},
		attendee:{max:-1,visible:true,type:'text'},
		contact:{max:-1,visible:true,type:'text'},
		organizer:{max:1,visible:true,type:'text'},
		'related-to':{max:-1,visible:false,type:'text'},
		url:{max:1,visible:true,type:'uri'},
		uid:{max:1,visible:false,type:'text'},
		exdate:{max:-1,visible:false,type:'date'},
		action:{max:1,visible:false,type:'text'},
		repeat:{max:1,visible:false,type:'integer'},
		trigger:{max:1,visible:false,type:'trigger'},
		created:{max:1,visible:false,type:'date'},
		dtstamp:{max:1,visible:false,type:'date'},
		'last-modified':{max:1,visible:false,type:'date'},
		sequence:{max:1,visible:false,type:'integer','default':0},
		'request-status':{max:-1,visible:false,type:'text'},
	};

	this.parseiCal = function ( text )
	{
		var dRX = /([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?[Zz]?/;
		var types = /(VEVENT|VTODO|VJOURNAL|VFREEBUSY)/;
		var t = text.replace(/\n[\s\t]/mg,'').split ("\n");
		var ret = new Array ();
		var ic = new Object ;
		ic['RAW'] = text;
		ic.propertyIsEnumerable('RAW',false);
		var c = ic;
		var previous = new Array ();
		previous.push(c);
		for (var i=0;i<t.length;i++)
		{
			//var l = t[i].match( /^(.*?):(.*)/m ); bad regex, need to ignore separators in ""
			var l = t[i].match( /^((?:'[^']*')|(?:[^:]+)):(.*)/m ); // (?:'[^']*')|(?:[^, ]+)
			if ( l == null  )
				continue;
			l = l.slice(1);
			var a=l[1].replace(/\\(,|;)/g,'$1');
			l[1]=a.replace(/\\n/g,"\n");
			l0l = l[0].toLowerCase();
			if ( l[0] == 'BEGIN' )
			{
				var old = c;
				previous.push(c);
				var c = new Object;
				c['BEGIN'] = true;
				c.propertyIsEnumerable('BEGIN',false);
				if ( old[l[1].toLowerCase()] != undefined  && ! types.test(l[1]) )
				{
					if ( typeof old[l[1].toLowerCase()] != "array" )
						old[l[1].toLowerCase()] = new Array ( $.extend({},old[l[1].toLowerCase()] ) );
					old[l[1].toLowerCase()].push(c);
				}
				else
					old[l[1].toLowerCase()]=c;
				continue ;
			}
			else if ( l[0] == 'END' )
			{
				c.UPDATED = false ;
				if ( types.test(l[1]) )
				{
					ret.push($.extend(true,{},ic));
					ret[ret.length-1].TYPE=l[1].toLowerCase();
				}
				else if ( l[1].toLowerCase() == 'vtimezone' )
				{
					this.tz = new zones(c);
				}
				var c = previous.pop();
				continue ;
			}
			else if ( l[0] == 'RRULE' )
				c[l0l] = this.newField(l0l,l[1]);
			else if ( l[0].match( /;/ ) )
			{
				var a = new Object ;
				var p = l[0].split(';');
				l0l = p[0].toLowerCase();
				for (var x=1;x<p.length;x++ ) 
				{
					var pp = p[x].split('=');
					a[pp[0].toLowerCase()] = pp.slice(1).join();
				}
				if ( c[l0l] != undefined )
					c[l0l].UPDATE(l[1],a);
				else
					c[l0l] = this.newField(l0l,l[1],a);
			}
			else if ( c[l0l] != undefined )
				c[l0l].UPDATE(l[1]);
			else
				c[l0l] = this.newField(l0l,l[1]);
			c[l0l].PARENT = c; 
		}
		return ret;
	};
	
	this.printiCal = function ( timezone )
	{
		this.parts = {VTIMEZONE:[],VEVENT:[],VTODO:[],VJOURNAL:[] };
		this.depth =0;
		var vcal = this.print ( this.ics, timezone );
		for ( var i in this.parts )
		{
			for ( var j in this.parts[i] )
				vcal = vcal + this.parts[i][j];
		}
		vcal = vcal + "END:VCALENDAR\n";
		if ( debug ) console.log ( vcal );
		return vcal;
	};

	this.print = function ( ics, timezone )
	{
		if ( timezone != null )
			this.timezones = timezone;
		var types = /(VEVENT|VTODO|VJOURNAL)/;
		var text = '';
		var printed = {};
		for ( var i in ics )
		{
			var line = '';
			if ( i-0 == i )
			{
				text += this.print(ics[i],false);
				continue;
			}
			if ( i == i.toUpperCase() )
				continue;
			if ( ics[i] instanceof Object )
			{
				if ( ics[i].BEGIN || ics[i].SERIALIZE == undefined )
				{
					if ( ics[i].UPDATED )
					{
						if ( ics[i].sequence )
							ics[i].sequence.VALUE ++;
						if ( ics[i].dtstamp )
							ics[i].dtstamp.UPDATE ( new Date() );
					}
					line = 'BEGIN:' + i.toUpperCase() + "\n";
					if ( i == 'vtimezone' || timezone )
						line += this.print(ics[i],true);
					else
					{
						if ( ics[i] instanceof Array )
						{
							for ( var j=0; j<ics[i].length; j++ )
							{
								line += this.print(ics[i][j],false);
								if ( j+1 < ics[i].length )
								{
									line += 'END:' + i.toUpperCase() + "\n";
									line += 'BEGIN:' + i.toUpperCase() + "\n";
								}
							}
						}
						else
							line += this.print(ics[i],false);
					}
					var end = 'END:' + i.toUpperCase() + "\n";
					if ( i != 'vcalendar' )
						line += end;
					else
						this.depth++;
					if ( types.test ( i.toUpperCase() ) )
					{
						this.parts[i.toUpperCase()].push ( line );
						line = '';
					}
					else if ( this.depth > 1 ) 
						line = '';
				}
				else
				{
					if ( this.fields[i] != undefined && this.fields[i].max > 0 && printed[i] >= this.fields[i].max )
						continue;
					printed[i]++;
					line = ics[i].SERIALIZE(); 
				}
			}
			else
			{
				if ( i == i.toUpperCase() )
					continue ;
				if ( this.fields[i].max > 0 && printed[i] > this.fields[i].max )
					continue;
				switch ( i )
				{
					case 'dtstamp':
						line = 'DTSTAMP:' + (new Date()).DateString() + "\n";
						break ;
					case 'sequence':
						line = 'SEQUENCE:' + ics[i].VALUE + 1 + "\n";
						break ;
					default :
						line = i.toUpperCase() + ':' + ics[i] + "\n";
				}
				printed[i]++;
				if ( line.length > 72 )
					for ( var z=72;z<line.length;z+=72)
						line = line.slice(0,z) + "\n " + line.slice(z);
			}
			text += line;
		}
		return text;
	};


	this.toString = this.printiCal;

	this.pop=function(){return this.ics.pop();};
	this.push=function(i){return this.ics.push(i);};
	this.reverse=function(){return this.ics.reverse();};
	this.shift=function(){return this.ics.shift();};
	this.splice=function(i){return this.ics.splice(i);};
	this.unshift=function(i){return this.ics.unshift(i);};
	this.slice=function(b,e){return this.ics.slice(b,e);};
	this.pop=function(){return this.ics.pop();};
	this.UPDATE = function(){
		this.dateValues = function (d){
			if ( d.getDate ) return	{DATE: d,VALUE:d.DateString()};
			else if ( String(d).match(/\s/) ) {var n=Zero().parsePrettyDate(d); return {DATE:n,VALUE:n.DateString()};}
			else return {DATE:Zero().parseDate(d),VALUE:d}; };
		this.SETDATE = function ()
		{
			if ( arguments[1] instanceof Object )
			{
				var props = arguments[1];
				if ( arguments[2] != undefined )
					p = arguments[2];
			}
			else if ( arguments.length > 1 )
				p = arguments[1];
			var n = this.dateValues(arguments[0]);
			if ( this.VALUES )
			{
				if ( this.DATES == undefined ) 
				{
					this.DATES = new Array ;
					this.PROPS = new Array ;
					this.VALUES.push(this.VALUE);
					this.DATES.push(this.DATE);
					if ( props )
						this.PROPS.push(props);
					else
						this.PROPS.push('');
				}
				if ( p )
				{
					var  i = this.DATES.indexOf(p)?this.DATES.indexOf(p):this.VALUES.indexOf(p);
					if ( i < 0 ) i = this.VALUES.length;
					this.VALUES[i] = n.VALUE;
					this.DATES[i] = n.DATE;
				}
				else
				{
					this.VALUES.push(n.VALUE);
					this.DATES.push(n.DATE);
					if ( props )
						this.PROPS.push(props);
				}
			}
			else 
			{ 
				this.DATE = n.DATE;
				this.VALUE = n.VALUE;
				if ( props )
					this.PROP = props;
			} 
		};
		this.SETDURATION = function (t,p)
		{
			if ( t.valid == undefined )
			{
				var v = t;
				var d = parseDuration(t);
			}
			else
			{
				var v = printDuration(t);
				var d = t;
			}
			if ( arguments.length > 1 )
				var props = arguments[1];
			if ( this.VALUES )
			{
				if ( props == undefined ) 
					props = null;
				if ( this.PROPS == undefined )
				{
					this.PROPS = new Array ;
					this.PROPS.push(this.PROP!=undefined?this.PROP:null);
				}
				if ( this.DURATIONS == undefined )
				{
					this.DURATIONS = new Array ;
					this.DURATIONS.push(this.DURATION!=undefined?this.DURATION:null);
				}
				if ( p && this.VALUES.indexOf(p) ) 
				{
					this.DURATIONS[this.VALUES.indexOf(p)] = d;
					this.VALUES[this.VALUES.indexOf(p)] = v;
					this.PROPS[this.VALUES.indexOf(p)] = props;
				}
				else
				{
					this.DURATIONS.push(d);
					this.VALUES.push(v);
					this.PROPS.push(props);
				}
			}
			else
			{
				if ( this.FIELDS && this.FIELDS.values )
					for ( var i in valueNames )
						if ( t == valueNames[i] )
							t = i;
				this.DURATION=d;
				this.VALUE=v;
				if ( props != undefined ) 
					this.PROP = props;
			}
		};
		this.TRIGGER = function (s)
		{
			var dRX = /^([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?([Zz])?$/;
			if ( s instanceof Date || dRX.test ( s ) )
			{
				this.SETDATE.apply(this,arguments);
			}
			else
			{
				this.SETDURATION.apply(this,arguments);
			}
		};
		this.SETRECURRENCE = function (s)
		{ 
			if ( this.RECURRENCE == undefined )
				this.RECURRENCE = new recurrence;
			if (String(s).match(/\s/)) 
			{ 
				this.RECURRENCE.parsePrettyRecurrence(s); 
				this.VALUE = s; 
			}
			else 
			{ 
				this.VALUE =s; 
				this.RECURRENCE.parseRecurrence(s) 
			} 
		};
		this.TEXT = function (t,p)
		{
			t = t.replace ( /\\([\\.,;:])/g, '$1' );
			if ( arguments.length > 1 )
				var props = arguments[1];
			if ( this.VALUES )
			{
				if ( props == undefined ) 
					props = null;
				if ( this.PROPS == undefined )
				{
					this.PROPS = new Array ;
					this.PROPS.push(this.PROP!=undefined?this.PROP:null);
				}
				if ( p && this.VALUES.indexOf(p) ) 
				{
					this.VALUES[this.VALUES.indexOf(p)] = t;
					this.PROPS[this.VALUES.indexOf(p)] = props;
				}
				else
				{
					this.VALUES.push(t);
					this.PROPS.push(props);
				}
			}
			else
			{
				if ( this.FIELDS && this.FIELDS.values )
					for ( var i in valueNames )
						if ( t == valueNames[i] )
							t = i;
				this.VALUE=t;
				if ( props != undefined ) 
					this.PROP = props;
			}
		};
		this.INTEGER = function (t){this.VALUE=Number(t);}
		this.SEQUENCE = function (){this.VALUE=Number(this.VALUE)+1;}
		this.PRINT = {
			'integer':function(){return this.VALUE;},
			number:function(){return this.VALUE;},
			sequence:function(){return this.VALUE;},
			text:function(){
				if ( arguments.length > 0 && this.VALUES && this.VALUES.length > 1 ) 
					var t = this.VALUES[arguments[0]]; 
				else 
					var t = this.VALUE; 
				if ( valueNames[t] )
					t = valueNames[t];
				if ( t != undefined )
				return t.replace(/\\n/g,"\n");},
			date:function(){
				if ( arguments.length > 0 && this.DATES.length > 1 ) 
					return this.DATES[arguments[0]].prettyDate(); 
				else 
					return this.DATE.prettyDate();},
			duration:function(){
				if ( arguments.length > 0 && this.VALUES && this.VALUES.length > 1 ) 
					var t = this.VALUES[arguments[0]]; 
				else 
					var t = this.VALUE; 
				return t;},
			trigger:function(){ if ( this.DATE ) return this.PRINT.date.apply(this,arguments);return this.PRINT.duration.apply(this,arguments);},
			recurrence:function(){if ( arguments[0] !== true ) var p = true; else var p = false; return this.RECURRENCE.toString(p);},
			props:function(){
				var line = '';
				if ( arguments.length > 0 && this.PROPS && this.PROPS.length > 1 )
				{
					if ( this.VALUES.indexOf(arguments[0]) ) var p = this.PROPS[this.VALUES.indexOf(arguments[0])];
					if ( this.VALUES[arguments[0]] ) var p = this.PROPS[arguments[0]];
				}
				else
					var p = this.PROP;
				for ( var j in p )
					if ( j != j.toUpperCase() )
						line += ';' + j.toUpperCase() + '=' + p[j];
				return line;
			}
		};
		this.ESCAPE = function ( text ) {
			var t = text;
			t = t.replace ( /([^\\])([\\,;:])/g, '$1\\$2' );
			return t.replace ( /\n/g, '\\n' );
		};
		this.SERIALIZE = function ()
		{
			var ret = '';
			if ( this.VALUES && this.VALUES.length > 0 && ( this.FIELDS == undefined || ( this.FIELDS.max != 1 ) ) )
			{
				for ( var i = 0; i < this.VALUES.length; i++ )
				{
					line = this.FIELD.toUpperCase() + this.PRINT.props.apply(this,[i]) + ':';
					if ( this.type == 'date' )
						line = line + this.DATES[i].DateString() + "\n";
					else if ( this.type == 'text' )
						line = line + this.ESCAPE(this.VALUES[i]) + "\n";
					else
						line = line + this.PRINT[this.type].apply(this,[i]) + "\n";
					if ( line.length > 72 )
						for ( var z=72;z<line.length;z+=72)
							line = line.slice(0,z) + "\n " + line.slice(z);
					ret = ret + line;
				}
			}
			else
			{
				ret = ret + this.FIELD.toUpperCase() + this.PRINT.props.apply(this) + ':' ;
				if ( this.type == 'date' )
					ret = ret + this.DATE.DateString() + "\n";
				else if ( this.type == 'text' )
					ret = ret + this.ESCAPE(this.VALUE) + "\n";
				else
					ret = ret + this.PRINT[this.type].apply(this,[true]) + "\n";
				if ( ret.length > 72 )
					for ( var z=72;z<ret.length;z+=72)
							ret = ret.slice(0,z) + "\n " + ret.slice(z);
			}
			return ret;
		};
		this.UPDATE = function ()
		{
			switch ( this.type )
			{
				case 'trigger':
					var update = this.TRIGGER; 
					break;
				case 'date':
					var update = this.SETDATE; 
					break;
				case 'duration':
					var update = this.SETDURATION; 
					break;
				case 'recurrence':
					var update = this.SETRECURRENCE;
					break;
				case 'number':
					var update = this.INTEGER; 
					break;
				default: // default to text
					var update = this.TEXT; 
					break;
			}
			if ( this.FIELDS && this.VALUES == undefined && this.FIELDS.max !=1 && this.VALUE && this.VALUE.length > 0 )
			{
				this.VALUES = new Array ;
				update.apply(this,arguments);
			}
			else
				update.apply(this,arguments);
			if ( this.VALUES )
				this.length = this.VALUES.length;
			else
				this.length = 1;
			this.propertyIsEnumerable('length',false);
			if ( this.PARENT != undefined )
				this.PARENT.UPDATED = true;
		};
		if ( ! this.type && arguments.length < 2 ) return ; 
		if (arguments.length == 1 && typeof arguments[0] == "boolean" ) return this.toString(arguments[0]); 
		return this[this.type.toUpperCase()](arguments);
	};

	this.newField = function ()
	{
		var args = Array.prototype.slice.call(arguments);
		var f = args.shift();
		var a = new this.UPDATE ;
		//a.VALUE=args[0];
		if ( f && this.fields[f.toLowerCase()] )
		{
			a.type = this.fields[f.toLowerCase()].type;
			a.FIELDS = this.fields[f.toLowerCase()];
			a.propertyIsEnumerable('FIELDS',false);
		}
		else
			a.type = 'text';
		a.FIELD = f;
		a.toString = a.PRINT[a.type];
		a.propertyIsEnumerable('type',false);
		a.propertyIsEnumerable('FIELD',false);
		if ( args.length > 0 )
			a.UPDATE(args[0],args[1],args[2],args[3]);
		return a;
	}

	if ( ! text )
		text = this.icsTemplate ;
	this.ics = this.parseiCal( text );
	this.length = this.ics.length;

	for ( var i in this.ics )
	{
		this.ics[i]['PARENT'] = this;
		this.ics[i]['INDEX'] = i;
		this.ics[i]['DELETE'] = function () { this.PARENT.length--; delete this.PARENT.ics[this.INDEX]; };
	}

	return this;
};

///////////////////////////////////////////////////////////////////////
//                Timezone Handling

var zones = function ( )
{
	this.initialized = false;
	this.adjustIntoTZ = function ( d )
	{

	};
	this.init = function ()
	{
		this.initialized = true;
		this.daylight = {};
		this.standard = {};
		this.Dstart = {};
		this.Sstart = {};
		var a = arguments[0];
		if ( ! a.tzid && a[0].tzid )
			a = a[0];
		this.tzid = a.tzid.toString();
		var today = new Date();
		var year2 = new Date().add('y',2);
		if ( a.daylight.length )
		{
			for ( var i = 0; i< a.daylight.length; i++ )
			{
				if ( a.daylight[i].rrule instanceof recurrence )
				{
					var o = a.daylight[i].rrule.expandRecurrence(a.daylight[i].dtstart,year2);
					for ( var j in o )
					{
						this.Dstart[i[j].getUTCFullYear()] = i;
					}
					this.daylight[i] = {begin:a.daylight[i].dtstart,end:o[o.length-1],offset:a.daylight[i].tzoffsetto.VALUE};
				}
				else
				{	
					this.daylight[i] = {begin:a.daylight[i].dtstart,offset:a.daylight[i].tzoffsetto.VALUE};
					this.Dstart[a.daylight[i].dtstart.DATE.getUTCFullYear()] = i;
				}
			}
		}
		else
		{	
			this.daylight[0] = {begin:a.daylight.dtstart,offset:a.daylight.tzoffsetto.VALUE};
			this.Dstart[a.daylight.dtstart.DATE.getUTCFullYear()] = 0;
		}
	
		if ( a.standard.length )
		{
			for ( var i = 0; i< a.standard.length; i++ )
			{
				if ( a.standard[i].rrule instanceof recurrence )
				{
					var o = a.standard[i].rrule.expandRecurrence(a.standard[i].dtstart,year2);
					for ( var j in o )
					{
						this.Sstart[i[j].getUTCFullYear()] = i;
					}
					this.standard[i] = {begin:a.standard[i].dtstart,end:o[o.length-1],offset:a.standard[i].tzoffsetto.VALUE};
				}
				else
				{	
					this.standard[i] = {begin:a.standard[i].dtstart,offset:a.standard[i].tzoffsetto.VALUE};
					this.Sstart[a.standard[i].dtstart.DATE.getUTCFullYear()] = i;
				}
			}
		}
		else
		{	
			this.standard[0] = {begin:a.standard.dtstart,offset:a.standard.tzoffsetto.VALUE};
			this.Sstart[a.standard.dtstart.DATE.getUTCFullYear()] = 0;
		}
	};
	if ( arguments[0] )
	{
		if ( this.initialized )
			this.adjustIntoTZ( arguments );
		else
			this.init( arguments );
	}
};

///////////////////////////////////////////////////////////////////////
//                Recurrence Handling

var recurrence = function ( text )
{
	this.rrule_expansion = {
		'YEARLY':{ type:'y', 'BYMONTH':'expand', 'BYWEEKNO':'expand', 'BYYEARDAY':'expand', 'BYMONTHDAY':'expand','BYDAY':'expand', 'BYHOUR':'expand', 'BYMINUTE':'expand', 'BYSECOND':'expand' },
		'MONTHLY':{ type:'m', 'BYMONTH':'limit', 'BYMONTHDAY':'expand','BYDAY':'expand', 'BYHOUR':'expand', 'BYMINUTE':'expand', 'BYSECOND':'expand' },
		'WEEKLY':{ type:'W', 'BYMONTH':'limit','BYDAY':'expand', 'BYHOUR':'expand', 'BYMINUTE':'expand', 'BYSECOND':'expand' },
		'DAILY':{ type:'d', 'BYMONTH':'limit', 'BYMONTHDAY':'limit','BYDAY':'limit', 'BYHOUR':'expand', 'BYMINUTE':'expand', 'BYSECOND':'expand' },
		'HOURLY':{ type:'h', 'BYMONTH':'limit', 'BYMONTHDAY':'limit','BYDAY':'limit', 'BYHOUR':'limit', 'BYMINUTE':'expand', 'BYSECOND':'expand' },  
		'MINUTELY':{ type:'M', 'BYMONTH':'limit', 'BYMONTHDAY':'limit','BYDAY':'limit', 'BYHOUR':'limit', 'BYMINUTE':'limit', 'BYSECOND':'expand' },
		'SECONDLY':{ type:'s', 'BYMONTH':'limit', 'BYMONTHDAY':'limit','BYDAY':'limit', 'BYHOUR':'limit', 'BYMINUTE':'limit', 'BYSECOND':'limit' } };
	
	this.prettyRecurrence = function()
	{
		var dowa = ['SU','MO','TU','WE','TH','FR','SA'];
		var dow = {SU:'Sunday',MO:'Monday',TU:'Tuesday',WE:'Wednesday',TH:'Thursday',FR:'Friday',SA:'Saturday'};
		if ( this.rule == undefined ) 
			return false ;
		var r = this.rule;
		var ret = r.FREQ.replace(/LY$/,'') ;
		ret = recurrenceUI[ret];
		if ( r.COUNT ) ret = recurrenceUI['every'] + ' ' + ret + ' ' + recurrenceUI['for'] + ' ' + r.COUNT + ' ' + recurrenceUI['time'+ (r.COUNT>1?'s':'')];
		if ( r.UNTIL ) ret += ' ' + recurrenceUI['until'] + ' ' + (new Date()).parseDate(r.UNTIL).prettyDate();
		if ( ! r.COUNT && ! r.UNTIL ) ret = recurrenceUI['every'] + ' ' + ret;
		return ret;
	};
	
	this.parsePrettyRecurrence = function(r)
	{ // FIXME
		var dow = {SU:'Sunday',MO:'Monday',TU:'Tuesday',WE:'Wednesday',TH:'Thursday',FR:'Friday',SA:'Saturday'};
		if ( this.rule == undefined ) 
			return false ;
		var ret = r.FREQ.toLowerCase() ;
		if ( r.COUNT ) ret += ' ' + r.COUNT + ' time' + (r.COUNT>1?'s':'');
		if ( r.UNTIL ) ret += ' until ' + (new Date()).parseDate(r.UNTIL).prettyDate();
	
		return ret;
	};
	
	this.parseRecurrence = function(r)
	{
		this.text = r;
		var S = String(r);
		//var freqr = /(SECONDLY|MINUTELY|HOURLY|DAILY|WEEKLY|MONTHLY|YEARLY)/;
		var byr = /(BYSECOND|BYMINUTE|BYHOUR|BYDAY|BYMONTHDAY|BYYEARDAY|BYWEEKNO|BYMONTH|BYSETPOS)/;
		var parts = S.split(';');
		var res = new Array;
		var rule = new Object;
		for ( var i=0; i<parts.length;i++)
		{
			var c = parts[i].split('=');
			if ( byr.test(c[0]) )
				rule[c[0]] = c[1].split(',');
			else
				rule[c[0]] = c[1];
		}
		this.rule = rule;
		if ( this.occurences != undefined )
		{
			delete this.occurences;
			delete this.start;
			delete this.until;
		}
	};
	
	this.unparseRecurrence = function(r)
	{
		//var freqr = /(SECONDLY|MINUTELY|HOURLY|DAILY|WEEKLY|MONTHLY|YEARLY)/;
		var byr = /(BYSECOND|BYMINUTE|BYHOUR|BYDAY|BYMONTHDAY|BYYEARDAY|BYWEEKNO|BYMONTH|BYSETPOS)/;
		if ( this.rule == undefined ) 
			return false ;
		var parts = this.rule;
		var rule = new String ;
		for ( var i in parts )
		{
			if ( rule.length > 1 )
				rule = rule + ';';
			rule = rule +  i + '=' + parts[i];
		}
		this.text = rule;
		return this.text;
	};
	
	this.expandRecurrence  = function( s, u )
	{
		var dow = {SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6};
		var Adj = { 'BYMONTH':-1, 'BYWEEKNO':0, 'BYYEARDAY':0, 'BYMONTHDAY':0, 'BYDAY':0, 'BYHOUR':0, 'BYMINUTE':0, 'BYSECOND':0, 'BYSETPOS':0 };
		var occurences = new Array ();
		if ( this.rule == undefined ) 
			return ;
		r = this.rule;
		var hms = s.match(/([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?[Zz]?/).slice(1);
		if ( hms[3] != undefined  )
		{
			var s = new Date ( ); //hms[0],(hms[1]-1),hms[2],hms[4],hms[5],hms[6] );
			s.setUTCFullYear(hms[0]);
			s.setUTCMonth(hms[1]-1);
			s.setUTCDate(hms[2]);
			s.setUTCHours(hms[4]);
			s.setUTCMinutes(hms[5]);
			s.setUTCSeconds(hms[6]);
			s.setMilliseconds(0);
			var order = { 'BYMONTH':'m', 'BYWEEKNO':'w', 'BYYEARDAY':'Y', 'BYMONTHDAY':'m', 'BYDAY':'D', 'BYHOUR':'h', 'BYMINUTE':'M', 'BYSECOND':'s', 'BYSETPOS':'p' };
			var Set = { 'BYMONTH':'setUTCMonth', 'BYWEEKNO':'setWeek', 'BYYEARDAY':'setDayOfYear', 'BYMONTHDAY':'setUTCDate', 'BYDAY':'setDayOfWeek', 'BYHOUR':'setUTCHours', 'BYMINUTE':'setUTCMinutes', 'BYSECOND':'setUTCSeconds', 'BYSETPOS':'p' };
		}
		else
		{
			var s = new Date ( ); //hms[0],(hms[1]-1),hms[2] );
			s.setUTCFullYear(hms[0]);
			s.setUTCMonth(hms[1]-1);
			s.setUTCDate(hms[2]);
			s.setUTCHours(0);
			s.setUTCMinutes(0);
			s.setUTCSeconds(0);
			s.setMilliseconds(0);
			var order = { 'BYMONTH':'m', 'BYWEEKNO':'w', 'BYYEARDAY':'Y', 'BYMONTHDAY':'m', 'BYDAY':'D', 'BYSETPOS':'p' };
			var Set = { 'BYMONTH':'setUTCMonth', 'BYWEEKNO':'setWeek', 'BYYEARDAY':'setDayOfYear', 'BYMONTHDAY':'setUTCDate', 'BYDAY':'setDayOfWeek', 'BYHOUR':'setUTCHours', 'BYMINUTE':'setUTCMinutes', 'BYSECOND':'setUTCSeconds', 'BYSETPOS':'p' };
		}
		if ( ! s instanceof Date )
			return false ;
		var d = new Date ( s );
		occurences[d.getTime()] = d;
		var end = false ;
		var limit = false ;
		var freq = r.FREQ ;
		if ( this.rrule_expansion[freq].length < 2 )
			return false ;
		var count = 100, until = '', interval = 1, c = 0,dummy=0;
		if ( r.COUNT    ) count     = r.COUNT;
		if ( r.INTERVAL ) interval  = r.INTERVAL;
		if ( r.UNTIL    ) until     = (new Date()).parseDate(r.UNTIL);
			else if ( u instanceof Date ) until = u;
			else until = dateAdd(new Date(),'y',20);
		if ( r.WKST     ) wkst      = r.WKST;
		if ( this.start == s && this.until.getTime() == until.getTime() )
			return this.occurences;
		for ( var c = 1;c < count &&! end; dummy++ )
		{
			var nextd = d;
			var loopoccurences = new Array ();
			for ( var i in order )
			{
				if ( end ) break ;
				if ( r[i] != undefined )
				{
					if ( i == 'BYSETPOS' )
					{
						var previousoccurences = loopoccurences;
					}
					//console.log ( rrule_expansion[freq][r[i]] );
					if ( this.rrule_expansion[freq][r[i]] == 'limit' ) 
						limit = true;
					for (var z=0;z<r[i].length&&c<count&&!end;z++)
					{ 
						if ( i == 'BYDAY' )
						{
							var offset = r[i][z].match ( /([-+]?[0-9]+)?([a-zA-Z]{2})/ );
							if ( freq == 'MONTHLY' ) // special by day rules for monthly
							{
								limit = true;
								d.setUTCDate(1);
								if ( offset[1] < 0 ) 
									d.add ( 'm' , 1).setUTCDate(-1);
								if ( offset[1] == undefined ) offset[1] = 0;
								d.add ( order[i], offset[1] * 7 + dow[offset[2]]  );
							}
							else
							{
								d.setUTCDate(1);
								if ( offset[1] == undefined ) offset[1] = 0;
								d.add ( order[i], offset[1] * 7 + dow[offset[2]]  );
							}
						}
						else if ( i == 'BYSETPOS' )
						{
							var a = previousoccurences.length,inc=0;
							for ( var b in previousoccurences )
							{
								if ( inc == r[i][z] && r[i][z] > 0 )
									loopoccurences[b] = previousoccurences[b];
								if ( (a - inc) == r[i][z] && r[i][z] < 0 )
									loopoccurences[b] = previousoccurences[b];
								inc++;
							}
						}
						else
							d[Set[i]]( Number(r[i][z]) + Adj[i] );
						//	d.add ( order[i], r[i][z] );
						if ( c >= count || d > until ) end = true;
						else loopoccurences[d.getTime()] = d;
					}
					for ( var b in loopoccurences )
					{
						c++;
						if ( c < count )
							occurences[b] = loopoccurences[b];
					}
				}
				if ( c >= count || d > until ) end = true;
			}
			
			d = dateAdd ( nextd, this.rrule_expansion[freq].type, interval );
			if ( c >= count || d > until ) end = true;
			else if ( ! limit ) { c++;occurences[d.getTime()] = d;}
		}
		this.start = s;
		this.until = until;
		this.occurences = occurences;
		return occurences;
	};
	
	this.toString = function (p){ return p?this.prettyRecurrence():this.text; };

	if ( text )
	{
		if ( /\s/.test ( text ) )
			this.parsePrettyRecurrence( text );
		else
			this.parseRecurrence( text );
	}
	return this;
};

///////////////////////////////////////////////////////////////////////
//                Expanded Date Handling

Date.prototype.pad = function (n){return n<10 ? '0'+n : n};

Date.prototype.TimeString = function(){
	return this.getUTCHours() + '' 
      + this.pad(this.getUTCMinutes()) + ''
			+ this.pad(this.getUTCSeconds())};

Date.prototype.DayString = function(){
	return this.getUTCFullYear() + '' 
      + this.pad(this.getUTCMonth()+1) + '' 
      + this.pad(this.getUTCDate())};

Date.prototype.DateString = function(){
	return this.getUTCFullYear() + ''
      + this.pad(this.getUTCMonth()+1) + ''
      + this.pad(this.getUTCDate())+'T'
      + this.pad(this.getUTCHours()) + ''
      + this.pad(this.getUTCMinutes()) + ''
      + this.pad(this.getUTCSeconds())};

Date.prototype.DateStringZ = function(){
	return this.getUTCFullYear() + ''
      + this.pad(this.getUTCMonth()+1) + ''
      + this.pad(this.getUTCDate())+'T'
      + this.pad(this.getUTCHours()) + ''
      + this.pad(this.getUTCMinutes()) + ''
      + this.pad(this.getUTCSeconds())+'Z'};

Date.prototype.prettyTime = function(){
	return settings.twentyFour?this.prettyTime24():this.prettyTime12();};

Date.prototype.prettyTime24 = function(){
	return this.getUTCHours() + ':' 
      + this.pad(this.getUTCMinutes()) };

Date.prototype.prettyTime12 = function(){
	return (this.getUTCHours()==12||this.getUTCHours()==0?12:(this.getUTCHours()>11?this.getUTCHours()-12:this.getUTCHours()))
      + (this.getUTCMinutes()==0?'':':'+this.pad(this.getUTCMinutes())) + ' '
			+ (this.getUTCHours()>11?'PM':'AM')};

Date.prototype.prettyDate = function(short){
	return this.pad(this.getUTCMonth()+1)+'/'
      + this.pad(this.getUTCDate())+'/'
      + this.getUTCFullYear()+' '
			+ (short===true?'':this.prettyTime()) };

function emptyDuration ()
{
	return {years:0,months:0,weeks:0,days:0,hours:0,minutes:0,seconds:0,negative:false,valid:false};
}
function parseDuration(dur)
{
	var years = /([1-9][0-9]*)[\s\t.,=_;@:-]*years?/i;
	var months = /([1-9][0-9]*)[\s\t.,=_;@:-]*months?/i;
	var weeks = /([1-9][0-9]*)[\s\t.,=_;@:-]*w(eeks?)?/i;
	var days = /([1-9][0-9]*)[\s\t.,=_;@:-]*d(ays?)?/i;
	var hours = /([.1-9][.0-9]*)((?=:)[0-9]{2})?[\s\t.,=_;@-]*h(ours?)?/i;
	var minutes = /([1-9][0-9]*)[\s\t.,=_;@:-]*m(inutes?)?/i;
	var seconds = /([1-9][0-9]*)[\s\t.,=_;@:-]*s(econds?)?/i;
	var neg = /(^-P?|before)/;
	var validDuration = /([-+])?P([0-9]+W)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+S)?)?/;
	var s = String(dur),y,m,w,d,h,M,S,n;
	if ( s.match ( validDuration ) )
	{
		var r = s.match ( validDuration );
		return {years:0,months:0,negative:r[1]==undefined?false:true,
			weeks:parseInt(r[2])+0,days:parseInt(r[3])+0,
			hours:parseInt(r[5])+0,minutes:parseInt(r[6])+0,seconds:parseInt(r[7])+0,valid:true};
	}
	if ( s.match ( neg ) )
		var n = true;
	else 
		var n = false;
	if ( s.match ( years ) )
		var y = Number ( s.match ( years )[1]);
	if ( s.match ( months ) )
		var m = Number ( s.match ( months )[1]);
	if ( s.match ( weeks ) )
		var w = Number ( s.match ( weeks )[1]);
	if ( s.match ( days ) )
		var d = Number ( s.match ( days )[1]);
	if ( s.match ( hours ) )
		var h = Number ( s.match ( hours )[1]);
	if ( s.match ( minutes ) )
		var M = Number ( s.match ( minutes )[1]);
	if ( s.match ( seconds ) )
		var S = Number ( s.match ( seconds )[1]);
	return {years:y,months:m,weeks:w,days:d,hours:h,minutes:M,seconds:S,negative:n,valid:false};
}

function printDuration(dur)
{
	if ( dur.valid == undefined )
		return dur;
	var ret = '';
	if ( dur.negative == true )
		ret = '-';
	ret = ret + 'P';
	if ( dur.weeks && dur.weeks != 0 )
		ret = ret + dur.weeks + 'W';
	if ( dur.days && dur.days != 0 )
		ret = ret + dur.days + 'D';
	var time = '';
	if ( dur.hours && dur.hours != 0 )
		time = time + dur.hours + 'H';
	if ( dur.minutes && dur.minutes != 0 )
		time = time + dur.minutes + 'M';
	if ( dur.seconds && dur.seconds != 0 )
		time = time + dur.seconds + 'S';
	if ( time.length > 0 )
		ret = ret + 'T' + time;
	return ret;
}

Date.prototype.addDuration  = function( duration )
{
	var start = new Date ( this.getTime() );
	if ( duration['years'] != undefined )
		var dur = duration;
	else
		var dur = parseDuration ( duration );
	var map = {years:'y',months:'m',weeks:'w',days:'d',hours:'h',minutes:'M',seconds:'S'};
	for ( var x in dur )
	{
		if ( map[x] != undefined && ( dur[x] > 0 || dur[x] < 0 ) )
			this.add ( map[x], dur[x] );
	}
	if ( dur.negative == true )
		this.setTime ( start.getTime() - ( this.getTime() - start.getTime() ) );
	return this;
};

Date.prototype.parseDate  = function( d )
{
	var dRX = /([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?([Zz])?/;
	this.setUTCMilliseconds(0);
	var parts = String(d).match( dRX ).slice(1);
	if ( parts[3] != undefined  )
	{
		this.setUTCFullYear(parts[0]);
		this.setUTCMonth(parts[1]-1);
		this.setUTCDate(parts[2]);
		this.setUTCHours(parts[4]);
		this.setUTCMinutes(parts[5]);
		this.setUTCSeconds(parts[6]);
		this.setMilliseconds(0);
		this.zulu = parts[7];
	}
	else
	{
		this.setUTCFullYear(parts[0]);
		this.setUTCMonth(parts[1]-1);
		this.setUTCDate(parts[2]);
		this.setUTCHours(0);
		this.setUTCMinutes(0);
		this.setUTCSeconds(0);
		this.setMilliseconds(0);
	}
	return this;
};

Date.prototype.parsePrettyTime = function(d){
	this.setUTCMilliseconds(0);
	var dRX = /\s*(([0-2]?[0-9]):?([0-6][0-9])?\s*([AP]M)?)?/i;
	var parts = String(d).match( dRX ).slice(1);
	if ( parts[3] != undefined  )
	{
		this.setUTCHours(parts[3].match(/am/i)?(parts[1]==12?0:parts[1]):(parts[1]-0+12));
		this.setUTCMinutes(parts[2]==undefined?0:parts[2]); 
	}
	else
	{
		this.setUTCHours(parts[1]);
		this.setUTCMinutes(parts[2]==undefined?0:parts[2]); 
	}
	return this;
};

Date.prototype.parsePrettyDate = function(d,zero){
	if ( zero )
	{
		this.setUTCHours(0);
		this.setUTCMinutes(0);
		this.setUTCSeconds(0);
		this.setUTCMilliseconds(0);
	}
	var dRX = /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})\s*(([0-2]?[0-9]):?([0-6][0-9])?:?([0-6][0-9])?\s*([AP]M)?)?/i;
	var parts = String(d).match( dRX ).slice(1);
	if ( parts[3] != undefined )
	{
		this.setUTCFullYear(parts[2]);
		this.setUTCMonth(parts[0]-1);
		this.setUTCDate(parts[1]);
		this.setUTCHours((parts[7]!=undefined&&parts[7].match(/pm/i))?(parts[4]-0+12):(parts[4]==12?0:parts[4]));
		this.setUTCMinutes(parts[5]==undefined?0:parts[5]);
		this.setUTCSeconds(parts[6]||0);
	}
	else
	{
		this.setUTCFullYear(parts[2]);
		this.setUTCMonth(parts[0]-1);
		this.setUTCDate(parts[1]);
	}
	return this;
};

function Zero (d)
{
	if ( !d )
		var d = new Date();
	d.setUTCMonth(0);
	d.setUTCDate(1);
	d.setUTCHours(0);
	d.setUTCMinutes(0);
	d.setUTCSeconds(0);
	d.setUTCMilliseconds(0);
	return d;
}

Date.prototype.localTzApply = function(){ var adj = localTimezone.offset * 60/100 * 60; this.setTime( this.getTime() - adj *1000); return this; };
Date.prototype.getLongMinutes = function(){return this.getUTCHours() * 100 + this.getUTCMinutes() * (100/60);};
Date.prototype.Zero = function (){ Zero(this); return this; };
Date.prototype.WeekStart = new Number(1);
Date.prototype.setWeekStart = function ( Day ) { this.WeekStart = new Number(Day); return this; };
Date.prototype.getWeekStart = function ( ) { return this.WeekStart; };
Date.prototype.getWeek = function ( ) { var w = 0, t = new Date(this);t.setUTCDate(1); t.setUTCMonth(0); if (t.getDay()<this.WeekStart)w--;while (t<this&&w<53) {t.setUTCDate(t.getUTCDate()+7);w++;}  return w; };
Date.prototype.setWeek = function ( Week ) { var t = new Date(this); var w=t.getWeek(); this.setUTCDate((Week-w)*7); return this; };
Date.prototype.getDayOfYear = function ( ) { var w = 0, t = new Date(this);t.setUTCDate(1); t.setUTCMonth(0); while (t<this&&w<366) {t.setUTCDate(t.getUTCDate()+1);w++;}  return w; };
Date.prototype.setDayOfYear = function ( Day ) { var w=0;this.setUTCDate(1); this.setUTCMonth(0); while (w<Day&&w<366) {this.setUTCDate(this.getUTCDate()+1);w++;}  return this; };
Date.prototype.getDaysInMonth = function ( ) { var t = new Date(this); t.setUTCMonth(t.getUTCMonth()+1); t.setUTCDate(-1);return t.getUTCDate(); };
Date.prototype.getWeekInMonth = function ( ) { return Math.ceil(t.getUTCDate()/7); };
Date.prototype.setDayOfWeek = function (Day) { this.setUTCDate(0-this.getUTCDay());var t=this.getUTCDate();this.setUTCDate(t+Day); return this; };

function dateAdd ( d, field, amount )
{ // y = year, m = month, w = week number, d = day of month(25), D = day of week (3) -> wed, h = hour, M = minute, s = Second
	var ret = new Date ( d.getTime() );
	var amount = Number(amount);
	switch ( field )
	{
		case 'y':
			ret.setUTCFullYear(d.getUTCFullYear()+amount);
			break ;
		case 'm':
			ret.setUTCMonth(d.getUTCMonth()+amount);
			break ;
		case 'W':
			ret.setUTCDate(d.getUTCDate()+(7*amount));
			break ;
		case 'w':
			ret.setWeek(d.getWeek()+amount);
			break ;
		case 'd':
			ret.setUTCDate(d.getUTCDate()+amount);
			break ;
		case 'D':
			ret.setUTCDate(d.getUTCDate()-d.getDay());
			if ( ( d.getDay() <= amount && amount >= 0 ) || amount < 0 )
				ret.setUTCDate(ret.getUTCDate()+amount);
			else
				ret.setUTCDate(ret.getUTCDate()+amount+7);
			break ;
		case 'h':
			ret.setUTCHours(d.getUTCHours()+amount);
			break ;
		case 'M':
			ret.setUTCMinutes(d.getUTCMinutes()+amount);
			break ;
		case 's':
			ret.setUTCSeconds(d.getUTCSeconds()+amount);
			break ;
		default :
	}
	return ret ;
}

Date.prototype.add = function ( field, amount ){ this.setTime( dateAdd( this, field, amount ).getTime() ); return this; };


///////////////////////////////////////////////////////////////////////
//                StyleSheet Convenience Class

var styles = {
	sheet: undefined,	
	rules: {} ,
	getStyleSheet: function (unique_title) { 
	  for(var i=0; i<document.styleSheets.length; i++) 
	    if(document.styleSheets[i].title == unique_title) 
	      this.sheet = document.styleSheets[i];
		if ( this.sheet != undefined );
			this.refreshRules();
		return this;
	},
	refreshRules: function ()
	{
		 var cr = this.sheet.cssRules;
		 for ( var x in cr )
			 this.rules[cr[x].selectorText]=x;
		 this.rules.length = cr.length;
	},
	getRule: function (selector)
	{
		var ret = new Array ;
		if ( this.rules.length != this.sheet.cssRules.length )
			this.refreshRules();
		if ( this.rules[selector] != undefined )
			ret.push(this.sheet.cssRules[this.rules[selector]]);
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
		var cr = this.sheet.cssRules;
		for ( var x in cr )
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
		var rs = this.getRule( selector );
		if ( rs.length == 0 )
		{
			this.addRule ( selector, '' );
			rs = this.getRule ( selector );
			if ( rs.length < 1 )
				return;
		}
		var props = prop_erties;
		if ( typeof props != "object" )
		{
			var props = new Object ;
			var r = properties.split(';');
			for ( var x in r )
			{
				var parts = r[x].split(':',2);
				props[parts[0]] = parts[1];
			}
		}
		for ( var i in rs )
		{
			if ( rs[i] == undefined )
				continue;
			for ( var x in props )
			{
				if ( props[x] == null || props[x].length == 0 )
					rs[i].style.removeProperty(x);
				else
					rs[i].style.setProperty( x, String(props[x]), null );
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

/////////  Array helpers
//

