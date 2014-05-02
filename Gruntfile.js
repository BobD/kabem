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

    connect: {
      live: {
        options: {
          port: 9001,
          base: 'build/live',
          keepalive: true,
          open: true
        }
      },
      develop: {
        options: {
          port: 9002,
          base: 'build/develop',
          keepalive: true,
          open: true
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
      live: {
        src: './build/css/index.prefixed.min.css',
        dest: './build/live/css/index.css'
      },
      develop: {
        src: './build/css/index.prefixed.css',
        dest: './build/develop/css/index.css'
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
          append: {selector: 'head', html: '<link rel="stylesheet" href="/css/index.min.css">'}
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
          {'./build/css/index.source.css': './src/index.scss'},
          {'./build/develop/css/debug.css': './src/sass/custom/debug.scss'}
        ]
      }
    },

    autoprefixer: {
      index: {
        options: {},
        src: 'build/css/index.source.css',
        dest: 'build/css/index.prefixed.css',
      },
    },

    cssmin: {
      index: {
        expand: true,
        files: {'build/css/index.prefixed.min.css': 'build/css/index.prefixed.css'},
        options: {
          banner: '/* Minified with https://www.npmjs.org/package/grunt-contrib-cssmin */'
        }
      }
    },

    // See https://www.npmjs.org/package/grunt-w3c-validation
    'css-validation': {
      options: {
        stoponerror: false,
        relaxerror: [],
        profile: 'css3',
        medium: 'all',
        warnings: '2'
      },
      files: {
        src: ['build/css/*.css']
      }
    },

    'html-validation': {
      options: {
          stoponerror: false,
          relaxerror: [] //ignores these errors
      },
      files: {
          src: ['build/live/index.html']
      }
    },
    // 

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
    }

  });

  // load all custom tasks
  grunt.task.loadTasks('tasks');

  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt);

  // BOB::TODO::20140422, the default task should re-use the html/css tasks
  grunt.registerTask('dev', ['default']);
  grunt.registerTask('backend', ['bem-lookup', 'bem-view']);
  grunt.registerTask('reset', ['copy:backup', 'clean']);
  grunt.registerTask('validate', ['html-validation', 'css-validation']);
  grunt.registerTask('default', ['clean:build', 'copy:html', 'dom_munger:index', 'scaffold-sass', 'import-all-sass', 'sass', 'autoprefixer', 'cssmin', 'copy:live', 'copy:develop', 'scaffold-develop']);

};
