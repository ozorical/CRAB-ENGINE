"use strict";
import * as bc from "@minecraft/server";
import { sellWandHitBlock } from "../../sell/sellWand";
import { addScore } from "../../helperFunctions/getScore";

import { bountyClaim } from "../../bounties/bountyClaim";
import { pvpKillTracker } from "../../quests/pvp/pvpTracker";
import { pveTracker } from "../../quests/pve/pveTracker";

bc.world.afterEvents.entityDie.subscribe((e) => {
  bountyClaim(e);
  pvpKillTracker(e);
  pveTracker(e);
});
