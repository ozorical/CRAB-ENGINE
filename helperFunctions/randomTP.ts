import { BlockTypes, Player, system, world } from "@minecraft/server";
import { donoMenu } from "../guiPages/donator";
const teleportingPlayers = new Map<string, { intervalId: number }>();
const teleportCooldowns = new Map<string, number>();

export function startWildTeleport(player: Player) {
  const playerId = player.id;

  const isStaff = player.hasTag("donatorplus");

  if (!isStaff) {
    const lastTeleportTime = teleportCooldowns.get(playerId);
    const currentTime = Date.now();

    if (lastTeleportTime && currentTime - lastTeleportTime < 120000) {
      const remainingCooldown = Math.ceil((120000 - (currentTime - lastTeleportTime)) / 1000);
      player.sendMessage(`§cYou must wait ${remainingCooldown} seconds before using this again! Purchase §dDonator§f+ §cfor no cooldowns.`);
      donoMenu(player);
      return;
    }
  }

  let countdown = 3;

  const countdownInterval = system.runInterval(() => {
    if (isMoving(player)) {
      system.clearRun(countdownInterval);
      cancelTeleport(player, "movement");
      return;
    }

    if (countdown > 0) {
      player.playSound("random.click");
      countdown--;
    } else {
      system.clearRun(countdownInterval);
      system.runTimeout(() => {
        wildTeleport(player);
        teleportingPlayers.delete(playerId);

        if (!isStaff) {
          teleportCooldowns.set(playerId, Date.now());
        }
      }, 10);
    }
  }, 20);
}

const isMoving = (player: Player) => {
  const { x, y, z } = player.getVelocity();
  return x !== 0 || y !== 0 || z !== 0;
};

function cancelTeleport(player: Player, reason: string) {
  system.run(() => {
    teleportingPlayers.delete(player.id);
    player.playSound("note.bass");
    player.sendMessage(`§cTeleportation has been cancelled due to ${reason}!`);
  });
}

const INVALID_BLOCKS = ["minecraft:water", "minecraft:lava", "minecraft:cactus", "minecraft:fire", "minecraft:gravel", "minecraft:granite", "minecraft:sand", "minecraft:seagrass"];

function wildTeleport(player: Player) {
  const playerId = player.id;
  system.run(() => {
    if (!isPlayerOnline(playerId)) return;

    const spreadLocations = [
      [-10000, 10000],
      [-10000, -10000],
      [10000, -10000],
      [10000, 10000],
    ];

    const [x, z] = spreadLocations[Math.floor(Math.random() * spreadLocations.length)];
    player.runCommand(`spreadplayers ${x} ${z} 1 2000 @s`);
    player?.addEffect("slow_falling", 500, { amplifier: 255, showParticles: false });
    player?.addEffect("blindness", 500, { amplifier: 255, showParticles: false });
    player.playSound("random.beacon.activate");
    player?.addTag("onWildTeleportation");

    const blockCheck = system.runInterval(() => {
      if (!isPlayerOnline(playerId)) {
        system.clearRun(blockCheck);
        teleportingPlayers.delete(playerId);
        return;
      }

      const belowBlock = player.dimension.getBlockFromRay(player.location, { x: 0, y: -1, z: 0 });
      if (belowBlock?.block) {
        const blockType = belowBlock.block.type.id;
        if (!INVALID_BLOCKS.includes(blockType)) {
          const aboveBlock = belowBlock.block.above();
          if (aboveBlock) {
            player.teleport({ x: aboveBlock.x + 0.5, y: aboveBlock.y, z: aboveBlock.z + 0.5 }, { dimension: player.dimension, keepVelocity: false });
            player?.removeEffect("slow_falling");
            player?.removeEffect("blindness");
            player?.removeTag("onWildTeleportation");
            system.clearRun(blockCheck);
            teleportingPlayers.delete(playerId);
            player?.sendMessage("§aYou have been safely teleported to a random location!");
          }
        } else {
          const [newX, newZ] = spreadLocations[Math.floor(Math.random() * spreadLocations.length)];
          player.runCommand(`spreadplayers ${newX} ${newZ} 1 2000 @s`);
        }
      }
    }, 1);

    teleportingPlayers.set(playerId, { intervalId: blockCheck });
  });
}

function isPlayerOnline(playerId: string) {
  return world.getAllPlayers().some((p) => p.id === playerId);
}
