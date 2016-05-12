import { Component } from '@angular/core';

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
