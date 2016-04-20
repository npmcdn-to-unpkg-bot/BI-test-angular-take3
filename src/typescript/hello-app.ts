// The new ES6 module syntax - load
// these three objects from the
// module stored at the module search
// path under the angular2 folder,
// with a module named angular2
import { Component, View, bootstrap }
  from 'angular2/core';
 
// define the settings of the component
// (except view settings)
@Component({
  selector: 'app'     // look up the app
})
// define view-specific settings
@View({
  template: 'Hello yourself!'
})
// now define the class that will be
// used to create the instance of the
// app. This is the class file that has
// the annotations of Component and View
// on it. You can consider these classes
// as if they are controllers in Angular1.
export class HelloApp {
  constructor() {
    console.log('I am alive!');
  }
}
 
// tell Angular2 to fire up the application
// using this app as the root component
bootstrap(HelloApp);
