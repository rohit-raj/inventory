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
var auth        = require('../model/authModel');
var __          = require('../model/logsModel');
var constants   = require('../lib/constants');

router.get('/get-logs', function (req, res) {
    var handlerInfo = {
        apiModule:  'activity',
        apiHandler: 'get-logs'
    };

    var userId  = xss(req.query.user_id);



    var tasks = [];
    if(userId) {
        tasks.push(auth.checkIfUserExists.bind(null, handlerInfo, userId));
    }
    tasks.push(__.getLogs.bind(null, handlerInfo, userId));

    async.waterfall(tasks, function (error, result) {
        if (error) {
            if (error.flag === constants.responseFlags.USER_NOT_FOUND) {
                return response.userNotFound(handlerInfo, res);
            } else {
                return response.actionFailed(handlerInfo, res);
            }
        }
        response.actionComplete(handlerInfo, res, result);
    });
});


module.exports = router;