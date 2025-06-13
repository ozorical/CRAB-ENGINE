import { world, Player, EntityHitEntityAfterEvent, Vector3 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { getScore } from "../helperFunctions/getScore";
import { playSoundTo } from "../helperFunctions/sounds";
import { moneyTransfer } from "../chatCommands/commands/moneyTransfer";
import { bountyMenu } from '../bounties/bounty';

const CENTER_LOCATION: Vector3 = { x: 19974, y: 146, z: 19842 };
const TRIGGER_RADIUS = 250;

function calculateDistance(pos1: Vector3, pos2: Vector3): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

async function showPlayerStats(player: Player, target: Player) {
    const stats = {
        kills: getScore(target, "kills") || 0,
        deaths: getScore(target, "deaths") || 0,
        money: getScore(target, "money") || 0,
        blocksPlaced: getScore(target, "blocksPlaced") || 0,
        blocksBroken: getScore(target, "blocksBroken") || 0,
        clicks: getScore(target, "clicks") || 0
    };
    
    const kdRatio = stats.deaths === 0 ? stats.kills : (stats.kills / stats.deaths).toFixed(2);
    
    const statsForm = new ActionFormData()
        .title(`§cCrab§fSMP §8- §eStats`)
        .body(
            `§7Player: §e${target.name}\n\n` +
            `§aMoney: §f${stats.money}\n` +
            `§cKills: §f${stats.kills}\n` +
            `§4Deaths: §f${stats.deaths}\n` +
            `§6KD: §f${kdRatio}\n` +
            `§2Placed: §f${stats.blocksPlaced}\n` +
            `§5Broken: §f${stats.blocksBroken}\n `
        )
        .button("§l§aTransfer Money\n§r§8[ §fSend Money §8]", "textures/items/emerald")
        .button("§l§6Place Bounty\n§r§8[ §fSet a bounty §8]", "textures/items/diamond_sword")
        .button("§l§4Close\n§r§8[ §fClose the GUI §8]", "textures/blocks/barrier");
    
    const response = await statsForm.show(player as any);
    if (response.canceled) return;

    switch (response.selection) {
        case 0:
            moneyTransfer(player);
            break;
        case 1:
            bountyMenu(player);
            break;
        case 2:
            player.sendMessage("§aClosed stats menu.");
            break;
    }
    
    target.sendMessage(`§b${player.name} §7viewed your profile.`);
    playSoundTo(target, "RandomPop");
}

world.afterEvents.entityHitEntity.subscribe((event: EntityHitEntityAfterEvent) => {
    const { damagingEntity, hitEntity } = event;
    
    if (!(damagingEntity instanceof Player) || !(hitEntity instanceof Player)) return;
    
    const damagerLocation = damagingEntity.location;
    const hitEntityLocation = hitEntity.location;
    
    const damagerDistance = calculateDistance(damagerLocation, CENTER_LOCATION);
    const hitEntityDistance = calculateDistance(hitEntityLocation, CENTER_LOCATION);
    
    if (damagerDistance <= TRIGGER_RADIUS && hitEntityDistance <= TRIGGER_RADIUS) {
        showPlayerStats(damagingEntity, hitEntity);
        playSoundTo(damagingEntity, "RandomPop");
        damagingEntity.dimension.spawnParticle("minecraft:heart_particle", hitEntityLocation);
    }
});