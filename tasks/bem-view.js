module.exports = function(grunt) {

  grunt.registerTask('bem-view', 'Generate an ERB view for the backend to fill with the BEM/Setting values', function() {
    var _ = require("underscore");
    var jsdom = require("jsdom").jsdom;
    var source = grunt.file.read('src/index.html');
    var doc = jsdom(source);
    var window = doc.parentWindow;
    var blockElements = doc.querySelectorAll('body[class^="__"], body *[class^="__"]');
    var block = blockElements[0]; // first element is the root BEM 'block'
    var classList, output;


    _.each(blockElements, function(el){
      classList = el.getAttribute('class').split(' ');

       _.each(classList, function(c, index){
        if(c.indexOf('__') == 0){
          classList[index] = "<%= presenter.classes_for('" + c + "') %>";
        }
      });

      el.setAttribute('class', classList.join(' '));
    });

    output = block.outerHTML;
    output = output.replace(/&lt;/g, "<");
    output = output.replace(/&gt;/g, ">");
    grunt.file.write('build/backend/bem-view.erb', output);
  }); 

}