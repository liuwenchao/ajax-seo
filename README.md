AJAX-SEO
=====

Use [PhantomJS 2.0](http://phantomjs.org/) to build a simple server to provide rendered html to crawlers, for ajax sites. 

Following [Google ajax crawling standard](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started).


How to use
------------
```
$ ##Install PhantomJS, on Mac, you can: brew install phantomjs 
$ sudo apt-get install phantomjs  
$ ##Start SEO Server
$ phantomjs --disk-cache=no seo.js http://yoursite.domain
```

How to verify
-------------
```
$ ## For http://site.domain/page#!/id/12
$ curl http://localhost:8888/page?_escaped_fragment_=/id/12
$ ## verify it's fully rendered HTML from http://yoursite.domain/page#!/id/12
```

How to connect Nginx
-------
```
if ($args ~ "_escaped_fragment_=(.*)") {
    rewrite ^ /snapshot${uri};
}   
location /snapshot {
    proxy_pass http://localhost:8888;
    proxy_connect_timeout 60s;
}
```

Note
-------
For index page of your site, you need to add this in HTML if you haven't:
```
<meta name="fragment" content="!" />
```