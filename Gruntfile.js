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
          {'./build/css/index.css': './src/index.scss'},
          {'./build/develop/css/index.css': './src/index.scss'},
          {'./build/develop/css/debug.css': './src/sass/custom/debug.scss'}
        ]
      }
    },

    cssmin: {
      minify: {
        expand: true,
        cwd: 'build/css/',
        src: ['*.css', '!*.min.css'],
        dest: 'build/live/css/',
        ext: '.min.css',
        options: {
          banner: '/* Minified with https://www.npmjs.org/package/grunt-contrib-cssmin */'
        }
      }
    },


    uncss: {
      live: {
        files: {
          'build/live/css/index.min.css': ['build/live/index.html']
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
    }

  });

  // load all custom tasks
  grunt.task.loadTasks('tasks');

  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt);

  // BOB::TODO::20140422, the default task should re-use the html/css tasks
  grunt.registerTask('dev', ['default']);
  grunt.registerTask('backend', ['bem-lookup', 'bem-view']);
  grunt.registerTask('html', ['copy:html', 'dom_munger:index', 'scaffold-sass', 'import-all-sass', 'sass', 'scaffold-develop']);
  grunt.registerTask('css', ['sass', 'cssmin', 'scaffold-develop']);
  grunt.registerTask('reset', ['copy:backup', 'clean']);
  grunt.registerTask('default', ['clean:build', 'copy', 'dom_munger:index', 'scaffold-sass', 'import-all-sass', 'sass', 'cssmin', 'scaffold-develop', 'backend']);

};
