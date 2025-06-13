"use strict";
import { world, system } from "@minecraft/server";
import { questScoreboardInit } from "../../quests/questFunctions";
import { CRABSCORES } from "../../enums";
import { staffDBInit } from "../../adminGUI/AdminGui";
import { bountyDBInit } from "../../bounties/bounty";
import { clansDBInit } from "../../clans/clanSetup";
import { invDBInit } from "../../combatLog/combatlog";
import { reportsDBInit } from "../../reportSystem/reportMenu";
import { loadData } from "../../auctionHouse/auctionManager";

const engineVersion = "v4.7";

function initializeWorldObjectives(): void {
    questScoreboardInit();

    for (const [value] of Object.entries(CRABSCORES)) {
        try {
            const objective = world.scoreboard.getObjective(value);
            if (!objective) {
                world.scoreboard.addObjective(value, value);
                console.warn(`[Crab Engine] Successfully initialized objective: ${value}`);
            }
        } catch (error) {
            console.error(`[Crab Engine] Failed to initialize objective ${value}: ${error}`);
        }
    }
}

world.afterEvents.worldLoad.subscribe(() => {
    try {
        const overworld = world.getDimension("overworld");
        
        overworld.runCommand("scoreboard players add clan clanID 0");
        overworld.runCommand("scoreboard players add @a spam 0");
        
        overworld.runCommand(
            `tellraw @a {"rawtext":[{"text":"§cCrab§fEngine §e${engineVersion}§7 > §aInitialized all functions!"}]}`
        );

        initializeWorldObjectives();
        staffDBInit();
        bountyDBInit();
        clansDBInit();
        invDBInit();
        reportsDBInit();
        loadData();

        console.warn("[Crab Engine] World initialization completed successfully");
    } catch (error) {
        console.error("[Crab Engine] World initialization failed:", error);
    }
});

system.beforeEvents.watchdogTerminate.subscribe((data) => {
    data.cancel = true;
    world.getDimension("overworld").runCommand(
        'tellraw @a[tag=staffstatus] {"rawtext":[{"text":"§eWatchdog has been disabled by Crab-Engine."}]}'
    );
});