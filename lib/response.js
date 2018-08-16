/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

var constants = require('./constants');

exports.parameterMissing = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.PARAMETER_MISSING,
        message: 'Few Parameter(s) are missing'
    };
    res.send(response);
};

exports.userNotFound = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.USER_NOT_FOUND,
        message: 'You Are Not Registered With Us. Please SignUp.'
    };
    res.send(response);
};

exports.credentialMismatch = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.CREDENTIAL_MISMATCH,
        message: 'Credential Mismatch'
    };
    res.send(response);
};

exports.unauthorizedAccess = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.UNAUTHORIZED_ACCESS,
        message: 'Unauthorized Access'
    };
    res.send(response);
};

exports.specialCharacterFound = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.SPECIAL_CHARACTER_FOUND,
        message: 'Special Characters not permitted'
    };
    res.send(response);
};

exports.userNameExists = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.USERNAME_ALREADY_EXISTS,
        message: 'This Username Already Exist.'
    };
    res.send(response);
};

exports.itemNotFound = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.ITEM_NOT_FOUND,
        message: 'Item Does Not Exist'
    };
    res.send(response);
};
exports.variantNotFound = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.VARIANT_NOT_FOUND,
        message: 'Variant Does Not Exist'
    };
    res.send(response);
};

exports.actionFailed = function (handlerInfo, res, data) {
    var response = {
        status: constants.responseFlags.ACTION_FAILED,
        message: 'Failed',
        data: data
    };
    res.send(response);
};

exports.actionComplete = function (handlerInfo, res, data) {
    var response = {
        status: constants.responseFlags.ACTION_COMPLETE,
        message: 'Ok',
        data: data
    };
    res.send(response);
};

exports.invalidAccessToken = function (handlerInfo, res) {
    var response = {
        status: constants.responseFlags.INVALID_ACCESS_TOKEN,
        message: 'Unauthorized'
    };
    res.send(response);
};
