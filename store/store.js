"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by vadimsky on 02/11/16.
 */

var Store = exports.Store = function () {
    function Store() {
        _classCallCheck(this, Store);

        this.store = {};
    }

    _createClass(Store, [{
        key: "get",
        value: function get(key) {
            if (!this.store.hasOwnProperty(key)) {
                return;
            }
            return this.store[key];
        }
    }, {
        key: "set",
        value: function set(key, value) {
            this.store[key] = value;
        }
    }, {
        key: "getKeys",
        value: function getKeys() {
            return Object.keys(this.store);
        }
    }, {
        key: "init",
        value: function init() {
            this.store = {};
        }
    }]);

    return Store;
}();