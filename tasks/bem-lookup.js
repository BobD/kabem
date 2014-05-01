module.exports = function(grunt) {

  grunt.registerTask('bem-lookup', 'Generate a lookup file for all possible Modifiers belonging to a Block or Element', function() {
    var _ = require("underscore");
    var dir = 'src/sass/';
    var modifierFiles = grunt.file.expand([dir + 'bem/**/*_modifiers.scss']);
    var CSSOM = require('cssom');
    var CSSFile, CSSTree, bem;
    var settings = {}, json;

    _.each(modifierFiles, function(file){
      CSSFile = grunt.file.read(file);
      CSSTree = CSSOM.parse(CSSFile);

      _.each(CSSTree.cssRules, function(rule){
        bem = grunt.splitBEM(rule.selectorText);
        if(!_.has(settings, bem.be)){
          settings[bem.be] = {setting: '', values: []};
        }
        settings[bem.be].values.push({modifier: bem.m, value: ""});
      });
    });

    json = JSON.stringify({settings: settings}, null, 2);
    grunt.file.write('build/backend/bem-lookup.json', json);
  });

}