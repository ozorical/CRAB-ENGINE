import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { titleCase } from "../../helperFunctions/functions";
import { getScore } from "../../helperFunctions/getScore";
import { pvpRegister } from "./pvpQuests";
import { pvpUI } from "../MainGUI";

export function pvpProgressPage(player: Player) {
  return pvpUI(player) 
  const bodyText: Array<string> = [];

  Object.entries(pvpRegister).forEach((quest) => {
    const text = `§c${quest[1].questName} - §e${quest[1].questDesc}\n§dCurrent Progress: ${getScore(player, quest[1].scoreName) ?? 0}/${quest[1].amounts[(player.getDynamicProperty(quest[1].questName) as number) ?? 0]}`;
    bodyText.push(text);
  });

  const pvpGUI = new ActionFormData()
    .title("§cCrab§fSMP - §eQuests")
    .body(bodyText.join("\n\n"))
    .button("§l§4Close Menu§r\n§8[ §fClose Menu §8]")
    .show(player as any);
}
