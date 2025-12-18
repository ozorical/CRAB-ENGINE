import { world, system, GameMode } from "@minecraft/server";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";
import { playSoundTo } from "../helperFunctions/sounds";

const LOCATIONS = {
    SPAWN: { x: -36, y: 50, z: 20 },
    NETHER_SPAWN: { x: 117, y: 42, z: 85 }
};

world.beforeEvents.playerPlaceBlock.subscribe((e) => {
    const { player } = e;
    if (player.hasTag("staffstatus") || player.dimension.id === MinecraftDimensionTypes.TheEnd) return;

    if (player.dimension.id === MinecraftDimensionTypes.Nether) {
        const distance = calculateDistance(player.location, LOCATIONS.NETHER_SPAWN);
        if (distance <= 25) { 
            player.sendMessage("§cCannot Place Blocks: go §e" + Math.ceil(25 - distance) + " §cmore blocks out");
            e.cancel = true;
            return;
        }
    }

    if (player.hasTag("spawn")) {
        player.sendMessage("§cCannot Place Blocks In spawn area");
        e.cancel = true;
    }
});

world.beforeEvents.playerBreakBlock.subscribe((e) => {
    const { player } = e;
    if (player.hasTag("staffstatus") || player.dimension.id === MinecraftDimensionTypes.TheEnd) return;

    if (player.dimension.id === MinecraftDimensionTypes.Nether) {
        const distance = calculateDistance(player.location, LOCATIONS.NETHER_SPAWN);
        if (distance <= 25) {
            player.sendMessage("§cCannot Break Blocks: go §e" + Math.ceil(25 - distance) + " §cmore blocks out");
            e.cancel = true;
            return;
        }
    }

    if (player.hasTag("spawn")) {
        player.sendMessage("§cCannot Break Blocks In spawn area");
        e.cancel = true;
    }
});

system.runInterval(() => {
    const overworld = world.getDimension(MinecraftDimensionTypes.Overworld);
    const spawnPlayers = overworld.getPlayers({ 
        location: LOCATIONS.SPAWN, 
        maxDistance: 1000 
    });
    spawnPlayers.forEach(player => {
        if (!player.hasTag("staffstatus")) {
            player.addTag("spawn");
        }
    });
    const nonSpawnPlayers = overworld.getPlayers({ 
        location: LOCATIONS.SPAWN, 
        minDistance: 1000 
    });
    nonSpawnPlayers.forEach(player => {
        if (player.hasTag("spawn")) {
            player.removeTag("spawn");
        }
    });
}, 20);

system.runInterval(() => {
    const nether = world.getDimension(MinecraftDimensionTypes.Nether);
    const end = world.getDimension(MinecraftDimensionTypes.TheEnd);
    [...nether.getPlayers(), ...end.getPlayers()].forEach(player => {
        if (!player.hasTag("staffstatus") && player.getGameMode() !== GameMode.Survival) {
            player.runCommand("gamemode s @s");
            playSoundTo(player, "Success");
            player.sendMessage("§cYou've been put in Survival mode in this dimension!");
        }
    });
}, 150);

function calculateDistance(loc1: { x: number, y: number, z: number }, loc2: { x: number, y: number, z: number }): number {
    return Math.sqrt(
        Math.pow(loc1.x - loc2.x, 2) + 
        Math.pow(loc1.y - loc2.y, 2) + 
        Math.pow(loc1.z - loc2.z, 2)
    );
}