// Uses http://handlebarsjs.com/
module.exports = function(grunt) {
	grunt.registerTask('parse-index', 'Parses a underscore template and returns the HTML', function() {
		var _ = require("underscore");
		var Handlebars = require('Handlebars');
		var dataPath = grunt.option('config-path') + '/data.json';
		var data = (grunt.file.exists(dataPath)) ? grunt.file.readJSON(dataPath) : {};
		var index = grunt.option('source-path') + '/index.html';
		var html = grunt.file.read(index);
		var template = Handlebars.compile(html);
		var cwd = grunt.option('source-path') + '/templates/';
		var partials = grunt.file.expand({cwd: cwd}, '*.html');
		var templateName, templateHTML;

		_.each(partials, function(file){
			templateName = file.substr(0, file.indexOf('.html'));
			templateHTML = grunt.file.read(cwd + file);
			Handlebars.registerPartial(templateName, templateHTML);
		});

		var result = template(data);
		grunt.file.write(grunt.option('build-path') + '/source/html/index.html', result);
	})
}