// Simplified version of https://www.npmjs.org/package/grunt-sass-directory-import
module.exports = function(grunt) {
    
grunt.registerTask('sass-imports', 'Generates an _all.scss file with all sass files needed', function() {
    var dir = grunt.option('source-path');
    var allImportFile = dir + '/css/_all.scss';
    var bemImportFile = grunt.option('kabem-path') + '/bem.scss';
    var normalFiles = grunt.file.expand({cwd: dir + '/css'}, ['**/*.scss', '**/*.css' ,'!_all.scss', '!kabem/**/*.*']);
    var bemFiles = grunt.file.expand({cwd: grunt.option('kabem-path')}, ['bem/**/*.scss']);
    var segments, file, importFile;
    var leader = ['// Auto generated, see grunt the sass-imports task '];
    var allImports = getSASSimports(normalFiles);
    var bemImports = getSASSimports(bemFiles);
    
    bemImports.unshift('@import "../helpers/variables";', '@import "../helpers/utils";');
    bemImports.unshift(leader);
    allImports.push('@import "helpers/variables";', '@import "helpers/utils";', '@import "kabem/bem.better";');
    allImports.unshift(leader);

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