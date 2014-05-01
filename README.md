##kaBEM

kaBEM is a grunt.js environment for easy scaffolding, developing and testing HTML pages with BEM (Block, Element, Modifier) CSS syntax. And if you are using User Stories to define your project, and have written those in a Structure/Behaviour way, it's easy to get some initial BEM entities out of that to get a quick start scaffolding.

kaBEM is mostly useful if you have a single HTML page which can have a lot of different visual states. For example if you want to develop a Gallery or Page Theme depending on a plethory of specific user defined settings.


###What does kaBEM do for you?

kaBEM uses your initial HTML file with BEM classes to scaffold out a handy SASS folder structure to start working on. Each Block or Element get's it's own folder, and inside that is a seperate SASS file for Block/Element and modifier CSS. Each new Modifier BEM class you add get's translated into a separate HTML for easy testing. 

And the kaBEM Grunt environment has all standard niceties like ~~validation~~, ~~minimizing~~, local servers and file change watches. And you can add your own specific tasks of course.

TODO
* Add CSS validation, UglifyCSS and unCSS
* Add HTML validation
* Add GIT Hooks for CSS/HTML validation before deploy


###Why BEM?

BEM stands for Block Element Modifier and was originally thought up by the people of <a href="http://yandex.ru/">Yandex</a>. BEM is no more then a simple CSS class naming convention which gives them purpose and meaning to other developers. Ideal for teams. In short the benefits are:
 
* See a BEM classname in your CSS and know where to use it in your HTML
* See a BEM classname in your HTML and know where to find it in your CSS files
* See a BEM classname and know which purpose it has

BEM is no golden highway to utter development bliss of course. It's (long) classnames help in understanding your CSS, but it will also bloat your HTML. It's single classname approach can prevent CSS specifity hell and helps with an OOCSS approach, but also ignores the useful cascading nature of C(cascading)SS. Luckily kaBEM nor BEM prevent you from using it in the way you want.

For some more BEM reading:

* [linkBEM Methodology] (http://bem.info/method/)
* [BEM it!, BEM Methodology for small companies with high expectations] ( href="http://www.slideshare.net/MaxShirshin/bem-dm")
* [MindBEMding – getting your head ’round BEM syntax] (http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)


###kaBEM naming conventions

kaBEM uses these class name conventions:

* '__' staring block and elements
* '_' starting a modifier
* '-' for multi word block, elements and modifiers. 

So this is what a kaBEM class can look like: '__page__container_your-name'


###Structure/Behaviour User Stories?

kaBEM is essentially about managing the different visual states of a single HTML block using SASS. And if you would describe a visual state using User Stories, they would end up in two main categories: Structure and State.

In essence Structure describes those elements always present on screen (unless you hide them with a state, don't be nitpicky), and State describes the different states those elements can have (duh). And it just happens that this closely matches the way BEM is thought up. Block and Elements are 'Structure', and Modifiers are 'State'. So how handy would it be if you could get some BEM classnames directly from the User Stories and get started scaffolding your HTML and SASS folder sctructure. Very handy.

For example. Considder a simple paragraph with a title and some text. And it has to be able to expand the full width, or alternatively take a fixed width (a rather stupid example, i know. But stick with me). Then you could write the different User Stories this way

####Structure
* As a Visitor i want to see a paragraph some text with a nice title above it
 * It should have a title
 * It should have some text
 * The title should be above the text

* As a Visitor i want to see a paragraph strech the full width of the screen
 * It should be 100% wide
 * 
 
* As a Visitor i want to see a paragraph stay the same width even if the screen resizes.
 * It should be 600 pixels wide
 * 


Reading these User Stories you end up with three structurial elements, and two states. And put those in kaBEM classnames you end up with this:

* __paragraph
* __paragraph__title
* __paragraph__text
* __paragraph_full-width
* __paragraph_fixed-width

Now you can startup a simple HTML structre like this (BEM classnames already suggest a structure to use):

<code>
<section class='__paragraph'>
 <header class='__paragraph__title'>title</header>
 <p class='__paragraph__text'>text</p>
</section>
</code>

And hitting 'grunt' inside kaBEM would give you this folder structure:

<pre>
__paragraph
 __title
  __paragraph__title.scss
  __paragraph__title_modifiers.scss
 __text
   __paragraph__text.scss
  __paragraph__text_modifiers.scss
__paragraph.scss
__paragraph_modifiers.scss
</pre>

And finally you can put the three BEM modifier class names inside the __paragraph_modifiers.scss file, and fill them with the CSS needed to pass the User Story. Nice.


###Getting Stared

  1. [install node.js] (http://nodejs.org/)
  2. [install grunt.js] (http://gruntjs.com/getting-started)
  3. Run 'npm install'
  4. Take a look at the index.html in src folder, notice the example kaBEM classes, and run 'grunt'

###TODO

* Finish this readme
