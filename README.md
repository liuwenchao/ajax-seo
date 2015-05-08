AJAX-SEO ![Bower Version](https://badge.fury.io/bo/ajax-seo.svg)
=====

A simple server to provide rendered html to crawlers, for ajax sites. 

* [Google ajax crawling standard](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started).
* [PhantomJS 2.0](http://phantomjs.org/)

How to use
------------

1.  Install PhantomJS, on Mac, you can: `$ brew install phantomjs `

    ```
    $ sudo apt-get install phantomjs  
    ```
2.  Start SEO Server

    ```
    $ phantomjs seo.js
    ```
3.  Setup nginx, add codes below into site configuration:

    ```
    if ($args ~ _escaped_fragment_) {
      rewrite ^ /snapshot$uri;
    }

    location ~ ^/snapshot(.*) {
      rewrite ^/snapshot(.*)$ $1 break;
      proxy_pass http://localhost:8888;
      proxy_set_header Host $scheme://$host;
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

Notes
-------
For index page of your site, you need to add this in HTML if you haven't:
```
<meta name="fragment" content="!" />
```


if you have trouble for https URLs, try this:
```
$ # phantomjs --ssl-protocol=any seo.js 
```
see [phantomjs options documentation](http://phantomjs.org/api/command-line.html)
