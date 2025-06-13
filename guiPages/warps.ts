import { Player, world, system, Dimension } from "@minecraft/server";
import { ActionFormData, FormCancelationReason, ModalFormData } from "@minecraft/server-ui";
import { startWildTeleport } from "../helperFunctions/randomTP";
import { playSoundTo } from "../helperFunctions/sounds";
let overworld: Dimension;
const e = () => {
  overworld = world.getDimension("minecraft:overworld");
};
system.run(e);

export let config = {
  warmUpTime: 3,
  warpLocations: [
    /*0*/ { name: "§l§fSpawn", description: "§fGo back to the lobby", icon: `textures/items/nether_star.png`, location: { x: 19974, y: 146, z: 19842 }, dimension: `overworld`, wild: false, showUI: true },
    /*1*/ { name: "§l§bFreeplay", description: "§fExplore the world", icon: `textures/gui/menu/clan`, location: { x: 380, y: 117, z: 935 }, dimension: `overworld`, wild: false, showUI: true },
    /*2*/ { name: "§l§7RTP", description: "§fRandomly teleport", icon: `textures/gui/menu/RTP`, location: { x: 0, y: 0, z: 0 }, dimension: `overworld`, wild: true, showUI: true },
    /*4*/ { name: "§l§6Nether TP", description: "§fWarp to the Nether", icon: `textures/items/blaze_powder.png`, location: { x: 117, y: 42, z: 85 }, dimension: `nether`, wild: false, showUI: true },
    /*5*/ { name: "§l§dEnd TP", description: "§fWarp to the End", icon: `textures/items/ender_pearl.png`, location: { x: 10, y: 64, z: 10 }, dimension: `the_end`, wild: false, showUI: true },
  ],
};

//ill comment later
export function warpTeleport(player: Player, warp: number) {
  if (config.warpLocations[warp].wild == true) return startWildTeleport(player);

  playSoundTo(player, "RandomPop");
  let teleportCanceled = false;
  let checks = config.warmUpTime;

  const initialLocation = { ...player.location };
  const timer = system.runInterval(() => {
    if (teleportCanceled) {
      system.clearRun(timer);
      return;
    }
    if (checks > 0) {
      player.sendMessage(`§aTeleporting in ${checks} seconds...`);
      playSoundTo(player, "RandomPop");
      checks = checks - 1;
    } else {
      system.clearRun(timer);
    }
  }, 20);

  const warmUpTask = system.runTimeout(() => {
    if (teleportCanceled) return;

    player.tryTeleport(config.warpLocations[warp].location, {
      dimension: world.getDimension(config.warpLocations[warp].dimension),
    });

    player.runCommand(`summon fireworks_rocket`);

    system.runTimeout(() => {
      player.playSound(`random.toast`);
    }, 5);

    teleportCanceled = true;
  }, Number(config.warmUpTime + 1) * 20);

  const movementCheckTask = system.runInterval(() => {
    if (teleportCanceled) {
      system.clearRun(warmUpTask);
      system.clearRun(timer);
      system.clearRun(movementCheckTask);
      return;
    }
    if (Math.abs(player.location.x - initialLocation.x) > 0.1 || Math.abs(player.location.y - initialLocation.y) > 0.1 || Math.abs(player.location.z - initialLocation.z) > 0.1) {
      teleportCanceled = true;
      system.clearRun(warmUpTask);
      system.clearRun(timer);
      system.clearRun(movementCheckTask);
      player.sendMessage(`§cTeleport canceled due to movement.`);
      playSoundTo(player, "Error");
    }
  }, 5);
}

export function warpMenu(player: Player, chat?: boolean, i?: number) {
  let warpMenuForm = new ActionFormData().title("§cCrab§fSMP §8- §eWarps");
  config.warpLocations.forEach((warp) => {
    if (warp.showUI) warpMenuForm.button(`${warp.name}§r\n§8[ §f${warp.description} §8]§r`, warp.icon);
  });
  warpMenuForm
    .button("§l§4Close Menu§r\n§8[ §fExit the GUI §8]§r", "textures/blocks/barrier")
    .show(player as any)
    .then((res) => {
      if (res.cancelationReason == FormCancelationReason.UserBusy) return warpMenu(player);

      if (Number(res.selection) <= 7) {
        warpTeleport(player, Number(res.selection));
      } else {
        player.sendMessage(`§cWarp menu closed!`);
      }
    });
}

function freePlayForm(player: Player) {
  let freePlayOptions = new ActionFormData()
    .title("§cCrab§fSMP §8- §eWild")
    .body("§fSelect the option that seems authentic to you!")
    .button("§l§aFreeplay§r\n§8[ §fWild with King of the hill §8]", "textures/gui/menu/freeplay")
    .button("§l§7RTP§r\n§8[ §fTP to a random location §8]", "textures/gui/menu/RTP")
    .button("§l§4Close Menu§r\n§8[ §fExit the GUI §8]§r", "textures/blocks/barrier")

    .show(player as any)
    .then((res) => {
      if (res.selection == 0) {
        playSoundTo(player, "RandomPop");
        player.teleport({ x: 380, y: 117, z: 935 }, { dimension: overworld });
      }
      if (res.selection == 1) {
        playSoundTo(player, "RandomPop");
        player.sendMessage("§aCrab-Engine is generating a random location... Please wait");
        player.runCommand("gamemode s @s[tag=!staffstatus]");
        startWildTeleport(player);
      }
    });
}

export { freePlayForm };
