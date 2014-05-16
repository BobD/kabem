// Uses http://underscorejs.org/#template
module.exports = function(grunt) {
	grunt.registerTask('parse-index', 'Parses a underscore template and returns the HTML', function() {
		var _ = require("underscore");
		var data = grunt.file.readJSON('config/data.json');
		var cwd = 'src/';
		var index = cwd + 'index.html';
		var html = grunt.file.read(index);
		var compiled = _.template(html);
		var res = compiled(data);

		grunt.file.write('build/source/html/index.html', res);
	})
}