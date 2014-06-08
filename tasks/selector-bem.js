module.exports = function(grunt) {
	// Splits apart a selector into its Block, Element, Modifier parts
    grunt.splitBEM = function(selector){
        if(selector.indexOf('.') == 0){
          selector = selector.substring(1);
        }
        
        if(selector.indexOf('__') != 0){
          return {selector: selector};
        }

        // Only get the actuals BEM class names
        selector = selector.split(',')[0];
        selector = selector.split(' ')[0];

        // Some extensive splitting die to kaBEM class starting with '__' WHICH INCLUDES the modifier '_' splitter
        var BE = selector.split('__');
        var M = BE.pop().split('_');
        BE.push(M.shift());

        var ret = {be: BE.join('__'), selector: selector};

        if(M.length > 0){
          ret.m = '_' + M[0];
        }

        return ret;
    };
}