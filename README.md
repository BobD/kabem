##kaBEM

kaBEM is a grunt.js environment for easy scaffolding, developing and testing HTML pages with BEM CSS.

###Why BEM?

BEM stands for Block Element Modifier and was originally thought up by the people of <a href="http://yandex.ru/">Yandex</a>. BEM is no more then a simple CSS class naming convention which gives them purpose and meaning to other developers, ideal for teams. In short the benefits are:
 
* See a BEM classname in your CSS and know where to use it in your HTML
* See a BEM classname in your HTML and know where to find it in your CSS files
* See a BEM classname and know which purpose it has

BEM is no golden highway to utter development bliss of course. It's (long) classnames help in understanding your CSS, but it will also bloat your HTML a bit. It's single classname approach can prevent CSS specifity hell and helps with an OOCSS approach, but also ignores the useful cascading nature of C(cascading)SS. Luckily (ka)BEM is pretty flexible and does not prevent you from using it in the way you want.

For some more BEM reading:

* [linkBEM Methodology] (http://bem.info/method/)
* [BEM it!, BEM Methodology for small companies with high expectations] ( href="http://www.slideshare.net/MaxShirshin/bem-dm")
* [MindBEMding – getting your head ’round BEM syntax] (http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)

###Why kaBEM?

Using a single HTML file with meaningful kaBEM classes it can scaffold all the needed SASS files inside a nice 'BEM' folder structure. It also generates HTML files for all the BEM modifiers in your CSS for easy testing. And of course it (will) include all the relevant grunt.js niceties like running a local server with livereload and HTML/CSS validation and cleaning.


###kaBEM naming conventions

kaBEM uses these class name conventions:

* '__' staring block and elements
* '_' starting a modifier
* '-' for multi word block, elements and modifiers. 

So this is what a kaBEM class can look like: '__page__container_your-name'

###Getting Stared

  1. [install node.js] (http://nodejs.org/)
  2. [install grunt.js] (http://gruntjs.com/getting-started)
  3. Run 'npm install'
  4. Take a look at the index.html in src folder, notice the example kaBEM classes, and run 'grunt'

###TODO

* Finish this readme
