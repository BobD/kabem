/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);

  // Splits a BEM selector inti it's Block, Element and Modifier parts
  grunt.splitBEM = function(selector){
    if(selector.indexOf('.') == 0){
      selector = selector.substring(1);
    }

    var BE = selector.split('__');
    var M = BE.pop().split('_');
    BE.push(M.shift());
    BE = BE.join('__');
    M = M[0];

    return {be: BE, m: M, selector: selector};
  };
  
  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // https://github.com/gruntjs/grunt-contrib-connect
    connect: {
      develop: {
        options: {
          port: 9001,
          base: 'build/develop',
          keepalive: true,
          open: true
        }
      },
      live: {
        options: {
          port: 9002,
          base: 'build/live',
          keepalive: true,
          open: true
        }
      }
    },

    // https://github.com/gruntjs/grunt-contrib-clean
    clean: {
      build: ['build'],
      source: ['.sass-cache', 'src/sass/_all.scss', 'src/sass/partials/_debug.scss'],
      backup: ['backup']
    },

    // https://github.com/gruntjs/grunt-contrib-copy
    copy: {
      html: {
        src: 'build/source/html/index.html',
        dest: 'build/live/index.html'
      },
      live: {
        src: './build/source/css/index.prefixed.min.css',
        dest: './build/live/css/index.css'
      },
      develop: {
        src: './build/source/css/index.prefixed.css',
        dest: './build/develop/css/index.css'
      },
      backup: {
        cwd: 'src/',
        expand: true,
        src: 'sass/**',
        dest: 'backup/ <%= grunt.template.today("yyyymmddhMM") %>/'
      }
    },

    // https://www.npmjs.org/package/grunt-dom-munger
    dom_munger: {
      index: {
        options: {
          append: {selector: 'head', html: '<link rel="stylesheet" href="/css/index.min.css">'}
        },
        src: 'build/live/index.html'
      }
    },

    // https://www.npmjs.org/package/grunt-prettify
    prettify: {
      options: {
        'unformatted': []
      },
      all: {
        expand: true,
        cwd: 'build/',
        src: ['**/*.html'],
        dest: 'build'
      }
    },

    // https://github.com/gruntjs/grunt-contrib-sass
    sass: {                             
      dist: {                           
        options: {                      
          style: 'expanded'
        },
        files: [
          {'./build/source/css/index.source.css': './src/index.scss'},
          {'./build/source/css/index.bem.css': './src/sass/bem.scss'},
          {'./build/develop/css/debug.css': './src/sass/custom/debug.scss'}
        ]
      }
    },

    // https://www.npmjs.org/package/grunt-autoprefixer
    autoprefixer: {
      index: {
        options: {},
        src: 'build/source/css/index.source.css',
        dest: 'build/source/css/index.prefixed.css',
      },
    },

    // https://github.com/gruntjs/grunt-contrib-cssmin
    cssmin: {
      index: {
        expand: true,
        files: {'build/source/css/index.prefixed.min.css': 'build/source/css/index.prefixed.css'},
        options: {
          banner: '/* Minified with https://www.npmjs.org/package/grunt-contrib-cssmin */'
        }
      }
    },

    // https://www.npmjs.org/package/grunt-w3c-validation
    'css-validation': {
      options: {
        path: './log/validation-css-status.json',
        reportpath: './log/validation-css-report.json',
        stoponerror: false,
        relaxerror: [],
        profile: 'css3',
        medium: 'all',
        warnings: '2'
      },
      files: {
        src: ['build/source/css/*.css']
      }
    },

    'html-validation': {
      options: {
          path: './log/validation-html-status.json',
          reportpath: './log/validation-html-report.json',
          stoponerror: false,
          relaxerror: [] //ignores these errors
      },
      files: {
          src: ['build/live/index.html']
      }
    },

    // https://github.com/phamann/grunt-css-metrics
    cssmetrics: {
      index: {
        src: [
            'build/source/css/index.source.css'
        ]
      }
    },

    // https://github.com/gruntjs/grunt-contrib-watch
    watch: {
      html: {
        files: ['src/index.html'],
        tasks: ['default']
      },
      sass: {
        files: ['src/**/**.scss'],
        tasks: ['default']
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

    // https://github.com/gruntjs/grunt-contrib-watch
    githooks: {
      all: {
        // Will run the jshint and test:unit tasks at every commit
        'pre-commit': 'jshint test:unit',
      }
    }

  });

  // load all custom tasks
  grunt.task.loadTasks('tasks');

  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('dev', ['default']);
  grunt.registerTask('backend', ['bem-lookup', 'bem-view']);
  grunt.registerTask('reset', ['copy:backup', 'clean']);
  grunt.registerTask('validate', ['html-validation', 'cssmetrics', 'css-validation']);
  
  // WOW... loads!
  grunt.registerTask('default', [
    'clean:build',      // clean up folders, redundant folders and files do not need to linger on
    'parse-index',      // add stub data to build/source/html/index.html using underscore templates
    'scaffold-sass',    // rip apart the build/source/html/index.html and create SASS files for each block/element and modifier in there
    'import-all-sass',  // generate a CSS file with all needed SASS @import's
    'sass',             // SASS up the resulting build/source/css/index.source.css
    'autoprefixer',     // prefix CSS shizzle
    'cssmin',           // minify CSS shizzle
    'copy:html',        // copy the build/source/html/index.html to build/live/index.html
    'dom_munger:index', // add the index.min.css to the build/live/index.html
    'copy:live',        // copy a minified/prefixed CSS to the build/live
    'copy:develop',     // the same for the develop
    'scaffold-develop', // generate a HTML page for each modifier you defined in the src/sss/bem
    'prettify:all'      // clean the resulting HTML up a bit
  ]);

};
