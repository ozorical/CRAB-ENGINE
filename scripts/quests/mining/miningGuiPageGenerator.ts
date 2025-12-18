import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { MineQuestRegistry } from "./miningQuests";
import { titleCase } from "../../helperFunctions/functions";
import { getScore } from "../../helperFunctions/getScore";
import { questUI } from "../MainGUI"

export function miningProgressPage(player: Player) {
  return questUI(player)
  const bodyText: Array<string> = [];

  Object.entries(MineQuestRegistry).forEach((quest) => {
    const text = `§c${quest[1].questName} - §e${quest[1].questDesc}\nMine Blocks: §a${titleCase(quest[1].blockList.join(", ").replaceAll("minecraft:", "").replaceAll("_", " "))}\n§dCurrent Progress: ${getScore(player, quest[1].scoreName) ?? 0}/${
      quest[1].amounts[(player.getDynamicProperty(quest[1].questName) as number) ?? 0]
    }`;
    bodyText.push(text);
  });

  const miningGUI = new ActionFormData()
    .title("§5Nexus§fSMP - §eQuests")
    .body(bodyText.join("\n\n"))
    .button("§l§4Close Menu§r\n§8[ §fClose Menu §8]")
    .show(player as any);
}
