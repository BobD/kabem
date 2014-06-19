/*global module:false*/
module.exports = function(grunt) {

  // grunt.option.init() method overwrites the entire internal option state, https://github.com/gruntjs/grunt/issues/1023
  grunt.option('config-path', grunt.option('config-path') || 'config');
  grunt.option('build-path', grunt.option('build-path') || 'build');
  grunt.option('source-path', grunt.option('source-path') || 'src');

  grunt.initConfig({
    copy: {
      normalize: {
        src: './bower_components/normalize-css/normalize.css',
        dest: grunt.option('build-path') + '/source/css/vendor/normalize.css',
      }, 

      html5shiv: {
        src: './bower_components/html5shiv/dist/html5shiv.min.js',
        dest: grunt.option('build-path') + '/scripts/vendor/html5shiv.min.js',
      }
    }
  });

  require('./kabem')(grunt);

  grunt.registerTask('default', [
    'kabem',
    'copy:normalize',
    'copy:html5shiv'
  ]);

};
