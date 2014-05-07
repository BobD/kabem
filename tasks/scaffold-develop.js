module.exports = function(grunt) {

  grunt.registerTask('scaffold-develop', 'Generate HTML pages for each BEM modifier', function() {
    var _ = require("underscore");
    var CSSOM = require('cssom');
    var CSSFile = grunt.file.read('build/source/css/index.source.css');
    var CSSTree = CSSOM.parse(CSSFile);
    var classes = [{selector: 'body', attribute: 'class', value: ' debug'}];
    var context = grunt.option('context') || 'default';
    var contextBEM = grunt.file.readJSON('src/config/bem-context.json')[context] || [];
    var dir = 'build/develop/';
    var createPage= false;
    var tasks = [];
    var bem;

    _.each(contextBEM, function(sel){
      var context = splitBEM(sel);
      classes.push({selector: '.' + context.be, attribute: 'class', value: ' ' + sel});
    });

    var currentModifierFiles = grunt.file.expand({cwd: dir}, '*.html');  
    _.each(currentModifierFiles, function(file){
      grunt.file.delete(dir + file);
    });

    _.each(CSSTree.cssRules, function(rule){
      var selector = rule.selectorText;
      var bemClasses = [];
      var beParts;

      bem = grunt.splitBEM(selector);
      beParts = bem.be.split('__').length;
      selector = bem.selector;

      // Only create pages for BEM modifiers
      createPage = (selector.indexOf(' ') === -1) && (bem.m !== undefined);

      // Create pages for testing, and apply the relevant modifier classes
      if(createPage){

        // Only apply the context bem class if they are to be applied with a parent of the current bem element
        _.each(classes, function(suffix){
          if(suffix.selector.split('__').length < beParts){
            bemClasses.push(suffix);
          }
        });

        bemClasses.push({selector: '.' + bem.be, attribute: 'class', value: ' ' + selector});
        grunt.config('dom_munger.a' + selector + '.options', {
          append: {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'}, 
          suffix: bemClasses
        });
        grunt.config('dom_munger.a' + selector + '.src', 'build/source/html/index.html');
        grunt.config('dom_munger.a' + selector + '.dest', dir + selector + '.html');
        tasks.push('dom_munger:a' + selector);
      }

    });

    grunt.config('dom_munger.index' + '.options', {
      append: [
        {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'},
        {selector: 'head', html: '<link rel="stylesheet" href="/css/index.css">'}
      ],
      suffix: classes
    });
    grunt.config('dom_munger.index.src', 'build/source/html/index.html');
    grunt.config('dom_munger.index.dest', dir + 'main.html');
    tasks.push('dom_munger:index');

    grunt.task.run(tasks);
  });

}