/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

process.env.NODE_CONFIG_DIR = __dirname + '/config/';
const config = require('config');

// Adding the new relic server monitoring if enabled : this is not enabled for now
if (config.get('newRelicEnabled')) {
    require('newrelic');
}

var express     = require('express');
var logger      = require('morgan');
var bodyParser  = require('body-parser');
var errorhandler= require('errorhandler');
var http        = require('http');

//Exports file and function
var validator   = require('./middleware/validator').validateLogin; //Middleware to validate login
var users       = require('./routes/usersController');
var inventory   = require('./routes/inventoryController');
var activity    = require('./routes/activityController');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// production only
if ('production' === app.get('env')) {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
} else {
    console.log("test");
    app.use(errorhandler());
}


/**--------------------------------------------------------
 *                      AUTHORIZATION
 *---------------------------------------------------------
 */
app.use('/v1/auth',     users);
app.use('/v1/inventory', validator(), inventory);
app.use('/v1/activity', activity);


module.exports = app;

http.createServer(app).listen(config.get('port'), function () {
    console.log('Express server started on port');
    console.log('http://localhost:' + config.get('port'));
    console.log('http://127.0.0.1:' + config.get('port'));
});