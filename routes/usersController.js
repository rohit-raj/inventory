/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

var router  = require('express').Router();
var uuid    = require('uuid/v4');
var bcrypt  = require('bcryptjs');
var async   = require('async');
var xss     = require('xss');

var util        = require('../lib/util');
var response    = require('../lib/response');
var __          = require('../model/authModel');
var constants   = require('../lib/constants');

router.post('/register', function (req, res) {
    var handlerInfo = {
        apiModule:  'users',
        apiHandler: 'register'
    };

    var username  = xss(req.body.username);
    var password  = req.body.password;

    if (util.checkBlank([username, password])) {
        return response.parameterMissing(handlerInfo, res);
    }

    var token = uuid();
    var data = {
        username: username,
        password: bcrypt.hashSync(password, 10),
        uuid    : token
    };

    var tasks = [
        __.checkIfUsernameAlreadyExists.bind(null, handlerInfo, username),
        __.registerUser.bind(null, handlerInfo, data)
    ];

    async.waterfall(tasks, function (error, result) {
        if (error) {
            if (error.flag === constants.responseFlags.USERNAME_ALREADY_EXISTS) {
                return response.userNameExists(handlerInfo, res);
            } else {
                return response.actionFailed(handlerInfo, res);
            }
        }
        response.actionComplete(handlerInfo, res, {});
    });
});

router.post('/login', function (req, res) {
    var handlerInfo = {
        apiModule: 'users',
        apiHandler: 'login'
    };

    var username = xss(req.body.username);
    var password = req.body.password;

    if (util.checkBlank([username, password])) {
        return response.parameterMissing(handlerInfo, res);
    }

    __.getUserByUsername(handlerInfo, username, function (error, user) {
        if (error) {
            if(error.flag === constants.responseFlags.USER_NOT_FOUND){
                return response.userNotFound(handlerInfo, res);
            }
            return response.actionFailed(handlerInfo, res);
        }
        else {
            if (user) {
                if (!bcrypt.compareSync(password, user.password)) {
                    return response.credentialMismatch(handlerInfo, res);
                }
                var sessionId = uuid() + '-' + uuid();
                __.createSession(handlerInfo, user.id, sessionId, function (err, sessionId) {
                    var data = {};
                    data.session_id = sessionId;
                    data.user_id = user.uuid;
                    data.username = user.username;
                    response.actionComplete(handlerInfo, res, data);
                });
            } else {
                return response.userNotFound(handlerInfo, res);
            }
        }
    });
});

module.exports = router;