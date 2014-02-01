// modules
var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

// configuration files
var db = require('./config/db');

// configuration
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.cookieParser('e4933f5566c21bdca6b1077c6f60f1429d6966432be4def199d2a78991d2c800eecbe4bfd6044147c91c43406072035077656730ba476f7cb6285849fd2e45bd'));
    app.use(express.session());
    app.use(app.router);
    app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
    app.use(express.static(path.join(__dirname, 'public')));

    mongoose.connect(db.url);
});

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
require('./routes/api')(app);
require('./routes/frontend')(app);

// start app
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// expose the app
exports = module.exports = app; 
