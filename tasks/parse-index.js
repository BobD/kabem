// Uses http://underscorejs.org/#template
module.exports = function(grunt) {
	grunt.registerTask('parse-index', 'Parses a underscore template and returns the HTML', function() {
		var _ = require("underscore");
		var data = grunt.file.readJSON(grunt.option('config-path') + '/data.json');
		var index = grunt.option('source-path') + '/index.html';
		var html = grunt.file.read(index);
		var compiled = _.template(html);
		var res = compiled(data);

		grunt.file.write(grunt.option('build-path') + '/source/html/index.html', res);
	})
}