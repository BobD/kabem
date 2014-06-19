/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);

  grunt.option('backup-path', 'backup');
  grunt.option('kabem-path', grunt.option('source-path') + '/css/kabem');

  var config = {

    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // https://github.com/gruntjs/grunt-contrib-connect
    connect: {
      server: {
        options: {
          port: 9001,
          base: grunt.option('build-path') + '/bem',
          keepalive: true,
          open: true
        }
      }
    },

    // https://github.com/gruntjs/grunt-contrib-clean
    clean: {
      options:{
        force: true
      },
      build: [grunt.option('build-path')],
      backup: [grunt.option('backup-path')],
      reset: [
        grunt.option('build-path'), 
        grunt.option('kabem-path') + '/bem/**/*', 
        grunt.option('kabem-path') + '/_all.scss', 
        grunt.option('kabem-path') + '/bem.scss'
      ]
    },

    // https://github.com/gruntjs/grunt-contrib-copy
    copy: {
      css: {
        files: [
          {expand: true, cwd: grunt.option('source-path') + '/css', src: ['**/*', '!**/*.scss'], dest: grunt.option('build-path') + '/source/css', filter: 'isFile'}
        ]
      },
      files: {
        files: [
          {expand: true, cwd: grunt.option('source-path') + '/<%= grunt.task.current.args[0] %>/', src: ['**/*'], dest: './dist/<%= grunt.task.current.args[0] %>/', filter: 'isFile'},
          {expand: true, cwd: grunt.option('source-path') + '/<%= grunt.task.current.args[0] %>/', src: ['**/*'], dest: grunt.option('build-path') + '/bem/<%= grunt.task.current.args[0] %>/', filter: 'isFile'}
        ]
      },
      dist: {
        files:[
          {src: grunt.option('build-path') + '/source/html/index.html', dest: './dist/index.html'},
          {src: grunt.option('build-path') + '/source/css/index.source.prefixed.min.css', dest: './dist/css/index.min.css'}
        ]
      },
      bem: {
        src: grunt.option('build-path') + '/source/css/index.source.prefixed.min.css',
        dest: grunt.option('build-path') + '/bem/css/index.min.css'
      }
    },

    // https://www.npmjs.org/package/grunt-dom-munger
    dom_munger: {
      source_index: {
        options: {
          append: [
            {selector: 'head', html: '<link rel="stylesheet" href="/css/index.min.css">'}          ]
        },
        src: grunt.option('build-path') + '/source/html/index.html'
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
      bem: {
        files: [
           {
            expand: true, 
            cwd: grunt.option('kabem-path'), 
            src: ['bem.scss'], 
            dest: grunt.option('build-path') + '/source/css/', 
            ext: '.source.css'
          }
        ]
      },                        
      all: {                           
        files: [
          {
            expand: true, 
            cwd: grunt.option('source-path'), 
            src: ['index.scss'], 
            dest: grunt.option('build-path') + '/source/css/', 
            ext: '.source.css'
          },
          {
            expand: true, 
            cwd: grunt.option('kabem-path'), 
            src: ['bem.better.scss'], 
            dest: grunt.option('build-path') + '/source/css/', 
            ext: '.source.css'
          },
          {
            expand: true, 
            cwd: grunt.option('kabem-path') + '/debug/', 
            src: ['debug.scss'], 
            dest: grunt.option('build-path') + '/bem/css/', 
            ext: '.css'
          }  
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
          banner: '<%= banner %>'
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
        src: ['./dist/index.html']
      }
    },

    // https://github.com/phamann/grunt-css-metrics
    cssmetrics: {
      index: {
        src: [grunt.option('build-path') + '/source/css/index.source.css']
      }
    },

    // https://github.com/gruntjs/grunt-contrib-watch
    // watch needs to reset it's cwd due to the grunt.file.setBase above, bit it's weird it does not work with cwd: grunt.option('source-path') directly..
    watch: {
      html: {
        files: [grunt.option('source-path') + '/index.html'],
        tasks: ['vb-kabem']
      },
      sass_modifiers: {
        files: [grunt.option('kabem-path') + '/**/*_modifiers.scss'],
        tasks: ['vb-kabem']
      },
      sass_the_rest: {
        files: [grunt.option('source-path') + '/**/**.scss', '!kabem'],
        tasks: ['sass', 'import-css-modules', 'autoprefixer', 'cssmin', 'copy:bem', 'copy:live']
      },
      grunt: {
        files: ['Gruntfile.js', 'tasks/*.js'],
        tasks: ['vb-kabem']
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
    }
  };

  grunt.config.merge(config);

  grunt.task.loadTasks('tasks/kabem');

  // https://www.npmjs.org/package/load-grunt-tasks
  require('load-grunt-tasks')(grunt, {config: __dirname + '/package.json'});

  grunt.registerTask('reset', ['prompt:reset', 'do-reset']);
  grunt.registerTask('validate', ['html-validation', 'cssmetrics', 'css-validation']);
  
  // WOW... loads!
  grunt.registerTask('kabem', [
    'clean:build',                  // clean up folders
    'copy:files:scripts',           // copy any src scrips into build/../scrips
    'copy:files:images',            // copy any src images into build/../images
    'copy:css',                     // copy any vendor css files into build/../css/vendor
    'parse-index',                  // add stub data to build/source/html/index.html using underscore templates
    'scaffold-sass',                // rip apart the build/source/html/index.html and create SASS files for each block/element and modifier in there
    'sass-imports',                 // generate a CSS file with all needed SASS @import's
    'sass:bem',                     // sass up a CSS with all BEM classes
    'better-bem',                   // use that CSS to generate CSS selectors for 'better' BEM classnames multy modifiers possible block__element_modifier1_modifier_2
    'sass:all',                     // SASS up the resulting build/source/css/index.source.css
    'autoprefixer',                 // prefix CSS shizzle
    'cssmin',                       // minify CSS shizzle
    'dom_munger:source_index',      // create a index HTML file used the source for all other pages
    'copy:dist',                    // copy a minified/prefixed CSS to the build/live
    'copy:bem',                     // the same for the build/bem pages
    'scaffold-bem',                 // generate testing pages for all defined BEM modifiers
    'prettify:all'                  // clean the resulting HTML up a bit
  ]);

};
