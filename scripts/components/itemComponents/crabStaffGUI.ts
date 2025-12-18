import { Player, StartupEvent } from "@minecraft/server";
// import { playerSelector } from "../../admin/inventoryViewer";
import { staffMain } from "../../adminGUI/AdminGui";
import { playSoundTo } from "../../helperFunctions/sounds";

//TODO: Add Images To GUI Buttons

export function crabStaffGUI(init: StartupEvent) {
  init.itemComponentRegistry.registerCustomComponent("crab:staff_gui", {
    onUse(use) {
      let player: Player = use.source;
      playSoundTo(player, "RandomPop");
      staffMain(player);
    },
  });
}
