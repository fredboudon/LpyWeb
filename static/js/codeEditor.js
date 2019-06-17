define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var MyNewHighlightRules = function() {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used
   this.$rules = {
        "start" : [
            {
                token: "basic", // String, Array, or Function: the CSS token to apply
                regex: "Axiom:" // String or RegExp: the regexp to match
            }
        ]
    };
};

oop.inherits(MyNewHighlightRules, TextHighlightRules);
exports.MyNewHighlightRules = MyNewHighlightRules;
});
