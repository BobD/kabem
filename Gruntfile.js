/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);

  // grunt.option.init() method overwrites the entire internal option state, https://github.com/gruntjs/grunt/issues/1023
  grunt.option('build-path', grunt.option('build-path') || './build');
  grunt.option('source-path', grunt.option('source-path') || './src');
  grunt.option('backup-path', grunt.option('backup-path') || './backup');
  grunt.option('config-path', grunt.option('config-path') || './config');

  // Splits a CSS selector inti it's Block, Element and Modifier parts
  grunt.splitBEM = function(selector){
    if(selector.indexOf('.') == 0){
      selector = selector.substring(1);
    }

    // Only get the main BEM class name, not the descendants
    if(selector.indexOf(' ') != -1){
      selector = selector.split(' ')[0];
    }

    var BE = selector.split('__');
    var M = BE.pop().split('_');
    BE.push(M.shift());
    BE = BE.join('__');
    M = M[0];

    return {be: BE, m: M, selector: selector};
  };
  
  // Project configuration.
  grunt.config.merge({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // https://github.com/gruntjs/grunt-contrib-connect
    connect: {
      modifiers: {
        options: {
          port: 9001,
          base: grunt.option('build-path') + '/modifiers',
          keepalive: true,
          open: true
        }
      },
      live: {
        options: {
          port: 9002,
          base: grunt.option('build-path') + '/live',
          keepalive: true,
          open: true
        }
      }
    },

    // https://github.com/gruntjs/grunt-contrib-clean
    clean: {
      build: [grunt.option('build-path')],
      backup: [grunt.option('backup-path')],
      reset: [grunt.option('build-path'), grunt.option('source-path') + '/css/bem/**/*', grunt.option('source-path') + '/css/_all.scss', grunt.option('source-path') + '/css/bem_imports.scss']
    },

    // https://github.com/gruntjs/grunt-contrib-copy
    copy: {
      normalize: {
        src: 'bower_components/normalize.css/normalize.css',
        dest: grunt.option('source-path') + '/css/vendor/normalize.scss'
      },
      html5shiv: {
        src: 'bower_components/html5shiv/dist/html5shiv.min.js',
        dest: grunt.option('source-path') + '/scripts/vendor/html5shiv.min.js'
      },
      scripts: {
        files: [
          {expand: true, cwd: grunt.option('source-path') + '/scripts/', src: ['**/*'], dest: grunt.option('build-path') + '/live/scripts/', filter: 'isFile'},
          {expand: true, cwd: grunt.option('source-path') + '/scripts/', src: ['**/*'], dest: grunt.option('build-path') + '/modifiers/scripts/', filter: 'isFile'}
        ]
      },
      images: {
        files: [
          {expand: true, cwd: grunt.option('source-path') + '/images/', src: ['**/*'], dest: grunt.option('build-path') + '/live/images/', filter: 'isFile'},
          {expand: true, cwd: grunt.option('source-path') + '/images/', src: ['**/*'], dest: grunt.option('build-path') + '/modifiers/images/', filter: 'isFile'}
        ]
      },
      html: {
        src: grunt.option('build-path') + '/source/html/index.html',
        dest: grunt.option('build-path') + '/live/index.html'
      },
      live: {
        src: grunt.option('build-path') + '/source/css/index.source.prefixed.min.css',
        dest: grunt.option('build-path') + '/live/css/index.min.css'
      },
      modifiers: {
        src: grunt.option('build-path') + '/source/css/index.source.prefixed.css',
        dest: grunt.option('build-path') + '/modifiers/css/index.css'
      }
    },

    // https://www.npmjs.org/package/grunt-dom-munger
    dom_munger: {
      index: {
        options: {
          append: [
            {selector: 'head', html: '<link rel="stylesheet" href="/css/index.min.css">'},
            {selector: 'head', html: '<!--[if lt IE 9]><script src="/scripts/vendor/html5shiv.js"></script><![endif]-->'}
          ]
        },
        src: 'build/source/html/index.html'
      }
    },

    // https://www.npmjs.org/package/grunt-prettify
    prettify: {
      options: {
        'unformatted': []
      },
      all: {
        expand: true,
        cwd: grunt.option('build-path'),
        src: ['**/*.html'],
        dest: grunt.option('build-path')
      }
    },

    // https://github.com/gruntjs/grunt-contrib-sass
    sass: {                             
      dist: {                           
        files: [
          {expand: true, cwd: grunt.option('source-path'), src: ['index.scss'], dest: grunt.option('build-path') + '/source/css/', ext: '.source.css'},
          {expand: true, cwd: grunt.option('source-path') + '/css/', src: ['bem_imports.scss'], dest: grunt.option('build-path') + '/source/css/', ext: '.source.css'},
          {expand: true, cwd: grunt.option('source-path') + '/css/debug/', src: ['debug.scss'], dest: grunt.option('build-path') + '/modifiers/css/', ext: '.css'}  
        ]
      }
    },

    // https://www.npmjs.org/package/grunt-autoprefixer
    autoprefixer: {
      index: {
        options: {},
        src: grunt.option('build-path') + '/source/css/index.source.css',
        dest: grunt.option('build-path') + '/source/css/index.source.prefixed.css',
      },
    },

    // https://github.com/gruntjs/grunt-contrib-cssmin
    cssmin: {
      index: {
        expand: true,
        files: {'<%= grunt.option("build-path") %>/source/css/index.source.prefixed.min.css': '<%= grunt.option("build-path") %>/source/css/index.source.prefixed.css'},
        options: {
          banner: '/* Minified with https://www.npmjs.org/package/grunt-contrib-cssmin */'
        }
      }
    },

    // https://www.npmjs.org/package/grunt-w3c-validation
    'css-validation': {
      options: {
        path: './doc/log/validation-css-status.json',
        reportpath: './doc/log/validation-css-report.json',
        stoponerror: false,
        relaxerror: [],
        profile: 'css3',
        medium: 'all',
        warnings: '2'
      },
      files: {
        src: [grunt.option('build-path') + '/source/css/*.css']
      }
    },

    'html-validation': {
      options: {
        path: './doc/log/validation-html-status.json',
        reportpath: './doc/log/validation-html-report.json',
        stoponerror: false,
        relaxerror: [] //ignores these errors
      },
      files: {
        src: [grunt.option('build-path') + '/live/index.html']
      }
    },

    // https://github.com/phamann/grunt-css-metrics
    cssmetrics: {
      index: {
        src: [grunt.option('build-path') + '/source/css/index.source.css']
      }
    },

    // https://github.com/gruntjs/grunt-contrib-watch
    watch: {
      html: {
        files: [grunt.option('source-path') + '/index.html'],
        tasks: ['default']
      },
      sass: {
        files: [grunt.option('source-path') + '/**/**.scss'],
        tasks: ['default']
      },
      css: {
        files: [grunt.option('source-path') + '/**/**.css'],
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
      reset: {
        options: {
          questions: [{
              config: 'reset',
              type: 'confirm',
              message: 'This will throw all your work out, are you sure?',
              default: true
            }
          ]
        }
      }
    },

    // https://github.com/gruntjs/grunt-contrib-watch
    githooks: {
      all: {
        // Will run the jshint and test:unit tasks at every commit
      }
    }

  });

  // what the task title says
  grunt.registerTask('do-reset', 'Clean working environment', function() {
    if(grunt.config('reset')){
      grunt.task.run('clean:reset');
    }
  });

  // load all custom tasks
  grunt.task.loadTasks(__dirname + '/tasks');

  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt, {config: __dirname + '/package.json', scope: 'peerDependencies'});

  grunt.registerTask('dev', ['default']);
  grunt.registerTask('reset', ['prompt:reset', 'do-reset']);
  grunt.registerTask('validate', ['html-validation', 'cssmetrics', 'css-validation']);
  
  // WOW... loads!
  grunt.registerTask('default', [
    'clean:build',          // clean up folders
    'copy:normalize',       // copy a bower normalize package into the src/css/vendor
    'copy:html5shiv',       // copy a bower html5 shiv package into the src/script/vendor
    'copy:scripts',         // copy any src scrips into build/../scrips
    'copy:images',          // copy any src images into build/../scrips
    'parse-index',          // add stub data to build/source/html/index.html using underscore templates
    'scaffold-sass',        // rip apart the build/source/html/index.html and create SASS files for each block/element and modifier in there
    'sass-imports',         // generate a CSS file with all needed SASS @import's
    'sass',                 // SASS up the resulting build/source/css/index.source.css
    'autoprefixer',         // prefix CSS shizzle
    'cssmin',               // minify CSS shizzle
    'copy:html',            // copy the build/source/html/index.html to build/live/index.html
    'dom_munger:index',     // add default css and scripts to the index.html
    'copy:live',            // copy a minified/prefixed CSS to the build/live
    'copy:modifiers',       // the same for the modifiers
    'scaffold-modifiers',   // generate a HTML page for each modifier you defined in the src/sss/bem
    'prettify:all'          // clean the resulting HTML up a bit
  ]);

};
