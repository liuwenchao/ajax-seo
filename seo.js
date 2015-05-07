var system = require('system');

if (system.args.length < 2) {
    console.log("Usage:   phantomjs --disk-cache=false seo.js [website_domain] [port optional, default 8888]");
    console.log("Example: phantomjs --disk-cache=false seo.js http://www.mysite.com");
    phantom.exit();
}

var host   = system.args[1], 
    port   = system.args[2] || 8888, 
    server = require('webserver').create(),
    log = function(message) {
        var messages = typeof message === 'string' ? [message] : message;
        console.info(
            ['[', new Date().toISOString(), ']']
            .concat(messages)
            .join(' ')
        );
    };

var render = function(url, cb) {
    var page = require('webpage').create();
    page.settings.loadImages = false;
    page.settings.localToRemoteUrlAccessEnabled = true;
    page.onResourceRequested = function(requestData, request) {
        // Ingore css and fonts.
        if (['text/css', 'application/font-woff'].indexOf(requestData.headers['Content-Type']) >= 0
            || (/http:\/\/.+?\.(css|woff)/gi).test(requestData.url)) {
            log(['Request  (#', requestData.id, ') ', requestData.url, 'abort']);
            request.abort();
        } else {
            log(['Request  (#', requestData.id, ') ', requestData.url]);
        }
    };
    page.onResourceReceived = function(response) {
        if (response.url) {
            log(['Response (#', response.id, '):', response.url, response.stage]);
        }
    };
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
       log(['CONSOLE: ', msg, ' (from line #', lineNum, ' in "', sourceId, '")']);
    };

    // http://phantomjs.org/api/webpage/handler/on-callback.html
    // Consider waitFor example.
    page.onCallback = function() {
        cb(page.content);
        page.close();
    };
    page.onInitialized = function() {
       page.evaluate(function() {
            setTimeout(function() {
                window.callPhantom();
            }, 5000);
        });
    };
    page.open(url);
};

// turn 'page?_escaped_fragment_=/id/36' to 'page#!/id/24'
var toHashBangUrl = function(path) {
    var search = path.substring(path.indexOf('?')+1);
    var route_parts = search.split('&').filter(function(v){
        if (v.split('=')[0] === '_escaped_fragment_') return true;
    });
    var route = route_parts[0].split('=')[1];
    return host
      + path.slice(0, path.indexOf('?'))
      + '#!' 
      + decodeURIComponent(route);
};

var service = server.listen(port, function (request, response) {
    render(toHashBangUrl(request.url), function(html) {
        response.statusCode = 200;
        response.write(html);
        response.close();
    });
});

if (service) {
    log(['SEO server running on port:', port, 'for website:', host]);
    log('Press Ctrl+C to stop...\n');
} else {
    log(['Error: Could not start server listening on port: ', port]);
    phantom.exit();
}
