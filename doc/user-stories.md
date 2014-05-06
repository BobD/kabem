### Topic

* The Visual Structure and States of ...

### Guidelines

* The user stories in this document are grouped in two sections: **Structure** and **State**.
  * The **Structure** section describes the visible elements inside a page or plugin from a visitors point of view, starting from the main page window to each sub component.
  * The **State** section describe the different states and behaviours those elements can have.
* Each user story can have a list acceptance tests summing up the main characteristics of that element or state. 
* Both the Structure and the State user stories can be used to form some initial [BEM entities](https://github.com/viewbook/kabem/blob/left-layout/doc/bem.md):
  * The Structure describe (B)locks and (E)lements
  * The State describe (M)odifiers
* And since this document is about describing the visual nature of a page or plugin, the acceptance tests inside each user story can be used to get a head start filling the CSS of each corresponding BEM entity. 

See https://github.com/viewbook/kabem/blob/master/README.md for some more background on BEM and kaBEM.


### Vocabular

* **Visitor**, a person viewing the ... inside a browser
* **Window**, the entire browser canvas
* **Page**, the area inside the Window containing the visual elements of the Structure 
* **...** ...