// Simplified version of https://www.npmjs.org/package/grunt-sass-directory-import
module.exports = function(grunt) {
    
grunt.registerTask('sass-imports', 'Generates a _all.scss file with all sass files needed', function() {
    var dir = grunt.option('source-path') + '/css/';
    var allImportFile = dir + '_all.scss';
    var bemImportFile = dir + 'bem_imports.scss';
    var normalFiles = grunt.file.expand({cwd: dir}, ['**/*.scss', '**/*.css', '!debug/*.scss', '!bem/**/*.scss', '!_all.scss', '!bem_imports.scss']);
    var bemFiles = grunt.file.expand({cwd: dir}, ['bem/**/*.scss']);
    var segments, file, importFile;
    var leader = ['// Auto generated, see grunt the sass-imports task '];
    var allImports = getSASSimports(normalFiles);
    var bemImports = getSASSimports(bemFiles);
    
    bemImports.unshift('@import "helpers/variables";')
    bemImports.unshift(leader)
    allImports.push('@import "css/bem_imports";');
    allImports.unshift(leader)

    grunt.file.write(allImportFile, allImports.join('\n'));
    grunt.file.write(bemImportFile, bemImports.join('\n'));
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