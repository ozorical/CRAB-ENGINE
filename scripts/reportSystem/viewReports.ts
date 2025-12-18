import { world, ItemStack, system, Player, ItemType, Vector3 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { reportsDB } from "./reportMenu";
import { reportFind } from "../types";

export function viewReports(player: Player) {
  const reports = reportsDB.values();
  let ids: Array<reportFind> = [];

  let reportView = new ActionFormData().title("§5Nexus§fSMP §8- §eReports");

  reports.forEach((report) => {
    let text = `§f${report.name}\n${report.title}`;
    ids.push({ id: report.id, name: report.name });
    reportView.button(text);
  });

  reportView.show(player as any).then((res) => {
    console.warn("E", res.selection);
    if (res.selection != undefined) {
      console.warn("E1");
      console.warn(ids[res.selection!]);
      reportViewer(player, ids[res.selection!]);
    }
  });
}

function reportViewer(player: Player, data: reportFind) {
  const dbEntry = reportsDB.get(`${data.name}:${data.id}`);
  let report = new ActionFormData()
    .title(`§c${dbEntry?.title}`)
    .body(`§7Report By: §e${dbEntry?.name}\n§7Reported Player: §b${dbEntry?.title}\n§7Description: §6${dbEntry?.message}`)
    .button("§fDelete Report\n§8[ §cTrash Report §8]§r", "textures/gui/claims/leave")
    .button("§fClose Menu§r\n§8[ §cClose the GUI §8]§r", "textures/blocks/barrier.png")
    .show(player as any)
    .then((res) => {
      if (res.selection == 0) {
        reportsDB.delete(`${data.name}:${data.id}`);
      }
    });
}
