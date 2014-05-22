// Uses http://underscorejs.org/#template
module.exports = function(grunt) {
	grunt.registerTask('parse-index', 'Parses a underscore template and returns the HTML', function() {
		var _ = require("underscore");
		var dataPath = grunt.option('source-path') + '/config/data.json';
		var data = (grunt.file.exists(dataPath)) ? grunt.file.readJSON(dataPath) : {};
		var index = grunt.option('source-path') + '/index.html';
		var html = grunt.file.read(index);
		var compiled = _.template(html);
		var res = compiled(data);

		grunt.file.write(grunt.option('build-path') + '/source/html/index.html', res);
	})
}