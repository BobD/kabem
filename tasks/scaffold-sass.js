module.exports = function(grunt) {
  var _ = require("underscore");
  var redundants;

  grunt.registerTask('scaffold-sass', 'Generates folders for all sass files based on BEM classnames in index.html', function() {
    var jsdom = require('jsdom').jsdom;
    var cwd = 'src/';
    var dir = cwd + 'css/bem'
    var index = grunt.option('build') + '/source/html/index.html';
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
    grunt.file.write(cwd + 'css/debug/_debug.scss', debugSASS);

    // clean up sass folders which are not referenced through the HTML bem classes
    var deletePaths = grunt.file.expand({cwd: dir}, ['**/*', '!**/*.scss']),
        dirName, backupTasks = [], paths = [], taskName;

    redundants = [];

    _.each(deletePaths, function(path){
      dirName = path.split('/').join('');

      if(!doc.querySelector('.' + dirName)){
        taskName = 'prompt.a' + path;

        grunt.config(taskName + '.options', {
          questions: [{
              config: taskName + '.backup',
              type: 'list',
              message: 'It seems the CSS for .' + dirName + ' is not needed anymore. What do you want to do?',
              choices: ['backup', 'delete'],
              default: 'backup',
              filter:  function(action){
                redundants.push({path: path, action: action});
                return true;
              }
            }
          ]
        });

        backupTasks.push('prompt:a' + path);
      }
    });

    backupTasks.push('bem_backup');
    grunt.task.run(backupTasks);
  });

  grunt.registerTask('bem_backup', 'Make a backup from a BEM SASS folder if it is not referenced in the HTML anymore', function(){

    _.each(redundants, function(bem){
      var cwd = 'src/css/bem/' + bem.path + '/';
      var files = grunt.file.expand({cwd: cwd}, ['*.scss']);

      switch(bem.action){
        case 'backup':
          var backupDir = 'backup/' + grunt.template.today('yyyy-mm-dd-h-MM') + '/' + bem.path + '/';

          _.each(files, function(file){
            grunt.file.copy(cwd + file,  backupDir + file);
          });
          break;
      }
    });

    _.each(redundants, function(bem){
      var cwd = 'src/css/bem/' + bem.path + '/';
      if(grunt.file.exists(cwd)){
        grunt.file.delete(cwd);
      }
    });

  });

};