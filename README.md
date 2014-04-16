<h1>kaBEM</h1>

kaBEM is a grunt.js environment for easy scaffolding, developing and testing HTML pages with BEM CSS.

<h2>Why BEM?</h2>

BEM stands for Block Element Modifier and was originally thought up by the people of <a href="http://yandex.ru/">Yandex</a>. BEM is no more then a simple CSS class naming convention which gives them purpose and meaning to other developers, ideal for teams. In short the benefits are:
 
<ul>
<li>See a BEM classname in your CSS and know where to use it in your HTML</li>
<li>See a BEM classname in your HTML and know where to find it in your CSS files</li>
<li>See a BEM classname and know which purpose it has</li>
</ul>

BEM is no golden highway to utter development bliss of course. It's (long) classnames help in understanding your CSS, but it will also bloat your HTML a bit. It's single classname approach can prevent CSS specifity hell and helps with an OOCSS approach, but also ignores the useful cascading nature of C(cascading)SS. Luckily (ka)BEM is pretty flexible and does not prevent you from using it in the way you want.

For some more BEM reading:

<ul>
<li><a href="http://bem.info/method/">BEM Methodology</a></li>
<li><a href="http://www.slideshare.net/MaxShirshin/bem-dm">BEM it!, BEM Methodology for small companies with high expectations</a></li>
<li><a href="http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/">MindBEMding – getting your head ’round BEM syntax</a></li>
</ul>

<h2>Why kaBEM?</h2>

Using a single HTML file with meaningful kaBEM classes it can scaffold all the needed SASS files inside a nice 'BEM' folder structure. It also generates HTML files for all the BEM modifiers in your CSS for easy testing. And of course it (will) include all the relevant grunt.js niceties like running a local server with livereload and HTML/CSS validation and cleaning.


<h2>kaBEM naming conventions</h2>

kaBEM uses these class name conventions:

<ul>
 <li>'__' staring block and elements</li>
 <li>'_' starting a modifier</li>
 <li>'-' for multi word block, elements and modifiers. 
</ul>

So this is what a kaBEM class can look like: '__page__container_your-name'

<h2>Getting Stared</h2>

<ol>
  <li><a href="http://nodejs.org/">install node.js</a></li>
  <li><a href="http://gruntjs.com/getting-started">install grunt.js</a></li>
  <li>Run 'npm install'</li>
  <li>Take a look at the index.html in src folder, notice the example kaBEM classes, and run 'grunt'</li>
</ol>

<h2>TODO</h2>

<ul>
 <li>Finish this readme</li>
</ul>

