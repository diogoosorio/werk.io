// modules
var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var nunjucks = require('nunjucks');
var moment = require('moment');

// configuration files
var db = require('./config/db');
mongoose.connect(db.url);

// configuration
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));

    nunjucks.configure('views', {
        autoescape: true,
        express: app
    });

    app.use("/public", express.static(path.join(__dirname, 'public')));
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.methodOverride());
    app.use(express.cookieParser('e4933f5566c21bdca6b1077c6f60f1429d6966432be4def199d2a78991d2c800eecbe4bfd6044147c91c43406072035077656730ba476f7cb6285849fd2e45bd'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.errorHandler());

    app.locals({
        moment: moment
    });
});

// routes
require('./routes/frontend.js')(app);

// start app
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// expose the app
exports = module.exports = app; 
