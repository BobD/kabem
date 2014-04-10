/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  
  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.

    connect: {
      server: {
        options: {
          port: 9001,
          base: 'build',
          keepalive: true
        }
      }
    },

    copy: {
      html: {
        src: 'src/page/page.html',
        dest: 'build/index.html'
      }
    },

    sass: {                             
      dist: {                           
        options: {                      
          style: 'expanded'
        },
        files: [{'./build/css/page.css': './src/page/page.scss'}]
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['lib/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    uncss: {
      dist: {
        src: 'build/index.html',
        dest: 'build/css/page.css',
        options: {
          stylesheets: ['css/page.css']
          // report: 'min' // optional: include to report savings
        }
      }
    },

    watch: {
      html: {
        files: ['src/page/page.html'],
        tasks: ['copy:html', 'sass', 'build-pages']
      },
      sass: {
        files: ['src/page/**/**.scss'],
        tasks: ['sass', 'build-pages']
      },
      options: {
        livereload: true
      }
    }

  });

  grunt.registerTask('build-pages', 'Creating HTML files for all possible modifiers', function() {
    var _ = require("underscore");
    var CSSOM = require('cssom');
    var CSSFile = grunt.file.read('build/css/page.css');
    var CSSTree = CSSOM.parse(CSSFile);
    var dir = 'build/modifiers/';

    grunt.file.delete(dir);

    _.each(CSSTree.cssRules, function(rule){
      var selector = rule.selectorText;

      if(selector.indexOf('.') == 0){
        selector = selector.substring(1);
      }

      // Split the seletor in their BEM elements.. nasty, but the regex is even more frightful..
      var selectorSansModifier = selector.split('__');
      var modifier = selectorSansModifier.pop().split('_');
      selectorSansModifier.push(modifier.shift());
      selectorSansModifier = selectorSansModifier.join('__');
      modifier = modifier[0];

      // Create matching HTML file for testing, and apply the relevant modifier classes
      if(modifier !== undefined){ 
        grunt.config('dom_munger.' + selector + '.options', {suffix: {selector: '.' + selectorSansModifier, attribute: 'class', value: ' ' + selector}});
        grunt.config('dom_munger.' + selector + '.src', 'build/index.html');
        grunt.config('dom_munger.' + selector + '.dest', dir + selector + '/index.html');
        grunt.task.run('dom_munger:' + selector);
      }

    });

  });

  // https://www.npmjs.org/package/load-grunt-tasks
  // Loads all tasks straight from the package.json. Make sure all needed ones are installed locally instead of globally
  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', []);

};
