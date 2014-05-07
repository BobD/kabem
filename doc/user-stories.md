### Topic

* The Visual Structure and States of ...

### Guidelines

* The user stories in this document are grouped in two sections: **Structure** and **State**.
  * The **Structure** section describes those elements inside a page or plugin which would always be present.
  * The **State** section describe the different states and behaviours those elements can have.
  
* Start the **Structure** with a single user story simply summing all elements, and fill in the details of those element in subsequent user stories.

* Each user story can have a list acceptance tests summing up the main characteristics of that element or state. 

* The user stories can be used to form some initial BEM (Block, Element, Modifier) classnames.
  * Each Structure story corresponds to a single Block and Element (__block__element)
  * Each acceptance test inside State stories describe a modifier (__block__element_state-name)
  
* And since this document is about describing the visual nature of a page or plugin, the acceptance tests inside each user story can be used to get a head start filling the CSS of each corresponding BEM classname.

See https://github.com/viewbook/kabem/blob/master/README.md for some more background on BEM and kaBEM.


### Vocabular

* **Visitor**, a person viewing the ... inside a browser
* **Window**, the entire browser canvas
* **Page**, the area inside the Window containing the visual elements of the Structure 
* **...** ...
