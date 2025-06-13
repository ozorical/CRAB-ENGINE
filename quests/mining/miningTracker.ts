import { PlayerBreakBlockAfterEvent, PlayerBreakBlockBeforeEvent } from "@minecraft/server";
import { MineQuestRegistry } from "./miningQuests";
import { addScore, getScore } from "../../helperFunctions/getScore";

export function miningTracker(e: PlayerBreakBlockAfterEvent) {
  const { brokenBlockPermutation, player } = e;

  Object.entries(MineQuestRegistry).forEach((quest) => {
    if ((getScore(player, quest[1].scoreName) ?? 0) > 2000000000) return;
    if (player.getDynamicProperty(quest[1].questName) === undefined) {
      player.setDynamicProperty(quest[1].questName, 0);
    }

    if (quest[1].blockList.includes(e.brokenBlockPermutation.type.id)) {
      addScore(player, quest[1].scoreName, 1);
    }
  });
}
