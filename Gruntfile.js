/*global module:false*/
module.exports = function(grunt) {

  // grunt.option.init() method overwrites the entire internal option state, https://github.com/gruntjs/grunt/issues/1023
  grunt.option('config-path', grunt.option('config-path') || 'config');
  grunt.option('build-path', grunt.option('build-path') || 'build');
  grunt.option('source-path', grunt.option('source-path') || 'src');

  grunt.initConfig({
    copy: {
      normalize: {
        files: [
          {src: './bower_components/normalize-css/normalize.css', dest: './dist/css/normalize.css'},
          {src: './bower_components/normalize-css/normalize.css', dest: grunt.option('build-path') + '/bem/css/normalize.css'}
        ]
      }, 

      html5shiv: {
        files: [
          {src: './bower_components/html5shiv/dist/html5shiv.min.js', dest: './dist/scripts/html5shiv.min.js'},
          {src: './bower_components/html5shiv/dist/html5shiv.min.js', dest: grunt.option('build-path') + '/bem/scripts/html5shiv.min.js'}
        ]
      },

      css: {
        files: [
          {expand: true, cwd: grunt.option('source-path') + '/css', src: ['**/*', '!**/*.scss'], dest: './dist/css', filter: 'isFile'},
          {expand: true, cwd: grunt.option('source-path') + '/css', src: ['**/*', '!**/*.scss'], dest: grunt.option('build-path') + '/bem/css', filter: 'isFile'}
        ]
      },

      files: {
        files: [
          {expand: true, cwd: grunt.option('source-path') + '/<%= grunt.task.current.args[0] %>/', src: ['**/*'], dest: './dist/<%= grunt.task.current.args[0] %>/', filter: 'isFile'},
          {expand: true, cwd: grunt.option('source-path') + '/<%= grunt.task.current.args[0] %>/', src: ['**/*'], dest: grunt.option('build-path') + '/bem/<%= grunt.task.current.args[0] %>/', filter: 'isFile'}
        ]
      }
    }
  });

  require('./kabem')(grunt);

  grunt.registerTask('default', [
    'kabem',                          // Perform some kaBEM on your index.html
    'copy:normalize',                 // Copy some bower assets into the dist and build/bem folders
    'copy:html5shiv',                 // ..
    'copy:css',                       // Copy any other css/scripts assets
    'copy:files:scripts',             // ..
    'copy:files:images'               // ..
  ]);

};
