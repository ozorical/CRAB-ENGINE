"use strict";
import { system, world } from "@minecraft/server";
import { checkMutedPlayersStatus, enforceAndCheckBanStatus } from "../adminGUI/AdminGui";
import { chatSpamCooldown } from "../chatRanks/ranks";
import { checkAndKickAFKPlayers } from "../afk/afkTimer";
import { trackPlayerClickStats } from "../helperFunctions/cps";
import { updateSidebar } from "../playerInfo/sidebar";
import { updatePlayerNametags } from "../namebar/names";
import { updateLeaderboards } from "../leaderboard/setupLeaderboard";
import { combatStatusCheck } from "../combatLog/combatTimer";
import { inventorySnapshot } from "../combatLog/combatlog";
import { travelTracker } from "../quests/travel/travelTracker";

/* From Bateman:
Hi! I've globalized the system.runInterval and 
converted them into functions since I found like 
10+ of them scattered around.
*/

/* Reply from Adem:
Thanks Bateman!
*/

system.runInterval(() => {
  checkMutedPlayersStatus();
  combatStatusCheck();
  enforceAndCheckBanStatus();

  for (const player of world.getPlayers()) {
    updateSidebar(player);
    chatSpamCooldown(player);
    checkAndKickAFKPlayers(player);
    inventorySnapshot(player);
    trackPlayerClickStats(player);
    updatePlayerNametags(player);
  }
}, 20);

system.runInterval(() => {
  updateLeaderboards();
  world.getAllPlayers().forEach((p) => {
    travelTracker(p);
  });
}, 100);
