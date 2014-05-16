module.exports = function(grunt) {
  var _ = require("underscore");
  var dir = 'build/modifiers/';
  var append = [
      {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'},
      {selector: 'head', html: '<link rel="stylesheet" href="/css/index.css">'}
  ];

  grunt.registerTask('scaffold-modifiers', 'Generate HTML pages for each BEM modifier', function() {
    var CSSOM = require('cssom');
    var CSSFile = grunt.file.read('build/source/css/index.bem.css');
    var CSSTree = CSSOM.parse(CSSFile);
    var classes = [{selector: 'body', attribute: 'class', value: ' debug'}];
    var context = grunt.option('context') || 'default';
    var contextBEM = grunt.file.readJSON('config/context.json')[context] || [];
    var tasks = [];

    _.each(contextBEM, function(sel){
      var context = grunt.splitBEM(sel);
      classes.push({selector: '.' + context.be, attribute: 'class', value: ' ' + sel});
    });

    var currentModifierFiles = grunt.file.expand({cwd: dir}, '*.html');  
    _.each(currentModifierFiles, function(file){
      grunt.file.delete(dir + file);
    });

    tasks = generateModifierFiles(CSSTree.cssRules, classes);

    grunt.config('dom_munger.index' + '.options', {
      append: append,
      suffix: classes
    });
    grunt.config('dom_munger.index.src', 'build/source/html/index.html');
    grunt.config('dom_munger.index.dest', dir + 'main.html');
    tasks.push('dom_munger:index');

    grunt.task.run(tasks);
  });

  function generateModifierFiles(cssRules, classes){
    var tasks = [];
    var createPage= false;
    var bem;

    _.each(cssRules, function(rule){

        // In case of media queries or SASS selector nesting
        if(_.has(rule, 'cssRules')){
          tasks = tasks.concat(generateModifierFiles(rule.cssRules, classes));
          return;
        }

        var selector = rule.selectorText;
        var bemClasses = classes.slice(0);
        var beParts;

        bem = grunt.splitBEM(selector);
        beParts = bem.be.split('__').length;
        selector = bem.selector;
        
        // Only create pages for BEM modifiers
        createPage = (selector.indexOf(' ') === -1) && (bem.m !== undefined);

        // Create pages for testing, and apply the relevant modifier classes
        if(createPage){
          bemClasses.push({selector: '.' + bem.be, attribute: 'class', value: ' ' + selector});
          grunt.config('dom_munger.a' + selector + '.options', {
            append: append, 
            suffix: bemClasses
          });
          grunt.config('dom_munger.a' + selector + '.src', 'build/source/html/index.html');
          grunt.config('dom_munger.a' + selector + '.dest', dir + selector + '.html');
          tasks.push('dom_munger:a' + selector);
        }

      });

    return tasks;
  }

}

