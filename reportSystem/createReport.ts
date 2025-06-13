import { world, ItemStack, system, Player, ItemType, Vector3 } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { reportData } from "../types";
import { reportsDB } from "./reportMenu";
import { getRandomInt } from "../helperFunctions/randomInt";

export function createReport(player: Player) {
  const reportForm = new ModalFormData()
    .title("§cCrab§fSMP §8- §eReport")
    .textField("Player Name", "", { defaultValue: "" })
    .textField("Report Description", "", { defaultValue: "" })
    .show(player as any)
    .then((res) => {
      const title = res.formValues![0]!.toString();
      const description = res.formValues![1]!.toString();

      if (title.length > 11) {
        player.sendMessage("§cName too long");
        return;
      }
      if (description.length > 100) {
        player.sendMessage("§cDescription Too Long");
        return;
      }
      const id = getRandomInt(1, 999999);

      const data: reportData = {
        name: player.name,
        title: title,
        message: description,
        id: id,
      };

      const staff = world.getPlayers({ tags: ["staffstatus"] });

      staff.forEach((p) => {
        p.playSound("block.bell.hit");
        p.sendMessage(`§e${player.name} §fCreated A New Report`);
      });

      reportsDB.set(`${player.name}:${id}`, data);
    });
}
