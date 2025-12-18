import { world, ItemStack, system, Player, ItemType, Vector3 } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import { Database } from "../db/Database";
import { reportData } from "../types";
import { createReport } from "./createReport";
import { viewReports } from "./viewReports";

let reportsDB: Database<reportData>;

export const reportsDBInit = async () => {
  await null;
  reportsDB = new Database<reportData>("reports");
};

export function reportMenu(player: Player, isChat?: boolean, i?: number) {
  if (isChat) {
    i = 0;
  }
  const reportMenuForm = new ActionFormData()
    .title("§5Nexus§fSMP §8- §eReport")
    .body("§7Use this module to report players to our team.")
    .button(`§l§pCreate Report§r\n§8[ §fReport a player §8]§r`, "textures/staff/view.png")
    .button("§l§aActive Reports§r\n§8[ §fStaff Only §8]§r", "textures/items/emerald.png")
    .button("§l§4Close Menu§r\n§8[ §fClose the GUI §8]§r", "textures/blocks/barrier.png")
    .show(player as any)
    .then((res) => {
      if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy && i != undefined) {
        system.runTimeout(() => {
          if (i! < 5) {
            player.sendMessage(`Close Chat Within ${5 - i!} Seconds To Open The Bounty Menu`);
            i!++;
            reportMenu(player, false, i);
          }
        }, 20);
        return;
      }
      if (res.selection == 0) {
        createReport(player);
      }
      if (res.selection == 1 && player.hasTag("staffstatus")) {
        viewReports(player);
      }
    });
}

export { reportsDB };
