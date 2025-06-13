"use strict";
import { world } from "@minecraft/server";
import { sellWandHitBlock } from "../../sell/sellWand";
import { addScore } from "../../helperFunctions/getScore";

import { CRABSCORES } from "../../enums";

world.afterEvents.entityHitBlock.subscribe((e) => {
  const entity = e.damagingEntity;
  if (entity.typeId === "minecraft:player") {
    sellWandHitBlock(e);
    addScore(entity, CRABSCORES.clicks, 1);
  }
});
