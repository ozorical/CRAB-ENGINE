"use strict";
import { world } from "@minecraft/server";
import { addScore } from "../../helperFunctions/getScore";
import { miningTracker } from "../../quests/mining/miningTracker";

world.afterEvents.playerBreakBlock.subscribe((e) => {
  addScore(e.player, "blocksBroken", 1);
  miningTracker(e);
});
