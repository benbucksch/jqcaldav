# Requirements

1. CalDAV server. Supported are:
   * DAViCal
   * Apple "Darwin Calendar and Contacts Server"
2. A page on the server to add the scripts to OR a place on the server for the included index.html file
3. For subscribed calendars, you will need to proxy the requests, mod_rewrite and mod_proxy on apache. See the included .htaccess file.

# Install

## Generic install
1. Clone the git repo
2. Edit index.html and change the `data-caldavurl` and `data-calproxyurl` attributes, if necessary.
   * `data-caldavurl` is the address of your caldav servers root. Generally, you should install on the same host as your calendar server.  In that case, set the `data-caldavurl` to `/` or `/davical/caldav.php`.
  * `data-calproxyurl` is the directory where the .htaccess file is located

## Install with DAViCal
1. Clone the git repo into the same vhost as DAViCal.
   * You may need to edit the mod_rewrite rules, if things don't work.
2. if you do not have mod_rewrite enabled for davical, edit index.html and change the `data-caldavurl` and `data-calproxyurl` attributes. `data-calproxyurl` is the directory where the .htaccess file is located.
Example:
```
RewriteEngine on
RewriteCond %{HTTP:Origin} %{SERVER_NAME}  [NC]
RewriteCond %{HTTP:X-Requested-With} ^XMLHttpRequest [NC]
RewriteCond %{HTTP:Authorization} username=\?([^\?]+)\?
RewriteRule /test/http://(.*)$ http://$1 [P,L,QSA]
```

## Install for Darwin Calendar and Contacts Server
1. Clone the git repo into the data/Documents/ directory
2. It does not appear at this time that it's possible to setup proxying subscribed calendars.
3. `data-caldavurl` is either `/` or `http://your.server.com/`
