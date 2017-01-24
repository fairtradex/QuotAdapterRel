"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by vadimsky on 18/10/16.
 */

var Asset = exports.Asset = function Asset(options) {
    _classCallCheck(this, Asset);

    this.id = options.id;
    this.name = options.name;
    this.active = options.active;
};