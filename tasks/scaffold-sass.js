module.exports = function(grunt) {
  grunt.registerTask('scaffold-sass', 'Generates folders for all sass files based on BEM classnames in index.html', function() {
    var _ = require("underscore");
    var jsdom = require('jsdom').jsdom;
    var cwd = 'src/';
    var dir = cwd + 'sass/bem'
    var index = 'build/source/html/index.html';
    var html = grunt.file.read(index);
    var doc = jsdom(html).parentWindow.document;
    var bemClasses = doc.querySelectorAll('body[class^="__"], body *[class^="__"]');
    var classList, BEList = [], beSplit, dirPath, bePath, mPath;

    // collect the BEM classes
    _.each(bemClasses, function(el){
      classList = el.getAttribute('class').split(' ');
       _.each(classList, function(c){
        if(c.indexOf('__') == 0){
          BEM = grunt.splitBEM(c);
          BEList.push(BEM.be);
        }
      });
    });

    BEList = _.uniq(BEList);

    var debugSASS = '';

    // generate sass folders
    _.each(BEList, function(be){
      beSplit = be.split('__');
      dirPath = dir + beSplit.join('/__');
      bePath = dirPath + '/' + be + '.scss';
      mPath = dirPath + '/' + be + '_modifiers.scss';

      if(!grunt.file.isDir(dirPath)){
        grunt.file.mkdir(dirPath);
      }

      if(!grunt.file.exists(bePath)){
        grunt.file.write(bePath, '.' + be + '{/* add your block/element CSS */}');
      }

      if(!grunt.file.exists(mPath)){
        grunt.file.write(mPath, '.' + be + '_modifier-name{/* add your modifier CSS */}');
      }

      debugSASS += 'body.debug .' + be + '{@include debug(' + be + ');}\n';
    });

    // write some debuging css outlines
    grunt.file.write(cwd + 'sass/custom/partials/_debug.scss', debugSASS);

    // clean up sass folders which are not referenced through the HTML bem classes
    // BOB::TODO::20140324, will remove everything.. also custom css work, need to rethink this
    var dirs = grunt.file.expand({cwd: dir}, ['**/*', '!**/*.scss']),
        dirName;

    _.each(dirs, function(path){
      dirName = path.split('/').join('');
      if(!doc.querySelector('.' + dirName)){
        // grunt.task.run('prompt:clear_sass_scaffold');
        grunt.file.delete(dir + '/'+ path);
      }
    });

  });
};