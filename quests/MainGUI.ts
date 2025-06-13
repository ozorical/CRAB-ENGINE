import { Player } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import { MineQuestRegistry, MiningQuest } from "./mining/miningQuests";
import { pvpRegister, PvpQuest } from "./pvp/pvpQuests";
import { PveRegister, PveQuest } from "./pve/pveQuests";
import { TravelRegister, TravelQuest } from "./travel/travelQuests";
import { titleCase } from "./../helperFunctions/functions";
import { getScore } from "./../helperFunctions/getScore";

export function questUI(player: Player) {
  const bodyText: Array<string> = [];

  // Generate body text for all quests
  Object.entries(MineQuestRegistry).forEach((quest) => {
    const text = `§c${quest[1].questName} - §e${quest[1].questDesc}\n
        Mine Blocks: §a${titleCase(quest[1].blockList.join(", ").replaceAll("minecraft:", "").replaceAll("_", " "))}\n
            §dCurrent Progress: ${getScore(player, quest[1].scoreName) ?? 0}/${quest[1].amounts[(player.getDynamicProperty(quest[1].questName) as number) ?? 0]}`;
    bodyText.push(text);
  });

  const miningGUI = new ActionFormData();
  let validQuests = 0;

  // Set the title and body of the GUI
  miningGUI.title("§cCrab§fSMP - §eQuests");
  //.body(bodyText.join("\n\n"));

  // Add buttons for valid quests
  Object.entries(MineQuestRegistry).forEach((quest) => {
    const currentProgress = getScore(player, quest[1].scoreName) ?? 0;
    const maxProgress = quest[1].amounts[(player.getDynamicProperty(quest[1].questName) as number) ?? 0];

    // Only add a button if the quest is valid (e.g., progress is less than max)
    if (currentProgress < maxProgress) {
      miningGUI.button(`§e§l${quest[1].questName}§r\n§8[ §f${getProgress(currentProgress, maxProgress, true)} §8]`);
      validQuests++;
    }
  });

  // Add a close button
  miningGUI.button("§l§4Close Menu§r\n§8[ §fClose Menu §8]");

  // Show the GUI to the player
  miningGUI.show(player as any).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy) {
      return questUI(player); // Reopen the UI if the player was busy
    }

    // If the player clicked the close button, exit
    if (res.selection === validQuests) return;

    // Get the selected quest
    const selectedQuest = Object.values(MineQuestRegistry)[Number(res.selection)];

    // Show the detailed view of the selected quest
    showQuestDetails(player, selectedQuest);
  });
}

export function pvpUI(player: Player) {
  const bodyText: Array<string> = [];

  // Generate body text for all quests
  Object.entries(pvpRegister).forEach((quest) => {
    const text = `§c${quest[1].questName} - §e${quest[1].questDesc}\n
            §dCurrent Progress: ${getScore(player, quest[1].scoreName) ?? 0}/${quest[1].amounts[(player.getDynamicProperty(quest[1].questName) as number) ?? 0]}`;
    bodyText.push(text);
  });

  const miningGUI = new ActionFormData();
  let validQuests = 0;

  // Set the title and body of the GUI
  miningGUI.title("§cCrab§fSMP - §eQuests");
  //.body(bodyText.join("\n\n"));

  // Add buttons for valid quests
  Object.entries(pvpRegister).forEach((quest) => {
    const currentProgress = getScore(player, quest[1].scoreName) ?? 0;
    const maxProgress = quest[1].amounts[(player.getDynamicProperty(quest[1].questName) as number) ?? 0];

    // Only add a button if the quest is valid (e.g., progress is less than max)
    if (currentProgress < maxProgress) {
      miningGUI.button(`§e§l${quest[1].questName}§r\n§8[ §f${getProgress(currentProgress, maxProgress, true)} §8]`);
      validQuests++;
    }
  });

  // Add a close button
  miningGUI.button("§l§4Close Menu§r\n§8[ §fClose Menu §8]");

  // Show the GUI to the player
  miningGUI.show(player as any).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy) {
      return questUI(player); // Reopen the UI if the player was busy
    }

    // If the player clicked the close button, exit
    if (res.selection === validQuests) return;

    // Get the selected quest
    const selectedQuest = Object.values(pvpRegister)[Number(res.selection)];

    // Show the detailed view of the selected quest
    showPvpQuestDetails(player, selectedQuest);
  });
}

function showPvpQuestDetails(player: Player, quest: PvpQuest) {
  const miningGUI = new ActionFormData();

  // Set the title and body for the detailed view
  miningGUI.title("§cCrab§fSMP - §eQuests")

  miningGUI.body(`§c${quest.questName} - §e${quest.questDesc}\n
§dCurrent progress: §a${getScore(player, quest.scoreName) ?? 0}/${quest.amounts[(player.getDynamicProperty(quest.questName) as number) ?? 0]} (${getProgress(
    getScore(player, quest.scoreName) ?? 0,
    quest.amounts[(player.getDynamicProperty(quest.questName) as number) ?? 0],
    false
  )}
`);


  // Add a back button
  miningGUI.button("§l§4Back§r\n§8[ §fGoes back to Quest UI §8]");

  // Show the detailed view
  miningGUI.show(player as any).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy) {
      return showPvpQuestDetails(player, quest); // Reopen the detailed view if the player was busy
    }

    // If the player clicked the back button, return to the main quest UI
    if (res.selection === 0) {
      return questUI(player);
    }
  });
}

function showQuestDetails(player: Player, quest: MiningQuest) {
  const miningGUI = new ActionFormData();

  // Set the title and body for the detailed view
  miningGUI.title("§cCrab§fSMP - §eQuests")

  miningGUI.body(`§c${quest.questName} - §e${quest.questDesc}\n
Mine Blocks: §a${titleCase(quest.blockList.join(", ").replaceAll("minecraft:", "").replaceAll("_", " "))}\n
§dCurrent progress: §a${getScore(player, quest.scoreName) ?? 0}/${quest.amounts[(player.getDynamicProperty(quest.questName) as number) ?? 0]} (${getProgress(
    getScore(player, quest.scoreName) ?? 0,
    quest.amounts[(player.getDynamicProperty(quest.questName) as number) ?? 0],
    false
  )}
`);


  // Add a back button
  miningGUI.button("§l§4Back§r\n§8[ §fGoes back to Quest UI §8]");

  // Show the detailed view
  miningGUI.show(player as any).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy) {
      return showQuestDetails(player, quest); // Reopen the detailed view if the player was busy
    }

    // If the player clicked the back button, return to the main quest UI
    if (res.selection === 0) {
      return questUI(player);
    }
  });
}




function getProgress(current: number, max: number, asString = true): string | number {
  if (max === 0) {
    throw new Error("Max value cannot be zero.");
  }

  const percentage = (current / max) * 100;

  if (asString) {
    const completed = Math.floor((current / max) * 20); // Scale of 10 for visual representation
    const remaining = 10 - completed;
    return "§a|".repeat(completed) + "§8|".repeat(remaining);
  } else {
    return Math.round(percentage);
  }
}
