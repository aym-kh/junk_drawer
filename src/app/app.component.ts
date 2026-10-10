import { Component } from "@angular/core";
import { JunkDrawer } from "./components/junk-drawer/junk-drawer";

@Component({
  selector: "app-root",
  imports: [JunkDrawer],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
}
