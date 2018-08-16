/**
 * Created by Rohit Raj.
 * Date: 15/8/18
 * Version : v1.0
 */

function define(obj, name, value) {
    Object.defineProperty(obj, name, {
        value: value,
        enumerable: true,
        writable: false,
        configurable: true
    });
}

exports.responseFlags = {};
define(exports.responseFlags, 'PARAMETER_MISSING', 100);
define(exports.responseFlags, 'USER_NOT_FOUND', 101);
define(exports.responseFlags, 'CREDENTIAL_MISMATCH', 102);
define(exports.responseFlags, 'UNAUTHORIZED_ACCESS', 103);
define(exports.responseFlags, 'SPECIAL_CHARACTER_FOUND', 104);
define(exports.responseFlags, 'USERNAME_ALREADY_EXISTS', 105);
define(exports.responseFlags, 'ITEM_NOT_FOUND', 106);
define(exports.responseFlags, 'VARIANT_NOT_FOUND', 107);
define(exports.responseFlags, 'ACTION_FAILED', 121);
define(exports.responseFlags, 'ACTION_COMPLETE', 200);
define(exports.responseFlags, 'INVALID_ACCESS_TOKEN', 401);
