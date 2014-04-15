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

    connect: {
      server: {
        options: {
          port: 9001,
          base: 'build',
          keepalive: true
        }
      }
    },

    clean: {
      build: ['build'],
      source: ['src/_all.scss', 'src/sass']
    },

    copy: {
      html: {
        src: 'src/index.html',
        dest: 'build/index.html'
      },
      css: {
        expand: true,
        src: 'src/*.css',
        dest: 'build/css/',
        flatten: true,
        filter: 'isFile'
      }
    },

    dom_munger: {
      index: {
        options: {
          append: {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'}
        },
        src: 'build/index.html'
      }
    },

    sass: {                             
      dist: {                           
        options: {                      
          style: 'expanded'
        },
        files: [{'./build/css/index.css': './src/index.scss'}]
      }
    },

    sass_directory_import: {
      index: {
        files: {
          src: ['src/_all.scss']
        }
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
        dest: 'build/css/index.css',
        options: {
          stylesheets: ['css/index.css'],
          report: 'min' 
        }
      }
    },

    watch: {
      html: {
        files: ['src/index.html'],
        tasks: ['clean:build', 'copy:html', 'dom_munger:index', 'sass', 'scaffold-html']
      },
      sass: {
        files: ['src/**/**.scss'],
        tasks: ['import-all-sass', 'sass', 'scaffold-html']
      },
      css: {
         files: ['src/**/**.css'],
         tasks: ['copy:css']
      },
      options: {
        livereload: true
      }
    }

  });


  grunt.registerTask('scaffold-sass', 'Generates folders for all sass files based on BEM classnames in index.html', function() {
    var _ = require("underscore");
    var jsdom = require('jsdom').jsdom;
    var dir = 'src/';
    var file = dir + 'index.html';
    var html = grunt.file.read(file);
    var doc = jsdom(html).parentWindow.document;
    var bemClasses = doc.querySelectorAll('body[class^="__"], body *[class^="__"]');
    var classList, BEList = [], beSplit, dirPath;

    // parse the BEM classes
    _.each(bemClasses, function(el){
      classList = el.getAttribute('class').split(' ');

       _.each(classList, function(c){
       
        if(c.indexOf('__') == 0){
          BEM = splitBEM(c);
          BEList.push(BEM.be);
        }
 
       });
    });

    BEList = _.uniq(BEList);

    _.each(BEList, function(be){
      beSplit = be.split('__');
      dirPath = dir + 'sass/' + beSplit.join('/');

      if(!grunt.file.isDir(dirPath)){
        grunt.file.mkdir(dirPath);
      }

      grunt.file.write(dirPath + '/_' + be + '.scss', '.' + be + '{\n}');
      grunt.file.write(dirPath + '/_' + be + '_modifiers.scss', '.' + be + '_modifier-name{\n}');
    });

  });


  // Simplified version of https://www.npmjs.org/package/grunt-sass-directory-import
  grunt.registerTask('import-all-sass', 'Generates a _all.scss file with all sass files imported', function() {
    var _ = require("underscore");
    var dir = 'src';
    var filepath = 'src/_all.scss';
    var filesToInclude = grunt.file.expand({cwd: dir}, ['**/_*.scss', '!_all.scss']);
    var imports = ['// Auto generated, see grunt "import-all-sass task" '], segments, file, importFile;

    _.each(filesToInclude, function(path){
      segments = path.split('/');
      file = segments.pop();

      if(file.charAt(0) == '_'){
        file = file.substring(1);
      }

      file = file.replace('.scss', '');
      segments.push(file);
      importFile = segments.join('/');
      imports.push('@import "' + importFile + '";');
    });

    grunt.file.write(filepath, imports.join('\n'));
  });


  grunt.registerTask('scaffold-html', 'Generate HTML pages for each BEM modifier', function() {
    var _ = require("underscore");
    var CSSOM = require('cssom');
    var CSSFile = grunt.file.read('build/css/index.css');
    var CSSTree = CSSOM.parse(CSSFile);
    var dir = 'build/modifiers/';
    var createPage = false;
    var tasks = [], bem;

    if(grunt.file.isDir(dir)){
      grunt.file.delete(dir);
    }    

    _.each(CSSTree.cssRules, function(rule){
      var selector = rule.selectorText;

      if(selector.indexOf('.') == 0){
        selector = selector.substring(1);
      }

      bem = splitBEM(selector);

      // Only create pages with a single 'BEM' including a modifier
      createPage = (selector.indexOf(' ') === -1 ) && (bem.m !== undefined);

      // Create pages for testing, and apply the relevant modifier classes
      if(createPage){ 
        grunt.config('dom_munger.a' + selector + '.options', {append: {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'}});
        grunt.config('dom_munger.a' + selector + '.options', {suffix: {selector: '.' + bem.be, attribute: 'class', value: ' ' + selector}});
        grunt.config('dom_munger.a' + selector + '.src', 'build/index.html');
        grunt.config('dom_munger.a' + selector + '.dest', dir + selector + '.html');
        tasks.push('dom_munger:a' + selector);
      }

    });

    grunt.task.run(tasks);
  });


  function splitBEM(bemClass){
    var BE = bemClass.split('__');
    var M = BE.pop().split('_');
    BE.push(M.shift());
    BE = BE.join('__');
    M = M[0];

    return {be: BE, m: M};
  }


  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('scaffold', ['scaffold-sass']);
  grunt.registerTask('prepare-css', ['copy:css', 'import-all-sass', 'sass']);
  grunt.registerTask('prepare-html', ['copy:html', 'sass', 'scaffold-html']);
  grunt.registerTask('default', ['clean', 'scaffold-sass', 'prepare-css', 'prepare-html']);

};
