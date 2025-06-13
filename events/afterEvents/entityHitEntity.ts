"use strict";
import { world } from "@minecraft/server";
import { addScore } from "../../helperFunctions/getScore";
import { CRABSCORES } from "../../enums";

world.afterEvents.entityHitEntity.subscribe((e) => {
  addScore(e.damagingEntity, CRABSCORES.clicks, 1);
});
