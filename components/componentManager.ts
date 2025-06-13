import { system, world } from "@minecraft/server";
import { crabGUI } from "./itemComponents/crabGUI";
import { crabStaffGUI } from "./itemComponents/crabStaffGUI";

system.beforeEvents.startup.subscribe((init) => {
  crabGUI(init);
  crabStaffGUI(init);
});
