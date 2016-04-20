import {Component} from "angular2/core";

@Component({
  selector: "the-app",
  templateUrl: "partials/app.html"
})

export class AppComponent {
  name: string;

  constructor() {
    this.name = "Jan Mazáč";
  }
}
