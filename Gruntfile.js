/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);

  // Splits a BEM selector inti it's Block, Element and Modifier parts
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
      modifiers: {
        options: {
          port: 9001,
          base: 'build/modifiers',
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
      source: ['src/css/_all.scss']
    },

    // https://github.com/gruntjs/grunt-contrib-copy
    copy: {
      normalize: {
        src: 'bower_components/normalize.css/normalize.css',
        dest: 'src/css/vendor/normalize.scss'
      },
      scripts: {
        files: [
          {expand: true, cwd: 'src/scripts/', src: ['**/*'], dest: 'build/live/scripts/', filter: 'isFile'},
          {expand: true, cwd: 'src/scripts/', src: ['**/*'], dest: 'build/modifiers/scripts/', filter: 'isFile'}
        ]
      },
      images: {
        files: [
          {expand: true, cwd: 'src/images/', src: ['**/*'], dest: 'build/live/images/', filter: 'isFile'},
          {expand: true, cwd: 'src/images/', src: ['**/*'], dest: 'build/modifiers/images/', filter: 'isFile'}
        ]
      },
      html: {
        src: 'build/source/html/index.html',
        dest: 'build/live/index.html'
      },
      live: {
        src: './build/source/css/index.source.prefixed.min.css',
        dest: './build/live/css/index.min.css'
      },
      modifiers: {
        src: './build/source/css/index.source.prefixed.css',
        dest: './build/modifiers/css/index.css'
      },
      // backup: {
      //   cwd: 'src/',
      //   expand: true,
      //   src: 'css/**',
      //   dest: 'backup/ <%= grunt.template.today("yyyymmddhMM") %>/'
      // }
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
          {'./build/source/css/index.bem.css': './src/css/bem_imports.scss'},
          {'./build/modifiers/css/debug.css': './src/css/debug/debug.scss'}
        ]
      }
    },

    // https://www.npmjs.org/package/grunt-autoprefixer
    autoprefixer: {
      index: {
        options: {},
        src: 'build/source/css/index.source.css',
        dest: 'build/source/css/index.source.prefixed.css',
      },
    },

    // https://github.com/gruntjs/grunt-contrib-cssmin
    cssmin: {
      index: {
        expand: true,
        files: {'build/source/css/index.source.prefixed.min.css': 'build/source/css/index.source.prefixed.css'},
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
      }
    }

  });

  // load all custom tasks
  grunt.task.loadTasks('tasks');

  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('dev', ['default']);
  grunt.registerTask('backend', ['bem-lookup', 'bem-view']);
  // grunt.registerTask('reset', ['copy:backup', 'clean']);
  grunt.registerTask('validate', ['html-validation', 'cssmetrics', 'css-validation']);
  
  // WOW... loads!
  grunt.registerTask('default', [
    'clean:build',          // clean up folders
    'copy:normalize',       // copy a bower normalize package into the src/css/vendor
    'copy:scripts',         // copy any src scrips into build/../scrips
    'copy:images',          // copy any src images into build/../scrips
    'parse-index',          // add stub data to build/source/html/index.html using underscore templates
    'scaffold-sass',        // rip apart the build/source/html/index.html and create SASS files for each block/element and modifier in there
    'sass-imports',         // generate a CSS file with all needed SASS @import's
    'sass',                 // SASS up the resulting build/source/css/index.source.css
    'autoprefixer',         // prefix CSS shizzle
    'cssmin',               // minify CSS shizzle
    'copy:html',            // copy the build/source/html/index.html to build/live/index.html
    'dom_munger:index',     // add the index.min.css to the build/live/index.html
    'copy:live',            // copy a minified/prefixed CSS to the build/live
    'copy:modifiers',       // the same for the modifiers
    'scaffold-modifiers',   // generate a HTML page for each modifier you defined in the src/sss/bem
    'prettify:all'          // clean the resulting HTML up a bit
  ]);

};
