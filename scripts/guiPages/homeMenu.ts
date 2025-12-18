import { playSoundTo } from "../helperFunctions/sounds";
import { ActionFormData, ModalFormData, FormCancelationReason } from "@minecraft/server-ui";
import { Player, world, system } from "@minecraft/server";
import { Database } from "../db/Database.js";
import { relay } from "../protocol/protocol";


const MAX_HOMES = 3;
const MAX_HOMES_PER_CATEGORY = 3;
const TELEPORT_WARMUP = 5;
const TELEPORT_COOLDOWN = 60;

export async function getPlayerDB(player: Player) {
  const db = await new Database<{ name: string; description?: string; category?: string; location: { x: number; y: number; z: number }; dimension: string }>(`${player.id}_home`);
  return db;
}

export function homeMenu(player: Player) {
  const form = new ActionFormData()
    .title("§5Nexus§fSMP §8- §eHomes")
    .body("§cCreate §7and §eManage §7Homes with ease!")
    .button("§l§eSet Homes§r\n§8[ §fSet Home Locations §8]§r", "textures/items/bed_red")
    .button("§l§aTeleport to Homes§r\n§8[ §fWarp to Homes §8]§r", "textures/items/bed_green")
    .button("§l§bDelete Homes§r\n§8[ §fRemove Home Locations §8]§r", "textures/items/bed_cyan")
    .button("§l§5Share Homes§r\n§8[ §fShare with Friends §8]§r", "textures/items/bed_purple")
    .button("§l§4Close Menu§r\n§8[ §fExit the GUI §8]§r", "textures/blocks/barrier")
    .show(player as any)
    .then((res) => {
      if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy) return homeMenu(player);
      const selection = res.selection;
      if (selection === undefined) return;

      if (selection === 0) {
        setHomesMenu(player);
      } else if (selection === 1) {
        teleportToHomesMenu(player);
      } else if (selection === 2) {
        deleteHomesMenu(player);
      } else if (selection === 3) {
        shareHomesMenu(player);
      }
    })
    .catch((error) => {
      console.error("Error in homeMenu:", error);
      player.sendMessage("§cAn error occurred. Please try again.");
    });
}

/**
 * Set Homes Sub-Menu
 */
async function setHomesMenu(player: Player) {
  let homesDB = await getPlayerDB(player);
  const form = new ModalFormData()
    .title("§5Nexus§fSMP §8- §eSet Homes")
    .textField("§7Home Name", "Enter a name for your home")
    .textField("§7Home Description", "Optional: Add a description")
    .dropdown("§7Category", ["Base", "Farm", "Mine", "Other"])
    .show(player as any)
    .then((res) => {
      if (res.canceled) return homeMenu(player);

      const [name, description, category] = res.formValues as [string, string, string];
      if (!name) {
        player.sendMessage("§cHome name cannot be empty!");
        playSoundTo(player, "Error");
        return setHomesMenu(player);
      }

      const playerHomes = Object.keys(homesDB.collection()).filter((key) => key.startsWith(player.name));
      if (playerHomes.length >= MAX_HOMES) {
        player.sendMessage(`§cYou can only set a maximum of ${MAX_HOMES} homes!`);
        playSoundTo(player, "Error");
        return homeMenu(player);
      }

      const categoryHomes = playerHomes.filter((key) => homesDB.get(key)?.category === category);
      if (categoryHomes.length >= MAX_HOMES_PER_CATEGORY) {
        player.sendMessage(`§cYou can only set a maximum of ${MAX_HOMES_PER_CATEGORY} homes in the "${category}" category!`);
        playSoundTo(player, "Error");
        return homeMenu(player);
      }

      const homeKey = `${player.name}_${name}`;
      const { x, y, z } = player.location;
      const dimension = player.dimension.id.replace("minecraft:", ""); // Remove "minecraft:" prefix
      homesDB.set(homeKey, { name, description, category, location: player.location, dimension });

      player.sendMessage(`§aHome "${name}" has been set at: §eX: ${x.toFixed(1)}, Y: ${y.toFixed(1)}, Z: ${z.toFixed(1)} §ain dimension §e${dimension}`);
      relay(`[Homes] ${player.name} has set their home "${name}" at: ${x.toFixed(1)}, Y: ${y.toFixed(1)}, Z: ${z.toFixed(1)} in the dimension ${dimension}`);
      if (description) player.sendMessage(`§7Description: §f${description}`);
      player.sendMessage(`§7Category: §f${category}`);

      playSoundTo(player, "Success");
      player.runCommand(`summon fireworks_rocket`);
      homeMenu(player);
    })
    .catch((error) => {
      console.error("Error in setHomesMenu:", error);
      player.sendMessage("§cAn error occurred. Please try again.");
    });
}

async function teleportToHomesMenu(player: Player) {
  let homesDB = await getPlayerDB(player);
  const form = new ActionFormData().title("§5Nexus§fSMP §8- §eTeleport to Homes").body("§7Select a home to teleport to.");

  const playerHomes = Object.entries(homesDB.collection()).filter(([key]) => key.startsWith(player.name));
  if (playerHomes.length === 0) {
    player.sendMessage("§cYou have no homes set!");
    playSoundTo(player, "Error");
    return homeMenu(player);
  }

  playerHomes.forEach(([key, home]) => {
    const coordinates = `§8[ §fX: ${home.location.x.toFixed(1)}, Y: ${home.location.y.toFixed(1)}, Z: ${home.location.z.toFixed(1)} §8]`;
    form.button(`§l§a${home.name}§r\n${coordinates}`, "textures/items/bed_red"); // Default icon
  });

  form
    .button("§l§4Back§r\n§8[ §fReturn to Main Menu §8]§r", "textures/blocks/barrier")
    .show(player as any)
    .then((res) => {
      const homeIndex = res.selection;
      if (homeIndex === undefined) return;

      if (homeIndex < playerHomes.length) {
        const [homeKey, home] = playerHomes[homeIndex];
        const startLocation = { ...player.location }; // Store the player's starting location

        let countdown = 3;
        const countdownInterval = system.runInterval(() => {
          if (countdown > 0) {
            player.sendMessage(`§aTeleporting to "${home.name}" in ${countdown} seconds. Don't move!`);
            countdown--;
          } else {
            system.clearRun(countdownInterval); // Stop the countdown

            const currentLocation = player.location;
            if (currentLocation.x !== startLocation.x || currentLocation.y !== startLocation.y || currentLocation.z !== startLocation.z) {
              player.sendMessage("§cTeleportation canceled because you moved.");
              playSoundTo(player, "Error");
              return;
            }
            playSoundTo(player, "Success");
            player.teleport(home.location, { dimension: world.getDimension(home.dimension) });
          }
        }, 20); 
      } else if (homeIndex === playerHomes.length) {
        homeMenu(player);
      }
    })
    .catch((error) => {
      console.error("Error in teleportToHomesMenu:", error);
      player.sendMessage("§cAn error occurred. Please try again.");
    });
}

async function deleteHomesMenu(player: Player) {
  let homesDB = await getPlayerDB(player);
  const form = new ActionFormData().title("§5Nexus§fSMP §8- §eDelete Homes").body("§7Select a home to delete.");

  const playerHomes = Object.entries(homesDB.collection()).filter(([key]) => key.startsWith(player.name));
  if (playerHomes.length === 0) {
    player.sendMessage("§cYou have no homes set!");
    playSoundTo(player, "Error");
    return homeMenu(player);
  }

  playerHomes.forEach(([key, home]) => {
    form.button(`§l§eDelete ${home.name}§r\n§8[ §f${home.description || "No Description"} §8]`, "textures/items/bed_red"); // Default icon
  });

  form
    .button("§l§4Back§r\n§8[ §fReturn to Main Menu §8]§r", "textures/blocks/barrier")
    .show(player as any)
    .then((res) => {
      const homeIndex = res.selection;
      if (homeIndex === undefined) return;

      if (homeIndex < playerHomes.length) {
        const [homeKey, home] = playerHomes[homeIndex];
        const confirmForm = new ModalFormData()
          .title("§eConfirm Deletion")
          .toggle(`§7Are you sure you want to delete "${home.name}"?`, { defaultValue: false })
          .show(player as any)
          .then((confirmRes) => {
            if (confirmRes.canceled) return deleteHomesMenu(player);

            const [confirmed] = confirmRes.formValues as [boolean];
            if (confirmed) {
              homesDB.delete(homeKey);
              playSoundTo(player, "Success");
              player.sendMessage(`§aHome "${home.name}" has been deleted.`);
              relay(`[Homes] ${player.name} has deleted their home "${home.name}"`);
            }
            deleteHomesMenu(player);
          })
          .catch((error) => {
            console.error("Error in confirmForm:", error);
            player.sendMessage("§cAn error occurred. Please try again.");
          });
      } else if (homeIndex === playerHomes.length) {
        homeMenu(player);
      }
    })
    .catch((error) => {
      console.error("Error in deleteHomesMenu:", error);
      player.sendMessage("§cAn error occurred. Please try again.");
    });
}

async function shareHomesMenu(player: Player) {
  let homesDB = await getPlayerDB(player);
  const form = new ActionFormData().title("§5Nexus§fSMP §8- §dShare Homes").body("§7Select a home to share.");

  const playerHomes = Object.entries(homesDB.collection()).filter(([key]) => key.startsWith(player.name));
  if (playerHomes.length === 0) {
    player.sendMessage("§cYou have no homes set!");
    playSoundTo(player, "Error");
    return homeMenu(player);
  }

  playerHomes.forEach(([key, home]) => {
    form.button(`§l§dShare ${home.name}§r\n§8[ §f${home.description || "No Description"} §8]`, "textures/items/bed_red"); // Default icon
  });

  form
    .button("§l§4Back§r\n§8[ §fReturn to Main Menu §8]§r", "textures/blocks/barrier")
    .show(player as any)
    .then((res) => {
      const homeIndex = res.selection;
      if (homeIndex === undefined) return;

      if (homeIndex < playerHomes.length) {
        const [homeKey, home] = playerHomes[homeIndex];
        const shareForm = new ModalFormData()
          .title("§dShare Home")
          .textField("§7Player Name", "Enter the name of the player to share with")
          .show(player as any)
          .then((shareRes) => {
            if (shareRes.canceled) return shareHomesMenu(player);

            const [targetPlayerName] = shareRes.formValues as [string];
            const targetPlayer = world.getPlayers().find((p) => p.name === targetPlayerName);
            if (!targetPlayer) {
              player.sendMessage(`§cPlayer "${targetPlayerName}" not found!`);
              playSoundTo(player, "Error");
              return shareHomesMenu(player);
            }

            const sharedHomeKey = `${targetPlayer.name}_${home.name}`;
            homesDB.set(sharedHomeKey, home);
            player.sendMessage(`§aHome "${home.name}" has been shared with ${targetPlayerName}.`);
            relay(`[Homes] ${player.name} has shared their home ${home.name} with ${targetPlayerName}`);
            targetPlayer.sendMessage(`§a${player.name} has shared their home "${home.name}" with you!`);
            playSoundTo(player, "Success");
            shareHomesMenu(player);
          })
          .catch((error) => {
            console.error("Error in shareForm:", error);
            player.sendMessage("§cAn error occurred. Please try again.");
          });
      } else if (homeIndex === playerHomes.length) {
        homeMenu(player);
      }
    })
    .catch((error) => {
      console.error("Error in shareHomesMenu:", error);
      player.sendMessage("§cAn error occurred. Please try again.");
    });
}


