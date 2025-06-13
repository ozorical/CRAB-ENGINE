"use strict";
import { world } from "@minecraft/server";
import { addScore } from "../../helperFunctions/getScore";

world.afterEvents.playerPlaceBlock.subscribe(e => {
    addScore(e.player, "blocksPlaced", 1);
})