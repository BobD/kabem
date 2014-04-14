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

    clean: ['build'],

    copy: {
      html: {
        src: 'src/page/page.html',
        dest: 'build/page/page.html'
      },
      css: {
        expand: true,
        src: 'src/page/*.css',
        dest: 'build/css/',
        flatten: true,
        filter: 'isFile'
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
        src: 'build/pages/page.html',
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
        tasks: ['sass', 'page']
      },
      css: {
         files: ['src/page/**/**.css'],
         tasks: ['copy:css']
      },
      options: {
        livereload: true
      }
    }

  });

  grunt.registerTask('page', 'Generate Page HTML for each BEM modifier', function() {
    var _ = require("underscore");
    var CSSOM = require('cssom');
    var CSSFile = grunt.file.read('build/css/page.css');
    var CSSTree = CSSOM.parse(CSSFile);
    var dir = 'build/page/modifiers/';
    var createPage = false;
    var tasks = [];

    if(grunt.file.isDir(dir)){
      grunt.file.delete(dir);
    }    

    _.each(CSSTree.cssRules, function(rule){
      var selector = rule.selectorText;

      if(selector.indexOf('.') == 0){
        selector = selector.substring(1);
      }

      // Split the seletor in their BEM elements.. nasty, but the regex is even more frightful..
      var BEM = selector.split('__');
      var modifier = BEM.pop().split('_');
      BEM.push(modifier.shift());
      BEM = BEM.join('__');
      modifier = modifier[0];

      // Only create pages with a single 'BEM' including a modifier
      createPage = (selector.indexOf(' ') === -1 ) && (modifier !== undefined);

      // Create pages for testing, and apply the relevant modifier classes
      if(createPage){ 
        grunt.config('dom_munger.' + selector + '.options', {suffix: {selector: '.' + BEM, attribute: 'class', value: ' ' + selector}});
        grunt.config('dom_munger.' + selector + '.src', 'build/page/page.html');
        grunt.config('dom_munger.' + selector + '.dest', dir + selector + '.html');
        tasks.push('dom_munger:' + selector);
      }

    });

    grunt.task.run(tasks);
  });


  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('prepare-css', ['copy:css', 'sass']);
  grunt.registerTask('prepare-html', ['copy:html', 'page']);
  grunt.registerTask('default', ['clean', 'prepare-css', 'prepare-html']);

};
