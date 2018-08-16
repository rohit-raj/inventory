/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

"use strict";
var _ = require('lodash');

exports.checkBlank = checkBlank;
exports.specialCharacterCheck = specialCharacterCheck;


// Check Null/Undefined/Empty field
function checkBlank(arr) {
    for (var i in arr) {
        if (_.isNil(arr[i]) || arr[i].toString().trim() === '') {
            return 1;
        }
    }
    return 0;
}

/**
 * This function primarily checks any special character present in the string
 * Returns true/false
 */

function specialCharacterCheck(string) {
    var format = /[ !@#$%^&*()+=\[\]{};':"\\|,.<>\/?`]/;
    var found = format.test(string);
    return found;
}
