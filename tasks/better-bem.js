module.exports = function(grunt) {
	 // https://www.npmjs.org/package/rework-npm
	 grunt.registerTask('better-bem', 'Makes the use of multiple modifiers in a bem classname possible: "block__element_modifier1_modifier_2"', function() {
	 	var _ = require("underscore");
	 	var CSSOM = require('cssom');
    	var CSSFile = grunt.file.read(grunt.option('build-path') + '/source/css/bem.source.css');
    	var CSSTree = CSSOM.parse(CSSFile);
    	var classes = [];
    	var selector;
    	var allBEM = [];
        var css = ['@import "bem";'];

    	_.each(CSSTree.cssRules, function(rule){
    		selector = rule.selectorText;
    		bem = grunt.splitBEM(selector);
    		if(_.has(bem, 'be')){
    			allBEM.push(bem);
    		}
    	});

    	var bemGrouped = _.groupBy(allBEM, function(bem){ return bem.be; });
    	var beList = _.keys(bemGrouped);

    	_.each(beList, function(be){
    		css.push('*[class^="' + be + '"]{');
            css.push('@extend .' + be + ';');
    		_.each(bemGrouped[be], function(be){
                if(_.has(be, 'm')){
                    css.push('&[class*="' + be.m + '"]{@extend .' + be.selector + ';}');
                }
    		});
    		css .push('}');
    	});

        var cssString = css.join('');

    	grunt.file.write(grunt.option('kabem-path') + '/bem.better.scss', cssString);
	 });
}