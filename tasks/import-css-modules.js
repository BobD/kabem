// Uses http://underscorejs.org/#template
module.exports = function(grunt) {
	 // https://www.npmjs.org/package/rework-npm
	 grunt.registerTask('import-css-modules', 'Import CSS from npm modules using rework', function() {
	    var rework = require('rework'),
	        reworkNPM = require('rework-npm'),
	        filePath = grunt.option('build-path') + '/source/css/index.source.css';
	        source = grunt.file.read(filePath);
	    
	    var output = rework(source)
	        .use(reworkNPM())
	        .toString();

	    grunt.file.write(filePath, output);
	 });
}