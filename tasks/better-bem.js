module.exports = function(grunt) {
    var _ = require("underscore");

     // https://www.npmjs.org/package/rework-npm
     grunt.registerTask('better-bem', 'Makes the use of multiple modifiers in a bem classname possible: "block__element_modifier1_modifier_2"', function() {
        var CSSOM = require('cssom');
        var CSSFile = grunt.file.read(grunt.option('build-path') + '/source/css/bem.source.css');
        var CSSTree = CSSOM.parse(CSSFile);
        var classes = [];
        var selector;
        var bemListing = bemSelectors(CSSTree.cssRules, []);
        var css = ['@import "bem";'];
        var bemListingGrouped = _.groupBy(bemListing, function(bem){ return bem.be; });
        var beListing = _.keys(bemListingGrouped);

        _.each(beListing, function(be){
            css.push('*[class="' + be + '"]{@extend .' + be + ' !optional;}');
            _.each(bemListingGrouped[be], function(bem){
                if(_.has(bem, 'm')){
                    css.push('*[class^="' + be + '_"][class*="' + bem.m.substring(1) + '"]{@extend .' + be + ' !optional; @extend .' + bem.selector + ' !optional;}');
                }
            });
            // css .push('');
        });

        var cssString = css.join('');

        grunt.file.write(grunt.option('kabem-path') + '/bem.better.scss', cssString);
     });

    function bemSelectors(cssRules, bemListing){
        _.each(cssRules, function(rule){
            if(_.has(rule, 'cssRules')){
                bemSelectors(rule.cssRules, bemListing);
                return;
            }

            selector = rule.selectorText;
            bem = grunt.splitBEM(selector);
            if(_.has(bem, 'be')){
                bemListing.push(bem);
            }
        });

        return bemListing;
    }
}