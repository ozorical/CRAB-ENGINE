import { world, Player, Dimension, ChatSendBeforeEvent, ItemStack, EntityComponentTypes, EquipmentSlot, ItemComponentTypes, EntityType } from "@minecraft/server";
import { ActionFormData, ModalFormData, FormCancelationReason, MessageFormData } from "@minecraft/server-ui";
import { Database } from "../db/Database.js";
import { banDBData, duration, JoinLeaveDB, messageDBData, muteDBData } from "../types.js";
import { setupLeaderBoard } from "../leaderboard/setupLeaderboard.js";
import { playSoundTo } from "../helperFunctions/sounds.js";
import { advancedRelay, relay } from "../protocol/protocol.js";

let messageDB: Database<messageDBData>, JoinLeaveDB: Database<JoinLeaveDB>, AdminDB: Database<string>, BansDB: Database<banDBData>, MuteDB: Database<muteDBData>;

export const staffDBInit = async () => {
  await null;
  console.warn("DBS INIT");
  messageDB = new Database<messageDBData>("messageDB");
  JoinLeaveDB = new Database<JoinLeaveDB>("JoinLeaveDB");
  AdminDB = new Database<string>("AdminDB");
  BansDB = new Database<banDBData>("BansDB");
  MuteDB = new Database<muteDBData>("MuteDB");
};

export function staffMain(player: Player) {
  if (!player.hasTag("staffstatus")) {
    player.sendMessage("§cYou don't have permission to access this menu.");
    return;
  }

  const form = new ActionFormData()
    .title(" §gAdmin Menu ")
    .body("This is the Crab-Engine Admin menu. Here, you can §gkick, §cban, §fand §bmute §fplayers.")
    .button("§bModeration GUI§r\n§7Staff Tools", "textures/ui/gear.png")
    .button("§4Close GUI§r\n§7Click to close", "textures/staff/kick.png");

  form.show(player as any).then((r) => {
    if (r.canceled) return;
    switch (r.selection) {
      case 0:
        playSoundTo(player, "Success");
        Main(player);
        break;
      case 1:
        playSoundTo(player, "RandomPop");
        player.sendMessage("§cYou closed the Moderation menu.");
        break;
    }
  });
}

function Main(player: Player) {
  const form = new ActionFormData()
    .title(" §gAdmin Menu ")
    .body("Select an option from the button list below: ")
    .button("§aMute §r\n§7Click to Mute Player", "textures/staff/mute.png")
    .button("§4Ban §r\n§7Click to Ban Player", "textures/staff/ban.png")
    .button("§eInventory view §r\n§7View a Player's Inventory", "textures/staff/view.png")
    .button("§6Gamemode §r\n§7Switch Gamemode", "textures/items/experience_bottle.png")
    .button("§bSetup Leaderboard §r\n§7Run Commands", "textures/items/map_filled.png")
    .button("§4Close §r\n§7Click to Close", "textures/staff/kick.png");

  form.show(player as any).then((r) => {
    if (r.canceled) return;
    switch (r.selection) {
      case 0:
        playSoundTo(player, "RandomPop");
        TimeOut(player);
        break;
      case 1:
        playSoundTo(player, "RandomPop");
        Bans(player);
        break;
      case 2:
        playSoundTo(player, "RandomPop");
        inventoryViewer(player);
        break;
      case 3:
        playSoundTo(player, "RandomPop");
        gamemodeSwitcher(player);
        break;
      case 4:
        playSoundTo(player, "RandomPop");
        setupLeaderBoard(player as any);
        break;
    }
  });
}


function gamemodeSwitcher(player: Player) {
  const currentGamemode = player.hasTag("isCreative") ? "creative" : "survival";
  const newGamemode = currentGamemode === "creative" ? "survival" : "creative";
  
  try {
    player.runCommand(`gamemode ${newGamemode}`);
    
    if (newGamemode === "creative") {
      player.addTag("isCreative");
      player.removeTag("isSurvival");
    } else {
      player.addTag("isSurvival");
      player.removeTag("isCreative");
    }
    
    player.sendMessage(`§aYour gamemode has been changed to §6${newGamemode}§a!`);
    relay(`[Admin Action] ${player.name} has changed their gamemode to ${newGamemode}.`)
  } catch (error) {
    player.sendMessage(`§cFailed to change gamemode: ${error}`);
  }
}


function successGui(player: Player, feedback: string, reason: string, command: string) {
  const form = new MessageFormData()
    .title(`§aFeedback Form - §b${feedback}`)
    .body(`${feedback} - ${reason} - Command: ${command}`)
    .button1("§cClose")
    .button2("§aOK");

  form.show(player as any);
}

function Timeout(player: Player) {
  const playerNames = world.getAllPlayers().map((p) => p.name);
  const form = new ModalFormData()
    .title(" §bTimeOut ")
    .dropdown("Choose a Player", playerNames)
    .textField("Enter Time (e.g. 1h 23m 32s)", "Time here...")
    .textField("Enter Reason", "Reason here...");

  form.show(player as any).then((result) => {
    if (result.canceled) {
      return player.sendMessage("§cTimeout setup canceled.");
    }

    const targetPlayerName = playerNames[Number(result.formValues?.[0]) || 0];
    const timeString = result.formValues?.[1] as string;
    const reason = result.formValues?.[2] as string;
    const durationInSeconds = parseTimeString(timeString);
    const endTime = Date.now() + durationInSeconds * 1000;

    const muteData: muteDBData = {
      player: targetPlayerName,
      mutedBy: player.name,
      endTime: endTime,
      duration: formatTime(durationInSeconds),
      reason: reason,
      startTime: Date.now(),
      finished: false,
    };

    MuteDB.set(targetPlayerName, muteData);

    player.sendMessage(`§a${targetPlayerName} has been muted for ${formatTime(durationInSeconds)}. Reason: ${reason}`);
    const targetPlayer = world.getAllPlayers().find((p) => p.name === targetPlayerName);
    targetPlayer?.sendMessage(`§cYou have been muted by ${player.name} for ${formatTime(durationInSeconds)}. Reason: ${reason}`);
    relay(`[Relay Message] ${targetPlayer} has been muted by ${player.name} for ${formatTime(durationInSeconds)}. Reason: ${reason}`);
    relay(`[Admin Action] ${targetPlayer} has been muted by ${player.name} for ${formatTime(durationInSeconds)}. Reason: ${reason}`);
  });
}

function TimeoutLogs(player: Player) {
  const currentTime = Date.now();
  const activeMutes = MuteDB.values().filter((info) => currentTime < info.endTime);

  if (!activeMutes.length) {
    return player.sendMessage("§cThere are no current timeouts.");
  }

  const logsForm = new ActionFormData()
    .title(" §bTimeout Logs ")
    .body("§uSelect a player to view details:");

  activeMutes.forEach((muteInfo) => {
    logsForm.button(muteInfo.player);
  });

  logsForm.show(player as any).then((result) => {
    if (result.canceled) return;
    const selectedPlayerName = activeMutes[result.selection ?? 0].player;
    playSoundTo(player, "RandomPop");
    showTimeoutDetails(player, selectedPlayerName);
  });
}

function showTimeoutDetails(player: Player, mutedPlayerName: string) {
  const muteInfo = MuteDB.get(mutedPlayerName);
  if (!muteInfo) return;

  const currentTime = Date.now();
  const timeLeft = currentTime < muteInfo.endTime ? formatTime((muteInfo.endTime - currentTime) / 1000) : "0s";
  const finished = currentTime >= muteInfo.endTime;

  const detailsForm = new ActionFormData()
    .title(` §bTimeout Details `)
    .body(`§aMod: ${muteInfo.mutedBy}\n§aUser: ${mutedPlayerName}\n§aReason: ${muteInfo.reason}\n§aDuration: ${muteInfo.duration}\n§aLeft: ${timeLeft}\n§aFinished: ${finished}`)
    .button("Remove Timeout")
    .button("Close");

  detailsForm.show(player as any).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      if (finished) {
        playSoundTo(player, "Error");
        player.sendMessage(`§cCannot remove timeout for ${mutedPlayerName} because it has already expired.`);
      } else {
        MuteDB.delete(mutedPlayerName);
        playSoundTo(player, "Success");
        player.sendMessage(`§cTimeout for ${mutedPlayerName} has been removed.`);
        relay(`[Admin Action] Timeout for ${mutedPlayerName} has been removed by ${player.name}`);
      }
    }
  });
}

function parseTimeString(timeString: string): number {
  const timeUnits: Record<string, number> = {
    h: 3600,
    m: 60,
    s: 1,
  };
  let totalSeconds = 0;
  const matches = timeString.match(/\d+\s*[hms]/g);
  if (matches) {
    matches.forEach((match) => {
      const unit = match.match(/[hms]/)?.[0] ?? '';
      const value = parseInt(match.match(/\d+/)?.[0] ?? '0');
      totalSeconds += value * (timeUnits[unit] || 0);
    });
  }
  return totalSeconds;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export function ifThisPlayerIsMutedDoThis(eventData: ChatSendBeforeEvent) {
  const playerName = eventData.sender.name;
  const muteInfo = MuteDB.get(playerName);

  if (muteInfo) {
    const currentTime = Date.now();
    if (currentTime < muteInfo.endTime) {
      eventData.cancel = true;
      const timeLeft = formatTime((muteInfo.endTime - currentTime) / 1000);
      eventData.sender.sendMessage(`§cYou are on timeout by ${muteInfo.mutedBy} for ${timeLeft}. Reason: ${muteInfo.reason}`);
    }
  }
}

export function checkMutedPlayersStatus() {
  const currentTime = Date.now();
  const allMutes = Array.from(MuteDB.keys());

  allMutes.forEach((playerName) => {
    const muteInfo = MuteDB.get(playerName);
    if (!muteInfo) return;

    if (muteInfo.endTime && currentTime >= muteInfo.endTime) {
      if (!muteInfo.finished) {
        MuteDB.set(playerName, {
          ...muteInfo,
          finished: true,
        });
      }

      MuteDB.delete(playerName);

      const player = world.getAllPlayers().find((p) => p.name === playerName);
      if (player) {
        player.sendMessage(`§aYour timeout has expired.`);
      }
    }
  });
}

function TimeOut(player: Player) {
  const form = new ActionFormData()
    .title(" §bMain UI ")
    .body("Welcome player")
    .button("§bTimeout User§r\n§7Click to View", "textures/staff/restrict.png")
    .button("§bTimeout Logs §r\n§7Click to View", "textures/items/map_filled.png");

  form.show(player as any).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      playSoundTo(player, "RandomPop");
      Timeout(player);
    } else if (response.selection === 1) {
      playSoundTo(player, "RandomPop");
      TimeoutLogs(player);
    }
  });
}

function Bans(player: Player) {
  const form = new ActionFormData()
    .title(" §bBan Menu ")
    .button("§bBan Player §r\n§7Click to Ban", "textures/staff/ban.png")
    .button("§bView Bans §r\n§7Click to View", "textures/staff/view.png")
    .button("§cClose §r\n§7Click to Close", "textures/staff/kick.png");

  form.show(player as any).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      playSoundTo(player, "RandomPop");
      banPlayer(player);
    } else if (response.selection === 1) {
      playSoundTo(player, "RandomPop");
      viewBans(player);
    }
  });
}

function banPlayer(player: Player) {
  const form = new ModalFormData()
    .title(" §bBan Player ")
    .textField("§7Enter Player Name to Ban:", "Player Name")
    .textField("§7Reason for Ban:\n§7Enter reason for banning this player.§r", "e.g. Cheating§r")
    .textField("§7Ban Duration (S, M, H, D, Perm):", "Duration")
    .toggle("Are you sure you want to ban this player?\n§cRequired!", { defaultValue: false });

  form.show(player as any).then((result) => {
    if (result.canceled || !result.formValues?.[3]) {
      return player.sendMessage('§cPlease complete the form and toggle "Are you sure?" to ban the player!');
    }

    const playerNameToBan = (result.formValues?.[0] as string).trim();
    const reason = result.formValues?.[1] as string;
    const durationInput = (result.formValues?.[2] as string).trim().toUpperCase();
    const isPermanent = durationInput === "PERM";
    const bannedAt = new Date().toLocaleString();
    let unbanTime: number | "Permanent" = "Permanent";

    if (!isPermanent) {
      const durationValue = parseInt(durationInput.slice(0, -1));
      const durationUnit = durationInput.slice(-1);
      const multiplier: Record<string, number> = {
        S: 1000,
        M: 1000 * 60,
        H: 1000 * 60 * 60,
        D: 1000 * 60 * 60 * 24,
      };
      unbanTime = Date.now() + durationValue * (multiplier[durationUnit] || 0);
    }

    const banData: banDBData = {
      player: playerNameToBan,
      bannedBy: player.name,
      reason: reason,
      bannedAt: bannedAt,
      unbanTime: unbanTime
    };

    BansDB.set(playerNameToBan, banData);
    world.sendMessage(`§c${playerNameToBan} has been banned.`);
    relay(`[Admin Action] ${playerNameToBan} has been banned by ${player.name}.`);
    relay(`[Relay Message] ${playerNameToBan} has been banned by ${player.name}.`);
  });
}

function viewBans(player: Player) {
  const allBans = BansDB.values();
  if (!allBans.length) {
    return player.sendMessage("§cThere are no bans at the moment.");
  }

  const bansForm = new ActionFormData()
    .title(" §bView Bans ")
    .body("§uSelect a Banned Player:");

  allBans.forEach((ban) => {
    bansForm.button(`§c${ban.player}`);
  });

  bansForm.show(player as any).then((response) => {
    if (response.canceled) return;
    const selectedBan = allBans[response.selection ?? 0];
    const unbanTimeString = selectedBan.unbanTime === "Permanent" 
      ? "Permanent" 
      : new Date(selectedBan.unbanTime).toLocaleString();

    const banDetailForm = new ActionFormData()
      .title(` §cBan Details `)
      .body(`§7Banned Player: ${selectedBan.player}\n§7Mod: ${selectedBan.bannedBy}\n§7Reason: ${selectedBan.reason}\n§7Banned At: ${selectedBan.bannedAt}\n§7Unban Time: ${unbanTimeString}`)
      .button("§cUnban Player", "textures/staff/ban.png");

    banDetailForm.show(player as any).then((detailResponse) => {
      if (detailResponse.canceled) return;
      if (detailResponse.selection === 0) {
        playSoundTo(player, "Success");
        BansDB.delete(selectedBan.player);
        player.sendMessage(`§a${selectedBan.player} has been unbanned.`);
        relay(`[Admin Action] ${selectedBan.player} has been unbanned.`);
        relay(`[Relay Message] ${selectedBan.player} has been unbanned.`);
        viewBans(player);
      }
    });
  });
}

export function enforceAndCheckBanStatus() {
  const currentTime = Date.now();

  world.getAllPlayers().forEach((player) => {
    const { name } = player;
    const banInfo = BansDB.get(name);
    if (!banInfo) return;

    let remainingTimeMessage: string;
    if (banInfo.unbanTime === "Permanent") {
      remainingTimeMessage = "Permanent";
    } else {
      if (typeof banInfo.unbanTime === "number") {
        const remainingTime = banInfo.unbanTime - currentTime;
        if (remainingTime > 0) {
          const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
          remainingTimeMessage = `${days}d ${hours}h ${minutes}m`;
        } else {
          BansDB.delete(name);
          return;
        }
      } else {
        remainingTimeMessage = "Permanent";
      }
    }

    const { bannedBy, reason } = banInfo;
    try {
      player.runCommand(`kick "${name}" §cYou have been banned by ${bannedBy}\n§cReason: ${reason}\n§cLength: ${remainingTimeMessage}`);
    } catch (e) {
      console.warn(`Failed to kick banned player ${name}: ${e}`);
      relay(`[Admin Action] Failed to kick banned player ${name}`)
    }
  });

  const allBans = BansDB.values();
  allBans.forEach((ban) => {
    if (ban.unbanTime !== "Permanent" && typeof ban.unbanTime === "number" && currentTime >= ban.unbanTime) {
      BansDB.delete(ban.player);
    }
  });
}

function inventoryViewer(player: Player) {
  const players = world.getAllPlayers();
  const playerNames = players.map((p) => p.name);

  const form = new ModalFormData()
    .title("§cSelect Inventory To View")
    .dropdown("Player", playerNames);

  form.show(player as any).then((res) => {
    if (res.canceled) return;
    const targetIndex = Number(res.formValues?.[0]) || 0;
    const target = players[targetIndex];
    viewInventory(player, target);
  });
}

function viewInventory(admin: Player, target: Player) {
  let invArray: (ItemStack | undefined)[] = [];
  invArray.push(target.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Chest) ?? new ItemStack("minecraft:air"));
  invArray.push(target.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Feet) ?? new ItemStack("minecraft:air"));
  invArray.push(target.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Head) ?? new ItemStack("minecraft:air"));
  invArray.push(target.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Legs) ?? new ItemStack("minecraft:air"));
  invArray.push(target.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Offhand) ?? new ItemStack("minecraft:air"));

  let playerInv = target.getComponent(EntityComponentTypes.Inventory)?.container;
  
  if (!playerInv) {
    admin.sendMessage("§cFailed to access player inventory");
    return;
  }

  for (let i = 0; i < playerInv.size; i++) {
    const item = playerInv.getItem(i);
    if (item) {
      invArray.push(item);
    }
  }

  let invDisplayText = "";
  invArray.forEach((inv) => {
    if (!inv) return;
    
    let enchants = inv
      .getComponent(ItemComponentTypes.Enchantable)
      ?.getEnchantments()
      .map((enchantment) => ({ id: enchantment.type.id, lvl: enchantment.level }));

    invDisplayText += `§b${inv.typeId}§r x §a${inv.amount}§r §dEnchants: ${
      enchants ? JSON.stringify(enchants)
        .replaceAll('"[{"id":"', "")
        .replaceAll('"', "")
        .replaceAll("}", "")
        .replaceAll("-{id:", "")
        .replaceAll("[{", "")
        .replaceAll("{", "")
        .replaceAll("]", "") 
      : ""
    }\n`;
  });

  new ActionFormData()
    .title(`§b${target.name}'s inventory`)
    .body(invDisplayText)
    .button("§8[ §cCLOSE §8]§r", "textures/blocks/barrier")
    .show(admin as any);
}

export { MuteDB };