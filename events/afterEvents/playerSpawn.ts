"use strict";
import { Player, world, system, PlayerSpawnAfterEvent } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { thisGuyCombatLogged } from "../../combatLog/combatlog";
import { thisPlayerIsAFirstTimeJoiner } from "../../helperFunctions/firstJoin";
import { poorGuyGotKickedOutOfHisClanWhenHeWasOffline } from "../../clans/clanFunctions/removeMember";
import { CRABTAGS } from "../../enums";
import { donoMarketMenu } from "../../guiPages/donomarket";
import { donoMenu } from "../../guiPages/donator";

const DEBUG_MODE = true;

function log(message: string): void {
    if (DEBUG_MODE) console.warn(`[SpawnHandler] ${message}`);
}

async function showWelcomeMenu(player: Player): Promise<void> {
    try {
        const form = new ActionFormData();
        form.title(`§bWelcome back, §e${player.name}§r!`);
        form.body(`§7Please consider checking out what you can get for §ddonating §7to §cCrab§fSMP! §7Every donation helps us §6keep the server running §7and §aimproves your experience!\n `);
        form.button("§dDonator §8/ §dDonator§f+§r \n§8[ §fSpecial donator perks §8]", "textures/blocks/amethyst_cluster");
        form.button("§eDonator Market§r \n§8[ §fBuy marketplace items §8]", "textures/gui/menu/market");
        form.button("§4Close§r \n§8[ §fDismiss this menu §8]", "textures/blocks/barrier");

        const response = await form.show(player as any);
        
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                await donoMenu(player);
                break;
            case 1:
                await donoMarketMenu(player);
                break;
        }
    } catch (error) {
        console.error(`Error showing welcome menu for ${player.name}: ${error}`);
        player.sendMessage("§cAn error occurred while loading the welcome menu.");
    }
}

function initializePlayerProperties(player: Player): void {
    const propertyDefaults: Record<string, any> = {
        tpa: "",
        tpr: "",
        invite: "",
        inviteAccept: "",
        originalName: player.name,
        normalizedName: player.nameTag
    };

    for (const [key, value] of Object.entries(propertyDefaults)) {
        try {
            if (player.getDynamicProperty(key) === undefined) {
                player.setDynamicProperty(key, value);
                log(`Initialized property ${key} for ${player.name}`);
            }
        } catch (error) {
            console.error(`Failed to initialize property ${key} for ${player.name}: ${error}`);
        }
    }
}

function onPlayerSpawn(event: PlayerSpawnAfterEvent): void {
    try {
        const { player, initialSpawn } = event;
        log(`Player spawned: ${player.name} (initial: ${initialSpawn})`);

        if (!initialSpawn) {
            log(`Ignoring non-initial spawn for ${player.name}`);
            return;
        }

        system.runTimeout(() => {
            try {
                if (!player.isValid) {
                    log(`Player ${player.name} no longer valid for spawn handling`);
                    return;
                }
                
                handlePlayerSpawn(player).catch(error => {
                    console.error(`Error in delayed spawn handler for ${player.name}: ${error}`);
                });
            } catch (error) {
                console.error(`Error in delayed spawn handler: ${error}`);
            }
        }, 20);
    } catch (error) {
        console.error(`Error in spawn event handler: ${error}`);
    }
}

async function handlePlayerSpawn(player: Player): Promise<void> {
    try {
        log(`Processing spawn for ${player.name}`);

        if (player.hasTag(CRABTAGS.combat)) {
            log(`Combat logger detected: ${player.name}`);
            thisGuyCombatLogged(player);
        }

        if (!player.hasTag(CRABTAGS.joined)) {
            log(`First-time join detected: ${player.name}`);
            thisPlayerIsAFirstTimeJoiner(player);
            player.addTag(CRABTAGS.joined);
            return;
        }

        poorGuyGotKickedOutOfHisClanWhenHeWasOffline(player);
        initializePlayerProperties(player);

        if (player.hasTag(CRABTAGS.joined)) {
            showWelcomeMenu(player);
            player.sendMessage(`§aWelcome back to §cCrab§fSMP§a, §e${player.name}!`);
        }

        log(`Successfully processed spawn for ${player.name}`);
    } catch (error) {
        console.error(`Error handling spawn for ${player.name}: ${error}`);
    }
}

world.afterEvents.playerSpawn.subscribe(onPlayerSpawn);
log("Player spawn handler initialized");