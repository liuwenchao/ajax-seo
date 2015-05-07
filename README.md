AJAX-SEO ![Bower Version](https://badge.fury.io/bo/ajax-seo.svg)
=====

Use [PhantomJS 2.0](http://phantomjs.org/) to build a simple server to provide rendered html to crawlers, for ajax sites. 

Following [Google ajax crawling standard](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started).


How to use
------------
```
$ ## Install PhantomJS, on Mac, you can: brew install phantomjs 
$ sudo apt-get install phantomjs  
$
$ ## Start SEO Server
$ phantomjs --disk-cache=no seo.js
$
$ ## Setup nginx, add codes below into site configuration:
```
```
if ($args ~ _escaped_fragment_) {
    rewrite ^ /snapshot$uri;
}

location ~ ^/snapshot(.*) {
    rewrite ^/snapshot(.*)$ $1 break;
    proxy_pass http://localhost:8888;
    proxy_set_header Host $host;
    proxy_connect_timeout 60s;
}

```

How to verify
-------------
```
$ curl http://yoursite.domain/page#!/id/12
$ ## verify it's fully rendered HTML
```

How to test your local app w/o nginx
-------------
```
$ ## if your app is running at http://localhost:3000
$ curl http://localhost:8888/page#!/id/12 --header Host:localhost:3000
$ ## verify it's fully rendered HTML
```

Note
-------
For index page of your site, you need to add this in HTML if you haven't:
```
<meta name="fragment" content="!" />
```