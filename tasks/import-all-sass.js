// Simplified version of https://www.npmjs.org/package/grunt-sass-directory-import
module.exports = function(grunt) {
	grunt.registerTask('import-all-sass', 'Generates a _all.scss file with all sass files imported', function() {
    var dir = 'src/sass/';
    var filepath = dir + '_all.scss';
    var customFiles = grunt.file.expand({cwd: dir}, ['custom/**/*.scss', '!_all.scss', '!custom/debug.scss', '!custom/partials/_debug.scss']);
    var bemFiles = grunt.file.expand({cwd: dir}, ['bem/**/*.scss']);
    var segments, file, importFile;
    var imports = ['// Auto generated, see grunt "import-all-sass task" '];
    
    imports = imports.concat(getSASSimports(customFiles));
    imports = imports.concat(getSASSimports(bemFiles));

    grunt.file.write(filepath, imports.join('\n'));
  });
}


function getSASSimports(files){
	var _ = require("underscore");
	var imports = [];

	_.each(files, function(path){
	  segments = path.split('/');
	  file = segments.pop();

	  if(file.charAt(0) == '_'){
	    file = file.substring(1);
	  }

	  file = file.replace('.scss', '');
	  segments.push(file);
	  importFile = segments.join('/');
	  imports.push('@import "' + importFile + '";');
	});

	return imports;
}