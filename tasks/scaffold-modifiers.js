module.exports = function(grunt) {
  var _ = require("underscore");
  var dir = grunt.option('build') + '/modifiers/';
  var debugOn = grunt.option('debug') == 1;

  var deviceDetection = ['<div  id="device-detection">'];
  // Keep the limit high enough to hold all possible devices in _device-detection.scss
  for(var a=1; a <= 40; ++a){
    deviceDetection.push('<div class="device-' + a + '"/>');
  }
  deviceDetection.push('</div>');

  var append = [
      {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'},
      {selector: 'body', html: deviceDetection.join('')},
      {selector: 'body', html: '<div id="toggle-debug" class="' + (debugOn ? 'on' : '') + '" onclick="document.querySelector(\'#toggle-debug\').classList.toggle(\'on\');document.querySelector(\'body\').classList.toggle(\'debug\');"></div>'}
  ];

  grunt.registerTask('scaffold-modifiers', 'Generate HTML pages for each BEM modifier', function() {
    var CSSOM = require('cssom');
    var CSSFile = grunt.file.read(grunt.option('build') + '/source/css/bem_imports.source.css');
    var CSSTree = CSSOM.parse(CSSFile);
    var classes = [{selector: 'body', attribute: 'class', value: (debugOn ? ' debug' : '')}];
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
          grunt.config('dom_munger.a' + selector + '.src', grunt.option('build') + '/source/html/index.html');
          grunt.config('dom_munger.a' + selector + '.dest', dir + selector + '.html');
          tasks.push('dom_munger:a' + selector);
        }

      });

    return tasks;
  }

}

