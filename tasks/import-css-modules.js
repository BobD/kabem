// Uses http://underscorejs.org/#template
module.exports = function(grunt) {
	 // https://www.npmjs.org/package/rework-npm
	 grunt.registerTask('import-css-modules', 'Import CSS from npm modules using rework', function() {
	    var rework = require('rework'),
	        reworkNPM = require('rework-npm'),
	        filePath = grunt.option('build-path') + '/source/css/index.source.css';
	        source = grunt.file.read(filePath);

	    // BOB::20140526, need to improve in this replacing routine..
	    source = source.replace(/url\(vb:/g, '');
	    source = source.replace(/.css\)/g, '');
	    // END
	    
	    var output = rework(source)
	        .use(reworkNPM())
	        .toString();

	    grunt.file.write(filePath, output);
	 });
}