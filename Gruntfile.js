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
      live: {
        options: {
          port: 9001,
          base: 'build/live',
          keepalive: true
        }
      },
      develop: {
        options: {
          port: 9002,
          base: 'build/develop',
          keepalive: true
        }
      }
    },

    clean: {
      build: ['build'],
      source: ['.sass-cache', 'src/sass/_all.scss', 'src/sass/partials/_debug.scss'],
      backup: ['backup']
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
      },
      develop_css: {
        expand: true,
        src: 'build/live/css/*.css',
        dest: 'build/develop/css/',
        flatten: true,
        filter: 'isFile'
      },
      backup: {
        cwd: 'src/',
        expand: true,
        src: 'sass/**',
        dest: 'backup/ <%= grunt.template.today("yyyymmddhMM") %>/'
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
        files: [
          {'./build/live/css/index.css': './src/index.scss'},
          {'./build/develop/css/debug.css': './src/sass/custom/debug.scss'}
        ]
      }
    },

    sass_directory_import: {
      index: {
        files: {
          src: ['src/sass/_all.scss']
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
        tasks: ['import-all-sass', 'sass', 'scaffold-develop', 'copy:develop_css']
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

    // prompt: {
    //   clear_sass_scaffold: {
    //     options: {
    //       questions: [{
    //           config: 'blah',
    //           type: 'confirm',
    //           message: 'This will remove your SASS ?',
    //           then: function(){
    //             console.log('then', arguments);
    //           }
    //         }
    //       ]
    //     }
    //   }
    // }

  });


  grunt.registerTask('scaffold-sass', 'Generates folders for all sass files based on BEM classnames in index.html', function() {
    var _ = require("underscore");
    var jsdom = require('jsdom').jsdom;
    var cwd = 'src/';
    var dir = cwd + 'sass/bem'
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

    var debugSASS = '';

    // generate sass folders
    _.each(BEList, function(be){
      beSplit = be.split('__');
      dirPath = dir + beSplit.join('/__');
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

      debugSASS += 'body.debug .' + be + '{@include debug(' + be + ');}\n';
    });

    // write some debuging css outlines
    grunt.file.write(cwd + 'sass/custom/partials/_debug.scss', debugSASS);

    // clean up sass folders which are not referenced through the HTML bem classes
    // BOB::TODO::20140324, will remove everything.. also custom css work, need to rethink this
    var dirs = grunt.file.expand({cwd: dir}, ['**/*', '!**/*.scss']),
        dirName;

    _.each(dirs, function(path){
      dirName = path.split('/').join('');
      if(!doc.querySelector('.' + dirName)){
        // grunt.task.run('prompt:clear_sass_scaffold');
        grunt.file.delete(dir + '/'+ path);
      }
    });  

  });


  // Simplified version of https://www.npmjs.org/package/grunt-sass-directory-import
  grunt.registerTask('import-all-sass', 'Generates a _all.scss file with all sass files imported', function() {
    var dir = 'src/sass/';
    var filepath = dir + '_all.scss';
    var customFiles = grunt.file.expand({cwd: dir}, ['custom/**/*.scss', '!_all.scss', '!partials/_debug.scss']);
    var bemFiles = grunt.file.expand({cwd: dir}, ['bem/**/*.scss']);
    var segments, file, importFile;
    var imports = ['// Auto generated, see grunt "import-all-sass task" '];
    
    imports = imports.concat(getSASSimports(customFiles));
    imports = imports.concat(getSASSimports(bemFiles));

    grunt.file.write(filepath, imports.join('\n'));
  });

  function getSASSimports(files){
    var _ = require("underscore");
    var imports = [];

    _.each(files, function(path){
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

    return imports;
  }


  grunt.registerTask('scaffold-develop', 'Generate HTML pages for each BEM modifier', function() {
    var _ = require("underscore");
    var CSSOM = require('cssom');
    var CSSFile = grunt.file.read('build/live/css/index.css');
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

      bem = splitBEM(selector);
      beParts = bem.be.split('__').length;
      selector = bem.selector;

      // Only create pages with a single 'BEM' including a modifier
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
        grunt.config('dom_munger.a' + selector + '.src', 'build/live/index.html');
        grunt.config('dom_munger.a' + selector + '.dest', dir + selector + '.html');
        tasks.push('dom_munger:a' + selector);
      }

    });

    grunt.config('dom_munger.index' + '.options', {
      append: {selector: 'head', html: '<link rel="stylesheet" href="/css/debug.css">'},
      suffix: classes
    });
    grunt.config('dom_munger.index.src', 'build/live/index.html');
    grunt.config('dom_munger.index.dest', dir + 'main.html');
    tasks.push('dom_munger:index');

    grunt.task.run(tasks);
  });

  grunt.registerTask('bem-lookup', 'Generate a lookup file for all possible Modifiers belonging to a Block or Element', function() {
    var _ = require("underscore");
    var dir = 'src/sass/';
    var modifierFiles = grunt.file.expand([dir + 'bem/**/*_modifiers.scss']);
    var CSSOM = require('cssom');
    var CSSFile, CSSTree, bem;
    var settings = [], json;

    _.each(modifierFiles, function(file){
      CSSFile = grunt.file.read(file);
      CSSTree = CSSOM.parse(CSSFile);

      _.each(CSSTree.cssRules, function(rule){
        bem = splitBEM(rule.selectorText);
        settings.push({block_element: bem.be, setting: '', modifier: bem.m, value: ''});
      });
    });

    json = JSON.stringify({settings: settings}, null, 2);
    grunt.file.write('src/config/bem-lookup.json', json);
  });

  function splitBEM(selector){
    if(selector.indexOf('.') == 0){
      selector = selector.substring(1);
    }

    var BE = selector.split('__');
    var M = BE.pop().split('_');
    BE.push(M.shift());
    BE = BE.join('__');
    M = M[0];

    return {be: BE, m: M, selector: selector};
  }

  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt);


  // BOB::TODO::20140422, the default task should re-use the html/css tasks
  grunt.registerTask('dev', ['clear', 'scaffold-sass']);
  grunt.registerTask('html', ['copy:html', 'scaffold-sass', 'import-all-sass', 'sass', 'scaffold-develop']);
  grunt.registerTask('css', ['copy:css', 'sass', 'scaffold-develop', 'copy:develop_css']);
  grunt.registerTask('reset', ['copy:backup', 'clean']);
  grunt.registerTask('default', ['clean:build', 'copy', 'scaffold-sass', 'import-all-sass', 'sass', 'scaffold-develop', 'copy:develop_css']);

};
