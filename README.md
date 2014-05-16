##kaBEM

kaBEM is a grunt.js environment for easy scaffolding, developing and testing of HTML pages with BEM (Block, Element, Modifier) CSS syntax. And if you are using User Stories to define your project, and have written those in a [Structure/State] (https://github.com/viewbook/dev-kabem/blob/master/README.md#structurestate-user-stories) way, it's easy to get some initial BEM classnames for a quick start.

kaBEM is mostly useful if you have a single HTML page which can have a lot of different visual states. For example if you want to develop a Gallery plugin or Page Theme depending on a list of different user defined settings.


###What does kaBEM do for you?

kaBEM uses a bit of HTML markup with some BEM classes to scaffold out a handy SASS folder structure to start working on. Each Block or Element get's it's own folder, and inside that is a seperate SASS file for the block/element and modifiers CSS. Each new Modifier BEM class you add get's translated into a separate HTML file for easy testing. 

The kaBEM Grunt environment also has all standard (grunt) niceties like HTML/CSS validation and minimizing, local servers and LiveReload. And you can add your own specific tasks of course.

TODO
* ~~Include SASS variables, SASS folder needs some restructuring no doubt~~
* Clean up debug CSS so it does not conflict with production CSS
* Review grunt clean & backup after default grunt task (old SASS BEM folder linger on..) 
* Add guidelines in readme for non-user-story related BEM classnames 
* Add GIT Hooks for CSS/HTML validation before push


###Why BEM?

BEM stands for Block Element Modifier and was originally thought up by the people of <a href="http://yandex.ru/">Yandex</a>. BEM is no more then a simple CSS class naming convention which gives them purpose and meaning to other developers. Ideal for teams. In short the benefits are:
 
* See a BEM classname in your CSS and know where to use it in your HTML
* See a BEM classname in your HTML and know where to find it in your CSS files
* See a BEM classname and know which purpose it has

BEM is no golden highway to utter development bliss though. It's (long) classnames help in understanding your CSS, but it will also bloat your HTML. It's single classname approach can prevent CSS specifity hell and helps with an OOCSS approach, but also ignores the useful cascading nature of C(cascading)SS. Luckily kaBEM nor BEM prevent you from using it with regular CSS in the way you want.

For some more BEM reading:

* [linkBEM Methodology] (http://bem.info/method/)
* [BEM it!, BEM Methodology for small companies with high expectations] ( href="http://www.slideshare.net/MaxShirshin/bem-dm")
* [MindBEMding – getting your head ’round BEM syntax] (http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)


###kaBEM naming conventions

kaBEM uses these class name conventions:

* '__' staring block and elements
* '_' starting a modifier
* '-' for multi word block, elements and modifiers. 

So a kaBEM class would look like: '__page__container_modifier-name'


###Structure/State User Stories?

Structure and State user stories? What are you babbling about? Well kaBEM is essentially about managing the different visual states of a single HTML block using SASS. And if you would describe a visual state using User Stories, they would end up in two main categories perhaps: Structure and State.

In essence Structure describes those elements always present on screen (unless you hide them with a state, don't be nitpicky), and State describes the different states and behaviours those elements can have. And it just happens that this pretty much matches what BEM is about. Block and Elements are 'Structure', and Modifiers are 'State'. So how handy would it be if you could derive some BEM classnames directly from the User Stories and get started scaffolding your HTML and SASS folder sctructure. Very handy.

For example. Considder a paragraph with a title and some text. And it has to be able to expand the full width, or alternatively take a fixed widt. This is rather stupid example, i know. But stick with me. Then you could write your User Stories this way;

#####Structure

* As a Visitor i want to see a paragraph some text with a nice title above it

 * It should have a title
 * It should have some text
 * The title should be above the text


#####State

* As a Visitor i want to see a paragraph stretching the full width of the screen
 * It should be 100% wide
 
* As a Visitor i want to see a paragraph stay the same width even if the screen resizes.
 * It should be 600 pixels wide

 
Reading these User Stories you end up with three Structure elements, and two States. Putting those in kaBEM classnames you would end up with this:

* __paragraph
* __paragraph__title
* __paragraph__text
* __paragraph_full-width
* __paragraph_fixed-width

Now you can startup a simple HTML structre like this (BEM classnames already suggest a certain structure to use):

    <section class='__paragraph'>
     <header class='__paragraph__title'>title</header>
     <p class='__paragraph__text'>text</p>
    </section>

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

And finally you can put the three BEM modifier class names inside the __paragraph_modifiers.scss file, and fill them with the needed CSS to pass the User Story.

<code>
.__paragraph_full-width{
 width: 100%;
}
</code>

<code>
.__paragraph_fixed-width{
 width: 600px;
}
</code>

Nice.

During development you might find that the HTML markup needs additional elements to make things actually work of course, no problem there. You could either modify the relevant BEM classnames with new __elements if those elements are in need of some CSS, or skip them altogether.


###Adding some dynamic HTML
kaBEM supports [underscore templates](http://underscorejs.org/#template) and you can put the data used in  config/data-stub.json. You can also tweak the parse-index task (see inside the tasks folder) to use some other template or load in dynamic JSON.

###Adding a BEM context for testing
Every BEM modifier classname you fill with some CSS will get a seperate HTML page in the build/develop folder for easy testing. But some modifiers only make sense in combination with other modifiers. So you can sum these modifier classnames up in config/bem-context.json ("default") and they will be injected in every modifier page. Or you can add them under a different name and run grunt with --context=your-bem-context.

###Getting Started

  1. [install node.js] (http://nodejs.org/), [grunt.js] (http://gruntjs.com/getting-started) and [bower] (http://bower.io/)
  2. Run 'npm install'
  3. Run 'bower install'
  4. Run 'grunt connect' and 'grunt watch'
  5. Take a look at the index.html in src folder, notice the example kaBEM classes, and run 'grunt'
