"use strict";
import { world } from "@minecraft/server";
import { dropTheCombatLoggersItems } from "../../combatLog/combatlog";
import { clearTPAS } from "../../chatCommands/commands/tpa";

world.beforeEvents.playerLeave.subscribe(e => {
    const p = e.player;

    clearTPAS(e)
    dropTheCombatLoggersItems(p);
})