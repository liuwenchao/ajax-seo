var system = require('system');

if (system.args.length > 2 || system.args[1] == 'help') {
    console.log("Usage:   phantomjs seo.js [port -- optional, default 8888]");
    console.log("Example: phantomjs seo.js");
    console.log("Example: phantomjs seo.js 8848");
    phantom.exit();
}

var port   = system.args[1] || 8888, 
    server = require('webserver').create(),
    log = function(message) {
        var messages = typeof message === 'string' ? [message] : message;
        console.info(
            [new Date().toISOString().substr(0, 19), '[INFO] ']
            .concat(messages)
            .join(' ')
        );
    };

var render = function(url, cb) {
    var page = require('webpage').create();
    page.settings.loadImages = false;
    page.settings.localToRemoteUrlAccessEnabled = true;
    page.onResourceRequested = function(requestData, request) {
        // Ignore css and fonts.
        if (['text/css', 'application/font-woff'].indexOf(requestData.headers['Content-Type']) >= 0
            || (/.+?\.(css|woff)/gi).test(requestData.url)) {
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
    page.onError = function(msg, trace) {
        var msgStack = [msg];

        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function(t) {
                msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
            });
        }

        console.error(msgStack.join('\n'));

        cb(page.content);
        page.close();
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
            }, 10000);
        });
    };
    page.open(url);
};

// turn 'page?_escaped_fragment_=/post/24' to 'page#!/post/24'
var toHashBangUrl = function(host, path) {
    if (!host) {
        log('no Host is set in the request headers! please fix it!');
    }
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
    // log(JSON.stringify(request));
    render(toHashBangUrl(request.headers['Host'], request.url), function(html) {
        response.statusCode = 200;
        response.write(html);
        response.close();
    });
});

if (service) {
    log(['SEO server running on port:', port]);
    log('Press Ctrl+C to stop...\n');
} else {
    log(['Error: Could not start server listening on port: ', port]);
    phantom.exit();
}
