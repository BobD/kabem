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
      source: ['.sass-cache', 'src/_all.scss', 'src/sass']
    },

    copy: {
      html: {
        src: 'src/index.html',
        dest: 'build/live/index.html'
      },
      css: {
        expand: true,
        src: 'src/*.css',
        dest: 'build/live/css/',
        flatten: true,
        filter: 'isFile'
      }
    },

    dom_munger: {
      index: {
        options: {
          append: {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'}
        },
        src: 'build/live/index.html'
      }
    },

    sass: {                             
      dist: {                           
        options: {                      
          style: 'expanded'
        },
        files: [{'./build/live/css/index.css': './src/index.scss'}]
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
        src: 'build/live/index.html',
        dest: 'build/live/css/index.css',
        options: {
          stylesheets: ['css/index.css'],
          report: 'min' 
        }
      }
    },

    watch: {
      html: {
        files: ['src/index.html'],
        tasks: ['html']
      },
      sass: {
        files: ['src/**/**.scss'],
        tasks: ['import-all-sass', 'sass', 'scaffold-html']
      },
      css: {
         files: ['src/**/**.css'],
         tasks: ['copy:css']
      },
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['dev']
      },
      options: {
        livereload: true
      }
    },

    prompt: {
      clear_sass_scaffold: {
        options: {
          questions: [{
              config: 'blah',
              type: 'confirm',
              message: 'This will remove your SASS ?',
              then: function(){
                console.log('then', arguments);
              }
            }
          ]
        }
      }
    }

  });


  grunt.registerTask('scaffold-sass', 'Generates folders for all sass files based on BEM classnames in index.html', function() {
    var _ = require("underscore");
    var jsdom = require('jsdom').jsdom;
    var cwd = 'src/';
    var dir = cwd + 'sass'
    var index = cwd + 'index.html';
    var html = grunt.file.read(index);
    var doc = jsdom(html).parentWindow.document;
    var bemClasses = doc.querySelectorAll('body[class^="__"], body *[class^="__"]');
    var classList, BEList = [], beSplit, dirPath, bePath, mPath;

    // collect the BEM classes
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


    // generate sass folders
    _.each(BEList, function(be){
      beSplit = be.split('__');
      beSplit.shift();

      copy = beSplit.slice(0);
      path = '/';

      _.each(copy, function(val, index){
        if(index > 0){
        path += '__' + beSplit.slice(0, index).join('__') + '/';
        }

      });

      path += be;

      dirPath = dir + path; // BOB::20140224, use  beSplit.join('/') for single block/element directory names
      bePath = dirPath + '/' + be + '.scss';
      mPath = dirPath + '/' + be + '_modifiers.scss';

      if(!grunt.file.isDir(dirPath)){
        grunt.file.mkdir(dirPath);
      }

      if(!grunt.file.exists(bePath)){
        grunt.file.write(bePath, '.' + be + '{\n}');
      }

      if(!grunt.file.exists(mPath)){
        grunt.file.write(mPath, '.' + be + '_modifier-name{\n}');
      }

    });

    // clean up sass folders which are not referenced through the HTML bem classes
    // BOB::TODO::20140324, will remove everything.. also custom css work, need to rethink this
    var dirs = grunt.file.expand({cwd: dir}, ['**/*', '!**/*.scss']),
        dirName;

    _.each(dirs, function(path){
      dirName = path.split('/').pop();
      if(!doc.querySelector('.' + dirName)){
        // grunt.task.run('prompt:clear_sass_scaffold');
        grunt.file.delete(dir + '/'+ path);
      }
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
    var CSSFile = grunt.file.read('build/live/css/index.css');
    var CSSTree = CSSOM.parse(CSSFile);
    var dir = 'build/testing/';
    var createPage = false;
    var defaultModifiers = ['__page_align_right', '__page__container_fixed-width'];
    var tasks = [], bem;

    if(grunt.file.isDir(dir)){
      grunt.file.delete(dir);
    }    

    _.each(CSSTree.cssRules, function(rule){
      var selector = rule.selectorText;
      var suffix = [];
      var beParts;

      if(selector.indexOf('.') == 0){
        selector = selector.substring(1);
      }

      bem = splitBEM(selector);

      beParts = bem.be.split('__').length;

      // Only create pages with a single 'BEM' including a modifier
      createPage = (selector.indexOf(' ') === -1 ) && (bem.m !== undefined);

      // Create pages for testing, and apply the relevant modifier classes
      if(createPage){ 
        suffix.push({selector: '.' + bem.be, attribute: 'class', value: ' ' + selector});

        _.each(defaultModifiers, function(sel){
          var defaultBem = splitBEM(sel);
          // Only apply the default if they are concerned with a parent of the current bem
          if(defaultBem.be.split('__').length < beParts){
            suffix.push({selector: '.' + defaultBem.be, attribute: 'class', value: ' ' + sel});
          }

        });

        grunt.config('dom_munger.a' + selector + '.options', {
          append: {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'}, 
          suffix: suffix
        });
        grunt.config('dom_munger.a' + selector + '.src', 'build/live/index.html');
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


  // BOB::TODO::20140422, the default task should re-use the html/css tasks
  grunt.registerTask('dev', ['clear', 'scaffold-sass']);
  grunt.registerTask('html', ['copy:html', 'scaffold-sass', 'import-all-sass', 'sass', 'scaffold-html']);
  grunt.registerTask('css', ['copy:css', 'sass', 'scaffold-html']);
  grunt.registerTask('default', ['clean:build', 'copy', 'scaffold-sass', 'import-all-sass', 'sass', 'scaffold-html']);

};
