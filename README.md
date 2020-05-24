# jqCalDav

A CalDAV Client for 2011 web browsers using a bit
of html5 and a bunch of css3.

Written by Rob Ostensen. See his [original website](http://boxacle.net/jqcaldav/).

This repository is a `git clone http://boxacle.net/jqcaldav/.git/`, to save it in case the original server goes down.

# Features

* Basic Features
   * month/week view
   * todo support
   * delegated calendars
* User interaction
   * drag and drop
      * move event to a different date
      * move event to a different time(when dragging over the left side of a day)
      * move event/todo to a different calendar(hold Alt to copy)
      * convert event from todo into event and vice versa
      * drag ics file into browser(chrome/firefox 4)
      * drag event out of browser to get ics file(chrome/firefox 4)
   * year/month timeline selector(between the calendar list and event view)
   * navigate by month/year(hover over month/year at the top of the page)
   * double click calendar name to edit the properties of the calendar(name, description, color etc.)
* caldav
   * read/write/modify events
   * read/write/modify todos
   * read/write/modify calendar collection properties
   * create/delete calendar collections
   * read calendar collection ACLs(write support coming)
   * on demand loading of events
   * webdav-sync with configurable interval
   * supports the calendar-color and calendar-order properties from [ical namespace](http://apple.com/ns/ical/)
* iCalendar
   * supports most properties of rfc5545
   * handles recurrence(may have a few bugs left, common cases all work)
   * preserves non-standard properties(ie X-VALUES), but does not display them
   * supports alarms(only display messages and sound types), from both the start and end of the event

## Known Issues and Missing Features

Prioritized list:
* leaving the client logged in from chrome for extended periods generates an error
* users may see browser authorization dialogs, especially with the Darwin server(I'm hoping that moving to web workers for AJAX requests will fix this)
* changing ACLs in the UI has no effect
* no support for scheduling
* no UI for journal/notes
* no catagory color support(not sure if this will ever be supported)
* no offline support

# Contributing

Patches, bug reports, and translations (of en-us.js) are welcome.
Send to rob+jqcaldav@boxacle.net.

# Usage

## Log out

The surest way to log out is to completely close the browser,
including all tabs and windows.
