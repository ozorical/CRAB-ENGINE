// scripts/chatCommands/commandHandler.ts
import { system as system13 } from "@minecraft/server";

// scripts/chatCommands/commands/tpa.ts
import { system as system2, world } from "@minecraft/server";
import { ActionFormData, FormCancelationReason, ModalFormData } from "@minecraft/server-ui";

// scripts/helperFunctions/sounds.ts
import { system } from "@minecraft/server";
var SOUNDS = {
  Activate: "beacon.activate",
  Chime: "note.chime",
  Error: "note.bit",
  Success: "random.levelup",
  Ping: "random.orb",
  BubblePop: "bubble.pop",
  RandomPop: "random.pop"
};
function playSoundTo(player, soundKey) {
  const sound = SOUNDS[soundKey];
  if (!sound) {
    console.warn(`Sound "${soundKey}" not found in SOUNDS.`);
    return;
  }
  system.run(() => {
    player.playSound(sound);
  });
}

// scripts/chatCommands/commands/tpa.ts
function tpaTprSelect(player, isChat, i) {
  if (isChat) {
    i = 0;
  }
  let selectionMenu = new ActionFormData().title("\xA7bTeleporting Menu\xA7r").body("Choose whether you want to Accept, or request a warp.").button("\xA7l\xA7dTPA\xA7r\n\xA78[ \xA7fAccept Warp Requests \xA78]\xA7r", "textures/ui/switch_accounts").button("\xA7l\xA7bTPR\xA7r\n\xA78[ \xA7fRequest To Warp \xA78]\xA7r", "textures/ui/switch_accounts").button("\xA7cClose Menu\n\xA78[ \xA7fExit the GUI \xA78]\xA7r", "textures/blocks/barrier").show(player).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy && i != void 0) {
      system2.runTimeout(() => {
        if (i < 5) {
          player.sendMessage(`\xA73Close chat to view GUI`);
          i++;
          tpaTprSelect(player, false, i);
        }
      }, 20);
      return;
    }
    if (res.canceled)
      return;
    if (res.selection === 0) {
      playSoundTo(player, "RandomPop");
      tpa(player);
    }
    if (res.selection == 1) {
      playSoundTo(player, "RandomPop");
      tpr(player);
    }
  });
}
function tpr(requester, i) {
  if (!i) {
    i = 0;
  }
  let players = world.getAllPlayers();
  let playerNames = players.map((p) => p.name);
  let tprMenu = new ModalFormData().title("\xA7aRequest To Warp To Player:\xA7r").dropdown("Player", playerNames, 0).show(requester).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy && i != void 0) {
      system2.runTimeout(() => {
        if (i < 5) {
          requester.sendMessage(`Close Chat Within ${5 - i} Seconds To Open Menu`);
          i++;
          tpr(requester, i);
        }
      }, 20);
      return;
    }
    let selection = res.formValues[0];
    let target = players[selection];
    if (requester.getDynamicProperty("tpr") != "") {
      requester.sendMessage("\xA7cCannot Send Warp Requests While One Is Still Pending. Please Wait 30 Seconds For It To Timeout");
      return;
    }
    if (target.getDynamicProperty("tpa") != "") {
      requester.sendMessage("\xA7cCannot Send Warp Requests While Target Still Has One Pending. Please Wait 30 Seconds For It To Timeout");
      return;
    }
    requester.sendMessage("\xA7aTP Request Sent");
    target.sendMessage(`\xA7b${requester.name} Sent You A TP Request`);
    requester.setDynamicProperty("tpr", target.name);
    target.setDynamicProperty("tpa", requester.name);
    tprTimeout(requester, target);
  });
}
function tpa(accepter, i) {
  if (!i) {
    i = 0;
  }
  let players = world.getAllPlayers();
  let playerNames = players.map((p) => p.name);
  let tpaMenu = new ModalFormData().title("\xA7aAccept warp from player:\xA7r").dropdown("Player", playerNames, 0).show(accepter).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason.UserBusy && i != void 0) {
      system2.runTimeout(() => {
        if (i < 5) {
          accepter.sendMessage(`Close Chat Within ${5 - i} Seconds To Open TPA Menu`);
          i++;
          tpa(accepter, i);
        }
      }, 20);
      return;
    }
    let selection = res.formValues[0];
    let target = players[selection];
    if (accepter.getDynamicProperty("tpa") == "") {
      accepter.sendMessage("\xA7cYou Have No Pending Requests");
      return;
    }
    if (target.getDynamicProperty("tpr") == "") {
      accepter.sendMessage("\xA7cThis Player Has Not Requested To Warp To You");
      return;
    }
    if (target.getDynamicProperty("tpr") == accepter.name && accepter.getDynamicProperty("tpa") == target.name) {
      target.setDynamicProperty("tpr", "");
      accepter.setDynamicProperty("tpa", "");
      target.teleport({ x: accepter.location.x, y: accepter.location.y, z: accepter.location.z }, { dimension: accepter.dimension });
    }
  });
}
function tprTimeout(player, target) {
  system2.runTimeout(() => {
    player.sendMessage("\xA7cYour Warp Request Timed Out");
    player.setDynamicProperty("tpr", "");
    target.sendMessage(`\xA7c${player.name}'s Warp Request Timed Out`);
    target.setDynamicProperty("tpa", "");
  }, 600);
}

// scripts/chatCommands/commands/moneyTransfer.ts
import { system as system3, world as world3 } from "@minecraft/server";
import { FormCancelationReason as FormCancelationReason2, ModalFormData as ModalFormData2 } from "@minecraft/server-ui";

// scripts/helperFunctions/getScore.ts
import { world as world2 } from "@minecraft/server";
function getScore(entity, score) {
  return world2.scoreboard.getObjective(score)?.getScore(entity);
}
function setScore(entity, score, amount) {
  world2.scoreboard.getObjective(score)?.setScore(entity, amount);
}
function addScore(entity, score, amount) {
  world2.scoreboard.getObjective(score)?.addScore(entity, amount);
}
function removeScore(entity, score, amount) {
  world2.scoreboard.getObjective(score)?.addScore(entity, amount * -1);
}

// scripts/chatCommands/commands/moneyTransfer.ts
function moneyTransfer(player, isChat, i) {
  if (isChat) {
    i = 0;
  }
  let players = world3.getAllPlayers();
  let playerNames = players.map((p) => p.name);
  let moneyTransferMenu = new ModalFormData2().title("\xA7cMoney Transfer Menu").textField("Amount To Send", "0", "0").dropdown("Player To Send To", playerNames, 0).show(player).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason2.UserBusy && i != void 0) {
      system3.runTimeout(() => {
        if (i < 5) {
          player.sendMessage(`\xA73Close chat to view GUI`);
          i++;
          moneyTransfer(player, false, i);
        }
      }, 20);
      return;
    }
    let amount = parseInt(res.formValues[0]);
    if (isNaN(amount) || amount <= 0 || amount >= 1e9) {
      player.sendMessage("\xA7cPlease Enter A Valid Number Between 1 and 1,000,000,000");
      return;
    }
    if (getScore(player, "money") <= amount) {
      player.sendMessage("\xA7cYou Dont Have Enough Money For That");
      return;
    }
    let target = players[res.formValues[1]];
    player.sendMessage(`\xA7fYou Sent \xA7a$${amount} \xA7fTo \xA7e${target.name}`);
    target.sendMessage(`\xA7e${player.name} \xA7fSent \xA7a$${amount} \xA7fTo You`);
    target.runCommand(`summon fireworks_rocket`);
    removeScore(player, "money", amount);
    addScore(target, "money", amount);
  });
}

// scripts/chatCommands/commands/warp.ts
import { world as world6, system as system6, MinecraftDimensionTypes } from "@minecraft/server";

// scripts/guiPages/warps.ts
import { world as world5, system as system5 } from "@minecraft/server";
import { ActionFormData as ActionFormData2, FormCancelationReason as FormCancelationReason3, ModalFormData as ModalFormData3 } from "@minecraft/server-ui";

// scripts/helperFunctions/randomTP.ts
import { BlockTypes, system as system4, world as world4 } from "@minecraft/server";
var teleportingPlayers = /* @__PURE__ */ new Map();
function startWildTeleport(player) {
  let countdown2 = 3;
  const countdownInterval = system4.runInterval(() => {
    if (isMoving(player)) {
      system4.clearRun(countdownInterval);
      cancelTeleport(player, "movement");
      return;
    }
    if (countdown2 > 0) {
      player.playSound("random.click");
      countdown2--;
    } else {
      system4.clearRun(countdownInterval);
      system4.runTimeout(() => {
        wildTeleport(player);
        teleportingPlayers.delete(player.id);
      }, 10);
    }
  }, 20);
}
var isMoving = (player) => {
  const { x, y, z } = player.getVelocity();
  return x !== 0 || y !== 0 || z !== 0;
};
function cancelTeleport(player, reason) {
  system4.run(() => {
    teleportingPlayers.delete(player.id);
    player.playSound("note.bass");
    player.sendMessage(`\xA7cTeleportation has been cancelled due to ${reason}!`);
  });
}
var INVALID_BLOCKS = [
  BlockTypes.get("minecraft:water"),
  BlockTypes.get("minecraft:lava"),
  BlockTypes.get("minecraft:cactus"),
  BlockTypes.get("minecraft:fire"),
  BlockTypes.get("minecraft:gravel"),
  BlockTypes.get("minecraft:granite"),
  BlockTypes.get("minecraft:sand"),
  BlockTypes.get("minecraft:seagrass")
];
function wildTeleport(player) {
  const playerId = player.id;
  system4.run(() => {
    if (!isPlayerOnline(playerId))
      return;
    const spreadLocations = [
      [-3e3, 3e3],
      [-3e3, -3e3],
      [3e3, -3e3],
      [3e3, 3e3]
    ];
    const [x, z] = spreadLocations[Math.floor(Math.random() * spreadLocations.length)];
    player.runCommand(`spreadplayers ${x} ${z} 1 2000 @s`);
    player?.addEffect("slow_falling", 500, { amplifier: 255, showParticles: false });
    player?.addEffect("blindness", 500, { amplifier: 255, showParticles: false });
    player?.addTag("onWildTeleportation");
    const blockCheck = system4.runInterval(() => {
      if (!isPlayerOnline(playerId)) {
        system4.clearRun(blockCheck);
        teleportingPlayers.delete(playerId);
        return;
      }
      const belowBlock = player.dimension.getBlockFromRay(player.location, { x: 0, y: -1, z: 0 });
      if (belowBlock && belowBlock.block) {
        const blockType = belowBlock.block.type;
        if (!INVALID_BLOCKS.includes(blockType)) {
          const aboveBlock = belowBlock.block.above();
          if (aboveBlock) {
            player.teleport({ x: aboveBlock.x + 0.5, y: aboveBlock.y, z: aboveBlock.z + 0.5 }, { dimension: player.dimension, keepVelocity: false });
            player?.removeEffect("slow_falling");
            player?.removeEffect("blindness");
            player?.removeTag("onWildTeleportation");
            system4.clearRun(blockCheck);
            teleportingPlayers.delete(playerId);
            player?.sendMessage("\xA7aYou have been safely teleported to a random location!");
          } else {
          }
        } else {
          const [newX, newZ] = spreadLocations[Math.floor(Math.random() * spreadLocations.length)];
          player.runCommand(`spreadplayers ${newX} ${newZ} 1 2000 @s`);
        }
      } else {
      }
    }, 5);
    teleportingPlayers.set(playerId, { intervalId: blockCheck });
  });
}
function isPlayerOnline(playerId) {
  return world4.getAllPlayers().some((p) => p.id === playerId);
}

// scripts/guiPages/warps.ts
var overworld = world5.getDimension("minecraft:overworld");
function warpMenu(player, chat, i) {
  if (chat) {
    i = 0;
  }
  let warpMenuForm = new ActionFormData2().title("\xA76Warp Menu").button(`\xA7l\xA73Spawn\xA7r
\xA78[ \xA7fWarp to the lobby \xA78]\xA7r`, "textures/items/nether_star.png").button("\xA7l\xA72Freeplay\xA7r\n\xA78[ \xA7fWarp to wild \xA78]\xA7r", "textures/items/emerald.png").button("\xA7l\xA79Discord Vault\xA7r\n\xA78[ \xA7fClaim your Discord Kit \xA78]\xA7r", "textures/items/iron_sword.png").button("\xA7l\xA76Nether TP\xA7r\n\xA78[ \xA7fWarp to the Nether \xA78]\xA7r", "textures/items/blaze_rod.png").button("\xA7l\xA7dEnd TP\xA7r\n\xA78[ \xA7fWarp to the End \xA78]\xA7r", "textures/items/ender_pearl.png").button("\xA7l\xA7cClose Menu\xA7r\n\xA78[ \xA7fExit the GUI \xA78]\xA7r", "textures/blocks/barrier").show(player).then((res) => {
    if (res.cancelationReason == FormCancelationReason3.UserBusy) {
      system5.runTimeout(() => {
        if (i < 5) {
          player.sendMessage(`\xA73Close Chat Within \xA7e${5 - i} \xA73Seconds To Open Menu`);
          i++;
          warpMenu(player, false, i);
        }
      }, 20);
      return;
    }
    let sel = res.selection;
    switch (sel) {
      case 0:
        playSoundTo(player, "RandomPop");
        player.teleport({ x: 19974, y: 146, z: 19842 }, { dimension: overworld });
        break;
      case 1:
        playSoundTo(player, "RandomPop");
        freePlayForm(player);
        break;
      case 2:
        playSoundTo(player, "RandomPop");
        discordKitForm(player);
        break;
      case 3:
        playSoundTo(player, "RandomPop");
        player.teleport({ x: 55, y: 38, z: 108 }, { dimension: world5.getDimension("minecraft:nether") });
        break;
      case 4:
        playSoundTo(player, "RandomPop");
        player.teleport({ x: 10, y: 64, z: 10 }, { dimension: world5.getDimension("minecraft:the_end") });
        break;
    }
  });
}
function freePlayForm(player) {
  let freePlayOptions = new ActionFormData2().title("\xA7aOpen world menu").body("\xA7fSelect the option that seems authentic to you!").button("\xA7l\xA72Freeplay\xA7r\n\xA78[ \xA7fWild with KOTH\n(the normal Experience) \xA78]", "textures/gui/menu/freeplay").button("\xA7l\xA72RTP\xA7r\n\xA78[ \xA7fTP to a random location \xA78]", "textures/gui/menu/RTP").button("\xA7l\xA7cClose Menu\xA7r\n\xA78[ \xA7fExit the GUI \xA78]\xA7r", "textures/blocks/barrier").show(player).then((res) => {
    if (res.selection == 0) {
      playSoundTo(player, "RandomPop");
      player.teleport({ x: 380, y: 117, z: 935 }, { dimension: overworld });
    }
    if (res.selection == 1) {
      playSoundTo(player, "RandomPop");
      player.sendMessage("\xA7aCrab-Engine is generating a random location... Please wait");
      startWildTeleport(player);
    }
  });
}
function discordKitForm(player, isChat, i) {
  if (isChat) {
    i = 0;
  }
  let discordForm = new ActionFormData2().title("\xA79Discord Menu").body("Select an option below:\n\xA79discord.gg/dmcE6B7sRX").button("\xA7l\xA79Warp\xA7r\n\xA78[ \xA7fWarp to Discord vault \xA78]\xA7r", "textures/gui/menu/vault").button("\xA7l\xA79Enter code\xA7r\n\xA78[ \xA7fEnter code manually \xA78]\xA7r", "textures/gui/menu/discord").button("\xA7l\xA7cClose Menu\xA7r\n\xA78[ \xA7fExit the GUI \xA78]", "textures/blocks/barrier").show(player).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason3.UserBusy && i != void 0) {
      system5.runTimeout(() => {
        if (i < 5) {
          player.sendMessage(`Close Chat Within ${5 - i} Seconds To Open Menu`);
          i++;
          discordKitForm(player, false, i);
        }
      }, 20);
      return;
    }
    if (res.selection == 0) {
      playSoundTo(player, "RandomPop");
      player.teleport({ x: 19926, y: 67, z: 19846 }, { dimension: overworld });
    }
    if (res.selection == 1) {
      playSoundTo(player, "RandomPop");
      discordClaim(player);
    }
  });
}
function discordClaim(player) {
  if (player.hasTag("discordKit")) {
    player.sendMessage("\xA7cYou Have Already Claimed The Discord Kit");
    return;
  }
  let codeForm = new ModalFormData3().title("\xA79Discord Menu").textField("Enter Code From Discord Here", "000", "").show(player).then((res) => {
    let code = res.formValues[0];
    if (code == "483") {
      world5.sendMessage(`\xA79${player.name} Claimed Their Discord Kit`);
      world5.structureManager.place("mystructure:discordkit", player.dimension, { x: player.location.x, y: player.location.y, z: player.location.z });
      player.addTag("discordKit");
    } else {
      player.sendMessage("\xA7cThat Is The Wrong Code, Try Again");
    }
  });
}

// scripts/chatCommands/commands/warp.ts
var overworld2 = world6.getDimension("minecraft:overworld");
function warpCommand(message, player) {
  const args = message.split(" ");
  console.warn(args[1]);
  if (args.length == 1) {
    system6.run(() => {
      warpMenu(player, true);
    });
  } else {
    system6.run(() => {
      switch (args[1]) {
        case "spawn":
          player.teleport({ x: 19918, y: 134, z: 19842 }, { dimension: overworld2 });
          break;
        case "wild":
          player.teleport({ x: 380, y: 117, z: 935 }, { dimension: overworld2 });
          break;
        case "discord":
          player.teleport({ x: 19926, y: 67, z: 19846 }, { dimension: overworld2 });
          break;
        case "nether":
          player.teleport({ x: 55, y: 38, z: 108 }, { dimension: world6.getDimension(MinecraftDimensionTypes.nether) });
          break;
        case "end":
          player.teleport({ x: 10, y: 64, z: 10 }, { dimension: world6.getDimension(MinecraftDimensionTypes.theEnd) });
          break;
        default:
          player.sendMessage("\xA7cUnknown Warp Location");
          break;
      }
    });
  }
}

// scripts/guiPages/marketSelectPage.ts
import { world as world7, system as system7 } from "@minecraft/server";
import { ActionFormData as ActionFormData4, FormCancelationReason as FormCancelationReason4 } from "@minecraft/server-ui";

// scripts/guiPages/sellPage.ts
import { ActionFormData as ActionFormData3 } from "@minecraft/server-ui";

// scripts/sell/sellCommand.ts
import { EntityComponentTypes } from "@minecraft/server";

// scripts/sell/prices.ts
var prices = [
  { name: "minecraft:melon_block", price: 5 },
  { name: "minecraft:pumpkin", price: 50 },
  { name: "minecraft:wheat", price: 30 },
  { name: "minecraft:carrot", price: 10 },
  { name: "minecraft:potato", price: 10 },
  { name: "minecraft:sugar_cane", price: 15 },
  { name: "minecraft:cod", price: 10 },
  { name: "minecraft:salmon", price: 10 },
  { name: "minecraft:cooked_cod", price: 20 },
  { name: "minecraft:cooked_salmon", price: 20 },
  { name: "minecraft:pufferfish", price: 10 },
  { name: "minecraft:tropical_fish", price: 10 },
  { name: "minecraft:nautilus_shell", price: 15 },
  { name: "minecraft:leather", price: 15 },
  { name: "minecraft:coal", price: 15 },
  { name: "minecraft:lapis_lazuli", price: 25 },
  { name: "minecraft:iron_ingot", price: 40 },
  { name: "minecraft:gold_ingot", price: 75 },
  { name: "minecraft:diamond", price: 150 },
  { name: "minecraft:netherite_ingot", price: 400 },
  { name: "minecraft:quartz", price: 15 },
  { name: "minecraft:redstone", price: 15 },
  { name: "minecraft:emerald", price: 100 },
  { name: "minecraft:amethyst_shard", price: 30 },
  { name: "minecraft:glowstone_dust", price: 15 },
  { name: "minecraft:obsidian", price: 50 },
  { name: "minecraft:blaze_rod", price: 40 },
  { name: "minecraft:ghast_tear", price: 150 },
  { name: "minecraft:shulker_shell", price: 200 },
  { name: "minecraft:nether_star", price: 1e3 },
  { name: "minecraft:phantom_membrane", price: 25 },
  { name: "minecraft:slime_ball", price: 15 },
  { name: "minecraft:honey_bottle", price: 20 },
  { name: "minecraft:iron_nugget", price: 5 },
  { name: "minecraft:gold_nugget", price: 5 }
];

// scripts/sell/sellCommand.ts
function sell(player) {
  let inventory = player.getComponent(EntityComponentTypes.Inventory);
  let totalMade = 0;
  for (let slot = 0; slot <= inventory.container?.size; slot++) {
    let itemName = inventory.container?.getItem(slot);
    if (itemName != void 0) {
      const name = itemName.typeId;
      const amount = itemName.amount;
      prices.forEach((price) => {
        if (name == price.name) {
          addScore(player, price.name, amount);
          totalMade += amount * price.price;
          inventory.container?.setItem(slot, void 0);
        }
      });
    }
    if (slot == 35) {
      player.sendMessage(`\xA7fYou sold items and earned \xA7a$${totalMade}`);
      player.runCommand(`summon fireworks_rocket`);
      addScore(player, CRABENGINEGLOBALCONFIG.SCORES.money, totalMade);
      return;
    }
  }
}

// scripts/guiPages/sellPage.ts
function sellPage(player) {
  let selling = new ActionFormData3().title("\xA7eSelling").body(`\xA7l\xA7fHere is a full list of what you can sell to get money.

  
\xA7eMelon Block \xA7f\u2013 \xA7a$5/each \xA78\u2502\u2502 \xA7eSugarcane \xA7f\u2013 \xA7a$15/each
  
\xA7ePumpkin \xA7f\u2013 \xA7a$50/each \xA78\u2502\u2502 \xA7eWheat \xA7f\u2013 \xA7a$30/each
  
\xA7eCarrot \xA7f\u2013 \xA7a$10/each \xA78\u2502\u2502 \xA7ePotato \xA7f\u2013 \xA7a$10/each
  
\xA7eRaw Cod \xA7f\u2013 \xA7a$10/each \xA78\u2502\u2502 \xA7eRaw Salmon \xA7f\u2013 \xA7a$10/each
  
\xA7eCooked Cod \xA7f\u2013 \xA7a$20/each \xA78\u2502\u2502 \xA7eCooked Salmon \xA7f\u2013 \xA7a$20/each
  
\xA7ePufferfish \xA7f\u2013 \xA7a$10/each \xA78\u2502\u2502 \xA7eTropical Fish \xA7f\u2013 \xA7a$10/each
  
\xA7eNautilus Shell \xA7f\u2013 \xA7a$15/each \xA78\u2502\u2502 \xA7eLeather \xA7f\u2013 \xA7a$15/each
  
\xA7eCoal \xA7f\u2013 \xA7a$15/each \xA78\u2502\u2502 \xA7eLapis Lazuli \xA7f\u2013 \xA7a$25/each
  
\xA7eIron Ingot \xA7f\u2013 \xA7a$40/each \xA78\u2502\u2502 \xA7eGold Ingot \xA7f\u2013 \xA7a$75/each
  
\xA7eDiamond \xA7f\u2013 \xA7a$150/each \xA78\u2502\u2502 \xA7eNetherite Ingot \xA7f\u2013 \xA7a$400/each
  
\xA7eQuartz \xA7f\u2013 \xA7a$15/each \xA78\u2502\u2502 \xA7eRedstone Dust \xA7f\u2013 \xA7a$15/each
  
\xA7eEmerald \xA7f\u2013 \xA7a$100/each \xA78\u2502\u2502 \xA7eAmethyst Shard \xA7f\u2013 \xA7a$30/each
  
\xA7eGlowstone Dust \xA7f\u2013 \xA7a$15/each \xA78\u2502\u2502 \xA7eObsidian \xA7f\u2013 \xA7a$50/each
  
\xA7eEnder Pearl \xA7f\u2013 \xA7a$25/each \xA78\u2502\u2502 \xA7eBlaze Rod \xA7f\u2013 \xA7a$40/each
  
\xA7eGhast Tear \xA7f\u2013 \xA7a$150/each \xA78\u2502\u2502 \xA7eShulker Shell \xA7f\u2013 \xA7a$200/each
  
\xA7eNether Star \xA7f\u2013 \xA7a$1000/each \xA78\u2502\u2502 \xA7ePhantom Membrane \xA7f\u2013 \xA7a$25/each
  
\xA7eSlime Ball \xA7f\u2013 \xA7a$15/each \xA78\u2502\u2502 \xA7eHoney Bottle \xA7f\u2013 \xA7a$20/each
  
\xA7eIron Nugget \xA7f\u2013 \xA7a$5/each \xA78\u2502\u2502 \xA7eGold Nugget \xA7f\u2013 \xA7a$5/each

  
  \xA7cSCROLL UP TO VIEW ALL SELL LISTINGS.`).button("\xA7aSell Items\n\xA78[ \xA7fClick to confirm \xA78]", "textures/ui/back_button_default.png").button("\xA7cClose Menu\n\xA78[ \xA7fExit the GUI \xA78]", "textures/blocks/barrier").show(player).then((res) => {
    if (res.selection == 0) {
      playSoundTo(player, "RandomPop");
      sell(player);
    }
  });
}

// scripts/guiPages/marketSelectPage.ts
function marketplaceSelect(player, isChat, i) {
  if (isChat) {
    i = 0;
  }
  let marketplaceForm = new ActionFormData4().title("\xA7eMarketplace Menu\xA7r").body("\xA76PLEASE READ: \xA77The 'CrabSMP Marketplace' is strictly Non Pay-To-Win (P2W). Players selling items for realm currencies will be \xA7cpermanently banned\xA77, along with the \xA7cother party involved \xA77in the transaction.\n\n\xA77However, if you wish to donate ->\n\xA7dhttps://paypal.me/ozorical\n ").button("\xA7l\xA7cSell Items\xA7r\n\xA78[ \xA7fEarn Money \xA78]", "textures/gui/menu/sell_items").button("\xA7l\xA7cWarp To Shop\xA7r\n\xA78[ \xA7fBuy goodies \xA78]", "textures/gui/menu/market").button("\xA7l\xA7cClose Menu\xA7r\n\xA78[ \xA7fExit the GUI \xA78]", "textures/blocks/barrier").show(player).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason4.UserBusy) {
      system7.runTimeout(() => {
        if (i < 5) {
          player.sendMessage(`\xA73Close Chat Within \xA7e${5 - i} \xA73Seconds To Open Menu`);
          i++;
          marketplaceSelect(player, false, i);
        }
      }, 20);
    }
    if (res.selection == 0) {
      playSoundTo(player, "RandomPop");
      sellPage(player);
    }
    if (res.selection == 1) {
      playSoundTo(player, "RandomPop");
      player.teleport({ x: 19980, y: 132, z: 20276 }, { dimension: world7.getDimension("minecraft:overworld") });
    }
    if (res.selection == 2) {
      playSoundTo(player, "RandomPop");
    }
  });
}

// scripts/clans/clanSetup.ts
import { system as system9, world as world13 } from "@minecraft/server";
import { ActionFormData as ActionFormData6, FormCancelationReason as FormCancelationReason5 } from "@minecraft/server-ui";

// scripts/clans/clanFunctions/addMember.ts
import { system as system8, world as world8 } from "@minecraft/server";
import { ModalFormData as ModalFormData4 } from "@minecraft/server-ui";

// scripts/clans/clanFunctions/getClan.ts
function getClan(player) {
  if (getScore(player, "clanID") == 0) {
    return void 0;
  }
  let clan = clansDBNew.get(`clan:${getScore(player, "clanID")}`);
  return clan;
}

// scripts/clans/clanFunctions/addMember.ts
function clanAdd(inviter) {
  let clanID = getScore(inviter, "clanID");
  let players = world8.getAllPlayers();
  let playerNames = players.map((p) => p.name);
  let playerList = new ModalFormData4().title("\xA7cSelect Player To Invite").dropdown("Player", playerNames, 0).show(inviter).then((res) => {
    let target = players[res.formValues[0]];
    let clan = getClan(inviter);
    let inviterData = clan?.find((clanData) => clanData.member == inviter.name);
    if (clanID == getScore(target, "clanID")) {
      inviter.sendMessage(`\xA7cCannot Send Invite -> Already A Clan Member`);
      return;
    }
    if (inviterData?.permission == "member") {
      inviter.sendMessage(`\xA7cCannot Send Invite -> Insufficient Permission Level`);
      return;
    }
    if (inviter.getDynamicProperty("invite") != "") {
      inviter.sendMessage(`\xA7cCannot Send Invites While One Is Pending -> Please Wait 30 Seconds For It To Expire`);
      return;
    }
    if (target.getDynamicProperty("inviteAccept") != "") {
      target.sendMessage(`\xA7cCannot Send Invites To Players WIth Ones Pending -> Please Wait And Try Again`);
      return;
    }
    inviter.sendMessage(`\xA7aInvite Sent To \xA7b${target.name}`);
    target.sendMessage(`\xA7a\xA7b${inviter.name} \xA7eInvited You To Their Clan`);
    inviter.setDynamicProperty("invite", target.name);
    target.setDynamicProperty("inviteAccept", inviter.name);
    inviteTimeout(inviter, target);
  });
}
function inviteAccept(accepter) {
  let players = world8.getAllPlayers();
  let playerNames = players.map((p) => p.name);
  let tpaMenu = new ModalFormData4().title("\xA7aAccept Clan Invite From Player\xA7r").dropdown("Player", playerNames, 0).show(accepter).then((res) => {
    let selection = res.formValues[0];
    let target = players[selection];
    if (getScore(accepter, "clanID") != 0) {
      accepter.sendMessage(`\xA7cCannot Join A Clan Whilst Already In One`);
      return;
    }
    if (accepter.getDynamicProperty("inviteAccept") == "") {
      accepter.sendMessage("\xA7cYou Have No Pending Invites");
      return;
    }
    if (target.getDynamicProperty("invite") == "") {
      accepter.sendMessage("\xA7cThis Player Has Not Invited You To Their Clan");
      return;
    }
    if (target.getDynamicProperty("invite") == accepter.name && accepter.getDynamicProperty("inviteAccept") == target.name) {
      target.setDynamicProperty("invite", "");
      accepter.setDynamicProperty("inviteAccept", "");
      let clanInfo = getClan(target);
      let clanID = getScore(target, "clanID");
      clanInfo?.push({
        clanName: clanInfo[0].clanName,
        member: accepter.name,
        permission: "member"
      });
      let info = JSON.stringify(clanInfo);
      clansDBNew.set(`clan:${clanID}`, clanInfo);
      console.warn(JSON.stringify(clanInfo), clanID);
      setScore(accepter, "clanID", clanID);
      world8.sendMessage(`\xA7b${accepter.name}\xA7e Joined \xA7a ${target.name}'s\xA7e Clan`);
    }
  });
}
function inviteTimeout(player, target) {
  system8.runTimeout(() => {
    player.sendMessage("\xA7cYour Clan Invite Expired");
    player.setDynamicProperty("invite", "");
    target.sendMessage(`\xA7c${player.name}'s Clan Invite Timed Out`);
    target.setDynamicProperty("inviteAccept", "");
  }, 600);
}
world8.getAllPlayers().forEach((player) => {
  player.setDynamicProperty("invite", "");
  player.setDynamicProperty("inviteAccept", "");
});

// scripts/clans/clanFunctions/clanCreate.ts
import { world as world9 } from "@minecraft/server";
import { ModalFormData as ModalFormData5 } from "@minecraft/server-ui";
var clanColours = ["\xA71", "\xA72", "\xA73", "\xA74", "\xA75", "\xA76", "\xA77", "\xA78", "\xA79", "\xA7a", "\xA7b", "\xA7c", "\xA7d", "\xA7e", "\xA7f", "\xA7g"];
var clanColoursList = ["\xA71Dark Blue", "\xA72Dark Green", "\xA73Dark Aqua", "\xA74Dark Red", "\xA75Dark Purple", "\xA76Gold", "\xA77Grey", "\xA78Dark Grey", "\xA79Blue", "\xA7aGreen", "\xA7bAqua", "\xA7cRed", "\xA7dLight Purple", "\xA7eYellow", "\xA7fWhite", "\xA7gMinecon Gold"];
function createClan(player) {
  console.warn(player.name, getScore(player, "clanID"));
  if (getScore(player, "clanID") != 0) {
    player.sendMessage("\xA7cYou Are Already In A Clan. Leave It First To Create A New One.");
    return;
  }
  let clanCreationForm = new ModalFormData5().title("\xA7l\xA7cClan Creator").textField("Clan Name", `clan${getScore("clan", "clanID")}`).dropdown("Clan Colour", clanColoursList).show(player).then((res) => {
    let name = res.formValues[0];
    let colorIndex = res.formValues[1];
    if (name.length > 15) {
      player.sendMessage("\xA7cClan Names Cannot Be More Than 15 Characters Long");
      return;
    }
    let selectedColor = clanColours[colorIndex];
    let coloredClanName = `${selectedColor}${name}`;
    let clanBuilder = [
      {
        member: player.name,
        permission: "owner",
        clanName: coloredClanName
      }
    ];
    let clanID = getScore("clan", "clanID");
    setScore(player, "clanID", clanID);
    addScore("clan", "clanID", 1);
    world9.sendMessage(`\xA7b${player.name} \xA7aCreated A Clan Called ${coloredClanName}`);
    clansDBNew.set(`clan:${clanID}`, clanBuilder);
    clanBanksDB.set(`clan:${clanID}`, 0);
  });
}

// scripts/clans/clanFunctions/removeMember.ts
import { world as world10 } from "@minecraft/server";
import { ModalFormData as ModalFormData6 } from "@minecraft/server-ui";
function removeMember(player) {
  console.warn("1");
  let clan = getClan(player);
  let clanID = getScore(player, "clanID");
  let clanPlayers = clan?.map((value) => value.member);
  console.warn("3");
  console.warn("e", JSON.stringify(clansDBNew.get(`clan:${clanID}`)));
  console.warn("4");
  let playerList = new ModalFormData6().title("\xA7cSelect Player To Kick").dropdown("Player", clanPlayers, 0).show(player).then((res) => {
    let name = clanPlayers[res.formValues[0]];
    let target = world10.getPlayers({ name })[0];
    let playersClanData = clan?.find((data) => data.member == player.name);
    let afterRemoveClan = clan?.filter((data) => data.member != name);
    let targetClanData = clan?.find((data) => data.member == name);
    if ((targetClanData?.permission == "admin" || targetClanData?.permission == "owner") && playersClanData?.permission != "owner") {
      player.sendMessage("\xA7cYou Do Not Have Permission To Kick Players Of This Permission Level");
      return;
    }
    if (playersClanData?.permission == "member" || playersClanData?.permission == "inviter") {
      player.sendMessage("\xA7cYou Do Not Have Permission To Kick Players");
      return;
    }
    if (target == void 0) {
      let kickPlayersList = clansKicksDBNew.get("kicks");
      kickPlayersList.push(name);
      clansKicksDBNew.set(`kicks`, kickPlayersList);
      clansDBNew.set(`clan:${clanID}`, afterRemoveClan);
      world10.sendMessage(`\xA7e${player.name} \xA7cKicked \xA7e${name}\xA7c From Their Clan`);
    } else {
      setScore(target, "clanID", 0);
      clansDBNew.set(`clan:${clanID}`, afterRemoveClan);
      console.warn("ea", JSON.stringify(clansDBNew.get(`clan:${clanID}`)));
      target.sendMessage("\xA7cYou Were Kicked From Your Clan");
    }
  });
}
function poorGuyGotKickedOutOfHisClanWhenHeWasOffline(player) {
  let kickList = JSON.parse(clansKicksDBNew.get("kicks"));
  let playerFiltered = kickList.filter((name) => name == player.name);
  if (playerFiltered.length != 0) {
    setScore(player, "clanID", 0);
    player.sendMessage("\xA7cYou Were Kicked From Your Clan");
    let newKickList = kickList.filter((name) => name != player.name);
    clansKicksDBNew.set("kicks", newKickList);
  }
}

// scripts/database/Database.ts
import { world as world11 } from "@minecraft/server";
var Database = class {
  /**
   * Creates a new instance of the Database
   * @param tableName - The name of the table
   */
  constructor(tableName) {
    this.tableName = tableName;
    this.tableName = tableName;
    this.MEMORY = null;
    this.QUEUE = [];
    const LOADED_DATA = this.fetch();
    this.MEMORY = LOADED_DATA;
    this.onLoadCallback?.(LOADED_DATA);
    this.QUEUE.forEach((v) => v());
  }
  /**
   * Resets this databases key length
   * and resets all corresponding ids.
   */
  resetStorage() {
    const ids = world11.getDynamicPropertyIds().filter((i) => i.startsWith(`db_${this.tableName}`));
    for (const id of ids) {
      world11.setDynamicProperty(id, void 0);
    }
    world11.setDynamicProperty(`db_${this.tableName}`, 0);
  }
  /**
   * Fetches this data from the dynamic properties
   * associated with this database
   * @returns
   */
  fetch() {
    let idLength = world11.getDynamicProperty(`db_${this.tableName}`) ?? 0;
    if (typeof idLength != "number") {
      console.warn(`[DATABASE]: DB: ${this.tableName}, has improper setup! Resetting data.`);
      idLength = 0;
      this.resetStorage();
    }
    if (idLength <= 0)
      return {};
    let collectedData = "";
    for (let i = 0; i < idLength; i++) {
      const data = world11.getDynamicProperty(`db_${this.tableName}_${i}`);
      if (typeof data != "string") {
        console.warn(`[DATABASE]: When fetching: db_${this.tableName}_${i}, improper data was found.`);
        this.resetStorage();
        return {};
      }
      collectedData += data;
    }
    return JSON.parse(collectedData);
  }
  /**
   * Adds a queue task to be awaited
   * @returns once its this items time to run in queue
   */
  async addQueueTask() {
    return new Promise((resolve) => {
      this.QUEUE.push(resolve);
    });
  }
  /**
   * Saves data into this database
   * @returns once data is saved to the database entities
   */
  async saveData() {
    if (!this.MEMORY)
      await this.addQueueTask();
    const chunks = JSON.stringify(this.MEMORY).match(/.{1,8000}/g);
    if (!chunks)
      return;
    world11.setDynamicProperty(`db_${this.tableName}`, chunks.length);
    const entries = chunks.entries();
    for (const [i, chunk] of entries) {
      world11.setDynamicProperty(`db_${this.tableName}_${i}`, chunk);
    }
  }
  /**
   * Sends a callback once this database has initiated data
   * @param callback
   */
  async onLoad(callback) {
    if (this.MEMORY)
      return callback(this.MEMORY);
    this.onLoadCallback = callback;
  }
  /**
   * Sets the specified `key` to the given `value` in the database table.
   * @param key - Key to store the value in.
   * @param value - The value to store for the specified key.
   * @returns A promise that resolves once the value has been saved in the database table.
   */
  async set(key, value) {
    if (!this.MEMORY)
      throw new Error("Data tried to be set before load!");
    this.MEMORY[key] = value;
    return this.saveData();
  }
  /**
   * Gets a value from this table
   * @param {Key} key - The key to retrieve the value for.
   * @returns the value associated with the given key in the database table.
   */
  get(key) {
    if (!this.MEMORY)
      throw new Error("Data not loaded! Consider using `getAsync` instead!");
    return this.MEMORY[key];
  }
  /**
   * Gets a value asynchronously from the database table.
   * @param {Key} key - The key to retrieve the value for.
   * @returns {Promise<T>} A Promise that resolves to the value associated with the given key in the database table.
   */
  async getSync(key) {
    if (this.MEMORY)
      return this.get(key);
    await this.addQueueTask();
    if (!this.MEMORY)
      return null;
    return this.MEMORY[key];
  }
  /**
   * Get all the keys in the table
   * @returns {string[]} the keys on this table
   */
  keys() {
    if (!this.MEMORY)
      throw new Error("Data not loaded! Consider using `keysSync` instead!");
    return Object.keys(this.MEMORY);
  }
  /**
   * Get all the keys in the table async, this should be used on world load
   * @returns {Promise<string[]>} the keys on this table
   */
  async keysSync() {
    if (this.MEMORY)
      return this.keys();
    await this.addQueueTask();
    if (!this.MEMORY)
      return [];
    return Object.keys(this.MEMORY);
  }
  /**
   * Get all the values in the table
   * @returns {T[]} values in this table
   */
  values() {
    if (!this.MEMORY)
      throw new Error("Data not loaded! Consider using `valuesSync` instead!");
    return Object.values(this.MEMORY);
  }
  /**
   * Get all the values in the table async, this should be used on world load
   * @returns {Promise<T[]>} the values on this table
   */
  async valuesSync() {
    if (this.MEMORY)
      return this.values();
    await this.addQueueTask();
    if (!this.MEMORY)
      return [];
    return Object.values(this.MEMORY);
  }
  /**
   * Check if the key exists in the table
   * @param {string} key the key to test
   * @returns {boolean} if this key exists on this table
   */
  has(key) {
    if (!this.MEMORY)
      throw new Error("Data not loaded! Consider using `hasSync` instead!");
    return Boolean(this.MEMORY[key]);
  }
  /**
   * Check if the key exists in the table async
   * @param {string} key the key to test
   * @returns {Promise<boolean>} if this table contains this key.
   */
  async hasSync(key) {
    if (this.MEMORY)
      return this.has(key);
    await this.addQueueTask();
    if (!this.MEMORY)
      return false;
    return Boolean(this.MEMORY[key]);
  }
  /**
   * Gets all the keys and values
   * @returns The collection data.
   */
  collection() {
    if (!this.MEMORY)
      throw new Error("Data not loaded! Consider using `collectionSync` instead!");
    return this.MEMORY;
  }
  /**
   * Gets all the keys and values async, this should be used for grabbingCollection on world load
   * @returns {Promise<{ [key: string]: T }>} The collection data.
   */
  async collectionSync() {
    if (this.MEMORY)
      return this.collection();
    await this.addQueueTask();
    if (!this.MEMORY)
      return {};
    return this.MEMORY;
  }
  /**
   * Delete a key from this table
   * @param key the key to delete
   * @returns if the deletion was successful
   */
  async delete(key) {
    if (!this.MEMORY)
      return false;
    const status = delete this.MEMORY[key];
    await this.saveData();
    return status;
  }
  /**
   * Clear everything in the table
   * @returns once this table has been cleared
   */
  async clear() {
    this.MEMORY = {};
    return await this.saveData();
  }
  /**
   * Gets a key by value
   * @param value
   * @returns
   */
  getKeyByValue(value) {
    for (const key in this.MEMORY) {
      if (this.MEMORY[key] === value) {
        return key;
      }
    }
    return null;
  }
};

// scripts/clans/clanFunctions/clanBank.ts
import { ActionFormData as ActionFormData5, ModalFormData as ModalFormData7 } from "@minecraft/server-ui";
function clanBankMenu(player) {
  let clanID = getScore(player, "clanID");
  let clanBank = clanBanksDB.get(`clan:${clanID}`);
  let selectAction = new ActionFormData5().title("\xA7cClan Bank").body(`\xA7bCurrent Balance -> \xA7b$\xA7a${clanBank}`).button("\xA7aDeposit Money", "textures/gui/claims/create").button("\xA7cWithdraw Money", "textures/gui/claims/leave").show(player).then((res) => {
    if (res.selection == 0) {
      playSoundTo(player, "RandomPop");
      depositToBank(player, clanID, clanBank);
    } else if (res.selection == 1) {
      playSoundTo(player, "RandomPop");
      withdrawFromBank(player, clanID, clanBank);
    }
  });
}
function depositToBank(player, clanID, currentAmount) {
  let depositForm = new ModalFormData7().title("\xA7cClan Bank").textField("Amount To Deposit", "0").show(player).then((res) => {
    let amount = parseInt(res.formValues[0]);
    if (isNaN(amount) || amount <= 0 || amount >= 1e9) {
      playSoundTo(player, "Error");
      player.sendMessage("\xA7cPlease Enter A Valid Number Between 1 and 1,000,000,000");
      return;
    }
    if (getScore(player, "money") <= amount) {
      playSoundTo(player, "Error");
      player.sendMessage("\xA7cYou Dont Have Enough Money For That");
      return;
    }
    removeScore(player, "money", amount);
    playSoundTo(player, "Success");
    player.sendMessage(`\xA7aYou Deposited \xA7b$\xA7a${amount}`);
    clanBanksDB.set(`clan:${clanID}`, currentAmount + amount);
  });
}
function withdrawFromBank(player, clanID, currentAmount) {
  let withdrawForm = new ModalFormData7().title("\xA7cClan Bank").textField("Amount To Withdraw", "0").show(player).then((res) => {
    let amount = parseInt(res.formValues[0]);
    if (isNaN(amount) || amount <= 0 || amount >= 1e9) {
      playSoundTo(player, "Error");
      player.sendMessage("\xA7cPlease Enter A Valid Number Between 1 and 1,000,000,000");
      return;
    }
    if (currentAmount <= amount) {
      playSoundTo(player, "Error");
      player.sendMessage("\xA7cYou Dont Have Enough Money For That In The Bank");
      return;
    }
    addScore(player, "money", amount);
    playSoundTo(player, "Success");
    player.sendMessage(`\xA7bYou Withdrew \xA7b$\xA7a${amount}`);
    clanBanksDB.set(`clan:${clanID}`, currentAmount - amount);
  });
}

// scripts/clans/clanFunctions/clanPerms.ts
import { world as world12 } from "@minecraft/server";
import { ModalFormData as ModalFormData8 } from "@minecraft/server-ui";
var permLvls = ["Member", "Inviter", "Admin"];
function editMemberPermission(player) {
  let clan = getClan(player);
  let clanID = getScore(player, "clanID");
  let clanPlayers = clan?.map((value) => value.member);
  let playerList = new ModalFormData8().title("\xA7cSelect Player To Manage").dropdown("Player", clanPlayers, 0).dropdown("New Permission Level", permLvls, 0).show(player).then((res) => {
    console.warn(JSON.stringify(res.formValues));
    let name = clanPlayers[res.formValues[0]];
    let permLvl = permLvls[res.formValues[1]];
    let target = world12.getPlayers({ name })[0];
    let playersClanData = clan?.find((data) => data.member == player.name);
    let clansData = clan;
    let targetClanDataIndex = clan?.findIndex((data) => data.member == name);
    let targetClanData = clan?.find((data) => data.member == name);
    if (targetClanData?.permission == "owner") {
      player.sendMessage("\xA7cOwners Permission Levels Cant Be Changed");
      return;
    }
    if ((targetClanData?.permission == "admin" || targetClanData?.permission == "owner") && playersClanData?.permission != "owner") {
      player.sendMessage("\xA7cYou Do Not Have Permission To Edit Players Of This Permission Level");
      return;
    }
    console.warn(playersClanData?.permission);
    if (playersClanData?.permission == "member" || playersClanData?.permission == "inviter") {
      player.sendMessage("\xA7cYou Do Not Have Permission To Edit Players Perms");
      return;
    }
    if (targetClanDataIndex == void 0) {
      player.sendMessage("There Was An Error");
      return;
    }
    clansData[targetClanDataIndex].permission = permLvl.toLowerCase();
    clansDBNew.set(`clan:${clanID}`, clansData);
  });
}

// scripts/clans/clanSetup.ts
var clansDBNew = new Database("clans");
var clansKicksDBNew = new Database("clans");
var clanBanksDB = new Database("banks");
function clanMenu(player, isChat, i) {
  if (isChat) {
    i = 0;
  }
  let clan = getClan(player);
  let clanList = clan?.map((player2) => {
    return `\xA7a${player2.member} \xA7f- \xA7e${player2.permission}`;
  });
  let clanGUI = new ActionFormData6().title("\xA7aClan Menu\xA7r").body(
    `\xA7l\xA7bYour Clan Members\xA7l\xA7r
    ${clanList?.toString().replaceAll(",", "\n")}`
  ).button("\xA7cCreate Clan\n\xA78[ \xA7fCreate a team \xA78]", "textures/gui/claims/create").button("\xA7cAccept Clan Invite\n\xA78[ \xA7fJoin a team \xA78]", "textures/gui/claims/joinClaim").button("\xA7cInvite Player\n\xA78[ \xA7fInvite someone \xA78]", "textures/gui/claims/invite").button("\xA7cClan Bank\n\xA78[ \xA7fManage clan money \xA78]", "textures/gui/claims/bank").button("\xA7cManage Players\n\xA78[ \xA7fManage clan users \xA78]", "textures/gui/claims/stats").button("\xA7cKick Player\n\xA78[ \xA7fKick a player \xA78]", "textures/gui/claims/kickClaim").button("\xA7cLeave Clan\n\xA78[ \xA7fLeave your clan \xA78]", "textures/gui/claims/leave").button("\xA7cClose Menu\n\xA78[ \xA7fExit the GUI \xA78]", "textures/blocks/barrier").show(player).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason5.UserBusy && i != void 0) {
      system9.runTimeout(() => {
        if (i < 5) {
          player.sendMessage(`\xA73Close Chat Within \xA7e${5 - i} \xA73Seconds To Open Menu`);
          i++;
          clanMenu(player, false, i);
        }
      }, 20);
      return;
    }
    switch (res.selection) {
      case 0:
        playSoundTo(player, "RandomPop");
        createClan(player);
        break;
      case 1:
        playSoundTo(player, "RandomPop");
        inviteAccept(player);
        break;
      case 2:
        playSoundTo(player, "RandomPop");
        clanAdd(player);
        break;
      case 3:
        playSoundTo(player, "RandomPop");
        clanBankMenu(player);
        break;
      case 4:
        playSoundTo(player, "RandomPop");
        editMemberPermission(player);
        break;
      case 5:
        playSoundTo(player, "RandomPop");
        removeMember(player);
        break;
      case 6:
        playSoundTo(player, "RandomPop");
        let clan2 = getClan(player);
        let clanID = getScore(player, "clanID");
        let afterRemoveClan = clan2?.filter((data) => data.member != player.name);
        console.warn(JSON.stringify(afterRemoveClan));
        clansDBNew.set(`clan:${clanID}`, afterRemoveClan);
        world13.sendMessage(`\xA7a${player.name} \xA7bLeft Their Clan`);
        setScore(player, "clanID", 0);
        break;
    }
  });
}

// scripts/bounties/bounty.ts
import { world as world14, system as system10 } from "@minecraft/server";
import { ActionFormData as ActionFormData7, FormCancelationReason as FormCancelationReason6, ModalFormData as ModalFormData9 } from "@minecraft/server-ui";
var bountyDB = new Database("bounties");
function bountyMenu(player, isChat, i) {
  if (isChat) {
    i = 0;
  }
  const bountyMenuForm = new ActionFormData7().title("\xA7bBounty Menu").body("\xA77Create and view player bounties").button(`\xA7l\xA7aView Bounties\xA7r
\xA78[ \xA7fActive bounties \xA78]\xA7r`, "textures/staff/view.png").button("\xA7l\xA7cAdd Bounty\xA7r\n\xA78[ \xA7fAdd a bounty \xA78]\xA7r", "textures/items/emerald.png").button("\xA7l\xA74Close Menu\xA7r\n\xA78[ \xA7fClose the GUI \xA78]\xA7r", "textures/blocks/barrier.png").show(player).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason6.UserBusy && i != void 0) {
      system10.runTimeout(() => {
        if (i < 5) {
          player.sendMessage(`\xA73Close chat to view GUI`);
          i++;
          bountyMenu(player, false, i);
        }
      }, 20);
      return;
    }
    if (res.selection === 0) {
      viewBounties(player);
    }
    if (res.selection === 1) {
      addBounty(player);
    }
  });
}
function addBounty(player) {
  const players = world14.getAllPlayers();
  const playerNames = players.map((p) => {
    return p.name;
  });
  const addBounty2 = new ModalFormData9().title("\xA7bBounty Menu").dropdown("Player", playerNames, 0).textField("Amount", "0", "0").show(player).then((res) => {
    const amount = parseInt(res.formValues[1]);
    if (isNaN(amount) || amount <= 500 || amount >= 1e5) {
      player.sendMessage("\xA7cPlease Enter A Valid Number Between 500 and 100,000");
      return;
    }
    if (getScore(player, "money") <= amount) {
      player.sendMessage("\xA7cYou Don't Have Enough Money For That");
      return;
    }
    if (bountyDB.get(playerNames[res.formValues[0]])) {
      player.sendMessage("\xA7cCannot Add Bounty -> Player Already Has One");
      return;
    }
    const date = Date.now();
    removeScore(player, "money", amount);
    bountyDB.set(playerNames[res.formValues[0]], { amount, name: playerNames[res.formValues[0]], date });
    world14.sendMessage(`\xA7e${player.name} \xA77Set A Bounty Of \xA7a$${res.formValues[1]} \xA77On \xA7e${playerNames[res.formValues[0]]}`);
  });
}
function viewBounties(player) {
  const bounties = bountyDB.values();
  const prettyBounties = bounties.map((b) => {
    if (b.date == void 0 || b.date > Date.now() - 2 * 24 * 60 * 60 * 1e3) {
      return `\xA77Name: \xA7e"${b.name}" \xA78--> \xA77Amount: \xA7a${b.amount} \xA78[ \xA77Ends: \xA76${new Date(b.date ? b.date + 2 * 24 * 60 * 60 * 1e3 : Date.now()).toUTCString()} \xA78]`;
    } else {
      bountyDB.delete(`${b.name}`);
    }
  }).join("\n");
  const activeBounties = new ActionFormData7().title("\xA7bActive Bounties").body(prettyBounties + "\n\n\n\n\n").button("Close", "textures/blocks/barrier.png").show(player).then((res) => {
    if (res.selection == 1) {
    }
  });
}

// scripts/reportSystem/reportMenu.ts
import { system as system12 } from "@minecraft/server";
import { ActionFormData as ActionFormData10, FormCancelationReason as FormCancelationReason7 } from "@minecraft/server-ui";

// scripts/reportSystem/createReport.ts
import { world as world15 } from "@minecraft/server";
import { ModalFormData as ModalFormData10 } from "@minecraft/server-ui";

// scripts/helperFunctions/randomInt.ts
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// scripts/reportSystem/createReport.ts
function createReport(player) {
  const reportForm = new ModalFormData10().title("\xA7cCreate Report").textField("Player Name", "", "").textField("Report Description", "", "").show(player).then((res) => {
    const title = res.formValues[0].toString();
    const description = res.formValues[1].toString();
    if (title.length > 11) {
      player.sendMessage("\xA7cName too long");
      return;
    }
    if (description.length > 100) {
      player.sendMessage("\xA7cDescription Too Long");
      return;
    }
    const id = getRandomInt(1, 999999);
    const data = {
      name: player.name,
      title,
      message: description,
      id
    };
    const staff = world15.getPlayers({ tags: ["staffstatus"] });
    staff.forEach((p) => {
      p.playSound("block.bell.hit");
      p.sendMessage(`\xA7e${player.name} \xA7fCreated A New Report`);
    });
    reportsDB.set(`${player.name}:${id}`, data);
  });
}

// scripts/reportSystem/viewReports.ts
import { ActionFormData as ActionFormData9 } from "@minecraft/server-ui";
function viewReports(player) {
  const reports = reportsDB.values();
  let ids = [];
  let reportView = new ActionFormData9().title("\xA7cReports");
  reports.forEach((report) => {
    let text = `\xA7f${report.name}
${report.title}`;
    ids.push({ id: report.id, name: report.name });
    reportView.button(text);
  });
  reportView.show(player).then((res) => {
    console.warn("E", res.selection);
    if (res.selection != void 0) {
      console.warn("E1");
      console.warn(ids[res.selection]);
      reportViewer(player, ids[res.selection]);
    }
  });
}
function reportViewer(player, data) {
  const dbEntry = reportsDB.get(`${data.name}:${data.id}`);
  let report = new ActionFormData9().title(`\xA7c${dbEntry?.title}`).body(`\xA77Report By: \xA7e${dbEntry?.name}
\xA77Reported Player: \xA7b${dbEntry?.title}
\xA77Description: \xA76${dbEntry?.message}`).button("\xA7eDelete Report\n\xA78[ \xA7fTrash Report \xA78]\xA7r", "textures/gui/claims/leave").button("\xA7cClose Menu\xA7r\n\xA78[ \xA7fClose the GUI \xA78]\xA7r", "textures/blocks/barrier.png").show(player).then((res) => {
    if (res.selection == 0) {
      reportsDB.delete(`${data.name}:${data.id}`);
    }
  });
}

// scripts/reportSystem/reportMenu.ts
var reportsDB = new Database("reports");
function reportMenu(player, isChat, i) {
  if (isChat) {
    i = 0;
  }
  const reportMenuForm = new ActionFormData10().title("\xA7cReport Menu").body("\xA77Use this module to report players to our team.").button(`\xA7l\xA7cCreate Report\xA7r
\xA78[ \xA7fReport a player \xA78]\xA7r`, "textures/staff/view.png").button("\xA7l\xA7aActive Reports\xA7r\n\xA78[ \xA7fStaff Only \xA78]\xA7r", "textures/items/emerald.png").button("\xA7l\xA74Close Menu\xA7r\n\xA78[ \xA7fClose the GUI \xA78]\xA7r", "textures/blocks/barrier.png").show(player).then((res) => {
    if (res.canceled && res.cancelationReason == FormCancelationReason7.UserBusy && i != void 0) {
      system12.runTimeout(() => {
        if (i < 5) {
          player.sendMessage(`Close Chat Within ${5 - i} Seconds To Open The Bounty Menu`);
          i++;
          reportMenu(player, false, i);
        }
      }, 20);
      return;
    }
    if (res.selection == 0) {
      createReport(player);
    }
    if (res.selection == 1 && player.hasTag("staffstatus")) {
      viewReports(player);
    }
  });
}

// scripts/chatCommands/commandHandler.ts
function handleChatCommands(chat) {
  const msg = chat.message;
  const player = chat.sender;
  console.warn(msg);
  if (msg.startsWith("-warp") || msg.startsWith("-w")) {
    warpCommand(msg, player);
    chat.cancel = true;
  }
  if (msg === "-rtp") {
    startWildTeleport(player);
    chat.cancel = true;
  }
  if (msg === "-marketplace" || msg === "-m") {
    system13.run(() => {
      marketplaceSelect(player, true);
    });
    chat.cancel = true;
  }
  if (msg === "-d" || msg === "-discord") {
    system13.run(() => {
      discordKitForm(player, true);
    });
    chat.cancel = true;
  }
  if (msg === "-tp" || msg === "-teleport") {
    system13.run(() => {
      tpaTprSelect(player, true);
    });
    chat.cancel = true;
  }
  if (msg === "-mt" || msg === "-transfer") {
    system13.run(() => {
      moneyTransfer(player, true);
    });
    chat.cancel = true;
  }
  if (msg === "-mt" || msg === "-transfer") {
    system13.run(() => {
      moneyTransfer(player, true);
    });
    chat.cancel = true;
  }
  if (msg === "-c" || msg === "-clan") {
    system13.run(() => {
      clanMenu(player, true);
    });
    chat.cancel = true;
  }
  if (msg === "-b" || msg === "-bounty") {
    system13.run(() => {
      bountyMenu(player, true);
    });
    chat.cancel = true;
  }
  if (msg === "-r" || msg === "-report") {
    system13.run(() => {
      reportMenu(player, true);
    });
    chat.cancel = true;
  }
}

// scripts/components/componentManager.ts
import { world as world21 } from "@minecraft/server";

// scripts/components/itemComponents/crabGUI.ts
import { ActionFormData as ActionFormData15 } from "@minecraft/server-ui";

// scripts/battlepass/claim.ts
import { EnchantmentType, world as world17 } from "@minecraft/server";
import { ActionFormData as ActionFormData11 } from "@minecraft/server-ui";

// scripts/helperFunctions/addEnchantedItem.ts
import { ItemStack as ItemStack5 } from "@minecraft/server";
function addEnchantedItem(player, item, enchants, amount) {
  let addItem = new ItemStack5(item, amount);
  addItem.getComponent("minecraft:enchantable")?.addEnchantments(enchants);
  player.getComponent("minecraft:inventory")?.container?.addItem(addItem);
}

// scripts/helperFunctions/functions.ts
function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
}

// scripts/battlepass/loot.ts
var Loot = [
  // Weapons
  "minecraft:diamond_sword",
  "minecraft:netherite_sword",
  "minecraft:trident",
  // Armor
  "minecraft:diamond_helmet",
  "minecraft:diamond_chestplate",
  "minecraft:diamond_leggings",
  "minecraft:diamond_boots",
  "minecraft:netherite_helmet",
  "minecraft:netherite_chestplate",
  "minecraft:netherite_leggings",
  "minecraft:netherite_boots",
  // Resources
  "minecraft:diamond",
  "minecraft:emerald",
  "minecraft:netherite_ingot",
  "minecraft:golden_apple",
  "minecraft:enchanted_golden_apple",
  "minecraft:totem_of_undying",
  // Enchanted Books
  { type: "minecraft:sharpness", lvl: 5 },
  { type: "minecraft:smite", lvl: 5 },
  { type: "minecraft:unbreaking", lvl: 3 },
  { type: "minecraft:fortune", lvl: 3 },
  { type: "minecraft:silk_touch", lvl: 1 },
  { type: "minecraft:power", lvl: 5 },
  { type: "minecraft:infinity", lvl: 1 },
  { type: "minecraft:looting", lvl: 3 },
  { type: "minecraft:efficiency", lvl: 5 },
  { type: "minecraft:mending", lvl: 1 },
  // Tools
  "minecraft:diamond_pickaxe",
  "minecraft:netherite_pickaxe",
  "minecraft:elytra",
  // Special Items
  "minecraft:beacon",
  "minecraft:nether_star",
  "minecraft:heart_of_the_sea",
  "minecraft:enchanted_book",
  "minecraft:netherite_block",
  "minecraft:end_crystal"
];

// scripts/battlepass/claim.ts
function battlepass(player) {
  let availability;
  const now = Date.now();
  const claimtime = player.getDynamicProperty("claimtime");
  if (now - claimtime > 24 * 60 * 60 * 1e3) {
    availability = `\xA7aAvailable To Claim Now`;
  } else {
    availability = `\xA7cAvailable In: \xA7b${new Date(24 * 60 * 60 * 1e3 - (now - claimtime)).toISOString().slice(11, 19)}`;
  }
  let batllepassMenu = new ActionFormData11().title("\xA7eBattlepass").body(availability).button(
    `\xA7aClaim Reward
\xA78[ \xA7fClick to Redeem \xA78]`,
    "textures/ui/promo_holiday_gift_small"
  ).button(
    `\xA7cClose
\xA78[ \xA7fClose the menu \xA78]`,
    "textures/ui/cancel.png"
  ).show(player).then((res) => {
    if (res.selection == 0) {
      playSoundTo(player, "RandomPop");
      if (now - claimtime > 24 * 60 * 60 * 1e3) {
        player.setDynamicProperty("claimtime", Date.now());
        let i = Math.floor(Math.random() * Loot.length);
        if (i <= 26 && i >= 17) {
          let item = [{ type: new EnchantmentType(Loot[i].type), level: Loot[i].lvl }];
          addEnchantedItem(player, "minecraft:enchanted_book", item, 1);
          world17.sendMessage(`\xA7b${player.name} \xA7fClaimed Their Battlepass Rewards!`);
        } else {
          world17.sendMessage(`\xA7b${player.name} \xA7fClaimed Their Battlepass Rewards!`);
          let loot = Loot[i];
          let money = getRandomInt(100, 1e3);
          player.sendMessage(`\xA7fYou Recieved \xA7a${titleCase(loot.replace("minecraft:", "").replaceAll("_", " "))} \xA7f& \xA7a$${money}`);
          player.runCommand(`summon fireworks_rocket`);
          player.runCommand(`give @s ${loot}`);
          addScore(player, "money", money);
        }
      } else {
        player.sendMessage(`\xA7cCannot Claim Reward Again Yet: Available In \xA7b${new Date(24 * 60 * 60 * 1e3 - (now - claimtime)).toISOString().slice(11, 19)}`);
        playSoundTo(player, "Error");
      }
    }
  });
}

// scripts/guiPages/homeMenu.ts
import { world as world18 } from "@minecraft/server";
import { ActionFormData as ActionFormData12 } from "@minecraft/server-ui";
function homeMenu(player) {
  let homesMenuForm = new ActionFormData12().title("\xA73Homes Menu").button("\xA7l\xA7aTeleport Home\xA7r\n\xA78[ \xA7fWarp to Home \xA78]\xA7r", "textures/items/bed_red").button("\xA7l\xA7aSet your Home\xA7r\n\xA78[ \xA7fSet Home \xA78] \xA7r", "textures/items/bed_red").button("\xA7cClose Menu\n\xA78[ \xA7fExit the GUI \xA78]\xA7r", "textures/blocks/barrier").show(player).then((res) => {
    switch (res.selection) {
      case 0:
        let warp = homesDB.get(`${player.name}home1`);
        if (warp == null) {
          playSoundTo(player, "Error");
          player.sendMessage("\xA7cThis Warp Is Not Set");
          return;
        } else {
          player.teleport(warp.location, { dimension: world18.getDimension(warp.dimension) });
        }
        break;
      case 1:
        homesDB.set(`${player.name}home1`, { location: player.location, dimension: player.dimension.id });
        playSoundTo(player, "Success");
        player.sendMessage("\xA7aHome warp has been set!");
        break;
    }
  });
}

// scripts/guiPages/infoMenu.ts
import { ActionFormData as ActionFormData13 } from "@minecraft/server-ui";
function infoMenu(player) {
  let infoMenu2 = new ActionFormData13().title("\xA7eInfomation").body(
    "\xA7l\xA7cCrab\xA7fSMP \xA7eGeneral Info\n\n\xA7r\xA77CrabSMP is a free Non-P2W Realms network owned by Ozorical & Christian. We strive for greatness, with a massive playerbase and two awesome Realms to play!\n\n\xA7aClassic Realm code: rswX4oget7U\n\xA7cLifesteal Realm Code: 9VptGj_9WX8\n\xA79Discord code: dmcE6B7sRX"
  ).button("\xA7cClose Menu\n\xA78[ \xA7fExit the GUI \xA78]", "textures/blocks/barrier").show(player);
}

// scripts/guiPages/rulePage.ts
import { ActionFormData as ActionFormData14 } from "@minecraft/server-ui";
function rulesPage(player) {
  let infoMenu2 = new ActionFormData14().title("\xA7dRegulations").body(
    "\xA7l\xA76Main Realm Rules\xA7r\n\n\xA7l\xA7e1. Be respectful at all times:\xA7r\n\xA77Please treat staff and realm members with respect.\xA7r\n\n\xA7l\xA7e2. No Hatespeech:\xA7r\n\xA77Keep it clean! Respect others and don\u2019t put each other down.\xA7r\n\n\xA7l\xA7e3. No Griefing:\xA7r\n\xA77Please don\u2019t grief areas that are not meant to be griefed.\xA7r\n\n\xA7l\xA7e4. No Hacking:\xA7r\n\xA77The use of 3rd party exploits to gain an unfair advantage is strictly prohibited.\xA7r\n\n\xA7l\xA7e5. No AFKing:\xA7r\n\xA77Hogging player slots is not allowed. You will be kicked if caught AFKing.\xA7r\n\n\xA7l\xA7e6. No Duping / Exploiting Glitches:\xA7r\n\xA77Please do not exploit glitches or bugs for personal gain.\xA7r\n\n\xA7l\xA7e7. No Racism:\xA7r\n\xA77Treat all players with respect, regardless of their background.\xA7r\n\n\xA7l\xA7e8. No Spamming:\xA7r\n\xA77Do not attempt to bypass the spam filter.\xA7r\n\n\xA7l\xA7e9. Privacy:\xA7r\n\xA77Do not share personal information with strangers.\xA7r\n\n\xA7l\xA7e10. Money and Trading:\xA7r\n\xA77Trading in-game items for real-life money is against our rules and will result in a permanent ban.\xA7r\n\n\xA7l\xA7e11. Follow the MCBE-EULA:\xA7r\n\xA77All players must follow the Minecraft Bedrock Edition EULA to ensure a safe, fair environment.\xA7r\n\n\xA7l\xA7e12. No C-Logging:\xA7r\n\xA77Logging out during combat will result in a 3-day ban.\xA7r\n\n\n\xA7l\xA76Discord Vault Rules\xA7r\n\xA77\u2022 Only one person is allowed inside the vault at a time, otherwise, the kit will not function properly.\n\xA77\u2022 Do not share the code with anyone outside the Discord.\xA7r\n\n\n\xA7l\xA76KOTH Rules\xA7r\n\xA77\u2022 No teaming allowed.\n\xA77\u2022 No C-Logging allowed.\xA7r\n\n\xA7l\xA7eMost of all, have fun!\xA7r\n\n\xA77Follow the rules and you\u2019re guaranteed a great experience on CrabSMP. Be smart, and don\u2019t try to find loopholes!\xA7r\n\n\xA7l\xA7cSCROLL UP TO VIEW ALL RULES\xA7r"
  ).button("\xA7cClose Menu\n\xA78[ \xA7fExit the GUI \xA78]", "textures/blocks/barrier").show(player);
}

// scripts/components/itemComponents/crabGUI.ts
function crabGUI(init) {
  init.itemComponentRegistry.registerCustomComponent("crab:crabGUI", {
    onUse(use) {
      let player = use.source;
      if (player.hasTag("combat")) {
        player.sendMessage("\xA7cYou Cannot Use GUI In Combat!");
        player.playSound("beacon.deactivate");
        return;
      }
      playSoundTo(player, "RandomPop");
      let guiMenu = new ActionFormData15().title("\xA7cCrab\xA7fSMP \xA78- \xA7eGUI Menu").body("\xA77Utilities you can use, all in one place.").button("\xA7l\xA7cWarp Menu\xA7r\n\xA78[ \xA7fWarp around CrabSMP \xA78]\xA7r", "textures/items/ender_pearl.png").button("\xA7l\xA7cHome Menu\xA7r\n\xA78[ \xA7fManage your homes \xA78]\xA7r", "textures/items/bed_red.png").button("\xA7l\xA7cClan Menu\xA7r\n\xA78[ \xA7fConfigure Clans \xA78]\xA7r", "textures/gui/menu/clan.png").button("\xA7l\xA7cMarketplace Menu\xA7r\n\xA78[ \xA7fOpen Marketplace \xA78]\xA7r", "textures/gui/menu/market.png").button("\xA7l\xA7cBounties Menu\xA7r\n\xA78[ \xA7fSet bounties \xA78]\xA7r", "textures/items/iron_sword.png").button("\xA7l\xA7cReport Menu\xA7r\n\xA78[ \xA7fReport a player \xA78]\xA7r", "textures/ui/hammer_l_disabled.png").button("\xA7l\xA7cTPA Menu\xA7r\n\xA78[ \xA7fTeleport to Players \xA78]\xA7r", "textures/gui/menu/tpa.png").button("\xA7l\xA7cMoney Transfer Menu\xA7r\n\xA78[ \xA7fTransfer money \xA78]\xA7r", "textures/gui/menu/mt.png").button("\xA7l\xA7cBattlepass\xA7r\n\xA78[ \xA7fClaim BP rewards \xA78]\xA7r", "textures/ui/promo_holiday_gift_small").button("\xA7l\xA7cInfomation Menu\xA7r\n\xA78[ \xA7fGet Information \xA78]\xA7r", "textures/ui/infobulb_darkborder_small.png").button("\xA7l\xA7cRules\xA7r\n\xA78[ \xA7fView regulations \xA78]\xA7r", "textures/ui/icon_map.png").button("\xA7l\xA7cClose Menu\n\xA7r\xA78[ \xA7fExit the GUI \xA78]\xA7r", "textures/blocks/barrier").show(player).then((res) => {
        let selection = res.selection;
        switch (selection) {
          case 0:
            playSoundTo(player, "RandomPop");
            warpMenu(player);
            break;
          case 1:
            playSoundTo(player, "RandomPop");
            homeMenu(player);
            break;
          case 2:
            playSoundTo(player, "RandomPop");
            clanMenu(player);
            break;
          case 3:
            playSoundTo(player, "RandomPop");
            marketplaceSelect(player);
            break;
          case 4:
            playSoundTo(player, "RandomPop");
            bountyMenu(player);
            break;
          case 5:
            playSoundTo(player, "RandomPop");
            reportMenu(player);
            break;
          case 6:
            playSoundTo(player, "RandomPop");
            tpaTprSelect(player);
            break;
          case 7:
            playSoundTo(player, "RandomPop");
            moneyTransfer(player);
            break;
          case 8:
            playSoundTo(player, "RandomPop");
            battlepass(player);
            break;
          case 9:
            playSoundTo(player, "RandomPop");
            infoMenu(player);
            break;
          case 10:
            playSoundTo(player, "RandomPop");
            rulesPage(player);
            break;
        }
      });
    }
  });
}

// scripts/adminGUI/AdminGui.ts
import { world as world20, ItemComponentTypes as ItemComponentTypes2, EntityComponentTypes as EntityComponentTypes3, ItemStack as ItemStack6, EquipmentSlot } from "@minecraft/server";
import { ActionFormData as ActionFormData16, ModalFormData as ModalFormData12, FormCancelationReason as FormCancelationReason8, MessageFormData } from "@minecraft/server-ui";

// scripts/leaderboard/setupLeaderboard.ts
import { world as world19 } from "@minecraft/server";
import { ModalFormData as ModalFormData11 } from "@minecraft/server-ui";
function setupLeaderBoard(player) {
  let colours = ["\xA70", "\xA71", "\xA72", "\xA73", "\xA74", "\xA75", "\xA76", "\xA77", "\xA78", "\xA79", "\xA7a", "\xA7b", "\xA7c", "\xA7d", "\xA7e", "\xA7f", "\xA7g"];
  let coloursList = ["\xA70Black", "\xA71Dark Blue", "\xA72Dark Green", "\xA73Dark Aqua", "\xA74Dark Red", "\xA75Dark Purple", "\xA76Gold", "\xA77Grey", "\xA78Dark Grey", "\xA79Blue", "\xA7aGreen", "\xA7bAqua", "\xA7cRed", "\xA7dLight Purple", "\xA7eYellow", "\xA7fWhite", "\xA7gMinecon Gold"];
  let objectives = world19.scoreboard.getObjectives().map((obj) => obj.displayName);
  let nearLB = player.dimension.getEntities({
    maxDistance: 2,
    type: "crab:floating_text",
    closest: 1,
    location: player.location
  });
  let leaderboardEntity;
  if (nearLB.length == 0) {
    const { x, y, z } = player.location;
    leaderboardEntity = player.dimension.spawnEntity("crab:floating_text", { x, y: y + 1, z });
  } else {
    leaderboardEntity = nearLB[0];
  }
  let spawnForm = new ModalFormData11().title("\xA7cCreate Leaderboard\xA7r").dropdown("Objective", objectives, objectives.findIndex((obj) => obj == leaderboardEntity.getDynamicProperty("obj")) ?? 0).textField("Enter The Leaderboards Name To Display", "name", leaderboardEntity.getDynamicProperty("name") ?? "name").dropdown("Name Colour", coloursList, leaderboardEntity.getDynamicProperty("name_colour") ? colours.findIndex((colour) => colour == leaderboardEntity.getDynamicProperty("name_colour")) : 0).dropdown("Player Names Colour", coloursList, leaderboardEntity.getDynamicProperty("player_colour") ? colours.findIndex((colour) => colour == leaderboardEntity.getDynamicProperty("player_colour")) : 0).dropdown("Score Colour", coloursList, leaderboardEntity.getDynamicProperty("score_colour") ? colours.findIndex((colour) => colour == leaderboardEntity.getDynamicProperty("score_colour")) : 0).slider("Amount Of Players To Show", 1, 25, 1, leaderboardEntity.getDynamicProperty("amount") ?? 1).toggle("\xA7aDelete This Leaderboard?", false).show(player).then((res) => {
    if (res.formValues[6] === true) {
      leaderboardEntity.remove();
      return;
    }
    const obj = objectives[res.formValues[0]];
    const displayName = res.formValues[1];
    const nameColour = colours[res.formValues[2]];
    const playerNameColour = colours[res.formValues[3]];
    const scoreColour = colours[res.formValues[4]];
    const amountToDisplay = res.formValues[5];
    leaderboardEntity.clearDynamicProperties();
    leaderboardEntity.setDynamicProperty("obj", obj);
    leaderboardEntity.setDynamicProperty("name", displayName);
    leaderboardEntity.setDynamicProperty("name_colour", nameColour);
    leaderboardEntity.setDynamicProperty("player_colour", playerNameColour);
    leaderboardEntity.setDynamicProperty("score_colour", scoreColour);
    leaderboardEntity.setDynamicProperty("amount", amountToDisplay);
    leaderboardEntity.setDynamicProperty("data", JSON.stringify([{ name: player.name, amount: 0 }]));
    leaderboardUpdate(leaderboardEntity);
  });
}
function leaderboardUpdate(leaderboard) {
  const obj = leaderboard.getDynamicProperty("obj");
  const displayName = leaderboard.getDynamicProperty("name");
  const nameColour = leaderboard.getDynamicProperty("name_colour");
  const playerNameColour = leaderboard.getDynamicProperty("player_colour");
  const scoreColour = leaderboard.getDynamicProperty("score_colour");
  const amountToDisplay = leaderboard.getDynamicProperty("amount");
  const data = JSON.parse(leaderboard.getDynamicProperty("data"));
  let playersOnlineScores = world19.getAllPlayers().map((player) => {
    let score = world19.scoreboard.getObjective(obj)?.getScore(player);
    let pData = { name: player.name, amount: score ?? 0 };
    return pData;
  });
  const mergedLb = merge(data, playersOnlineScores, "name");
  leaderboard.setDynamicProperty("data", JSON.stringify(mergedLb));
  let sortedLb = mergedLb.sort((a, b) => b.amount - a.amount).slice(0, amountToDisplay);
  let scoreSection = "";
  sortedLb.forEach((v, index) => {
    scoreSection += `\xA7f${index + 1}. \xA7r${playerNameColour}${sortedLb[index].name}\xA7f -\xA7r ${scoreColour}${sortedLb[index].amount}
`;
  });
  let nametag = `${nameColour}${displayName}
${scoreSection}`;
  leaderboard.nameTag = nametag;
}
function updateLeaderboards() {
  let e = world19.getDimension("minecraft:overworld").getEntities({ type: "crab:floating_text" });
  if (e.length != 0) {
    e.forEach((ent) => {
      if (ent.nameTag != "entity.crab:floating_text.name" && ent.getDynamicProperty("obj") != void 0) {
        leaderboardUpdate(ent);
      }
    });
  }
}
function merge(a, b, prop) {
  var reduced = a.filter((aitem) => !b.find((bitem) => aitem[prop] === bitem[prop]));
  return reduced.concat(b);
}

// scripts/adminGUI/AdminGui.ts
var messageDB = new Database("messageDB");
var JoinLeaveDB = new Database("JoinLeaveDB");
var AdminDB = new Database("AdminDB");
var BansDB = new Database("BansDB");
var MuteDB = new Database("MuteDB");
function staffMain(player) {
  new ActionFormData16().title(" \xA7gAdmin Menu ").body("This is the Crab-Engine Admin menu. Here, you can \xA7gkick, \xA7cban, \xA7fand \xA7bmute \xA7fplayers.").button("\xA7bModeration GUI\xA7r\n\xA77Enter access key", "textures/ui/gear.png").button("\xA76Change Password \xA7r\n\xA77Change access key", "textures/staff/lock.png").button("\xA7cClose GUI\xA7r\n\xA77Click to close", "textures/staff/kick.png").show(player).then((r) => {
    if (r.selection === 0) {
      playSoundTo(player, "RandomPop");
      Protected(player);
    }
    if (r.selection === 1) {
      playSoundTo(player, "RandomPop");
      Password(player);
    }
    if (r.selection === 2) {
      playSoundTo(player, "RandomPop");
      player.sendMessage("\xA7cYou closed the Moderation menu.");
    }
  });
}
function Password(player) {
  if (!player.hasTag("ceolol")) {
    player.sendMessage("\xA7cYou are not the owner.");
    return;
  }
  const currentPassword = AdminDB.get("adminPassword") || "No password set";
  new ModalFormData12().title(" \xA7bPassword ").textField(`Enter New Password
Current Password: ${currentPassword}`, "New Password").toggle("Are you sure you want to change the password?").show(player).then((result) => {
    if (result.canceled || !result.formValues[1]) {
      return player.sendMessage('\xA7cPlease enter the new password and toggle "Are you sure?" to change the password!');
    }
    const newPassword = result.formValues[0];
    AdminDB.set("adminPassword", newPassword);
    player.sendMessage(`\xA7aAdmin password changed successfully.`);
  });
}
function Protected(player) {
  new ModalFormData12().title(" \xA7bPassword ").textField("Enter Password", "Password here...").show(player).then((result) => {
    if (result.canceled) {
      return player.sendMessage("\xA7cPassword entry canceled.");
    }
    const enteredPassword = result.formValues[0];
    const storedPassword = AdminDB.get("adminPassword");
    if (enteredPassword === storedPassword) {
      Main(player);
    } else {
      player.sendMessage("\xA7cIncorrect password. Access denied.");
    }
  });
}
function Main(player) {
  new ActionFormData16().title(" \xA7gAdmin Menu ").body("Select an option from the button list below: ").button("\xA7aMute \xA7r\n\xA77Click to Mute Player", "textures/staff/mute.png").button("\xA7cBan \xA7r\n\xA77Click to Ban Player", "textures/staff/ban.png").button("\xA7eInventory view \xA7r\n\xA77View a Player's Inventory", "textures/staff/view.png").button("\xA7gQuick Commands \xA7r\n\xA77Run Commands", "textures/blocks/command_block.png").button("\xA7bSetup Leaderboard \xA7r\n\xA77Run Commands", "textures/items/map_filled.png").button("\xA7cClose \xA7r\n\xA77Click to Close", "textures/staff/kick.png").show(player).then((r) => {
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
        commandRunner(player);
        break;
      case 4:
        playSoundTo(player, "RandomPop");
        setupLeaderBoard(player);
        break;
    }
  });
}
function successGui(player, feedback, reason, command) {
  let success = new MessageFormData().title(`\xA7aFeedback Form - \xA7b${feedback}`).body(`${feedback} - ${reason} - Command: ${command}`).button1("\xA7cClose").button1("\xA7aOK");
}
function commandRunner(player) {
  let playerObj = world20.getPlayers();
  let players = playerObj.map((p) => p.name);
  const gui = new ModalFormData12().title("Quick Commands").textField("Input 1:", "Enter a command here, / is optional").slider("Run how many times", 1, 100, 1, 1).textField("Input 2:", "Enter a command here, / is optional").slider("Run how many times", 1, 100, 1, 1).textField("Input 3:", "Enter a command here, / is optional").slider("Run how many times", 1, 100, 1, 1).dropdown("Executor:", ["Crab-Engine: ", ...players.slice(1)]).submitButton("Run");
  gui.show(player).then((result) => {
    if (result.canceled && result.cancelationReason === FormCancelationReason8.UserClosed) {
      successGui(player, "Failed to run commands", "\xA7cCanceled", "quickcommands");
      return;
    }
    const executorIndex = +result.formValues[6];
    let executor;
    if (executorIndex > 0) {
      executor = playerObj[executorIndex];
    } else {
      executor = player.dimension;
    }
    const commmand1 = result.formValues[0];
    const commmand2 = result.formValues[2];
    const commmand3 = result.formValues[4];
    if (!commmand1 && !commmand2 && !commmand3) {
      successGui(player, "Failed to run commands", "\xA7cNo inputs detected", "quickcommands");
      return;
    }
    const times1 = +result.formValues[1];
    const times2 = +result.formValues[3];
    const times3 = +result.formValues[5];
    let success1 = 0;
    let success2 = 0;
    let success3 = 0;
    for (let i = 0; i < times1; i++) {
      try {
        success1 += executor.runCommand(`${commmand1}`).successCount;
      } catch (e) {
      }
    }
    for (let i = 0; i < times2; i++) {
      try {
        success2 += executor.runCommand(`${commmand2}`).successCount;
      } catch (e) {
      }
    }
    for (let i = 0; i < times3; i++) {
      try {
        success3 += executor.runCommand(`${commmand3}`).successCount;
      } catch (e) {
      }
    }
    successGui(player, "Ran commands", `\xA7aInput 1 success count: \xA7f${success1}
\xA7aInput 2 success count: \xA7f${success2}
\xA7aInput 3 success count: \xA7f${success3}`, "quickcommands");
  });
}
var bannedPlayers = /* @__PURE__ */ new Set();
var banDetails = /* @__PURE__ */ new Map();
function Timeout(player) {
  const playerNames = world20.getAllPlayers().map((p) => p.name);
  new ModalFormData12().title(" \xA7bTimeOut ").dropdown("Choose a Player", playerNames).textField("Enter Time (e.g. 1h 23m 32s)", "Time here...").textField("Enter Reason", "Reason here...").show(player).then((result) => {
    if (result.canceled) {
      return player.sendMessage("\xA7cTimeout setup canceled.");
    }
    const targetPlayerName = playerNames[parseInt(result.formValues[0])];
    const timeString = result.formValues[1];
    const reason = result.formValues[2];
    const durationInSeconds = parseTimeString(timeString);
    const endTime = Date.now() + durationInSeconds * 1e3;
    const muteData = {
      player: player.name,
      mutedBy: player.name,
      endTime,
      duration: formatTime(durationInSeconds),
      reason,
      startTime: Date.now(),
      finished: false
    };
    MuteDB.set(targetPlayerName, muteData);
    player.sendMessage(`\xA7a${targetPlayerName} has been muted for ${formatTime(durationInSeconds)}. Reason: ${reason}`);
    const targetPlayer = world20.getAllPlayers().find((p) => p.name === targetPlayerName);
    targetPlayer?.sendMessage(`\xA7cYou have been muted by ${player.name} for ${formatTime(durationInSeconds)}. Reason: ${reason}`);
  });
}
function TimeoutLogs(player) {
  const currentTime = Date.now();
  const activeMutes = MuteDB.values().filter((info) => currentTime < info.endTime);
  if (!activeMutes.length) {
    return player.sendMessage("\xA7cThere are no current timeouts.");
  }
  let logsForm = new ActionFormData16().title(" \xA7bTimeout Logs ").body("\xA7uSelect a player to view details:");
  activeMutes.forEach((playerName) => {
    logsForm.button(playerName.player);
  });
  logsForm.show(player).then((result) => {
    if (result.canceled)
      return;
    const selectedPlayerName = activeMutes[result.selection].player;
    playSoundTo(player, "RandomPop");
    showTimeoutDetails(player, selectedPlayerName);
  });
}
function showTimeoutDetails(player, mutedPlayerName) {
  const muteInfo = MuteDB.get(mutedPlayerName);
  const currentTime = Date.now();
  const timeLeft = currentTime < muteInfo.endTime ? formatTime((muteInfo.endTime - currentTime) / 1e3) : "0s";
  const finished = currentTime >= muteInfo.endTime;
  let detailsForm = new ActionFormData16().title(` \xA7bTimeout Details `).body(`\xA7aMod: ${muteInfo.mutedBy}
\xA7aUser: ${mutedPlayerName}
\xA7aReason: ${muteInfo.reason}
\xA7aDuration: ${muteInfo.duration}
\xA7aLeft: ${timeLeft}
\xA7aFinished: ${finished}`).button("Remove Timeout").button("Close");
  detailsForm.show(player).then((response) => {
    if (response.selection === 0) {
      if (finished) {
        playSoundTo(player, "Error");
        player.sendMessage(`\xA7cCannot remove timeout for ${mutedPlayerName} because it has already expired.`);
      } else {
        MuteDB.delete(mutedPlayerName);
        playSoundTo(player, "Success");
        player.sendMessage(`\xA7cTimeout for ${mutedPlayerName} has been removed.`);
      }
    }
  });
}
function parseTimeString(timeString) {
  const timeUnits = {
    h: 3600,
    m: 60,
    s: 1
  };
  let totalSeconds = 0;
  const matches = timeString.match(/\d+\s*[hms]/g);
  if (matches) {
    matches.forEach((match) => {
      const unit = match.match(/[hms]/)[0];
      const value = parseInt(match.match(/\d+/)[0]);
      totalSeconds += value * timeUnits[unit];
    });
  }
  return totalSeconds;
}
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
function ifThisPlayerIsMutedDoThis(eventData) {
  const playerName = eventData.sender.name;
  const muteInfo = MuteDB.get(playerName);
  if (muteInfo) {
    const currentTime = Date.now();
    if (currentTime < muteInfo.endTime) {
      eventData.cancel = true;
      const timeLeft = formatTime((muteInfo.endTime - currentTime) / 1e3);
      eventData.sender.sendMessage(`\xA7cYou are on timeout by ${muteInfo.mutedBy} for ${timeLeft}. Reason: ${muteInfo.reason}`);
    }
  }
}
function checkMutedPlayersStatus() {
  const currentTime = Date.now();
  const allMutes = Array.from(MuteDB.keys());
  allMutes.forEach((playerName) => {
    const muteInfo = MuteDB.get(playerName);
    if (muteInfo && muteInfo.endTime && currentTime >= muteInfo.endTime) {
      if (!muteInfo.finished) {
        MuteDB.set(playerName, {
          ...muteInfo,
          finished: true
        });
      }
      MuteDB.delete(playerName);
      const player = world20.getAllPlayers().find((p) => p.name === playerName);
      if (player) {
        player.sendMessage(`\xA7aYour timeout has expired.`);
      }
    }
  });
}
function TimeOut(player) {
  const form = new ActionFormData16().title(" \xA7bMain UI ").body("Welcome player").button("\xA7bTimeout User\xA7r\n\xA77Click to View", "textures/staff/restrict.png").button("\xA7bTimeout Logs \xA7r\n\xA77Click to View", "textures/items/map_filled.png");
  form.show(player).then((response) => {
    if (response.selection === 0) {
      playSoundTo(player, "RandomPop");
      Timeout(player);
    } else if (response.selection === 1) {
      playSoundTo(player, "RandomPop");
      TimeoutLogs(player);
    }
  });
}
function Bans(player) {
  new ActionFormData16().title(" \xA7bBan Menu ").button("\xA7bBan Player \xA7r\n\xA77Click to Ban", "textures/staff/ban.png").button("\xA7bView Bans \xA7r\n\xA77Click to View", "textures/staff/view.png").button("\xA7cClose \xA7r\n\xA77Click to Close", "textures/staff/kick.png").show(player).then((response) => {
    if (response.selection === 0) {
      playSoundTo(player, "RandomPop");
      banPlayer(player);
    } else if (response.selection === 1) {
      playSoundTo(player, "RandomPop");
      viewBans(player);
    }
  });
}
function banPlayer(player) {
  new ModalFormData12().title(" \xA7bBan Player ").textField("\xA77Enter Player Name to Ban:", "Player Name").textField("\xA77Reason for Ban:\n\xA77Enter reason for banning this player.\xA7r", "e.g. Cheating\xA7r").textField("\xA77Ban Duration (S, M, H, D, Perm):", "Duration").toggle("Are you sure you want to ban this player?\n\xA7cRequired!").show(player).then((result) => {
    if (result.canceled || !result.formValues[3]) {
      return player.sendMessage('\xA7cPlease complete the form and toggle "Are you sure?" to ban the player!');
    }
    const playerNameToBan = result.formValues[0].trim();
    const reason = result.formValues[1];
    const durationInput = result.formValues[2].trim().toUpperCase();
    const isPermanent = durationInput === "PERM";
    const bannedAt = (/* @__PURE__ */ new Date()).toLocaleString();
    let unbanTime = null;
    if (!isPermanent) {
      const durationValue = parseInt(durationInput.slice(0, -1));
      const durationUnit = durationInput.slice(-1);
      const durationInMilliseconds = {
        S: 1e3,
        M: 1e3 * 60,
        H: 1e3 * 60 * 60,
        D: 1e3 * 60 * 60 * 24,
        Unit: durationUnit || 0
      };
      unbanTime = Date.now() + durationValue * durationInMilliseconds[durationUnit];
    }
    bannedPlayers.add(playerNameToBan);
    banDetails.set(playerNameToBan, { bannedBy: player.name, reason, bannedAt, unbanTime });
    BansDB.set(playerNameToBan, { player: playerNameToBan, bannedBy: player.name, reason, bannedAt, unbanTime });
    player.sendMessage(`\xA7c${playerNameToBan} has been banned.`);
  });
}
function viewBans(player) {
  const allBans = BansDB.values();
  if (!allBans.length) {
    return player.sendMessage("\xA7cThere are no bans at the moment.");
  }
  const bansForm = new ActionFormData16().title(" \xA7bView Bans ").body("\xA7uSelect a Banned Player:");
  allBans.forEach((bans) => {
    bansForm.button(`\xA7c${bans.player}`);
  });
  bansForm.show(player).then((response) => {
    if (response.canceled)
      return;
    const selectedPlayer = allBans[response.selection];
    const banDetail = allBans[response.selection];
    const unbanTimeString = banDetail.unbanTime ? new Date(banDetail.unbanTime).toLocaleString() : "Permanent";
    let banDetailForm = new ActionFormData16().title(` \xA7cBan Details `).body(`\xA77Banned Player: ${selectedPlayer}
\xA77Mod: ${banDetail.bannedBy}
\xA77Reason: ${banDetail.reason}
\xA77Banned At: ${banDetail.bannedAt}
\xA77Unban Time: ${unbanTimeString}`).button("\xA7cUnban Player", "textures/staff/ban.png");
    banDetailForm.show(player).then((detailResponse) => {
      if (detailResponse.selection === 0) {
        playSoundTo(player, "Success");
        BansDB.delete(selectedPlayer.player);
        player.sendMessage(`\xA7a${selectedPlayer} has been unbanned.`);
        viewBans(player);
      }
    });
  });
}
function enforceAndCheckBanStatus() {
  const currentTime = Date.now();
  [...world20.getPlayers()].forEach((player) => {
    const { name } = player;
    const banInfo = BansDB.get(name);
    if (banInfo) {
      let remainingTimeMessage;
      if (banInfo.unbanTime === "Permanent") {
        remainingTimeMessage = "Permanent";
      } else {
        const remainingTime = parseInt(banInfo.unbanTime) - currentTime;
        if (remainingTime > 0) {
          const days = Math.floor(remainingTime / (1e3 * 60 * 60 * 24));
          const hours = Math.floor(remainingTime % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
          const minutes = Math.floor(remainingTime % (1e3 * 60 * 60) / (1e3 * 60));
          remainingTimeMessage = `${days}d ${hours}h ${minutes}m`;
        } else {
          BansDB.delete(name);
          bannedPlayers.delete(name);
          banDetails.delete(name);
          return;
        }
      }
      const { bannedBy, reason } = banInfo;
      const kickMessage = `kick ${name} \xA7cYou have been banned by ${bannedBy}
\xA7cReason: ${reason}
\xA7cLength: ${remainingTimeMessage}`;
      world20.getDimension("minecraft:overworld").runCommand(kickMessage);
    }
  });
  const allBans = BansDB.values();
  allBans.forEach((bans) => {
    if (typeof bans.unbanTime === "string") {
      return;
    }
    if (bans.unbanTime && currentTime >= bans.unbanTime) {
      BansDB.delete(bans.player);
      bannedPlayers.delete(bans.player);
      banDetails.delete(bans.player);
    }
  });
}
function inventoryViewer(player) {
  let players = world20.getAllPlayers();
  let playerNames = players.map((p) => p.name);
  let playerList = new ModalFormData12().title("\xA7cSelect Inventory To View").dropdown("Player", playerNames, 0).show(player).then((res) => {
    let target = players[res.formValues[0]];
    viewInventory(player, target);
  });
}
function viewInventory(admin, target) {
  let invArray = [];
  invArray.push(target.getComponent(EntityComponentTypes3.Equippable)?.getEquipment(EquipmentSlot.Chest) ?? new ItemStack6("minecraft:air"));
  invArray.push(target.getComponent(EntityComponentTypes3.Equippable)?.getEquipment(EquipmentSlot.Feet) ?? new ItemStack6("minecraft:air"));
  invArray.push(target.getComponent(EntityComponentTypes3.Equippable)?.getEquipment(EquipmentSlot.Head) ?? new ItemStack6("minecraft:air"));
  invArray.push(target.getComponent(EntityComponentTypes3.Equippable)?.getEquipment(EquipmentSlot.Legs) ?? new ItemStack6("minecraft:air"));
  invArray.push(target.getComponent(EntityComponentTypes3.Equippable)?.getEquipment(EquipmentSlot.Offhand) ?? new ItemStack6("minecraft:air"));
  let playerInv = target.getComponent(EntityComponentTypes3.Inventory)?.container;
  for (let i = 0; i < playerInv.size; i++) {
    if (playerInv?.getItem(i) == void 0 && i != playerInv.size - 1)
      continue;
    invArray.push(playerInv?.getItem(i));
    if (i == playerInv.size - 1) {
      let invDisplayText = "";
      invArray.forEach((inv) => {
        let enchants = inv?.getComponent(ItemComponentTypes2.Enchantable)?.getEnchantments().map((enchantment) => ({ id: enchantment.type.id, lvl: enchantment.level }));
        invDisplayText += `\xA7b${inv?.type.id}\xA7r x \xA7a${inv?.amount}\xA7r \xA7dEnchants: ${enchants ? JSON.stringify(enchants).replaceAll('"[{"id":"', "").replaceAll('"', "").replaceAll("}", "").replaceAll("-{id:", "").replaceAll("[{", "").replaceAll("{", "").replaceAll("]", "") : ""}
`;
      });
      let invDisplay = new ActionFormData16().title(`\xA7b${target.name}'s inventory`).body(invDisplayText).button("\xA78[ \xA7cCLOSE \xA78]\xA7r", "textures/blocks/barrier").show(admin);
    }
  }
}

// scripts/components/itemComponents/crabStaffGUI.ts
function crabStaffGUI(init) {
  init.itemComponentRegistry.registerCustomComponent("crab:staff_gui", {
    onUse(use) {
      let player = use.source;
      playSoundTo(player, "RandomPop");
      staffMain(player);
    }
  });
}

// scripts/components/componentManager.ts
world21.beforeEvents.worldInitialize.subscribe((init) => {
  crabGUI(init);
  crabStaffGUI(init);
});

// scripts/events/afterEvents/entityHitBlock.ts
import { world as world22 } from "@minecraft/server";

// scripts/sell/sellWand.ts
import { EntityComponentTypes as EntityComponentTypes4, EquipmentSlot as EquipmentSlot2, BlockComponentTypes } from "@minecraft/server";
function sellWandHitBlock(e) {
  let player = e.damagingEntity;
  let block = e.hitBlock;
  if (player.getComponent(EntityComponentTypes4.Equippable)?.getEquipment(EquipmentSlot2.Mainhand)?.typeId == "alpha:sellwand") {
    let inventory = block.getComponent(BlockComponentTypes.Inventory);
    let totalMade = 0;
    for (let slot = 0; slot <= inventory.container?.size; slot++) {
      let itemName = inventory.container?.getItem(slot);
      if (itemName != void 0) {
        let itemName2 = inventory.container?.getSlot(slot);
        const name = itemName2?.typeId;
        const amount = itemName2?.amount;
        prices.forEach((price) => {
          if (name.replace("minecraft:", "") == price.name) {
            addScore(player, price.name, amount);
            totalMade += amount * price.price;
            inventory.container?.setItem(slot, void 0);
          }
        });
      }
      if (slot == inventory.container?.size - 1) {
        player.sendMessage(`\xA7fYou made \xA7a$${totalMade}!`);
        player.runCommand(`summon fireworks_rocket`);
        addScore(player, CRABENGINEGLOBALCONFIG.SCORES.money, totalMade);
        return;
      }
    }
  }
}

// scripts/events/afterEvents/entityHitBlock.ts
world22.afterEvents.entityHitBlock.subscribe((e) => {
  const entity = e.damagingEntity;
  if (entity.typeId === "minecraft:player") {
    sellWandHitBlock(e);
    addScore(entity, CRABENGINEGLOBALCONFIG.SCORES.clicks, 1);
  }
});

// scripts/events/afterEvents/entityHitEntity.ts
import { world as world23 } from "@minecraft/server";
world23.afterEvents.entityHitEntity.subscribe((e) => {
  addScore(e.damagingEntity, CRABENGINEGLOBALCONFIG.SCORES.clicks, 1);
});

// scripts/events/afterEvents/playerBreakBlock.ts
import { world as world24 } from "@minecraft/server";
world24.afterEvents.playerBreakBlock.subscribe((e) => {
  addScore(e.player, "blocksBroken", 1);
});

// scripts/events/afterEvents/playerPlaceBlock.ts
import { world as world25 } from "@minecraft/server";
world25.afterEvents.playerPlaceBlock.subscribe((e) => {
  addScore(e.player, "blocksPlaced", 1);
});

// scripts/events/afterEvents/playerSpawn.ts
import { world as world28 } from "@minecraft/server";

// scripts/combatLog/combatlog.ts
import { world as world26, ItemStack as ItemStack7, system as system16, EntityComponentTypes as EntityComponentTypes5, EquipmentSlot as EquipmentSlot3 } from "@minecraft/server";
var playerInventories = new Database("inventories");
function thisGuyCombatLogged(p) {
  world26.sendMessage(`\xA7d${p.name} Tried To Leave While In Combat. They Were Cleared`);
  p.teleport({ x: 19918.34, y: 134.69, z: 19842.48 });
  p.removeTag(CRABENGINEGLOBALCONFIG.TAGS.combat);
  setScore(p, "clog", 0);
  p.getComponent(EntityComponentTypes5.Inventory)?.container?.clearAll();
  p.getComponent(EntityComponentTypes5.Equippable)?.setEquipment(EquipmentSlot3.Head, new ItemStack7("minecraft:air"));
  p.getComponent(EntityComponentTypes5.Equippable)?.setEquipment(EquipmentSlot3.Chest, new ItemStack7("minecraft:air"));
  p.getComponent(EntityComponentTypes5.Equippable)?.setEquipment(EquipmentSlot3.Feet, new ItemStack7("minecraft:air"));
  p.getComponent(EntityComponentTypes5.Equippable)?.setEquipment(EquipmentSlot3.Legs, new ItemStack7("minecraft:air"));
  p.getComponent(EntityComponentTypes5.Equippable)?.setEquipment(EquipmentSlot3.Offhand, new ItemStack7("minecraft:air"));
}
function inventorySnapshot(player) {
  let playerInvs = [];
  let eq = [];
  let items = [];
  let equipment = player.getComponent("equippable");
  let inventory = player.getComponent(EntityComponentTypes5.Inventory).container;
  if (equipment != void 0) {
    eq.push(equipment.getEquipment(EquipmentSlot3.Head) ?? new ItemStack7("minecraft:air"));
    eq.push(equipment.getEquipment(EquipmentSlot3.Chest) ?? new ItemStack7("minecraft:air"));
    eq.push(equipment.getEquipment(EquipmentSlot3.Feet) ?? new ItemStack7("minecraft:air"));
    eq.push(equipment.getEquipment(EquipmentSlot3.Legs) ?? new ItemStack7("minecraft:air"));
    eq.push(equipment.getEquipment(EquipmentSlot3.Offhand) ?? new ItemStack7("minecraft:air"));
    for (let i = 0; i <= 35; i++) {
      items.push(inventory?.getItem(i) ?? new ItemStack7("minecraft:air"));
    }
    let playerData = {
      equipment: eq,
      playerName: player.name,
      inv: items
    };
    playerInvs.push(playerData);
  }
  playerInventories.set("invs", playerInvs);
}
function dropTheCombatLoggersItems(player) {
  let dimension = player.dimension;
  let location = player.location;
  let name = player.name;
  if (player.hasTag(CRABENGINEGLOBALCONFIG.TAGS.combat)) {
    world26.sendMessage(`\xA7b${player.name} Left While in Combat. Their Items 'slipped' Out Of Their Inventory`);
    let playersinv = playerInventories.get("invs")?.filter((inv) => inv.playerName == name);
    system16.run(() => {
      playersinv[0].equipment.forEach((equip) => {
        if (equip.typeId != "") {
          dimension.spawnItem(equip, location);
        }
      });
      playersinv[0].inv.forEach((item) => {
        if (item.typeId != "" && item.typeId != "crab:crab_gui" && item.typeId != "crab:crab_staff_gui") {
          dimension.spawnItem(item, location);
        }
      });
    });
  }
}

// scripts/helperFunctions/firstJoin.ts
import { ActionFormData as ActionFormData17 } from "@minecraft/server-ui";
function thisPlayerIsAFirstTimeJoiner(player) {
  WelcomeUI(player);
  player.addTag("rank:member");
  addScore(player, "money", 0);
  addScore(player, "clanID", 0);
  player.setDynamicProperty("claimtime", Date.now());
  addScore(player, "kills", 0);
  addScore(player, "deaths", 0);
  addScore(player, "blocksBroken", 0);
  addScore(player, "blocksPlaced", 0);
}
function WelcomeUI(player) {
  new ActionFormData17().title("\xA7r\xA78Welcome to CrabSMP!").body(`\xA7gWelcome! This Realm is owned by \xA76Ozorical, Stocky & Christian, \xA7gand developed by \xA76Chickenman & Ozorical.
\xA7gMake sure to join our discord,
\xA7cdiscord.gg/dmcE6B7sRX

\xA7l\xA7fUse the \xA7cCompass GUI \xA7fto see all commands and features
\xA7l\xA7fType \xA7e-help \xA7fin the chat for a list of utility commands.`).button("Next", "textures/ui/check.png").show(player).then((response) => {
    if (response.canceled) {
      return WelcomeUI(player);
    }
    if (response.selection === 0) {
      let RulesUI2 = function(player2) {
        new ActionFormData17().title("\xA78CrabSMP Regulations").body("\xA7r\xA7fLocated in the \xA7cStarter Kit, \xA7fYou will find a rules book. By playing our \xA7rRealms, \xA7fYou \xA7aAutomatically agree \xA7fto the rules, and Realmbot TOS.\n\n\xA7gHave fun!").button("\xA7aAccept and close", "textures/ui/check.png").button("\xA7cDeny ToS", "textures/blocks/barrier").show(player2).then((result) => {
          if (result.canceled) {
            return RulesUI2(player2);
          }
          if (result.selection === 0) {
            player2.playSound("random.levelup");
            player2.sendMessage("\xA7e- discord.gg/dmcE6B7sRX: \xA7gCrabSMP Discord Server");
            player2.sendMessage("\xA7e- Join for the free \xA7gDiscord Kit!");
            player2.sendMessage("\xA7e- Owners: \xA7gOzorical and Christian");
            player2.sendMessage("\xA7e- Developers: \xA7gChickenman, Cookie, Magari, sixty");
            player2.sendMessage("\xA7e- Crab-Engine: \xA7gV4-BETA");
            player2.addTag("joined");
            player2.runCommand("summon fireworks_rocket");
            return;
          }
          if (result.selection === 1) {
            player2.runCommand(`kick "${player2.name}" \xA7cYou need to accept all ToS agreements to play CrabSMP.`);
          }
        });
      };
      var RulesUI = RulesUI2;
      RulesUI2(player);
    }
  });
}

// scripts/antibot/antibot.ts
import { system as system17 } from "@minecraft/server";
function botCheck(ev) {
  if (!ev.initialSpawn)
    return;
  system17.run(() => {
    if (ev.player.hasTag("realmbot") || ev.player.hasTag("staffstatus"))
      return;
    if (ev.player.clientSystemInfo.maxRenderDistance === 0) {
      ev.player.runCommand(`kick "${ev.player.name}"`);
      console.log("HAHA LOL GET CRABD");
      ev.player.remove();
    }
  });
}
function chatLength(ev) {
  system17.run(() => {
    if (ev.message.length > 100 && !ev.sender.hasTag("staffstatus")) {
      ev.sender.runCommand(`kick "${ev.sender.name}" \xA7cInflated textMessage module was triggered`);
    }
  });
}

// scripts/events/afterEvents/playerSpawn.ts
world28.afterEvents.playerSpawn.subscribe((e) => {
  botCheck(e);
  const p = e.player;
  if (e.initialSpawn) {
    if (p.hasTag(CRABENGINEGLOBALCONFIG.TAGS.combat))
      thisGuyCombatLogged(p);
    if (!p.hasTag(CRABENGINEGLOBALCONFIG.TAGS.joined))
      thisPlayerIsAFirstTimeJoiner(p);
    initializePlayerProperties(p);
    poorGuyGotKickedOutOfHisClanWhenHeWasOffline(p);
  }
});
function initializePlayerProperties(p) {
  p.setDynamicProperty("tpa", "");
  p.setDynamicProperty("tpr", "");
  p.setDynamicProperty("invite", "");
  p.setDynamicProperty("inviteAccept", "");
}

// scripts/events/afterEvents/worldInitialize.ts
import { world as world29 } from "@minecraft/server";
world29.afterEvents.worldInitialize.subscribe((e) => {
  initializeWorldObjectives();
});
function initializeWorldObjectives() {
  for (const [value] of Object.entries(CRABENGINEGLOBALCONFIG.SCORES)) {
    const objective = world29.scoreboard.getObjective(value);
    if (!objective) {
      try {
        world29.scoreboard.addObjective(value, value);
        console.warn(`[Crab Engine] Successfully initialized objective: ${value}`);
      } catch (error) {
        console.error(`[Crab Engine] The system could not initialize objective ${value}: ${error}`);
      }
    }
  }
}

// scripts/events/beforeEvents/chatSend.ts
import { world as world31 } from "@minecraft/server";

// scripts/chatRanks/ranks.ts
import { world as world30, system as system18, MinecraftDimensionTypes as MinecraftDimensionTypes2 } from "@minecraft/server";
var overworld3 = world30.getDimension(MinecraftDimensionTypes2.overworld);
function chatSpamCooldown(player) {
  if (getScore(player, CRABENGINEGLOBALCONFIG.SCORES.spam) > 0) {
    removeScore(player, CRABENGINEGLOBALCONFIG.SCORES.spam, 1);
  }
}
function handlePlayerChat(chat) {
  let player = chat.sender;
  let muted = MuteDB.get(player.name);
  console.warn(!player.hasTag("staffstatus") || !player.hasTag("realmbot"));
  if (chat.message.includes("* External") || chat.message.includes("* external") || chat.message.includes("tsl") || chat.message.includes("NUKED")) {
    chat.cancel = true;
    try {
      player.runCommand(`kick ${player.name} \xA7cSuspected Bot Detected.`);
    } catch {
      console.warn("Crab-Engine mitigated a potential external bot.");
    }
    return;
  }
  if (!player.hasTag("staffstatus") && !player.hasTag("realmbot")) {
    system18.run(() => {
      if (getScore(player, CRABENGINEGLOBALCONFIG.SCORES.spam) == 0) {
        setScore(player, CRABENGINEGLOBALCONFIG.SCORES.spam, 5);
      }
    });
    if (getScore(player, CRABENGINEGLOBALCONFIG.SCORES.spam) != 0) {
      player.sendMessage("\xA7cYou Can Only Send A Message Every 5 Seconds");
      chat.cancel = true;
      return;
    }
  }
  if (muted != void 0) {
    if (muted.endTime < Date.now()) {
      MuteDB.delete(player.name);
      player.sendMessage("\xA7aYour mute has been lifted.");
    } else {
      player.sendMessage(`\xA7cYou cannot talk - You are muted.`);
      chat.cancel = true;
      return;
    }
  }
  let clan = getClan(chat.sender);
  let clanText = "";
  chat.cancel = true;
  if (clan) {
    clanText = `\xA78[${clan[0].clanName}\xA7r\xA78] \xA7e\u2502  `;
  }
  system18.run(() => {
    for (const realmbot of world30.getPlayers({ tags: ["realmbot"] })) {
      realmbot.sendMessage(`<${player.name}> ${chat.message}`);
    }
    ;
    for (const notrealmbot of world30.getPlayers({ excludeTags: ["realmbot"] })) {
      notrealmbot.sendMessage(`${clanText}${getChatRanks(player)}\xA78 \xA77<${player.name}> \xA7f${chat.message}`);
    }
  });
}
function getChatRanks(player) {
  let tags = player.getTags();
  let rankList = [];
  for (let i = 0; i <= tags.length; i++) {
    try {
      if (tags[i].includes("rank:")) {
        let rank = tags[i].replace("rank:", "");
        switch (rank) {
          case "member":
            rankList.push("\xA78[\xA7aMember\xA78]");
            break;
          case "staff":
            rankList.push("\xA78[\xA7dStaff\xA78]");
            break;
          case "dev":
            rankList.push("\xA78[\xA7bDev\xA78]");
            break;
          case "owner":
            rankList.push("\xA78[\xA7gCEO\xA78]");
            break;
          case "crab":
            rankList.push("\xA78[\xA7cCRAB\xA78]");
            break;
          case "crabplus":
            rankList.push("\xA78[\xA7cCRAB\xA7fPLUS\xA7g+\xA78]");
            break;
          case "donator":
            rankList.push("\xA78[\xA7dDonator\xA78]");
            break;
          case "donatorplus":
            rankList.push("\xA78[\xA7dDonator\xA7f+\xA78]");
            break;
        }
      }
    } catch {
      let rank = "";
      return rank;
    }
    if (i == tags.length - 1) {
      return rankList.join(" ");
    }
  }
}

// scripts/chatCommands/commands/help.ts
function helpHandler(chat) {
  const { message, sender } = chat;
  if (!message.startsWith("-help"))
    return;
  chat.cancel = true;
  if (message == "-help") {
    sender.sendMessage(
      "\xA78----------- \xA7cHelp Menu \xA78-----------\xA7r\n\xA7eUse -help [commandname] for more info on commands\n\xA7b-help\n-warp\n-rtp\n-marketplace\n-discord\n-teleport\n-transfer\n-clan\n-bounty\n-report\n\xA78---------------------------------"
    );
    return;
  }
  const args = message.split(" ");
  if (args.length === 1) {
    sender.sendMessage("");
    return;
  }
  if (args.length <= 2) {
    const helpCommand = args[1];
    switch (helpCommand) {
      case "help":
        sender.sendMessage("\xA7a-help \xA7b[commandname] \xA7f--> Displays The Help Menu/Specific Command Help (-h, -help)");
        break;
      case "warp":
        sender.sendMessage("\xA7a-warp \xA7b[location] \xA7f--> Warp To A Set Location location: [spawn, wild, discord, nether, end ], Leave Location Empty To Open Warp Menu (-w, -warp)");
        break;
      case "rtp":
        sender.sendMessage("\xA7a-rtp \xA7f--> Teleport To A Random Location In Wild (-rtp)");
        break;
      case "marketplace":
        sender.sendMessage("\xA7a-marketplace \xA7f--> Opens The Market Menu (-m, -marketplace)");
        break;
      case "discord":
        sender.sendMessage("\xA7a-discord \xA7f--> Opens The Discord Kit Claim Menu (-d, -discord)");
        break;
      case "teleport":
        sender.sendMessage("\xA7a-teleport \xA7f--> Opens The Player Warp Menu (-tp, -teleport)");
        break;
      case "transfer":
        sender.sendMessage("\xA7a-transfer \xA7f--> Opens Money Transfer Menu (-mt, -transfer)");
        break;
      case "clan":
        sender.sendMessage("\xA7a-clan \xA7f--> Opens The Clan Management Interface (-c, -clan)");
        break;
      case "bounty":
        sender.sendMessage("\xA7a-bounty \xA7f--> Opens The Bounty Menu (-b, -bounty)");
        break;
      case "report":
        sender.sendMessage("\xA7a-report \xA7f--> Opens The Report Menu (-r, -report)");
        break;
      default:
        sender.sendMessage("\xA7cUnknown Command");
        break;
    }
  } else {
    sender.sendMessage("\xA7cInvalid Command Arguments");
  }
}

// scripts/events/beforeEvents/chatSend.ts
world31.beforeEvents.chatSend.subscribe((e) => {
  if (e.message.startsWith("-")) {
    helpHandler(e);
    handleChatCommands(e);
    return;
  }
  ifThisPlayerIsMutedDoThis(e);
  handlePlayerChat(e);
  chatLength(e);
});

// scripts/events/beforeEvents/playerLeave.ts
import { world as world32 } from "@minecraft/server";
world32.beforeEvents.playerLeave.subscribe((e) => {
  const p = e.player;
  dropTheCombatLoggersItems(p);
});

// scripts/events/systemRunInterval.ts
import { system as system19, world as world37 } from "@minecraft/server";

// scripts/afk/afkTimer.ts
import { world as world33 } from "@minecraft/server";
function checkAndKickAFKPlayers(player) {
  let isMoving2 = false;
  const velocity = player.getVelocity();
  velocity.x === 0 ? isMoving2 = false : isMoving2 = true;
  velocity.y === 0 && !isMoving2 ? isMoving2 = false : isMoving2 = true;
  velocity.z === 0 && !isMoving2 ? isMoving2 = false : isMoving2 = true;
  if (isMoving2 && !player.hasTag("staffstatus") && !player.hasTag("realmbot")) {
    setScore(player, "afk", 0);
  } else if (!player.hasTag("staffstatus") && !player.hasTag("realmbot")) {
    addScore(player, "afk", 1);
  }
  if (getScore(player, "afk") >= 600 && !player.getTags().includes("staffstatus") && !player.getTags().includes("realmbot")) {
    world33.sendMessage(`${player.name} \xA7cWas Kicked For AFK`);
    player.runCommand(`kick "${player.name}" \xA7cYou were kicked for being AFK`);
  }
}

// scripts/helperFunctions/cps.ts
import { world as world34 } from "@minecraft/server";
var scoreboard = world34.scoreboard;
function trackPlayerClickStats(player) {
  if (!player.getDynamicProperty("lastClicks")) {
    player.setDynamicProperty("lastClicks", JSON.stringify([0]));
  }
  let lastFiveClicks = JSON.parse(player.getDynamicProperty("lastClicks"));
  let clicksinSecond = scoreboard.getObjective("clicks")?.getScore(player);
  if (clicksinSecond > player?.getDynamicProperty("clickRecord")) {
    player.setDynamicProperty("clickRecord", clicksinSecond);
  }
  lastFiveClicks.push(clicksinSecond);
  if (lastFiveClicks.length === 6) {
    lastFiveClicks.shift();
  }
  player.setDynamicProperty("lastClicks", JSON.stringify(lastFiveClicks));
  let sum = lastFiveClicks.reduce((p, c) => p + c, 0);
  let avg = Math.floor(sum / 5);
  scoreboard.getObjective("clicks")?.setScore(player, 0);
  scoreboard.getObjective("avgClicks")?.setScore(player, avg);
}

// scripts/playerInfo/sidebar.ts
function updateSidebar(player) {
  const seconds = getScore(player, "seconds") || 0;
  const minutes = getScore(player, "minutes") || 0;
  const hours = getScore(player, "hours") || 0;
  const kills = getScore(player, "kills") || 0;
  const deaths = getScore(player, "deaths") || 0;
  const money = getScore(player, "money") || 0;
  const blocksPlaced = getScore(player, "blocksPlaced") || 0;
  const blocksBroken = getScore(player, "blocksBroken") || 0;
  const clicks = getScore(player, "clicks") || 0;
  addScore(player, "seconds", 1);
  if (seconds >= 60) {
    addScore(player, "minutes", 1);
    setScore(player, "seconds", 0);
  }
  if (minutes >= 60) {
    addScore(player, "hours", 1);
    setScore(player, "minutes", 0);
  }
  const kdRatio = deaths === 0 ? kills : (kills / deaths).toFixed(2);
  const formattedTime = `${hours <= 9 ? `0${hours}` : hours}:${minutes <= 9 ? `0${minutes}` : minutes}:${seconds <= 9 ? `0${seconds}` : seconds}`;
  player.onScreenDisplay.setTitle(`\xA7\u25CF\xA7l\xA7cMoney \xA7b>\xA7e \uE1B4 ${money}
\xA7\u25CF\xA7l\xA7cKills \xA7b>\xA7e \uE121 ${kills}
\xA7\u25CF\xA7l\xA7cDeaths \xA7b>\xA7e \uE131 ${deaths}
\xA7\u25CF\xA7l\xA7cKD \xA7b>\xA7e \uE141 ${kdRatio}
\xA7\u25CF\xA7l\xA7cTime \xA7b>\xA7e \uE167 ${formattedTime}
\xA7\u25CF\xA7l\xA7cBlocks Placed \xA7b>\xA7e ${blocksPlaced}
\xA7\u25CF\xA7l\xA7cBlocks Broke \xA7b>\xA7e ${blocksBroken}
\xA7\u25CF\xA7l\xA7cCPS \xA7b>\xA7e ${clicks}
\xA7r

\xA7\u25CF\xA7l\xA77Discord\xA78: \xA79dmcE6B7sRX
\xA78-------------------
\xA7\u25CF\xA7l\xA7chttps://crabsmp.net/
        `);
}

// scripts/namebar/names.ts
import { world as world35, EntityComponentTypes as EntityComponentTypes6 } from "@minecraft/server";
function getChatRanks2(player) {
  let tags = player.getTags();
  let rankList = [];
  for (let i = 0; i <= tags.length; i++) {
    try {
      if (tags[i].includes("rank:")) {
        let rank = tags[i].replace("rank:", "");
        switch (rank) {
          case "member":
            rankList.push("\xA78[\xA7aMember\xA78]");
            break;
          case "staff":
            rankList.push("\xA78[\xA7dStaff\xA78]");
            break;
          case "dev":
            rankList.push("\xA78[\xA7bDev\xA78]");
            break;
          case "owner":
            rankList.push("\xA78[\xA7gCEO\xA78]");
            break;
          case "crab":
            rankList.push("\xA78[\xA7cCRAB\xA78]");
            break;
          case "crabplus":
            rankList.push("\xA78[\xA7cCRAB\xA7fPLUS\xA7g+\xA78]");
            break;
          case "donator":
            rankList.push("\xA78[\xA7dDonator\xA78]");
            break;
          case "donatorplus":
            rankList.push("\xA78[\xA7dDonator\xA7f+\xA78]");
            break;
        }
      }
    } catch {
      let rank = "";
      return rank;
    }
    if (i == tags.length - 1) {
      return rankList.join(" ");
    }
  }
}
world35.afterEvents.entityHealthChanged.subscribe((ent) => {
  const { entity } = ent;
  if (entity.typeId == "minecraft:player") {
    let player = entity;
    player.nameTag = `${getChatRanks2(player)}\xA7r - ${player.hasTag("combat") ? "\xA7c" : "\xA7r"} ${player.name}\xA7r (\xA7c${player.getComponent(EntityComponentTypes6.Health)?.currentValue.toFixed(1)}\xA7r)`;
  }
});
function updatePlayerNametags(player) {
  player.nameTag = `${getChatRanks2(player)}\xA7r - ${player.hasTag("combat") ? "\xA7c" : "\xA7r"} ${player.name}\xA7r (\xA7c${player.getComponent(EntityComponentTypes6.Health)?.currentValue.toFixed(1)}\xA7r)`;
}

// scripts/combatLog/combatTimer.ts
import { EntityComponentTypes as EntityComponentTypes7, world as world36 } from "@minecraft/server";
world36.afterEvents.entityHurt.subscribe((hurt) => {
  const { damageSource, hurtEntity } = hurt;
  if (hurtEntity.typeId != "minecraft:player")
    return;
  let attacker;
  if (damageSource.damagingProjectile?.getComponent(EntityComponentTypes7.Projectile)?.owner?.typeId == "minecraft:player") {
    attacker = damageSource.damagingProjectile.getComponent(EntityComponentTypes7.Projectile)?.owner;
  } else if (damageSource.damagingEntity?.typeId == "minecraft:player") {
    attacker = damageSource.damagingEntity;
  }
  if (attacker == void 0) {
    return;
  }
  setScore(attacker, "clog", 20);
  setScore(hurtEntity, "clog", 20);
  let hurtPlayer = hurtEntity;
  let attackerPlayer = attacker;
  if (!hurtPlayer.hasTag("combat")) {
    hurtPlayer.sendMessage("\xA7cYou Are In Combat: You Cannot Leave For The Next 20 Seconds Or You Will Be Cleared");
  }
  if (!attackerPlayer.hasTag("combat")) {
    attackerPlayer.sendMessage("\xA7cYou Are In Combat: You Cannot Leave For The Next 20 Seconds Or You Will Be Cleared");
  }
  hurtPlayer.addTag("combat");
  attackerPlayer.addTag("combat");
});
function combatStatusCheck() {
  let players = world36.getPlayers({ tags: ["combat"] });
  players.forEach((player) => {
    if (getScore(player, "clog") > 0) {
      if (getScore(player, "clog") == 1 && player.hasTag("combat")) {
        player.sendMessage("\xA7aYou Are No Longer In Combat");
        player.removeTag("combat");
      }
      removeScore(player, "clog", 1);
    }
  });
}

// scripts/events/systemRunInterval.ts
system19.runInterval(() => {
  checkMutedPlayersStatus();
  combatStatusCheck();
  enforceAndCheckBanStatus();
  for (const player of world37.getPlayers()) {
    updateSidebar(player);
    chatSpamCooldown(player);
    checkAndKickAFKPlayers(player);
    inventorySnapshot(player);
    trackPlayerClickStats(player);
    updatePlayerNametags(player);
  }
}, 20);
system19.runInterval(() => {
  updateLeaderboards();
}, 100);

// scripts/crates/crateManager.ts
import { system as system21 } from "@minecraft/server";

// scripts/crates/commonCrate.ts
import { world as world38, ItemStack as ItemStack9, EntityComponentTypes as EntityComponentTypes8, EquipmentSlot as EquipmentSlot4, MinecraftDimensionTypes as MinecraftDimensionTypes3 } from "@minecraft/server";
function commonCrate(player) {
  const drop = getRandomInt(1, 5);
  let heldItem = player.getComponent(EntityComponentTypes8.Equippable)?.getEquipment(EquipmentSlot4.Mainhand);
  if (heldItem?.typeId == "crab:common_key") {
    world38.structureManager.place(`CommonReward${drop}`, player.dimension, { x: player.location.x, y: player.location.y + 1, z: player.location.z });
    player.sendMessage("\xA7bYou Opened A \xA7fCommon Crate");
    world38.getDimension(MinecraftDimensionTypes3.overworld).spawnParticle("crab:open", player.location);
    world38.getDimension(MinecraftDimensionTypes3.overworld).playSound("random.totem", player.location);
    if (heldItem.amount != 1) {
      heldItem.amount -= 1;
      player.getComponent(EntityComponentTypes8.Equippable)?.getEquipmentSlot(EquipmentSlot4.Mainhand).setItem(heldItem);
    } else if (heldItem.amount == 1) {
      player.getComponent(EntityComponentTypes8.Equippable)?.getEquipmentSlot(EquipmentSlot4.Mainhand).setItem(new ItemStack9("minecraft:air"));
    }
  } else {
    player.sendMessage("\xA7cCannot Open: You Are Not Holding A \xA7fCommon Key");
    player.playSound("beacon.deactivate");
  }
}

// scripts/crates/mythicCrate.ts
import { world as world39, ItemStack as ItemStack10, EntityComponentTypes as EntityComponentTypes9, EquipmentSlot as EquipmentSlot5, MinecraftDimensionTypes as MinecraftDimensionTypes4 } from "@minecraft/server";
function mythicCrate(player) {
  let heldItem = player.getComponent(EntityComponentTypes9.Equippable)?.getEquipment(EquipmentSlot5.Mainhand);
  if (heldItem?.typeId == "crab:mythic_key") {
    const drop = getRandomInt(1, 5);
    world39.structureManager.place(`MythicReward${drop}`, player.dimension, { x: player.location.x, y: player.location.y + 1, z: player.location.z });
    player.sendMessage("\xA7bYou Opened A \xA7dMythic Crate");
    world39.getDimension(MinecraftDimensionTypes4.overworld).spawnParticle("crab:open", player.location);
    world39.getDimension(MinecraftDimensionTypes4.overworld).playSound("random.totem", player.location);
    if (heldItem.amount != 1) {
      heldItem.amount -= 1;
      player.getComponent(EntityComponentTypes9.Equippable)?.getEquipmentSlot(EquipmentSlot5.Mainhand).setItem(heldItem);
    } else if (heldItem.amount == 1) {
      player.getComponent(EntityComponentTypes9.Equippable)?.getEquipmentSlot(EquipmentSlot5.Mainhand).setItem(new ItemStack10("minecraft:air"));
    }
  } else {
    player.sendMessage("\xA7cCannot Open: You Are Not Holding A \xA7dMythic Key");
    player.playSound("beacon.deactivate");
  }
}

// scripts/crates/rareCrate.ts
import { world as world40, ItemStack as ItemStack11, EntityComponentTypes as EntityComponentTypes10, EquipmentSlot as EquipmentSlot6, MinecraftDimensionTypes as MinecraftDimensionTypes5 } from "@minecraft/server";
function rareCrate(player) {
  let heldItem = player.getComponent(EntityComponentTypes10.Equippable)?.getEquipment(EquipmentSlot6.Mainhand);
  if (heldItem?.typeId == "crab:rare_key") {
    const drop = getRandomInt(1, 5);
    world40.structureManager.place(`RareReward${drop}`, player.dimension, { x: player.location.x, y: player.location.y + 1, z: player.location.z });
    player.sendMessage("\xA7bYou Opened A \xA79Rare Crate");
    world40.getDimension(MinecraftDimensionTypes5.overworld).spawnParticle("crab:open", player.location);
    world40.getDimension(MinecraftDimensionTypes5.overworld).playSound("random.totem", player.location);
    if (heldItem.amount != 1) {
      heldItem.amount -= 1;
      player.getComponent(EntityComponentTypes10.Equippable)?.getEquipmentSlot(EquipmentSlot6.Mainhand).setItem(heldItem);
    } else if (heldItem.amount == 1) {
      player.getComponent(EntityComponentTypes10.Equippable)?.getEquipmentSlot(EquipmentSlot6.Mainhand).setItem(new ItemStack11("minecraft:air"));
    }
  } else {
    player.sendMessage("\xA7cCannot Open: You Are Not Holding A \xA79Rare Key");
    player.playSound("beacon.deactivate");
  }
}

// scripts/crates/crateManager.ts
system21.afterEvents.scriptEventReceive.subscribe((script) => {
  const { sourceEntity, id } = script;
  if (id == "crab:common") {
    commonCrate(sourceEntity);
  }
  if (id == "crab:rare") {
    rareCrate(sourceEntity);
  }
  if (id == "crab:mythic") {
    mythicCrate(sourceEntity);
  }
});

// scripts/npcs/interact.ts
import { world as world41 } from "@minecraft/server";
world41.afterEvents.playerInteractWithEntity.subscribe((interact) => {
  const { player, target } = interact;
  switch (target.typeId) {
    case "npc:battlepass":
      battlepass(player);
      break;
    case "npc:discordkit":
      discordKitForm(player);
      break;
    case "npc:freeplay":
      freePlayForm(player);
      break;
    case "npc:help":
      infoMenu(player);
      break;
    case "npc:marketplace":
      marketplaceSelect(player);
      break;
    case "npc:bounty":
      bountyMenu(player);
      break;
    case "npc:report":
      reportMenu(player);
      break;
  }
});

// scripts/killDeath/tracker.ts
import { world as world42 } from "@minecraft/server";
world42.afterEvents.entityDie.subscribe((death) => {
  const { damageSource, deadEntity } = death;
  if (deadEntity.typeId == "minecraft:player") {
    addScore(deadEntity, "deaths", 1);
    if (damageSource.damagingEntity?.typeId == "minecraft:player") {
      addScore(damageSource.damagingEntity, "kills", 1);
    }
  }
});

// scripts/events/afterEvents/entityDie.ts
import * as bc from "@minecraft/server";

// scripts/bounties/bountyClaim.ts
import { world as world43 } from "@minecraft/server";
function bountyClaim(death) {
  const { deadEntity, damageSource } = death;
  if (deadEntity.typeId == "minecraft:player" && damageSource.damagingEntity?.typeId == "minecraft:player") {
    const dbEntry = bountyDB.get(deadEntity.name);
    if (dbEntry != void 0 && dbEntry?.date < Date.now() - 2 * 24 * 60 * 60 * 1e3) {
      reportsDB.delete(`${dbEntry.name}`);
      return;
    }
    if (dbEntry) {
      addScore(damageSource.damagingEntity, "money", dbEntry.amount);
      bountyDB.delete(deadEntity.name);
      world43.sendMessage(`\xA7e${damageSource.damagingEntity.name} \xA77Claimed The Bounty Of \xA7a${dbEntry.amount} \xA77From \xA7a${deadEntity.name}`);
    }
  }
}

// scripts/events/afterEvents/entityDie.ts
bc.world.afterEvents.entityDie.subscribe((e) => {
  bountyClaim(e);
});

// scripts/stacker/stacker.ts
import { EntityComponentTypes as EntityComponentTypes11, MinecraftDimensionTypes as MinecraftDimensionTypes7, system as system22, world as world45 } from "@minecraft/server";

// node_modules/@minecraft/vanilla-data/lib/index.js
var MinecraftBiomeTypes = ((MinecraftBiomeTypes2) => {
  MinecraftBiomeTypes2["BambooJungle"] = "minecraft:bamboo_jungle";
  MinecraftBiomeTypes2["BambooJungleHills"] = "minecraft:bamboo_jungle_hills";
  MinecraftBiomeTypes2["BasaltDeltas"] = "minecraft:basalt_deltas";
  MinecraftBiomeTypes2["Beach"] = "minecraft:beach";
  MinecraftBiomeTypes2["BirchForest"] = "minecraft:birch_forest";
  MinecraftBiomeTypes2["BirchForestHills"] = "minecraft:birch_forest_hills";
  MinecraftBiomeTypes2["BirchForestHillsMutated"] = "minecraft:birch_forest_hills_mutated";
  MinecraftBiomeTypes2["BirchForestMutated"] = "minecraft:birch_forest_mutated";
  MinecraftBiomeTypes2["CherryGrove"] = "minecraft:cherry_grove";
  MinecraftBiomeTypes2["ColdBeach"] = "minecraft:cold_beach";
  MinecraftBiomeTypes2["ColdOcean"] = "minecraft:cold_ocean";
  MinecraftBiomeTypes2["ColdTaiga"] = "minecraft:cold_taiga";
  MinecraftBiomeTypes2["ColdTaigaHills"] = "minecraft:cold_taiga_hills";
  MinecraftBiomeTypes2["ColdTaigaMutated"] = "minecraft:cold_taiga_mutated";
  MinecraftBiomeTypes2["CrimsonForest"] = "minecraft:crimson_forest";
  MinecraftBiomeTypes2["DeepColdOcean"] = "minecraft:deep_cold_ocean";
  MinecraftBiomeTypes2["DeepDark"] = "minecraft:deep_dark";
  MinecraftBiomeTypes2["DeepFrozenOcean"] = "minecraft:deep_frozen_ocean";
  MinecraftBiomeTypes2["DeepLukewarmOcean"] = "minecraft:deep_lukewarm_ocean";
  MinecraftBiomeTypes2["DeepOcean"] = "minecraft:deep_ocean";
  MinecraftBiomeTypes2["DeepWarmOcean"] = "minecraft:deep_warm_ocean";
  MinecraftBiomeTypes2["Desert"] = "minecraft:desert";
  MinecraftBiomeTypes2["DesertHills"] = "minecraft:desert_hills";
  MinecraftBiomeTypes2["DesertMutated"] = "minecraft:desert_mutated";
  MinecraftBiomeTypes2["DripstoneCaves"] = "minecraft:dripstone_caves";
  MinecraftBiomeTypes2["ExtremeHills"] = "minecraft:extreme_hills";
  MinecraftBiomeTypes2["ExtremeHillsEdge"] = "minecraft:extreme_hills_edge";
  MinecraftBiomeTypes2["ExtremeHillsMutated"] = "minecraft:extreme_hills_mutated";
  MinecraftBiomeTypes2["ExtremeHillsPlusTrees"] = "minecraft:extreme_hills_plus_trees";
  MinecraftBiomeTypes2["ExtremeHillsPlusTreesMutated"] = "minecraft:extreme_hills_plus_trees_mutated";
  MinecraftBiomeTypes2["FlowerForest"] = "minecraft:flower_forest";
  MinecraftBiomeTypes2["Forest"] = "minecraft:forest";
  MinecraftBiomeTypes2["ForestHills"] = "minecraft:forest_hills";
  MinecraftBiomeTypes2["FrozenOcean"] = "minecraft:frozen_ocean";
  MinecraftBiomeTypes2["FrozenPeaks"] = "minecraft:frozen_peaks";
  MinecraftBiomeTypes2["FrozenRiver"] = "minecraft:frozen_river";
  MinecraftBiomeTypes2["Grove"] = "minecraft:grove";
  MinecraftBiomeTypes2["Hell"] = "minecraft:hell";
  MinecraftBiomeTypes2["IceMountains"] = "minecraft:ice_mountains";
  MinecraftBiomeTypes2["IcePlains"] = "minecraft:ice_plains";
  MinecraftBiomeTypes2["IcePlainsSpikes"] = "minecraft:ice_plains_spikes";
  MinecraftBiomeTypes2["JaggedPeaks"] = "minecraft:jagged_peaks";
  MinecraftBiomeTypes2["Jungle"] = "minecraft:jungle";
  MinecraftBiomeTypes2["JungleEdge"] = "minecraft:jungle_edge";
  MinecraftBiomeTypes2["JungleEdgeMutated"] = "minecraft:jungle_edge_mutated";
  MinecraftBiomeTypes2["JungleHills"] = "minecraft:jungle_hills";
  MinecraftBiomeTypes2["JungleMutated"] = "minecraft:jungle_mutated";
  MinecraftBiomeTypes2["LegacyFrozenOcean"] = "minecraft:legacy_frozen_ocean";
  MinecraftBiomeTypes2["LukewarmOcean"] = "minecraft:lukewarm_ocean";
  MinecraftBiomeTypes2["LushCaves"] = "minecraft:lush_caves";
  MinecraftBiomeTypes2["MangroveSwamp"] = "minecraft:mangrove_swamp";
  MinecraftBiomeTypes2["Meadow"] = "minecraft:meadow";
  MinecraftBiomeTypes2["MegaTaiga"] = "minecraft:mega_taiga";
  MinecraftBiomeTypes2["MegaTaigaHills"] = "minecraft:mega_taiga_hills";
  MinecraftBiomeTypes2["Mesa"] = "minecraft:mesa";
  MinecraftBiomeTypes2["MesaBryce"] = "minecraft:mesa_bryce";
  MinecraftBiomeTypes2["MesaPlateau"] = "minecraft:mesa_plateau";
  MinecraftBiomeTypes2["MesaPlateauMutated"] = "minecraft:mesa_plateau_mutated";
  MinecraftBiomeTypes2["MesaPlateauStone"] = "minecraft:mesa_plateau_stone";
  MinecraftBiomeTypes2["MesaPlateauStoneMutated"] = "minecraft:mesa_plateau_stone_mutated";
  MinecraftBiomeTypes2["MushroomIsland"] = "minecraft:mushroom_island";
  MinecraftBiomeTypes2["MushroomIslandShore"] = "minecraft:mushroom_island_shore";
  MinecraftBiomeTypes2["Ocean"] = "minecraft:ocean";
  MinecraftBiomeTypes2["Plains"] = "minecraft:plains";
  MinecraftBiomeTypes2["RedwoodTaigaHillsMutated"] = "minecraft:redwood_taiga_hills_mutated";
  MinecraftBiomeTypes2["RedwoodTaigaMutated"] = "minecraft:redwood_taiga_mutated";
  MinecraftBiomeTypes2["River"] = "minecraft:river";
  MinecraftBiomeTypes2["RoofedForest"] = "minecraft:roofed_forest";
  MinecraftBiomeTypes2["RoofedForestMutated"] = "minecraft:roofed_forest_mutated";
  MinecraftBiomeTypes2["Savanna"] = "minecraft:savanna";
  MinecraftBiomeTypes2["SavannaMutated"] = "minecraft:savanna_mutated";
  MinecraftBiomeTypes2["SavannaPlateau"] = "minecraft:savanna_plateau";
  MinecraftBiomeTypes2["SavannaPlateauMutated"] = "minecraft:savanna_plateau_mutated";
  MinecraftBiomeTypes2["SnowySlopes"] = "minecraft:snowy_slopes";
  MinecraftBiomeTypes2["SoulsandValley"] = "minecraft:soulsand_valley";
  MinecraftBiomeTypes2["StoneBeach"] = "minecraft:stone_beach";
  MinecraftBiomeTypes2["StonyPeaks"] = "minecraft:stony_peaks";
  MinecraftBiomeTypes2["SunflowerPlains"] = "minecraft:sunflower_plains";
  MinecraftBiomeTypes2["Swampland"] = "minecraft:swampland";
  MinecraftBiomeTypes2["SwamplandMutated"] = "minecraft:swampland_mutated";
  MinecraftBiomeTypes2["Taiga"] = "minecraft:taiga";
  MinecraftBiomeTypes2["TaigaHills"] = "minecraft:taiga_hills";
  MinecraftBiomeTypes2["TaigaMutated"] = "minecraft:taiga_mutated";
  MinecraftBiomeTypes2["TheEnd"] = "minecraft:the_end";
  MinecraftBiomeTypes2["WarmOcean"] = "minecraft:warm_ocean";
  MinecraftBiomeTypes2["WarpedForest"] = "minecraft:warped_forest";
  return MinecraftBiomeTypes2;
})(MinecraftBiomeTypes || {});
var MinecraftBlockTypes = ((MinecraftBlockTypes2) => {
  MinecraftBlockTypes2["AcaciaButton"] = "minecraft:acacia_button";
  MinecraftBlockTypes2["AcaciaDoor"] = "minecraft:acacia_door";
  MinecraftBlockTypes2["AcaciaDoubleSlab"] = "minecraft:acacia_double_slab";
  MinecraftBlockTypes2["AcaciaFence"] = "minecraft:acacia_fence";
  MinecraftBlockTypes2["AcaciaFenceGate"] = "minecraft:acacia_fence_gate";
  MinecraftBlockTypes2["AcaciaHangingSign"] = "minecraft:acacia_hanging_sign";
  MinecraftBlockTypes2["AcaciaLeaves"] = "minecraft:acacia_leaves";
  MinecraftBlockTypes2["AcaciaLog"] = "minecraft:acacia_log";
  MinecraftBlockTypes2["AcaciaPlanks"] = "minecraft:acacia_planks";
  MinecraftBlockTypes2["AcaciaPressurePlate"] = "minecraft:acacia_pressure_plate";
  MinecraftBlockTypes2["AcaciaSapling"] = "minecraft:acacia_sapling";
  MinecraftBlockTypes2["AcaciaSlab"] = "minecraft:acacia_slab";
  MinecraftBlockTypes2["AcaciaStairs"] = "minecraft:acacia_stairs";
  MinecraftBlockTypes2["AcaciaStandingSign"] = "minecraft:acacia_standing_sign";
  MinecraftBlockTypes2["AcaciaTrapdoor"] = "minecraft:acacia_trapdoor";
  MinecraftBlockTypes2["AcaciaWallSign"] = "minecraft:acacia_wall_sign";
  MinecraftBlockTypes2["AcaciaWood"] = "minecraft:acacia_wood";
  MinecraftBlockTypes2["ActivatorRail"] = "minecraft:activator_rail";
  MinecraftBlockTypes2["Air"] = "minecraft:air";
  MinecraftBlockTypes2["Allium"] = "minecraft:allium";
  MinecraftBlockTypes2["Allow"] = "minecraft:allow";
  MinecraftBlockTypes2["AmethystBlock"] = "minecraft:amethyst_block";
  MinecraftBlockTypes2["AmethystCluster"] = "minecraft:amethyst_cluster";
  MinecraftBlockTypes2["AncientDebris"] = "minecraft:ancient_debris";
  MinecraftBlockTypes2["Andesite"] = "minecraft:andesite";
  MinecraftBlockTypes2["AndesiteStairs"] = "minecraft:andesite_stairs";
  MinecraftBlockTypes2["Anvil"] = "minecraft:anvil";
  MinecraftBlockTypes2["Azalea"] = "minecraft:azalea";
  MinecraftBlockTypes2["AzaleaLeaves"] = "minecraft:azalea_leaves";
  MinecraftBlockTypes2["AzaleaLeavesFlowered"] = "minecraft:azalea_leaves_flowered";
  MinecraftBlockTypes2["AzureBluet"] = "minecraft:azure_bluet";
  MinecraftBlockTypes2["Bamboo"] = "minecraft:bamboo";
  MinecraftBlockTypes2["BambooBlock"] = "minecraft:bamboo_block";
  MinecraftBlockTypes2["BambooButton"] = "minecraft:bamboo_button";
  MinecraftBlockTypes2["BambooDoor"] = "minecraft:bamboo_door";
  MinecraftBlockTypes2["BambooDoubleSlab"] = "minecraft:bamboo_double_slab";
  MinecraftBlockTypes2["BambooFence"] = "minecraft:bamboo_fence";
  MinecraftBlockTypes2["BambooFenceGate"] = "minecraft:bamboo_fence_gate";
  MinecraftBlockTypes2["BambooHangingSign"] = "minecraft:bamboo_hanging_sign";
  MinecraftBlockTypes2["BambooMosaic"] = "minecraft:bamboo_mosaic";
  MinecraftBlockTypes2["BambooMosaicDoubleSlab"] = "minecraft:bamboo_mosaic_double_slab";
  MinecraftBlockTypes2["BambooMosaicSlab"] = "minecraft:bamboo_mosaic_slab";
  MinecraftBlockTypes2["BambooMosaicStairs"] = "minecraft:bamboo_mosaic_stairs";
  MinecraftBlockTypes2["BambooPlanks"] = "minecraft:bamboo_planks";
  MinecraftBlockTypes2["BambooPressurePlate"] = "minecraft:bamboo_pressure_plate";
  MinecraftBlockTypes2["BambooSapling"] = "minecraft:bamboo_sapling";
  MinecraftBlockTypes2["BambooSlab"] = "minecraft:bamboo_slab";
  MinecraftBlockTypes2["BambooStairs"] = "minecraft:bamboo_stairs";
  MinecraftBlockTypes2["BambooStandingSign"] = "minecraft:bamboo_standing_sign";
  MinecraftBlockTypes2["BambooTrapdoor"] = "minecraft:bamboo_trapdoor";
  MinecraftBlockTypes2["BambooWallSign"] = "minecraft:bamboo_wall_sign";
  MinecraftBlockTypes2["Barrel"] = "minecraft:barrel";
  MinecraftBlockTypes2["Barrier"] = "minecraft:barrier";
  MinecraftBlockTypes2["Basalt"] = "minecraft:basalt";
  MinecraftBlockTypes2["Beacon"] = "minecraft:beacon";
  MinecraftBlockTypes2["Bed"] = "minecraft:bed";
  MinecraftBlockTypes2["Bedrock"] = "minecraft:bedrock";
  MinecraftBlockTypes2["BeeNest"] = "minecraft:bee_nest";
  MinecraftBlockTypes2["Beehive"] = "minecraft:beehive";
  MinecraftBlockTypes2["Beetroot"] = "minecraft:beetroot";
  MinecraftBlockTypes2["Bell"] = "minecraft:bell";
  MinecraftBlockTypes2["BigDripleaf"] = "minecraft:big_dripleaf";
  MinecraftBlockTypes2["BirchButton"] = "minecraft:birch_button";
  MinecraftBlockTypes2["BirchDoor"] = "minecraft:birch_door";
  MinecraftBlockTypes2["BirchDoubleSlab"] = "minecraft:birch_double_slab";
  MinecraftBlockTypes2["BirchFence"] = "minecraft:birch_fence";
  MinecraftBlockTypes2["BirchFenceGate"] = "minecraft:birch_fence_gate";
  MinecraftBlockTypes2["BirchHangingSign"] = "minecraft:birch_hanging_sign";
  MinecraftBlockTypes2["BirchLeaves"] = "minecraft:birch_leaves";
  MinecraftBlockTypes2["BirchLog"] = "minecraft:birch_log";
  MinecraftBlockTypes2["BirchPlanks"] = "minecraft:birch_planks";
  MinecraftBlockTypes2["BirchPressurePlate"] = "minecraft:birch_pressure_plate";
  MinecraftBlockTypes2["BirchSapling"] = "minecraft:birch_sapling";
  MinecraftBlockTypes2["BirchSlab"] = "minecraft:birch_slab";
  MinecraftBlockTypes2["BirchStairs"] = "minecraft:birch_stairs";
  MinecraftBlockTypes2["BirchStandingSign"] = "minecraft:birch_standing_sign";
  MinecraftBlockTypes2["BirchTrapdoor"] = "minecraft:birch_trapdoor";
  MinecraftBlockTypes2["BirchWallSign"] = "minecraft:birch_wall_sign";
  MinecraftBlockTypes2["BirchWood"] = "minecraft:birch_wood";
  MinecraftBlockTypes2["BlackCandle"] = "minecraft:black_candle";
  MinecraftBlockTypes2["BlackCandleCake"] = "minecraft:black_candle_cake";
  MinecraftBlockTypes2["BlackCarpet"] = "minecraft:black_carpet";
  MinecraftBlockTypes2["BlackConcrete"] = "minecraft:black_concrete";
  MinecraftBlockTypes2["BlackConcretePowder"] = "minecraft:black_concrete_powder";
  MinecraftBlockTypes2["BlackGlazedTerracotta"] = "minecraft:black_glazed_terracotta";
  MinecraftBlockTypes2["BlackShulkerBox"] = "minecraft:black_shulker_box";
  MinecraftBlockTypes2["BlackStainedGlass"] = "minecraft:black_stained_glass";
  MinecraftBlockTypes2["BlackStainedGlassPane"] = "minecraft:black_stained_glass_pane";
  MinecraftBlockTypes2["BlackTerracotta"] = "minecraft:black_terracotta";
  MinecraftBlockTypes2["BlackWool"] = "minecraft:black_wool";
  MinecraftBlockTypes2["Blackstone"] = "minecraft:blackstone";
  MinecraftBlockTypes2["BlackstoneDoubleSlab"] = "minecraft:blackstone_double_slab";
  MinecraftBlockTypes2["BlackstoneSlab"] = "minecraft:blackstone_slab";
  MinecraftBlockTypes2["BlackstoneStairs"] = "minecraft:blackstone_stairs";
  MinecraftBlockTypes2["BlackstoneWall"] = "minecraft:blackstone_wall";
  MinecraftBlockTypes2["BlastFurnace"] = "minecraft:blast_furnace";
  MinecraftBlockTypes2["BlueCandle"] = "minecraft:blue_candle";
  MinecraftBlockTypes2["BlueCandleCake"] = "minecraft:blue_candle_cake";
  MinecraftBlockTypes2["BlueCarpet"] = "minecraft:blue_carpet";
  MinecraftBlockTypes2["BlueConcrete"] = "minecraft:blue_concrete";
  MinecraftBlockTypes2["BlueConcretePowder"] = "minecraft:blue_concrete_powder";
  MinecraftBlockTypes2["BlueGlazedTerracotta"] = "minecraft:blue_glazed_terracotta";
  MinecraftBlockTypes2["BlueIce"] = "minecraft:blue_ice";
  MinecraftBlockTypes2["BlueOrchid"] = "minecraft:blue_orchid";
  MinecraftBlockTypes2["BlueShulkerBox"] = "minecraft:blue_shulker_box";
  MinecraftBlockTypes2["BlueStainedGlass"] = "minecraft:blue_stained_glass";
  MinecraftBlockTypes2["BlueStainedGlassPane"] = "minecraft:blue_stained_glass_pane";
  MinecraftBlockTypes2["BlueTerracotta"] = "minecraft:blue_terracotta";
  MinecraftBlockTypes2["BlueWool"] = "minecraft:blue_wool";
  MinecraftBlockTypes2["BoneBlock"] = "minecraft:bone_block";
  MinecraftBlockTypes2["Bookshelf"] = "minecraft:bookshelf";
  MinecraftBlockTypes2["BorderBlock"] = "minecraft:border_block";
  MinecraftBlockTypes2["BrainCoral"] = "minecraft:brain_coral";
  MinecraftBlockTypes2["BrainCoralBlock"] = "minecraft:brain_coral_block";
  MinecraftBlockTypes2["BrainCoralFan"] = "minecraft:brain_coral_fan";
  MinecraftBlockTypes2["BrewingStand"] = "minecraft:brewing_stand";
  MinecraftBlockTypes2["BrickBlock"] = "minecraft:brick_block";
  MinecraftBlockTypes2["BrickSlab"] = "minecraft:brick_slab";
  MinecraftBlockTypes2["BrickStairs"] = "minecraft:brick_stairs";
  MinecraftBlockTypes2["BrownCandle"] = "minecraft:brown_candle";
  MinecraftBlockTypes2["BrownCandleCake"] = "minecraft:brown_candle_cake";
  MinecraftBlockTypes2["BrownCarpet"] = "minecraft:brown_carpet";
  MinecraftBlockTypes2["BrownConcrete"] = "minecraft:brown_concrete";
  MinecraftBlockTypes2["BrownConcretePowder"] = "minecraft:brown_concrete_powder";
  MinecraftBlockTypes2["BrownGlazedTerracotta"] = "minecraft:brown_glazed_terracotta";
  MinecraftBlockTypes2["BrownMushroom"] = "minecraft:brown_mushroom";
  MinecraftBlockTypes2["BrownMushroomBlock"] = "minecraft:brown_mushroom_block";
  MinecraftBlockTypes2["BrownShulkerBox"] = "minecraft:brown_shulker_box";
  MinecraftBlockTypes2["BrownStainedGlass"] = "minecraft:brown_stained_glass";
  MinecraftBlockTypes2["BrownStainedGlassPane"] = "minecraft:brown_stained_glass_pane";
  MinecraftBlockTypes2["BrownTerracotta"] = "minecraft:brown_terracotta";
  MinecraftBlockTypes2["BrownWool"] = "minecraft:brown_wool";
  MinecraftBlockTypes2["BubbleColumn"] = "minecraft:bubble_column";
  MinecraftBlockTypes2["BubbleCoral"] = "minecraft:bubble_coral";
  MinecraftBlockTypes2["BubbleCoralBlock"] = "minecraft:bubble_coral_block";
  MinecraftBlockTypes2["BubbleCoralFan"] = "minecraft:bubble_coral_fan";
  MinecraftBlockTypes2["BuddingAmethyst"] = "minecraft:budding_amethyst";
  MinecraftBlockTypes2["Cactus"] = "minecraft:cactus";
  MinecraftBlockTypes2["Cake"] = "minecraft:cake";
  MinecraftBlockTypes2["Calcite"] = "minecraft:calcite";
  MinecraftBlockTypes2["CalibratedSculkSensor"] = "minecraft:calibrated_sculk_sensor";
  MinecraftBlockTypes2["Camera"] = "minecraft:camera";
  MinecraftBlockTypes2["Campfire"] = "minecraft:campfire";
  MinecraftBlockTypes2["Candle"] = "minecraft:candle";
  MinecraftBlockTypes2["CandleCake"] = "minecraft:candle_cake";
  MinecraftBlockTypes2["Carrots"] = "minecraft:carrots";
  MinecraftBlockTypes2["CartographyTable"] = "minecraft:cartography_table";
  MinecraftBlockTypes2["CarvedPumpkin"] = "minecraft:carved_pumpkin";
  MinecraftBlockTypes2["Cauldron"] = "minecraft:cauldron";
  MinecraftBlockTypes2["CaveVines"] = "minecraft:cave_vines";
  MinecraftBlockTypes2["CaveVinesBodyWithBerries"] = "minecraft:cave_vines_body_with_berries";
  MinecraftBlockTypes2["CaveVinesHeadWithBerries"] = "minecraft:cave_vines_head_with_berries";
  MinecraftBlockTypes2["Chain"] = "minecraft:chain";
  MinecraftBlockTypes2["ChainCommandBlock"] = "minecraft:chain_command_block";
  MinecraftBlockTypes2["ChemicalHeat"] = "minecraft:chemical_heat";
  MinecraftBlockTypes2["ChemistryTable"] = "minecraft:chemistry_table";
  MinecraftBlockTypes2["CherryButton"] = "minecraft:cherry_button";
  MinecraftBlockTypes2["CherryDoor"] = "minecraft:cherry_door";
  MinecraftBlockTypes2["CherryDoubleSlab"] = "minecraft:cherry_double_slab";
  MinecraftBlockTypes2["CherryFence"] = "minecraft:cherry_fence";
  MinecraftBlockTypes2["CherryFenceGate"] = "minecraft:cherry_fence_gate";
  MinecraftBlockTypes2["CherryHangingSign"] = "minecraft:cherry_hanging_sign";
  MinecraftBlockTypes2["CherryLeaves"] = "minecraft:cherry_leaves";
  MinecraftBlockTypes2["CherryLog"] = "minecraft:cherry_log";
  MinecraftBlockTypes2["CherryPlanks"] = "minecraft:cherry_planks";
  MinecraftBlockTypes2["CherryPressurePlate"] = "minecraft:cherry_pressure_plate";
  MinecraftBlockTypes2["CherrySapling"] = "minecraft:cherry_sapling";
  MinecraftBlockTypes2["CherrySlab"] = "minecraft:cherry_slab";
  MinecraftBlockTypes2["CherryStairs"] = "minecraft:cherry_stairs";
  MinecraftBlockTypes2["CherryStandingSign"] = "minecraft:cherry_standing_sign";
  MinecraftBlockTypes2["CherryTrapdoor"] = "minecraft:cherry_trapdoor";
  MinecraftBlockTypes2["CherryWallSign"] = "minecraft:cherry_wall_sign";
  MinecraftBlockTypes2["CherryWood"] = "minecraft:cherry_wood";
  MinecraftBlockTypes2["Chest"] = "minecraft:chest";
  MinecraftBlockTypes2["ChiseledBookshelf"] = "minecraft:chiseled_bookshelf";
  MinecraftBlockTypes2["ChiseledCopper"] = "minecraft:chiseled_copper";
  MinecraftBlockTypes2["ChiseledDeepslate"] = "minecraft:chiseled_deepslate";
  MinecraftBlockTypes2["ChiseledNetherBricks"] = "minecraft:chiseled_nether_bricks";
  MinecraftBlockTypes2["ChiseledPolishedBlackstone"] = "minecraft:chiseled_polished_blackstone";
  MinecraftBlockTypes2["ChiseledTuff"] = "minecraft:chiseled_tuff";
  MinecraftBlockTypes2["ChiseledTuffBricks"] = "minecraft:chiseled_tuff_bricks";
  MinecraftBlockTypes2["ChorusFlower"] = "minecraft:chorus_flower";
  MinecraftBlockTypes2["ChorusPlant"] = "minecraft:chorus_plant";
  MinecraftBlockTypes2["Clay"] = "minecraft:clay";
  MinecraftBlockTypes2["ClientRequestPlaceholderBlock"] = "minecraft:client_request_placeholder_block";
  MinecraftBlockTypes2["CoalBlock"] = "minecraft:coal_block";
  MinecraftBlockTypes2["CoalOre"] = "minecraft:coal_ore";
  MinecraftBlockTypes2["CobbledDeepslate"] = "minecraft:cobbled_deepslate";
  MinecraftBlockTypes2["CobbledDeepslateDoubleSlab"] = "minecraft:cobbled_deepslate_double_slab";
  MinecraftBlockTypes2["CobbledDeepslateSlab"] = "minecraft:cobbled_deepslate_slab";
  MinecraftBlockTypes2["CobbledDeepslateStairs"] = "minecraft:cobbled_deepslate_stairs";
  MinecraftBlockTypes2["CobbledDeepslateWall"] = "minecraft:cobbled_deepslate_wall";
  MinecraftBlockTypes2["Cobblestone"] = "minecraft:cobblestone";
  MinecraftBlockTypes2["CobblestoneSlab"] = "minecraft:cobblestone_slab";
  MinecraftBlockTypes2["CobblestoneWall"] = "minecraft:cobblestone_wall";
  MinecraftBlockTypes2["Cocoa"] = "minecraft:cocoa";
  MinecraftBlockTypes2["ColoredTorchBp"] = "minecraft:colored_torch_bp";
  MinecraftBlockTypes2["ColoredTorchRg"] = "minecraft:colored_torch_rg";
  MinecraftBlockTypes2["CommandBlock"] = "minecraft:command_block";
  MinecraftBlockTypes2["Composter"] = "minecraft:composter";
  MinecraftBlockTypes2["Conduit"] = "minecraft:conduit";
  MinecraftBlockTypes2["CopperBlock"] = "minecraft:copper_block";
  MinecraftBlockTypes2["CopperBulb"] = "minecraft:copper_bulb";
  MinecraftBlockTypes2["CopperDoor"] = "minecraft:copper_door";
  MinecraftBlockTypes2["CopperGrate"] = "minecraft:copper_grate";
  MinecraftBlockTypes2["CopperOre"] = "minecraft:copper_ore";
  MinecraftBlockTypes2["CopperTrapdoor"] = "minecraft:copper_trapdoor";
  MinecraftBlockTypes2["CoralFanHang"] = "minecraft:coral_fan_hang";
  MinecraftBlockTypes2["CoralFanHang2"] = "minecraft:coral_fan_hang2";
  MinecraftBlockTypes2["CoralFanHang3"] = "minecraft:coral_fan_hang3";
  MinecraftBlockTypes2["Cornflower"] = "minecraft:cornflower";
  MinecraftBlockTypes2["CrackedDeepslateBricks"] = "minecraft:cracked_deepslate_bricks";
  MinecraftBlockTypes2["CrackedDeepslateTiles"] = "minecraft:cracked_deepslate_tiles";
  MinecraftBlockTypes2["CrackedNetherBricks"] = "minecraft:cracked_nether_bricks";
  MinecraftBlockTypes2["CrackedPolishedBlackstoneBricks"] = "minecraft:cracked_polished_blackstone_bricks";
  MinecraftBlockTypes2["Crafter"] = "minecraft:crafter";
  MinecraftBlockTypes2["CraftingTable"] = "minecraft:crafting_table";
  MinecraftBlockTypes2["CrimsonButton"] = "minecraft:crimson_button";
  MinecraftBlockTypes2["CrimsonDoor"] = "minecraft:crimson_door";
  MinecraftBlockTypes2["CrimsonDoubleSlab"] = "minecraft:crimson_double_slab";
  MinecraftBlockTypes2["CrimsonFence"] = "minecraft:crimson_fence";
  MinecraftBlockTypes2["CrimsonFenceGate"] = "minecraft:crimson_fence_gate";
  MinecraftBlockTypes2["CrimsonFungus"] = "minecraft:crimson_fungus";
  MinecraftBlockTypes2["CrimsonHangingSign"] = "minecraft:crimson_hanging_sign";
  MinecraftBlockTypes2["CrimsonHyphae"] = "minecraft:crimson_hyphae";
  MinecraftBlockTypes2["CrimsonNylium"] = "minecraft:crimson_nylium";
  MinecraftBlockTypes2["CrimsonPlanks"] = "minecraft:crimson_planks";
  MinecraftBlockTypes2["CrimsonPressurePlate"] = "minecraft:crimson_pressure_plate";
  MinecraftBlockTypes2["CrimsonRoots"] = "minecraft:crimson_roots";
  MinecraftBlockTypes2["CrimsonSlab"] = "minecraft:crimson_slab";
  MinecraftBlockTypes2["CrimsonStairs"] = "minecraft:crimson_stairs";
  MinecraftBlockTypes2["CrimsonStandingSign"] = "minecraft:crimson_standing_sign";
  MinecraftBlockTypes2["CrimsonStem"] = "minecraft:crimson_stem";
  MinecraftBlockTypes2["CrimsonTrapdoor"] = "minecraft:crimson_trapdoor";
  MinecraftBlockTypes2["CrimsonWallSign"] = "minecraft:crimson_wall_sign";
  MinecraftBlockTypes2["CryingObsidian"] = "minecraft:crying_obsidian";
  MinecraftBlockTypes2["CutCopper"] = "minecraft:cut_copper";
  MinecraftBlockTypes2["CutCopperSlab"] = "minecraft:cut_copper_slab";
  MinecraftBlockTypes2["CutCopperStairs"] = "minecraft:cut_copper_stairs";
  MinecraftBlockTypes2["CyanCandle"] = "minecraft:cyan_candle";
  MinecraftBlockTypes2["CyanCandleCake"] = "minecraft:cyan_candle_cake";
  MinecraftBlockTypes2["CyanCarpet"] = "minecraft:cyan_carpet";
  MinecraftBlockTypes2["CyanConcrete"] = "minecraft:cyan_concrete";
  MinecraftBlockTypes2["CyanConcretePowder"] = "minecraft:cyan_concrete_powder";
  MinecraftBlockTypes2["CyanGlazedTerracotta"] = "minecraft:cyan_glazed_terracotta";
  MinecraftBlockTypes2["CyanShulkerBox"] = "minecraft:cyan_shulker_box";
  MinecraftBlockTypes2["CyanStainedGlass"] = "minecraft:cyan_stained_glass";
  MinecraftBlockTypes2["CyanStainedGlassPane"] = "minecraft:cyan_stained_glass_pane";
  MinecraftBlockTypes2["CyanTerracotta"] = "minecraft:cyan_terracotta";
  MinecraftBlockTypes2["CyanWool"] = "minecraft:cyan_wool";
  MinecraftBlockTypes2["DarkOakButton"] = "minecraft:dark_oak_button";
  MinecraftBlockTypes2["DarkOakDoor"] = "minecraft:dark_oak_door";
  MinecraftBlockTypes2["DarkOakDoubleSlab"] = "minecraft:dark_oak_double_slab";
  MinecraftBlockTypes2["DarkOakFence"] = "minecraft:dark_oak_fence";
  MinecraftBlockTypes2["DarkOakFenceGate"] = "minecraft:dark_oak_fence_gate";
  MinecraftBlockTypes2["DarkOakHangingSign"] = "minecraft:dark_oak_hanging_sign";
  MinecraftBlockTypes2["DarkOakLeaves"] = "minecraft:dark_oak_leaves";
  MinecraftBlockTypes2["DarkOakLog"] = "minecraft:dark_oak_log";
  MinecraftBlockTypes2["DarkOakPlanks"] = "minecraft:dark_oak_planks";
  MinecraftBlockTypes2["DarkOakPressurePlate"] = "minecraft:dark_oak_pressure_plate";
  MinecraftBlockTypes2["DarkOakSapling"] = "minecraft:dark_oak_sapling";
  MinecraftBlockTypes2["DarkOakSlab"] = "minecraft:dark_oak_slab";
  MinecraftBlockTypes2["DarkOakStairs"] = "minecraft:dark_oak_stairs";
  MinecraftBlockTypes2["DarkOakTrapdoor"] = "minecraft:dark_oak_trapdoor";
  MinecraftBlockTypes2["DarkOakWood"] = "minecraft:dark_oak_wood";
  MinecraftBlockTypes2["DarkPrismarineStairs"] = "minecraft:dark_prismarine_stairs";
  MinecraftBlockTypes2["DarkoakStandingSign"] = "minecraft:darkoak_standing_sign";
  MinecraftBlockTypes2["DarkoakWallSign"] = "minecraft:darkoak_wall_sign";
  MinecraftBlockTypes2["DaylightDetector"] = "minecraft:daylight_detector";
  MinecraftBlockTypes2["DaylightDetectorInverted"] = "minecraft:daylight_detector_inverted";
  MinecraftBlockTypes2["DeadBrainCoral"] = "minecraft:dead_brain_coral";
  MinecraftBlockTypes2["DeadBrainCoralBlock"] = "minecraft:dead_brain_coral_block";
  MinecraftBlockTypes2["DeadBrainCoralFan"] = "minecraft:dead_brain_coral_fan";
  MinecraftBlockTypes2["DeadBubbleCoral"] = "minecraft:dead_bubble_coral";
  MinecraftBlockTypes2["DeadBubbleCoralBlock"] = "minecraft:dead_bubble_coral_block";
  MinecraftBlockTypes2["DeadBubbleCoralFan"] = "minecraft:dead_bubble_coral_fan";
  MinecraftBlockTypes2["DeadFireCoral"] = "minecraft:dead_fire_coral";
  MinecraftBlockTypes2["DeadFireCoralBlock"] = "minecraft:dead_fire_coral_block";
  MinecraftBlockTypes2["DeadFireCoralFan"] = "minecraft:dead_fire_coral_fan";
  MinecraftBlockTypes2["DeadHornCoral"] = "minecraft:dead_horn_coral";
  MinecraftBlockTypes2["DeadHornCoralBlock"] = "minecraft:dead_horn_coral_block";
  MinecraftBlockTypes2["DeadHornCoralFan"] = "minecraft:dead_horn_coral_fan";
  MinecraftBlockTypes2["DeadTubeCoral"] = "minecraft:dead_tube_coral";
  MinecraftBlockTypes2["DeadTubeCoralBlock"] = "minecraft:dead_tube_coral_block";
  MinecraftBlockTypes2["DeadTubeCoralFan"] = "minecraft:dead_tube_coral_fan";
  MinecraftBlockTypes2["Deadbush"] = "minecraft:deadbush";
  MinecraftBlockTypes2["DecoratedPot"] = "minecraft:decorated_pot";
  MinecraftBlockTypes2["Deepslate"] = "minecraft:deepslate";
  MinecraftBlockTypes2["DeepslateBrickDoubleSlab"] = "minecraft:deepslate_brick_double_slab";
  MinecraftBlockTypes2["DeepslateBrickSlab"] = "minecraft:deepslate_brick_slab";
  MinecraftBlockTypes2["DeepslateBrickStairs"] = "minecraft:deepslate_brick_stairs";
  MinecraftBlockTypes2["DeepslateBrickWall"] = "minecraft:deepslate_brick_wall";
  MinecraftBlockTypes2["DeepslateBricks"] = "minecraft:deepslate_bricks";
  MinecraftBlockTypes2["DeepslateCoalOre"] = "minecraft:deepslate_coal_ore";
  MinecraftBlockTypes2["DeepslateCopperOre"] = "minecraft:deepslate_copper_ore";
  MinecraftBlockTypes2["DeepslateDiamondOre"] = "minecraft:deepslate_diamond_ore";
  MinecraftBlockTypes2["DeepslateEmeraldOre"] = "minecraft:deepslate_emerald_ore";
  MinecraftBlockTypes2["DeepslateGoldOre"] = "minecraft:deepslate_gold_ore";
  MinecraftBlockTypes2["DeepslateIronOre"] = "minecraft:deepslate_iron_ore";
  MinecraftBlockTypes2["DeepslateLapisOre"] = "minecraft:deepslate_lapis_ore";
  MinecraftBlockTypes2["DeepslateRedstoneOre"] = "minecraft:deepslate_redstone_ore";
  MinecraftBlockTypes2["DeepslateTileDoubleSlab"] = "minecraft:deepslate_tile_double_slab";
  MinecraftBlockTypes2["DeepslateTileSlab"] = "minecraft:deepslate_tile_slab";
  MinecraftBlockTypes2["DeepslateTileStairs"] = "minecraft:deepslate_tile_stairs";
  MinecraftBlockTypes2["DeepslateTileWall"] = "minecraft:deepslate_tile_wall";
  MinecraftBlockTypes2["DeepslateTiles"] = "minecraft:deepslate_tiles";
  MinecraftBlockTypes2["Deny"] = "minecraft:deny";
  MinecraftBlockTypes2["DetectorRail"] = "minecraft:detector_rail";
  MinecraftBlockTypes2["DiamondBlock"] = "minecraft:diamond_block";
  MinecraftBlockTypes2["DiamondOre"] = "minecraft:diamond_ore";
  MinecraftBlockTypes2["Diorite"] = "minecraft:diorite";
  MinecraftBlockTypes2["DioriteStairs"] = "minecraft:diorite_stairs";
  MinecraftBlockTypes2["Dirt"] = "minecraft:dirt";
  MinecraftBlockTypes2["DirtWithRoots"] = "minecraft:dirt_with_roots";
  MinecraftBlockTypes2["Dispenser"] = "minecraft:dispenser";
  MinecraftBlockTypes2["DoubleCutCopperSlab"] = "minecraft:double_cut_copper_slab";
  MinecraftBlockTypes2["DoubleStoneBlockSlab"] = "minecraft:double_stone_block_slab";
  MinecraftBlockTypes2["DoubleStoneBlockSlab2"] = "minecraft:double_stone_block_slab2";
  MinecraftBlockTypes2["DoubleStoneBlockSlab3"] = "minecraft:double_stone_block_slab3";
  MinecraftBlockTypes2["DoubleStoneBlockSlab4"] = "minecraft:double_stone_block_slab4";
  MinecraftBlockTypes2["DragonEgg"] = "minecraft:dragon_egg";
  MinecraftBlockTypes2["DriedKelpBlock"] = "minecraft:dried_kelp_block";
  MinecraftBlockTypes2["DripstoneBlock"] = "minecraft:dripstone_block";
  MinecraftBlockTypes2["Dropper"] = "minecraft:dropper";
  MinecraftBlockTypes2["Element0"] = "minecraft:element_0";
  MinecraftBlockTypes2["Element1"] = "minecraft:element_1";
  MinecraftBlockTypes2["Element10"] = "minecraft:element_10";
  MinecraftBlockTypes2["Element100"] = "minecraft:element_100";
  MinecraftBlockTypes2["Element101"] = "minecraft:element_101";
  MinecraftBlockTypes2["Element102"] = "minecraft:element_102";
  MinecraftBlockTypes2["Element103"] = "minecraft:element_103";
  MinecraftBlockTypes2["Element104"] = "minecraft:element_104";
  MinecraftBlockTypes2["Element105"] = "minecraft:element_105";
  MinecraftBlockTypes2["Element106"] = "minecraft:element_106";
  MinecraftBlockTypes2["Element107"] = "minecraft:element_107";
  MinecraftBlockTypes2["Element108"] = "minecraft:element_108";
  MinecraftBlockTypes2["Element109"] = "minecraft:element_109";
  MinecraftBlockTypes2["Element11"] = "minecraft:element_11";
  MinecraftBlockTypes2["Element110"] = "minecraft:element_110";
  MinecraftBlockTypes2["Element111"] = "minecraft:element_111";
  MinecraftBlockTypes2["Element112"] = "minecraft:element_112";
  MinecraftBlockTypes2["Element113"] = "minecraft:element_113";
  MinecraftBlockTypes2["Element114"] = "minecraft:element_114";
  MinecraftBlockTypes2["Element115"] = "minecraft:element_115";
  MinecraftBlockTypes2["Element116"] = "minecraft:element_116";
  MinecraftBlockTypes2["Element117"] = "minecraft:element_117";
  MinecraftBlockTypes2["Element118"] = "minecraft:element_118";
  MinecraftBlockTypes2["Element12"] = "minecraft:element_12";
  MinecraftBlockTypes2["Element13"] = "minecraft:element_13";
  MinecraftBlockTypes2["Element14"] = "minecraft:element_14";
  MinecraftBlockTypes2["Element15"] = "minecraft:element_15";
  MinecraftBlockTypes2["Element16"] = "minecraft:element_16";
  MinecraftBlockTypes2["Element17"] = "minecraft:element_17";
  MinecraftBlockTypes2["Element18"] = "minecraft:element_18";
  MinecraftBlockTypes2["Element19"] = "minecraft:element_19";
  MinecraftBlockTypes2["Element2"] = "minecraft:element_2";
  MinecraftBlockTypes2["Element20"] = "minecraft:element_20";
  MinecraftBlockTypes2["Element21"] = "minecraft:element_21";
  MinecraftBlockTypes2["Element22"] = "minecraft:element_22";
  MinecraftBlockTypes2["Element23"] = "minecraft:element_23";
  MinecraftBlockTypes2["Element24"] = "minecraft:element_24";
  MinecraftBlockTypes2["Element25"] = "minecraft:element_25";
  MinecraftBlockTypes2["Element26"] = "minecraft:element_26";
  MinecraftBlockTypes2["Element27"] = "minecraft:element_27";
  MinecraftBlockTypes2["Element28"] = "minecraft:element_28";
  MinecraftBlockTypes2["Element29"] = "minecraft:element_29";
  MinecraftBlockTypes2["Element3"] = "minecraft:element_3";
  MinecraftBlockTypes2["Element30"] = "minecraft:element_30";
  MinecraftBlockTypes2["Element31"] = "minecraft:element_31";
  MinecraftBlockTypes2["Element32"] = "minecraft:element_32";
  MinecraftBlockTypes2["Element33"] = "minecraft:element_33";
  MinecraftBlockTypes2["Element34"] = "minecraft:element_34";
  MinecraftBlockTypes2["Element35"] = "minecraft:element_35";
  MinecraftBlockTypes2["Element36"] = "minecraft:element_36";
  MinecraftBlockTypes2["Element37"] = "minecraft:element_37";
  MinecraftBlockTypes2["Element38"] = "minecraft:element_38";
  MinecraftBlockTypes2["Element39"] = "minecraft:element_39";
  MinecraftBlockTypes2["Element4"] = "minecraft:element_4";
  MinecraftBlockTypes2["Element40"] = "minecraft:element_40";
  MinecraftBlockTypes2["Element41"] = "minecraft:element_41";
  MinecraftBlockTypes2["Element42"] = "minecraft:element_42";
  MinecraftBlockTypes2["Element43"] = "minecraft:element_43";
  MinecraftBlockTypes2["Element44"] = "minecraft:element_44";
  MinecraftBlockTypes2["Element45"] = "minecraft:element_45";
  MinecraftBlockTypes2["Element46"] = "minecraft:element_46";
  MinecraftBlockTypes2["Element47"] = "minecraft:element_47";
  MinecraftBlockTypes2["Element48"] = "minecraft:element_48";
  MinecraftBlockTypes2["Element49"] = "minecraft:element_49";
  MinecraftBlockTypes2["Element5"] = "minecraft:element_5";
  MinecraftBlockTypes2["Element50"] = "minecraft:element_50";
  MinecraftBlockTypes2["Element51"] = "minecraft:element_51";
  MinecraftBlockTypes2["Element52"] = "minecraft:element_52";
  MinecraftBlockTypes2["Element53"] = "minecraft:element_53";
  MinecraftBlockTypes2["Element54"] = "minecraft:element_54";
  MinecraftBlockTypes2["Element55"] = "minecraft:element_55";
  MinecraftBlockTypes2["Element56"] = "minecraft:element_56";
  MinecraftBlockTypes2["Element57"] = "minecraft:element_57";
  MinecraftBlockTypes2["Element58"] = "minecraft:element_58";
  MinecraftBlockTypes2["Element59"] = "minecraft:element_59";
  MinecraftBlockTypes2["Element6"] = "minecraft:element_6";
  MinecraftBlockTypes2["Element60"] = "minecraft:element_60";
  MinecraftBlockTypes2["Element61"] = "minecraft:element_61";
  MinecraftBlockTypes2["Element62"] = "minecraft:element_62";
  MinecraftBlockTypes2["Element63"] = "minecraft:element_63";
  MinecraftBlockTypes2["Element64"] = "minecraft:element_64";
  MinecraftBlockTypes2["Element65"] = "minecraft:element_65";
  MinecraftBlockTypes2["Element66"] = "minecraft:element_66";
  MinecraftBlockTypes2["Element67"] = "minecraft:element_67";
  MinecraftBlockTypes2["Element68"] = "minecraft:element_68";
  MinecraftBlockTypes2["Element69"] = "minecraft:element_69";
  MinecraftBlockTypes2["Element7"] = "minecraft:element_7";
  MinecraftBlockTypes2["Element70"] = "minecraft:element_70";
  MinecraftBlockTypes2["Element71"] = "minecraft:element_71";
  MinecraftBlockTypes2["Element72"] = "minecraft:element_72";
  MinecraftBlockTypes2["Element73"] = "minecraft:element_73";
  MinecraftBlockTypes2["Element74"] = "minecraft:element_74";
  MinecraftBlockTypes2["Element75"] = "minecraft:element_75";
  MinecraftBlockTypes2["Element76"] = "minecraft:element_76";
  MinecraftBlockTypes2["Element77"] = "minecraft:element_77";
  MinecraftBlockTypes2["Element78"] = "minecraft:element_78";
  MinecraftBlockTypes2["Element79"] = "minecraft:element_79";
  MinecraftBlockTypes2["Element8"] = "minecraft:element_8";
  MinecraftBlockTypes2["Element80"] = "minecraft:element_80";
  MinecraftBlockTypes2["Element81"] = "minecraft:element_81";
  MinecraftBlockTypes2["Element82"] = "minecraft:element_82";
  MinecraftBlockTypes2["Element83"] = "minecraft:element_83";
  MinecraftBlockTypes2["Element84"] = "minecraft:element_84";
  MinecraftBlockTypes2["Element85"] = "minecraft:element_85";
  MinecraftBlockTypes2["Element86"] = "minecraft:element_86";
  MinecraftBlockTypes2["Element87"] = "minecraft:element_87";
  MinecraftBlockTypes2["Element88"] = "minecraft:element_88";
  MinecraftBlockTypes2["Element89"] = "minecraft:element_89";
  MinecraftBlockTypes2["Element9"] = "minecraft:element_9";
  MinecraftBlockTypes2["Element90"] = "minecraft:element_90";
  MinecraftBlockTypes2["Element91"] = "minecraft:element_91";
  MinecraftBlockTypes2["Element92"] = "minecraft:element_92";
  MinecraftBlockTypes2["Element93"] = "minecraft:element_93";
  MinecraftBlockTypes2["Element94"] = "minecraft:element_94";
  MinecraftBlockTypes2["Element95"] = "minecraft:element_95";
  MinecraftBlockTypes2["Element96"] = "minecraft:element_96";
  MinecraftBlockTypes2["Element97"] = "minecraft:element_97";
  MinecraftBlockTypes2["Element98"] = "minecraft:element_98";
  MinecraftBlockTypes2["Element99"] = "minecraft:element_99";
  MinecraftBlockTypes2["EmeraldBlock"] = "minecraft:emerald_block";
  MinecraftBlockTypes2["EmeraldOre"] = "minecraft:emerald_ore";
  MinecraftBlockTypes2["EnchantingTable"] = "minecraft:enchanting_table";
  MinecraftBlockTypes2["EndBrickStairs"] = "minecraft:end_brick_stairs";
  MinecraftBlockTypes2["EndBricks"] = "minecraft:end_bricks";
  MinecraftBlockTypes2["EndGateway"] = "minecraft:end_gateway";
  MinecraftBlockTypes2["EndPortal"] = "minecraft:end_portal";
  MinecraftBlockTypes2["EndPortalFrame"] = "minecraft:end_portal_frame";
  MinecraftBlockTypes2["EndRod"] = "minecraft:end_rod";
  MinecraftBlockTypes2["EndStone"] = "minecraft:end_stone";
  MinecraftBlockTypes2["EnderChest"] = "minecraft:ender_chest";
  MinecraftBlockTypes2["ExposedChiseledCopper"] = "minecraft:exposed_chiseled_copper";
  MinecraftBlockTypes2["ExposedCopper"] = "minecraft:exposed_copper";
  MinecraftBlockTypes2["ExposedCopperBulb"] = "minecraft:exposed_copper_bulb";
  MinecraftBlockTypes2["ExposedCopperDoor"] = "minecraft:exposed_copper_door";
  MinecraftBlockTypes2["ExposedCopperGrate"] = "minecraft:exposed_copper_grate";
  MinecraftBlockTypes2["ExposedCopperTrapdoor"] = "minecraft:exposed_copper_trapdoor";
  MinecraftBlockTypes2["ExposedCutCopper"] = "minecraft:exposed_cut_copper";
  MinecraftBlockTypes2["ExposedCutCopperSlab"] = "minecraft:exposed_cut_copper_slab";
  MinecraftBlockTypes2["ExposedCutCopperStairs"] = "minecraft:exposed_cut_copper_stairs";
  MinecraftBlockTypes2["ExposedDoubleCutCopperSlab"] = "minecraft:exposed_double_cut_copper_slab";
  MinecraftBlockTypes2["Farmland"] = "minecraft:farmland";
  MinecraftBlockTypes2["FenceGate"] = "minecraft:fence_gate";
  MinecraftBlockTypes2["Fern"] = "minecraft:fern";
  MinecraftBlockTypes2["Fire"] = "minecraft:fire";
  MinecraftBlockTypes2["FireCoral"] = "minecraft:fire_coral";
  MinecraftBlockTypes2["FireCoralBlock"] = "minecraft:fire_coral_block";
  MinecraftBlockTypes2["FireCoralFan"] = "minecraft:fire_coral_fan";
  MinecraftBlockTypes2["FletchingTable"] = "minecraft:fletching_table";
  MinecraftBlockTypes2["FlowerPot"] = "minecraft:flower_pot";
  MinecraftBlockTypes2["FloweringAzalea"] = "minecraft:flowering_azalea";
  MinecraftBlockTypes2["FlowingLava"] = "minecraft:flowing_lava";
  MinecraftBlockTypes2["FlowingWater"] = "minecraft:flowing_water";
  MinecraftBlockTypes2["Frame"] = "minecraft:frame";
  MinecraftBlockTypes2["FrogSpawn"] = "minecraft:frog_spawn";
  MinecraftBlockTypes2["FrostedIce"] = "minecraft:frosted_ice";
  MinecraftBlockTypes2["Furnace"] = "minecraft:furnace";
  MinecraftBlockTypes2["GildedBlackstone"] = "minecraft:gilded_blackstone";
  MinecraftBlockTypes2["Glass"] = "minecraft:glass";
  MinecraftBlockTypes2["GlassPane"] = "minecraft:glass_pane";
  MinecraftBlockTypes2["GlowFrame"] = "minecraft:glow_frame";
  MinecraftBlockTypes2["GlowLichen"] = "minecraft:glow_lichen";
  MinecraftBlockTypes2["Glowingobsidian"] = "minecraft:glowingobsidian";
  MinecraftBlockTypes2["Glowstone"] = "minecraft:glowstone";
  MinecraftBlockTypes2["GoldBlock"] = "minecraft:gold_block";
  MinecraftBlockTypes2["GoldOre"] = "minecraft:gold_ore";
  MinecraftBlockTypes2["GoldenRail"] = "minecraft:golden_rail";
  MinecraftBlockTypes2["Granite"] = "minecraft:granite";
  MinecraftBlockTypes2["GraniteStairs"] = "minecraft:granite_stairs";
  MinecraftBlockTypes2["GrassBlock"] = "minecraft:grass_block";
  MinecraftBlockTypes2["GrassPath"] = "minecraft:grass_path";
  MinecraftBlockTypes2["Gravel"] = "minecraft:gravel";
  MinecraftBlockTypes2["GrayCandle"] = "minecraft:gray_candle";
  MinecraftBlockTypes2["GrayCandleCake"] = "minecraft:gray_candle_cake";
  MinecraftBlockTypes2["GrayCarpet"] = "minecraft:gray_carpet";
  MinecraftBlockTypes2["GrayConcrete"] = "minecraft:gray_concrete";
  MinecraftBlockTypes2["GrayConcretePowder"] = "minecraft:gray_concrete_powder";
  MinecraftBlockTypes2["GrayGlazedTerracotta"] = "minecraft:gray_glazed_terracotta";
  MinecraftBlockTypes2["GrayShulkerBox"] = "minecraft:gray_shulker_box";
  MinecraftBlockTypes2["GrayStainedGlass"] = "minecraft:gray_stained_glass";
  MinecraftBlockTypes2["GrayStainedGlassPane"] = "minecraft:gray_stained_glass_pane";
  MinecraftBlockTypes2["GrayTerracotta"] = "minecraft:gray_terracotta";
  MinecraftBlockTypes2["GrayWool"] = "minecraft:gray_wool";
  MinecraftBlockTypes2["GreenCandle"] = "minecraft:green_candle";
  MinecraftBlockTypes2["GreenCandleCake"] = "minecraft:green_candle_cake";
  MinecraftBlockTypes2["GreenCarpet"] = "minecraft:green_carpet";
  MinecraftBlockTypes2["GreenConcrete"] = "minecraft:green_concrete";
  MinecraftBlockTypes2["GreenConcretePowder"] = "minecraft:green_concrete_powder";
  MinecraftBlockTypes2["GreenGlazedTerracotta"] = "minecraft:green_glazed_terracotta";
  MinecraftBlockTypes2["GreenShulkerBox"] = "minecraft:green_shulker_box";
  MinecraftBlockTypes2["GreenStainedGlass"] = "minecraft:green_stained_glass";
  MinecraftBlockTypes2["GreenStainedGlassPane"] = "minecraft:green_stained_glass_pane";
  MinecraftBlockTypes2["GreenTerracotta"] = "minecraft:green_terracotta";
  MinecraftBlockTypes2["GreenWool"] = "minecraft:green_wool";
  MinecraftBlockTypes2["Grindstone"] = "minecraft:grindstone";
  MinecraftBlockTypes2["HangingRoots"] = "minecraft:hanging_roots";
  MinecraftBlockTypes2["HardBlackStainedGlass"] = "minecraft:hard_black_stained_glass";
  MinecraftBlockTypes2["HardBlackStainedGlassPane"] = "minecraft:hard_black_stained_glass_pane";
  MinecraftBlockTypes2["HardBlueStainedGlass"] = "minecraft:hard_blue_stained_glass";
  MinecraftBlockTypes2["HardBlueStainedGlassPane"] = "minecraft:hard_blue_stained_glass_pane";
  MinecraftBlockTypes2["HardBrownStainedGlass"] = "minecraft:hard_brown_stained_glass";
  MinecraftBlockTypes2["HardBrownStainedGlassPane"] = "minecraft:hard_brown_stained_glass_pane";
  MinecraftBlockTypes2["HardCyanStainedGlass"] = "minecraft:hard_cyan_stained_glass";
  MinecraftBlockTypes2["HardCyanStainedGlassPane"] = "minecraft:hard_cyan_stained_glass_pane";
  MinecraftBlockTypes2["HardGlass"] = "minecraft:hard_glass";
  MinecraftBlockTypes2["HardGlassPane"] = "minecraft:hard_glass_pane";
  MinecraftBlockTypes2["HardGrayStainedGlass"] = "minecraft:hard_gray_stained_glass";
  MinecraftBlockTypes2["HardGrayStainedGlassPane"] = "minecraft:hard_gray_stained_glass_pane";
  MinecraftBlockTypes2["HardGreenStainedGlass"] = "minecraft:hard_green_stained_glass";
  MinecraftBlockTypes2["HardGreenStainedGlassPane"] = "minecraft:hard_green_stained_glass_pane";
  MinecraftBlockTypes2["HardLightBlueStainedGlass"] = "minecraft:hard_light_blue_stained_glass";
  MinecraftBlockTypes2["HardLightBlueStainedGlassPane"] = "minecraft:hard_light_blue_stained_glass_pane";
  MinecraftBlockTypes2["HardLightGrayStainedGlass"] = "minecraft:hard_light_gray_stained_glass";
  MinecraftBlockTypes2["HardLightGrayStainedGlassPane"] = "minecraft:hard_light_gray_stained_glass_pane";
  MinecraftBlockTypes2["HardLimeStainedGlass"] = "minecraft:hard_lime_stained_glass";
  MinecraftBlockTypes2["HardLimeStainedGlassPane"] = "minecraft:hard_lime_stained_glass_pane";
  MinecraftBlockTypes2["HardMagentaStainedGlass"] = "minecraft:hard_magenta_stained_glass";
  MinecraftBlockTypes2["HardMagentaStainedGlassPane"] = "minecraft:hard_magenta_stained_glass_pane";
  MinecraftBlockTypes2["HardOrangeStainedGlass"] = "minecraft:hard_orange_stained_glass";
  MinecraftBlockTypes2["HardOrangeStainedGlassPane"] = "minecraft:hard_orange_stained_glass_pane";
  MinecraftBlockTypes2["HardPinkStainedGlass"] = "minecraft:hard_pink_stained_glass";
  MinecraftBlockTypes2["HardPinkStainedGlassPane"] = "minecraft:hard_pink_stained_glass_pane";
  MinecraftBlockTypes2["HardPurpleStainedGlass"] = "minecraft:hard_purple_stained_glass";
  MinecraftBlockTypes2["HardPurpleStainedGlassPane"] = "minecraft:hard_purple_stained_glass_pane";
  MinecraftBlockTypes2["HardRedStainedGlass"] = "minecraft:hard_red_stained_glass";
  MinecraftBlockTypes2["HardRedStainedGlassPane"] = "minecraft:hard_red_stained_glass_pane";
  MinecraftBlockTypes2["HardWhiteStainedGlass"] = "minecraft:hard_white_stained_glass";
  MinecraftBlockTypes2["HardWhiteStainedGlassPane"] = "minecraft:hard_white_stained_glass_pane";
  MinecraftBlockTypes2["HardYellowStainedGlass"] = "minecraft:hard_yellow_stained_glass";
  MinecraftBlockTypes2["HardYellowStainedGlassPane"] = "minecraft:hard_yellow_stained_glass_pane";
  MinecraftBlockTypes2["HardenedClay"] = "minecraft:hardened_clay";
  MinecraftBlockTypes2["HayBlock"] = "minecraft:hay_block";
  MinecraftBlockTypes2["HeavyCore"] = "minecraft:heavy_core";
  MinecraftBlockTypes2["HeavyWeightedPressurePlate"] = "minecraft:heavy_weighted_pressure_plate";
  MinecraftBlockTypes2["HoneyBlock"] = "minecraft:honey_block";
  MinecraftBlockTypes2["HoneycombBlock"] = "minecraft:honeycomb_block";
  MinecraftBlockTypes2["Hopper"] = "minecraft:hopper";
  MinecraftBlockTypes2["HornCoral"] = "minecraft:horn_coral";
  MinecraftBlockTypes2["HornCoralBlock"] = "minecraft:horn_coral_block";
  MinecraftBlockTypes2["HornCoralFan"] = "minecraft:horn_coral_fan";
  MinecraftBlockTypes2["Ice"] = "minecraft:ice";
  MinecraftBlockTypes2["InfestedDeepslate"] = "minecraft:infested_deepslate";
  MinecraftBlockTypes2["InfoUpdate"] = "minecraft:info_update";
  MinecraftBlockTypes2["InfoUpdate2"] = "minecraft:info_update2";
  MinecraftBlockTypes2["InvisibleBedrock"] = "minecraft:invisible_bedrock";
  MinecraftBlockTypes2["IronBars"] = "minecraft:iron_bars";
  MinecraftBlockTypes2["IronBlock"] = "minecraft:iron_block";
  MinecraftBlockTypes2["IronDoor"] = "minecraft:iron_door";
  MinecraftBlockTypes2["IronOre"] = "minecraft:iron_ore";
  MinecraftBlockTypes2["IronTrapdoor"] = "minecraft:iron_trapdoor";
  MinecraftBlockTypes2["Jigsaw"] = "minecraft:jigsaw";
  MinecraftBlockTypes2["Jukebox"] = "minecraft:jukebox";
  MinecraftBlockTypes2["JungleButton"] = "minecraft:jungle_button";
  MinecraftBlockTypes2["JungleDoor"] = "minecraft:jungle_door";
  MinecraftBlockTypes2["JungleDoubleSlab"] = "minecraft:jungle_double_slab";
  MinecraftBlockTypes2["JungleFence"] = "minecraft:jungle_fence";
  MinecraftBlockTypes2["JungleFenceGate"] = "minecraft:jungle_fence_gate";
  MinecraftBlockTypes2["JungleHangingSign"] = "minecraft:jungle_hanging_sign";
  MinecraftBlockTypes2["JungleLeaves"] = "minecraft:jungle_leaves";
  MinecraftBlockTypes2["JungleLog"] = "minecraft:jungle_log";
  MinecraftBlockTypes2["JunglePlanks"] = "minecraft:jungle_planks";
  MinecraftBlockTypes2["JunglePressurePlate"] = "minecraft:jungle_pressure_plate";
  MinecraftBlockTypes2["JungleSapling"] = "minecraft:jungle_sapling";
  MinecraftBlockTypes2["JungleSlab"] = "minecraft:jungle_slab";
  MinecraftBlockTypes2["JungleStairs"] = "minecraft:jungle_stairs";
  MinecraftBlockTypes2["JungleStandingSign"] = "minecraft:jungle_standing_sign";
  MinecraftBlockTypes2["JungleTrapdoor"] = "minecraft:jungle_trapdoor";
  MinecraftBlockTypes2["JungleWallSign"] = "minecraft:jungle_wall_sign";
  MinecraftBlockTypes2["JungleWood"] = "minecraft:jungle_wood";
  MinecraftBlockTypes2["Kelp"] = "minecraft:kelp";
  MinecraftBlockTypes2["Ladder"] = "minecraft:ladder";
  MinecraftBlockTypes2["Lantern"] = "minecraft:lantern";
  MinecraftBlockTypes2["LapisBlock"] = "minecraft:lapis_block";
  MinecraftBlockTypes2["LapisOre"] = "minecraft:lapis_ore";
  MinecraftBlockTypes2["LargeAmethystBud"] = "minecraft:large_amethyst_bud";
  MinecraftBlockTypes2["LargeFern"] = "minecraft:large_fern";
  MinecraftBlockTypes2["Lava"] = "minecraft:lava";
  MinecraftBlockTypes2["Lectern"] = "minecraft:lectern";
  MinecraftBlockTypes2["Lever"] = "minecraft:lever";
  MinecraftBlockTypes2["LightBlock"] = "minecraft:light_block";
  MinecraftBlockTypes2["LightBlueCandle"] = "minecraft:light_blue_candle";
  MinecraftBlockTypes2["LightBlueCandleCake"] = "minecraft:light_blue_candle_cake";
  MinecraftBlockTypes2["LightBlueCarpet"] = "minecraft:light_blue_carpet";
  MinecraftBlockTypes2["LightBlueConcrete"] = "minecraft:light_blue_concrete";
  MinecraftBlockTypes2["LightBlueConcretePowder"] = "minecraft:light_blue_concrete_powder";
  MinecraftBlockTypes2["LightBlueGlazedTerracotta"] = "minecraft:light_blue_glazed_terracotta";
  MinecraftBlockTypes2["LightBlueShulkerBox"] = "minecraft:light_blue_shulker_box";
  MinecraftBlockTypes2["LightBlueStainedGlass"] = "minecraft:light_blue_stained_glass";
  MinecraftBlockTypes2["LightBlueStainedGlassPane"] = "minecraft:light_blue_stained_glass_pane";
  MinecraftBlockTypes2["LightBlueTerracotta"] = "minecraft:light_blue_terracotta";
  MinecraftBlockTypes2["LightBlueWool"] = "minecraft:light_blue_wool";
  MinecraftBlockTypes2["LightGrayCandle"] = "minecraft:light_gray_candle";
  MinecraftBlockTypes2["LightGrayCandleCake"] = "minecraft:light_gray_candle_cake";
  MinecraftBlockTypes2["LightGrayCarpet"] = "minecraft:light_gray_carpet";
  MinecraftBlockTypes2["LightGrayConcrete"] = "minecraft:light_gray_concrete";
  MinecraftBlockTypes2["LightGrayConcretePowder"] = "minecraft:light_gray_concrete_powder";
  MinecraftBlockTypes2["LightGrayShulkerBox"] = "minecraft:light_gray_shulker_box";
  MinecraftBlockTypes2["LightGrayStainedGlass"] = "minecraft:light_gray_stained_glass";
  MinecraftBlockTypes2["LightGrayStainedGlassPane"] = "minecraft:light_gray_stained_glass_pane";
  MinecraftBlockTypes2["LightGrayTerracotta"] = "minecraft:light_gray_terracotta";
  MinecraftBlockTypes2["LightGrayWool"] = "minecraft:light_gray_wool";
  MinecraftBlockTypes2["LightWeightedPressurePlate"] = "minecraft:light_weighted_pressure_plate";
  MinecraftBlockTypes2["LightningRod"] = "minecraft:lightning_rod";
  MinecraftBlockTypes2["Lilac"] = "minecraft:lilac";
  MinecraftBlockTypes2["LilyOfTheValley"] = "minecraft:lily_of_the_valley";
  MinecraftBlockTypes2["LimeCandle"] = "minecraft:lime_candle";
  MinecraftBlockTypes2["LimeCandleCake"] = "minecraft:lime_candle_cake";
  MinecraftBlockTypes2["LimeCarpet"] = "minecraft:lime_carpet";
  MinecraftBlockTypes2["LimeConcrete"] = "minecraft:lime_concrete";
  MinecraftBlockTypes2["LimeConcretePowder"] = "minecraft:lime_concrete_powder";
  MinecraftBlockTypes2["LimeGlazedTerracotta"] = "minecraft:lime_glazed_terracotta";
  MinecraftBlockTypes2["LimeShulkerBox"] = "minecraft:lime_shulker_box";
  MinecraftBlockTypes2["LimeStainedGlass"] = "minecraft:lime_stained_glass";
  MinecraftBlockTypes2["LimeStainedGlassPane"] = "minecraft:lime_stained_glass_pane";
  MinecraftBlockTypes2["LimeTerracotta"] = "minecraft:lime_terracotta";
  MinecraftBlockTypes2["LimeWool"] = "minecraft:lime_wool";
  MinecraftBlockTypes2["LitBlastFurnace"] = "minecraft:lit_blast_furnace";
  MinecraftBlockTypes2["LitDeepslateRedstoneOre"] = "minecraft:lit_deepslate_redstone_ore";
  MinecraftBlockTypes2["LitFurnace"] = "minecraft:lit_furnace";
  MinecraftBlockTypes2["LitPumpkin"] = "minecraft:lit_pumpkin";
  MinecraftBlockTypes2["LitRedstoneLamp"] = "minecraft:lit_redstone_lamp";
  MinecraftBlockTypes2["LitRedstoneOre"] = "minecraft:lit_redstone_ore";
  MinecraftBlockTypes2["LitSmoker"] = "minecraft:lit_smoker";
  MinecraftBlockTypes2["Lodestone"] = "minecraft:lodestone";
  MinecraftBlockTypes2["Loom"] = "minecraft:loom";
  MinecraftBlockTypes2["MagentaCandle"] = "minecraft:magenta_candle";
  MinecraftBlockTypes2["MagentaCandleCake"] = "minecraft:magenta_candle_cake";
  MinecraftBlockTypes2["MagentaCarpet"] = "minecraft:magenta_carpet";
  MinecraftBlockTypes2["MagentaConcrete"] = "minecraft:magenta_concrete";
  MinecraftBlockTypes2["MagentaConcretePowder"] = "minecraft:magenta_concrete_powder";
  MinecraftBlockTypes2["MagentaGlazedTerracotta"] = "minecraft:magenta_glazed_terracotta";
  MinecraftBlockTypes2["MagentaShulkerBox"] = "minecraft:magenta_shulker_box";
  MinecraftBlockTypes2["MagentaStainedGlass"] = "minecraft:magenta_stained_glass";
  MinecraftBlockTypes2["MagentaStainedGlassPane"] = "minecraft:magenta_stained_glass_pane";
  MinecraftBlockTypes2["MagentaTerracotta"] = "minecraft:magenta_terracotta";
  MinecraftBlockTypes2["MagentaWool"] = "minecraft:magenta_wool";
  MinecraftBlockTypes2["Magma"] = "minecraft:magma";
  MinecraftBlockTypes2["MangroveButton"] = "minecraft:mangrove_button";
  MinecraftBlockTypes2["MangroveDoor"] = "minecraft:mangrove_door";
  MinecraftBlockTypes2["MangroveDoubleSlab"] = "minecraft:mangrove_double_slab";
  MinecraftBlockTypes2["MangroveFence"] = "minecraft:mangrove_fence";
  MinecraftBlockTypes2["MangroveFenceGate"] = "minecraft:mangrove_fence_gate";
  MinecraftBlockTypes2["MangroveHangingSign"] = "minecraft:mangrove_hanging_sign";
  MinecraftBlockTypes2["MangroveLeaves"] = "minecraft:mangrove_leaves";
  MinecraftBlockTypes2["MangroveLog"] = "minecraft:mangrove_log";
  MinecraftBlockTypes2["MangrovePlanks"] = "minecraft:mangrove_planks";
  MinecraftBlockTypes2["MangrovePressurePlate"] = "minecraft:mangrove_pressure_plate";
  MinecraftBlockTypes2["MangrovePropagule"] = "minecraft:mangrove_propagule";
  MinecraftBlockTypes2["MangroveRoots"] = "minecraft:mangrove_roots";
  MinecraftBlockTypes2["MangroveSlab"] = "minecraft:mangrove_slab";
  MinecraftBlockTypes2["MangroveStairs"] = "minecraft:mangrove_stairs";
  MinecraftBlockTypes2["MangroveStandingSign"] = "minecraft:mangrove_standing_sign";
  MinecraftBlockTypes2["MangroveTrapdoor"] = "minecraft:mangrove_trapdoor";
  MinecraftBlockTypes2["MangroveWallSign"] = "minecraft:mangrove_wall_sign";
  MinecraftBlockTypes2["MangroveWood"] = "minecraft:mangrove_wood";
  MinecraftBlockTypes2["MediumAmethystBud"] = "minecraft:medium_amethyst_bud";
  MinecraftBlockTypes2["MelonBlock"] = "minecraft:melon_block";
  MinecraftBlockTypes2["MelonStem"] = "minecraft:melon_stem";
  MinecraftBlockTypes2["MobSpawner"] = "minecraft:mob_spawner";
  MinecraftBlockTypes2["MonsterEgg"] = "minecraft:monster_egg";
  MinecraftBlockTypes2["MossBlock"] = "minecraft:moss_block";
  MinecraftBlockTypes2["MossCarpet"] = "minecraft:moss_carpet";
  MinecraftBlockTypes2["MossyCobblestone"] = "minecraft:mossy_cobblestone";
  MinecraftBlockTypes2["MossyCobblestoneStairs"] = "minecraft:mossy_cobblestone_stairs";
  MinecraftBlockTypes2["MossyStoneBrickStairs"] = "minecraft:mossy_stone_brick_stairs";
  MinecraftBlockTypes2["MovingBlock"] = "minecraft:moving_block";
  MinecraftBlockTypes2["Mud"] = "minecraft:mud";
  MinecraftBlockTypes2["MudBrickDoubleSlab"] = "minecraft:mud_brick_double_slab";
  MinecraftBlockTypes2["MudBrickSlab"] = "minecraft:mud_brick_slab";
  MinecraftBlockTypes2["MudBrickStairs"] = "minecraft:mud_brick_stairs";
  MinecraftBlockTypes2["MudBrickWall"] = "minecraft:mud_brick_wall";
  MinecraftBlockTypes2["MudBricks"] = "minecraft:mud_bricks";
  MinecraftBlockTypes2["MuddyMangroveRoots"] = "minecraft:muddy_mangrove_roots";
  MinecraftBlockTypes2["Mycelium"] = "minecraft:mycelium";
  MinecraftBlockTypes2["NetherBrick"] = "minecraft:nether_brick";
  MinecraftBlockTypes2["NetherBrickFence"] = "minecraft:nether_brick_fence";
  MinecraftBlockTypes2["NetherBrickSlab"] = "minecraft:nether_brick_slab";
  MinecraftBlockTypes2["NetherBrickStairs"] = "minecraft:nether_brick_stairs";
  MinecraftBlockTypes2["NetherGoldOre"] = "minecraft:nether_gold_ore";
  MinecraftBlockTypes2["NetherSprouts"] = "minecraft:nether_sprouts";
  MinecraftBlockTypes2["NetherWart"] = "minecraft:nether_wart";
  MinecraftBlockTypes2["NetherWartBlock"] = "minecraft:nether_wart_block";
  MinecraftBlockTypes2["NetheriteBlock"] = "minecraft:netherite_block";
  MinecraftBlockTypes2["Netherrack"] = "minecraft:netherrack";
  MinecraftBlockTypes2["Netherreactor"] = "minecraft:netherreactor";
  MinecraftBlockTypes2["NormalStoneStairs"] = "minecraft:normal_stone_stairs";
  MinecraftBlockTypes2["Noteblock"] = "minecraft:noteblock";
  MinecraftBlockTypes2["OakDoubleSlab"] = "minecraft:oak_double_slab";
  MinecraftBlockTypes2["OakFence"] = "minecraft:oak_fence";
  MinecraftBlockTypes2["OakHangingSign"] = "minecraft:oak_hanging_sign";
  MinecraftBlockTypes2["OakLeaves"] = "minecraft:oak_leaves";
  MinecraftBlockTypes2["OakLog"] = "minecraft:oak_log";
  MinecraftBlockTypes2["OakPlanks"] = "minecraft:oak_planks";
  MinecraftBlockTypes2["OakSapling"] = "minecraft:oak_sapling";
  MinecraftBlockTypes2["OakSlab"] = "minecraft:oak_slab";
  MinecraftBlockTypes2["OakStairs"] = "minecraft:oak_stairs";
  MinecraftBlockTypes2["OakWood"] = "minecraft:oak_wood";
  MinecraftBlockTypes2["Observer"] = "minecraft:observer";
  MinecraftBlockTypes2["Obsidian"] = "minecraft:obsidian";
  MinecraftBlockTypes2["OchreFroglight"] = "minecraft:ochre_froglight";
  MinecraftBlockTypes2["OrangeCandle"] = "minecraft:orange_candle";
  MinecraftBlockTypes2["OrangeCandleCake"] = "minecraft:orange_candle_cake";
  MinecraftBlockTypes2["OrangeCarpet"] = "minecraft:orange_carpet";
  MinecraftBlockTypes2["OrangeConcrete"] = "minecraft:orange_concrete";
  MinecraftBlockTypes2["OrangeConcretePowder"] = "minecraft:orange_concrete_powder";
  MinecraftBlockTypes2["OrangeGlazedTerracotta"] = "minecraft:orange_glazed_terracotta";
  MinecraftBlockTypes2["OrangeShulkerBox"] = "minecraft:orange_shulker_box";
  MinecraftBlockTypes2["OrangeStainedGlass"] = "minecraft:orange_stained_glass";
  MinecraftBlockTypes2["OrangeStainedGlassPane"] = "minecraft:orange_stained_glass_pane";
  MinecraftBlockTypes2["OrangeTerracotta"] = "minecraft:orange_terracotta";
  MinecraftBlockTypes2["OrangeTulip"] = "minecraft:orange_tulip";
  MinecraftBlockTypes2["OrangeWool"] = "minecraft:orange_wool";
  MinecraftBlockTypes2["OxeyeDaisy"] = "minecraft:oxeye_daisy";
  MinecraftBlockTypes2["OxidizedChiseledCopper"] = "minecraft:oxidized_chiseled_copper";
  MinecraftBlockTypes2["OxidizedCopper"] = "minecraft:oxidized_copper";
  MinecraftBlockTypes2["OxidizedCopperBulb"] = "minecraft:oxidized_copper_bulb";
  MinecraftBlockTypes2["OxidizedCopperDoor"] = "minecraft:oxidized_copper_door";
  MinecraftBlockTypes2["OxidizedCopperGrate"] = "minecraft:oxidized_copper_grate";
  MinecraftBlockTypes2["OxidizedCopperTrapdoor"] = "minecraft:oxidized_copper_trapdoor";
  MinecraftBlockTypes2["OxidizedCutCopper"] = "minecraft:oxidized_cut_copper";
  MinecraftBlockTypes2["OxidizedCutCopperSlab"] = "minecraft:oxidized_cut_copper_slab";
  MinecraftBlockTypes2["OxidizedCutCopperStairs"] = "minecraft:oxidized_cut_copper_stairs";
  MinecraftBlockTypes2["OxidizedDoubleCutCopperSlab"] = "minecraft:oxidized_double_cut_copper_slab";
  MinecraftBlockTypes2["PackedIce"] = "minecraft:packed_ice";
  MinecraftBlockTypes2["PackedMud"] = "minecraft:packed_mud";
  MinecraftBlockTypes2["PearlescentFroglight"] = "minecraft:pearlescent_froglight";
  MinecraftBlockTypes2["Peony"] = "minecraft:peony";
  MinecraftBlockTypes2["PetrifiedOakSlab"] = "minecraft:petrified_oak_slab";
  MinecraftBlockTypes2["PinkCandle"] = "minecraft:pink_candle";
  MinecraftBlockTypes2["PinkCandleCake"] = "minecraft:pink_candle_cake";
  MinecraftBlockTypes2["PinkCarpet"] = "minecraft:pink_carpet";
  MinecraftBlockTypes2["PinkConcrete"] = "minecraft:pink_concrete";
  MinecraftBlockTypes2["PinkConcretePowder"] = "minecraft:pink_concrete_powder";
  MinecraftBlockTypes2["PinkGlazedTerracotta"] = "minecraft:pink_glazed_terracotta";
  MinecraftBlockTypes2["PinkPetals"] = "minecraft:pink_petals";
  MinecraftBlockTypes2["PinkShulkerBox"] = "minecraft:pink_shulker_box";
  MinecraftBlockTypes2["PinkStainedGlass"] = "minecraft:pink_stained_glass";
  MinecraftBlockTypes2["PinkStainedGlassPane"] = "minecraft:pink_stained_glass_pane";
  MinecraftBlockTypes2["PinkTerracotta"] = "minecraft:pink_terracotta";
  MinecraftBlockTypes2["PinkTulip"] = "minecraft:pink_tulip";
  MinecraftBlockTypes2["PinkWool"] = "minecraft:pink_wool";
  MinecraftBlockTypes2["Piston"] = "minecraft:piston";
  MinecraftBlockTypes2["PistonArmCollision"] = "minecraft:piston_arm_collision";
  MinecraftBlockTypes2["PitcherCrop"] = "minecraft:pitcher_crop";
  MinecraftBlockTypes2["PitcherPlant"] = "minecraft:pitcher_plant";
  MinecraftBlockTypes2["Podzol"] = "minecraft:podzol";
  MinecraftBlockTypes2["PointedDripstone"] = "minecraft:pointed_dripstone";
  MinecraftBlockTypes2["PolishedAndesite"] = "minecraft:polished_andesite";
  MinecraftBlockTypes2["PolishedAndesiteStairs"] = "minecraft:polished_andesite_stairs";
  MinecraftBlockTypes2["PolishedBasalt"] = "minecraft:polished_basalt";
  MinecraftBlockTypes2["PolishedBlackstone"] = "minecraft:polished_blackstone";
  MinecraftBlockTypes2["PolishedBlackstoneBrickDoubleSlab"] = "minecraft:polished_blackstone_brick_double_slab";
  MinecraftBlockTypes2["PolishedBlackstoneBrickSlab"] = "minecraft:polished_blackstone_brick_slab";
  MinecraftBlockTypes2["PolishedBlackstoneBrickStairs"] = "minecraft:polished_blackstone_brick_stairs";
  MinecraftBlockTypes2["PolishedBlackstoneBrickWall"] = "minecraft:polished_blackstone_brick_wall";
  MinecraftBlockTypes2["PolishedBlackstoneBricks"] = "minecraft:polished_blackstone_bricks";
  MinecraftBlockTypes2["PolishedBlackstoneButton"] = "minecraft:polished_blackstone_button";
  MinecraftBlockTypes2["PolishedBlackstoneDoubleSlab"] = "minecraft:polished_blackstone_double_slab";
  MinecraftBlockTypes2["PolishedBlackstonePressurePlate"] = "minecraft:polished_blackstone_pressure_plate";
  MinecraftBlockTypes2["PolishedBlackstoneSlab"] = "minecraft:polished_blackstone_slab";
  MinecraftBlockTypes2["PolishedBlackstoneStairs"] = "minecraft:polished_blackstone_stairs";
  MinecraftBlockTypes2["PolishedBlackstoneWall"] = "minecraft:polished_blackstone_wall";
  MinecraftBlockTypes2["PolishedDeepslate"] = "minecraft:polished_deepslate";
  MinecraftBlockTypes2["PolishedDeepslateDoubleSlab"] = "minecraft:polished_deepslate_double_slab";
  MinecraftBlockTypes2["PolishedDeepslateSlab"] = "minecraft:polished_deepslate_slab";
  MinecraftBlockTypes2["PolishedDeepslateStairs"] = "minecraft:polished_deepslate_stairs";
  MinecraftBlockTypes2["PolishedDeepslateWall"] = "minecraft:polished_deepslate_wall";
  MinecraftBlockTypes2["PolishedDiorite"] = "minecraft:polished_diorite";
  MinecraftBlockTypes2["PolishedDioriteStairs"] = "minecraft:polished_diorite_stairs";
  MinecraftBlockTypes2["PolishedGranite"] = "minecraft:polished_granite";
  MinecraftBlockTypes2["PolishedGraniteStairs"] = "minecraft:polished_granite_stairs";
  MinecraftBlockTypes2["PolishedTuff"] = "minecraft:polished_tuff";
  MinecraftBlockTypes2["PolishedTuffDoubleSlab"] = "minecraft:polished_tuff_double_slab";
  MinecraftBlockTypes2["PolishedTuffSlab"] = "minecraft:polished_tuff_slab";
  MinecraftBlockTypes2["PolishedTuffStairs"] = "minecraft:polished_tuff_stairs";
  MinecraftBlockTypes2["PolishedTuffWall"] = "minecraft:polished_tuff_wall";
  MinecraftBlockTypes2["Poppy"] = "minecraft:poppy";
  MinecraftBlockTypes2["Portal"] = "minecraft:portal";
  MinecraftBlockTypes2["Potatoes"] = "minecraft:potatoes";
  MinecraftBlockTypes2["PowderSnow"] = "minecraft:powder_snow";
  MinecraftBlockTypes2["PoweredComparator"] = "minecraft:powered_comparator";
  MinecraftBlockTypes2["PoweredRepeater"] = "minecraft:powered_repeater";
  MinecraftBlockTypes2["Prismarine"] = "minecraft:prismarine";
  MinecraftBlockTypes2["PrismarineBricksStairs"] = "minecraft:prismarine_bricks_stairs";
  MinecraftBlockTypes2["PrismarineStairs"] = "minecraft:prismarine_stairs";
  MinecraftBlockTypes2["Pumpkin"] = "minecraft:pumpkin";
  MinecraftBlockTypes2["PumpkinStem"] = "minecraft:pumpkin_stem";
  MinecraftBlockTypes2["PurpleCandle"] = "minecraft:purple_candle";
  MinecraftBlockTypes2["PurpleCandleCake"] = "minecraft:purple_candle_cake";
  MinecraftBlockTypes2["PurpleCarpet"] = "minecraft:purple_carpet";
  MinecraftBlockTypes2["PurpleConcrete"] = "minecraft:purple_concrete";
  MinecraftBlockTypes2["PurpleConcretePowder"] = "minecraft:purple_concrete_powder";
  MinecraftBlockTypes2["PurpleGlazedTerracotta"] = "minecraft:purple_glazed_terracotta";
  MinecraftBlockTypes2["PurpleShulkerBox"] = "minecraft:purple_shulker_box";
  MinecraftBlockTypes2["PurpleStainedGlass"] = "minecraft:purple_stained_glass";
  MinecraftBlockTypes2["PurpleStainedGlassPane"] = "minecraft:purple_stained_glass_pane";
  MinecraftBlockTypes2["PurpleTerracotta"] = "minecraft:purple_terracotta";
  MinecraftBlockTypes2["PurpleWool"] = "minecraft:purple_wool";
  MinecraftBlockTypes2["PurpurBlock"] = "minecraft:purpur_block";
  MinecraftBlockTypes2["PurpurStairs"] = "minecraft:purpur_stairs";
  MinecraftBlockTypes2["QuartzBlock"] = "minecraft:quartz_block";
  MinecraftBlockTypes2["QuartzBricks"] = "minecraft:quartz_bricks";
  MinecraftBlockTypes2["QuartzOre"] = "minecraft:quartz_ore";
  MinecraftBlockTypes2["QuartzSlab"] = "minecraft:quartz_slab";
  MinecraftBlockTypes2["QuartzStairs"] = "minecraft:quartz_stairs";
  MinecraftBlockTypes2["Rail"] = "minecraft:rail";
  MinecraftBlockTypes2["RawCopperBlock"] = "minecraft:raw_copper_block";
  MinecraftBlockTypes2["RawGoldBlock"] = "minecraft:raw_gold_block";
  MinecraftBlockTypes2["RawIronBlock"] = "minecraft:raw_iron_block";
  MinecraftBlockTypes2["RedCandle"] = "minecraft:red_candle";
  MinecraftBlockTypes2["RedCandleCake"] = "minecraft:red_candle_cake";
  MinecraftBlockTypes2["RedCarpet"] = "minecraft:red_carpet";
  MinecraftBlockTypes2["RedConcrete"] = "minecraft:red_concrete";
  MinecraftBlockTypes2["RedConcretePowder"] = "minecraft:red_concrete_powder";
  MinecraftBlockTypes2["RedGlazedTerracotta"] = "minecraft:red_glazed_terracotta";
  MinecraftBlockTypes2["RedMushroom"] = "minecraft:red_mushroom";
  MinecraftBlockTypes2["RedMushroomBlock"] = "minecraft:red_mushroom_block";
  MinecraftBlockTypes2["RedNetherBrick"] = "minecraft:red_nether_brick";
  MinecraftBlockTypes2["RedNetherBrickStairs"] = "minecraft:red_nether_brick_stairs";
  MinecraftBlockTypes2["RedSandstone"] = "minecraft:red_sandstone";
  MinecraftBlockTypes2["RedSandstoneStairs"] = "minecraft:red_sandstone_stairs";
  MinecraftBlockTypes2["RedShulkerBox"] = "minecraft:red_shulker_box";
  MinecraftBlockTypes2["RedStainedGlass"] = "minecraft:red_stained_glass";
  MinecraftBlockTypes2["RedStainedGlassPane"] = "minecraft:red_stained_glass_pane";
  MinecraftBlockTypes2["RedTerracotta"] = "minecraft:red_terracotta";
  MinecraftBlockTypes2["RedTulip"] = "minecraft:red_tulip";
  MinecraftBlockTypes2["RedWool"] = "minecraft:red_wool";
  MinecraftBlockTypes2["RedstoneBlock"] = "minecraft:redstone_block";
  MinecraftBlockTypes2["RedstoneLamp"] = "minecraft:redstone_lamp";
  MinecraftBlockTypes2["RedstoneOre"] = "minecraft:redstone_ore";
  MinecraftBlockTypes2["RedstoneTorch"] = "minecraft:redstone_torch";
  MinecraftBlockTypes2["RedstoneWire"] = "minecraft:redstone_wire";
  MinecraftBlockTypes2["Reeds"] = "minecraft:reeds";
  MinecraftBlockTypes2["ReinforcedDeepslate"] = "minecraft:reinforced_deepslate";
  MinecraftBlockTypes2["RepeatingCommandBlock"] = "minecraft:repeating_command_block";
  MinecraftBlockTypes2["Reserved6"] = "minecraft:reserved6";
  MinecraftBlockTypes2["RespawnAnchor"] = "minecraft:respawn_anchor";
  MinecraftBlockTypes2["RoseBush"] = "minecraft:rose_bush";
  MinecraftBlockTypes2["Sand"] = "minecraft:sand";
  MinecraftBlockTypes2["Sandstone"] = "minecraft:sandstone";
  MinecraftBlockTypes2["SandstoneSlab"] = "minecraft:sandstone_slab";
  MinecraftBlockTypes2["SandstoneStairs"] = "minecraft:sandstone_stairs";
  MinecraftBlockTypes2["Scaffolding"] = "minecraft:scaffolding";
  MinecraftBlockTypes2["Sculk"] = "minecraft:sculk";
  MinecraftBlockTypes2["SculkCatalyst"] = "minecraft:sculk_catalyst";
  MinecraftBlockTypes2["SculkSensor"] = "minecraft:sculk_sensor";
  MinecraftBlockTypes2["SculkShrieker"] = "minecraft:sculk_shrieker";
  MinecraftBlockTypes2["SculkVein"] = "minecraft:sculk_vein";
  MinecraftBlockTypes2["SeaLantern"] = "minecraft:sea_lantern";
  MinecraftBlockTypes2["SeaPickle"] = "minecraft:sea_pickle";
  MinecraftBlockTypes2["Seagrass"] = "minecraft:seagrass";
  MinecraftBlockTypes2["ShortGrass"] = "minecraft:short_grass";
  MinecraftBlockTypes2["Shroomlight"] = "minecraft:shroomlight";
  MinecraftBlockTypes2["SilverGlazedTerracotta"] = "minecraft:silver_glazed_terracotta";
  MinecraftBlockTypes2["Skull"] = "minecraft:skull";
  MinecraftBlockTypes2["Slime"] = "minecraft:slime";
  MinecraftBlockTypes2["SmallAmethystBud"] = "minecraft:small_amethyst_bud";
  MinecraftBlockTypes2["SmallDripleafBlock"] = "minecraft:small_dripleaf_block";
  MinecraftBlockTypes2["SmithingTable"] = "minecraft:smithing_table";
  MinecraftBlockTypes2["Smoker"] = "minecraft:smoker";
  MinecraftBlockTypes2["SmoothBasalt"] = "minecraft:smooth_basalt";
  MinecraftBlockTypes2["SmoothQuartzStairs"] = "minecraft:smooth_quartz_stairs";
  MinecraftBlockTypes2["SmoothRedSandstoneStairs"] = "minecraft:smooth_red_sandstone_stairs";
  MinecraftBlockTypes2["SmoothSandstoneStairs"] = "minecraft:smooth_sandstone_stairs";
  MinecraftBlockTypes2["SmoothStone"] = "minecraft:smooth_stone";
  MinecraftBlockTypes2["SmoothStoneSlab"] = "minecraft:smooth_stone_slab";
  MinecraftBlockTypes2["SnifferEgg"] = "minecraft:sniffer_egg";
  MinecraftBlockTypes2["Snow"] = "minecraft:snow";
  MinecraftBlockTypes2["SnowLayer"] = "minecraft:snow_layer";
  MinecraftBlockTypes2["SoulCampfire"] = "minecraft:soul_campfire";
  MinecraftBlockTypes2["SoulFire"] = "minecraft:soul_fire";
  MinecraftBlockTypes2["SoulLantern"] = "minecraft:soul_lantern";
  MinecraftBlockTypes2["SoulSand"] = "minecraft:soul_sand";
  MinecraftBlockTypes2["SoulSoil"] = "minecraft:soul_soil";
  MinecraftBlockTypes2["SoulTorch"] = "minecraft:soul_torch";
  MinecraftBlockTypes2["Sponge"] = "minecraft:sponge";
  MinecraftBlockTypes2["SporeBlossom"] = "minecraft:spore_blossom";
  MinecraftBlockTypes2["SpruceButton"] = "minecraft:spruce_button";
  MinecraftBlockTypes2["SpruceDoor"] = "minecraft:spruce_door";
  MinecraftBlockTypes2["SpruceDoubleSlab"] = "minecraft:spruce_double_slab";
  MinecraftBlockTypes2["SpruceFence"] = "minecraft:spruce_fence";
  MinecraftBlockTypes2["SpruceFenceGate"] = "minecraft:spruce_fence_gate";
  MinecraftBlockTypes2["SpruceHangingSign"] = "minecraft:spruce_hanging_sign";
  MinecraftBlockTypes2["SpruceLeaves"] = "minecraft:spruce_leaves";
  MinecraftBlockTypes2["SpruceLog"] = "minecraft:spruce_log";
  MinecraftBlockTypes2["SprucePlanks"] = "minecraft:spruce_planks";
  MinecraftBlockTypes2["SprucePressurePlate"] = "minecraft:spruce_pressure_plate";
  MinecraftBlockTypes2["SpruceSapling"] = "minecraft:spruce_sapling";
  MinecraftBlockTypes2["SpruceSlab"] = "minecraft:spruce_slab";
  MinecraftBlockTypes2["SpruceStairs"] = "minecraft:spruce_stairs";
  MinecraftBlockTypes2["SpruceStandingSign"] = "minecraft:spruce_standing_sign";
  MinecraftBlockTypes2["SpruceTrapdoor"] = "minecraft:spruce_trapdoor";
  MinecraftBlockTypes2["SpruceWallSign"] = "minecraft:spruce_wall_sign";
  MinecraftBlockTypes2["SpruceWood"] = "minecraft:spruce_wood";
  MinecraftBlockTypes2["StandingBanner"] = "minecraft:standing_banner";
  MinecraftBlockTypes2["StandingSign"] = "minecraft:standing_sign";
  MinecraftBlockTypes2["StickyPiston"] = "minecraft:sticky_piston";
  MinecraftBlockTypes2["StickyPistonArmCollision"] = "minecraft:sticky_piston_arm_collision";
  MinecraftBlockTypes2["Stone"] = "minecraft:stone";
  MinecraftBlockTypes2["StoneBlockSlab2"] = "minecraft:stone_block_slab2";
  MinecraftBlockTypes2["StoneBlockSlab3"] = "minecraft:stone_block_slab3";
  MinecraftBlockTypes2["StoneBlockSlab4"] = "minecraft:stone_block_slab4";
  MinecraftBlockTypes2["StoneBrickSlab"] = "minecraft:stone_brick_slab";
  MinecraftBlockTypes2["StoneBrickStairs"] = "minecraft:stone_brick_stairs";
  MinecraftBlockTypes2["StoneButton"] = "minecraft:stone_button";
  MinecraftBlockTypes2["StonePressurePlate"] = "minecraft:stone_pressure_plate";
  MinecraftBlockTypes2["StoneStairs"] = "minecraft:stone_stairs";
  MinecraftBlockTypes2["Stonebrick"] = "minecraft:stonebrick";
  MinecraftBlockTypes2["Stonecutter"] = "minecraft:stonecutter";
  MinecraftBlockTypes2["StonecutterBlock"] = "minecraft:stonecutter_block";
  MinecraftBlockTypes2["StrippedAcaciaLog"] = "minecraft:stripped_acacia_log";
  MinecraftBlockTypes2["StrippedAcaciaWood"] = "minecraft:stripped_acacia_wood";
  MinecraftBlockTypes2["StrippedBambooBlock"] = "minecraft:stripped_bamboo_block";
  MinecraftBlockTypes2["StrippedBirchLog"] = "minecraft:stripped_birch_log";
  MinecraftBlockTypes2["StrippedBirchWood"] = "minecraft:stripped_birch_wood";
  MinecraftBlockTypes2["StrippedCherryLog"] = "minecraft:stripped_cherry_log";
  MinecraftBlockTypes2["StrippedCherryWood"] = "minecraft:stripped_cherry_wood";
  MinecraftBlockTypes2["StrippedCrimsonHyphae"] = "minecraft:stripped_crimson_hyphae";
  MinecraftBlockTypes2["StrippedCrimsonStem"] = "minecraft:stripped_crimson_stem";
  MinecraftBlockTypes2["StrippedDarkOakLog"] = "minecraft:stripped_dark_oak_log";
  MinecraftBlockTypes2["StrippedDarkOakWood"] = "minecraft:stripped_dark_oak_wood";
  MinecraftBlockTypes2["StrippedJungleLog"] = "minecraft:stripped_jungle_log";
  MinecraftBlockTypes2["StrippedJungleWood"] = "minecraft:stripped_jungle_wood";
  MinecraftBlockTypes2["StrippedMangroveLog"] = "minecraft:stripped_mangrove_log";
  MinecraftBlockTypes2["StrippedMangroveWood"] = "minecraft:stripped_mangrove_wood";
  MinecraftBlockTypes2["StrippedOakLog"] = "minecraft:stripped_oak_log";
  MinecraftBlockTypes2["StrippedOakWood"] = "minecraft:stripped_oak_wood";
  MinecraftBlockTypes2["StrippedSpruceLog"] = "minecraft:stripped_spruce_log";
  MinecraftBlockTypes2["StrippedSpruceWood"] = "minecraft:stripped_spruce_wood";
  MinecraftBlockTypes2["StrippedWarpedHyphae"] = "minecraft:stripped_warped_hyphae";
  MinecraftBlockTypes2["StrippedWarpedStem"] = "minecraft:stripped_warped_stem";
  MinecraftBlockTypes2["StructureBlock"] = "minecraft:structure_block";
  MinecraftBlockTypes2["StructureVoid"] = "minecraft:structure_void";
  MinecraftBlockTypes2["Sunflower"] = "minecraft:sunflower";
  MinecraftBlockTypes2["SuspiciousGravel"] = "minecraft:suspicious_gravel";
  MinecraftBlockTypes2["SuspiciousSand"] = "minecraft:suspicious_sand";
  MinecraftBlockTypes2["SweetBerryBush"] = "minecraft:sweet_berry_bush";
  MinecraftBlockTypes2["TallGrass"] = "minecraft:tall_grass";
  MinecraftBlockTypes2["Target"] = "minecraft:target";
  MinecraftBlockTypes2["TintedGlass"] = "minecraft:tinted_glass";
  MinecraftBlockTypes2["Tnt"] = "minecraft:tnt";
  MinecraftBlockTypes2["Torch"] = "minecraft:torch";
  MinecraftBlockTypes2["Torchflower"] = "minecraft:torchflower";
  MinecraftBlockTypes2["TorchflowerCrop"] = "minecraft:torchflower_crop";
  MinecraftBlockTypes2["Trapdoor"] = "minecraft:trapdoor";
  MinecraftBlockTypes2["TrappedChest"] = "minecraft:trapped_chest";
  MinecraftBlockTypes2["TrialSpawner"] = "minecraft:trial_spawner";
  MinecraftBlockTypes2["TripWire"] = "minecraft:trip_wire";
  MinecraftBlockTypes2["TripwireHook"] = "minecraft:tripwire_hook";
  MinecraftBlockTypes2["TubeCoral"] = "minecraft:tube_coral";
  MinecraftBlockTypes2["TubeCoralBlock"] = "minecraft:tube_coral_block";
  MinecraftBlockTypes2["TubeCoralFan"] = "minecraft:tube_coral_fan";
  MinecraftBlockTypes2["Tuff"] = "minecraft:tuff";
  MinecraftBlockTypes2["TuffBrickDoubleSlab"] = "minecraft:tuff_brick_double_slab";
  MinecraftBlockTypes2["TuffBrickSlab"] = "minecraft:tuff_brick_slab";
  MinecraftBlockTypes2["TuffBrickStairs"] = "minecraft:tuff_brick_stairs";
  MinecraftBlockTypes2["TuffBrickWall"] = "minecraft:tuff_brick_wall";
  MinecraftBlockTypes2["TuffBricks"] = "minecraft:tuff_bricks";
  MinecraftBlockTypes2["TuffDoubleSlab"] = "minecraft:tuff_double_slab";
  MinecraftBlockTypes2["TuffSlab"] = "minecraft:tuff_slab";
  MinecraftBlockTypes2["TuffStairs"] = "minecraft:tuff_stairs";
  MinecraftBlockTypes2["TuffWall"] = "minecraft:tuff_wall";
  MinecraftBlockTypes2["TurtleEgg"] = "minecraft:turtle_egg";
  MinecraftBlockTypes2["TwistingVines"] = "minecraft:twisting_vines";
  MinecraftBlockTypes2["UnderwaterTorch"] = "minecraft:underwater_torch";
  MinecraftBlockTypes2["UndyedShulkerBox"] = "minecraft:undyed_shulker_box";
  MinecraftBlockTypes2["Unknown"] = "minecraft:unknown";
  MinecraftBlockTypes2["UnlitRedstoneTorch"] = "minecraft:unlit_redstone_torch";
  MinecraftBlockTypes2["UnpoweredComparator"] = "minecraft:unpowered_comparator";
  MinecraftBlockTypes2["UnpoweredRepeater"] = "minecraft:unpowered_repeater";
  MinecraftBlockTypes2["Vault"] = "minecraft:vault";
  MinecraftBlockTypes2["VerdantFroglight"] = "minecraft:verdant_froglight";
  MinecraftBlockTypes2["Vine"] = "minecraft:vine";
  MinecraftBlockTypes2["WallBanner"] = "minecraft:wall_banner";
  MinecraftBlockTypes2["WallSign"] = "minecraft:wall_sign";
  MinecraftBlockTypes2["WarpedButton"] = "minecraft:warped_button";
  MinecraftBlockTypes2["WarpedDoor"] = "minecraft:warped_door";
  MinecraftBlockTypes2["WarpedDoubleSlab"] = "minecraft:warped_double_slab";
  MinecraftBlockTypes2["WarpedFence"] = "minecraft:warped_fence";
  MinecraftBlockTypes2["WarpedFenceGate"] = "minecraft:warped_fence_gate";
  MinecraftBlockTypes2["WarpedFungus"] = "minecraft:warped_fungus";
  MinecraftBlockTypes2["WarpedHangingSign"] = "minecraft:warped_hanging_sign";
  MinecraftBlockTypes2["WarpedHyphae"] = "minecraft:warped_hyphae";
  MinecraftBlockTypes2["WarpedNylium"] = "minecraft:warped_nylium";
  MinecraftBlockTypes2["WarpedPlanks"] = "minecraft:warped_planks";
  MinecraftBlockTypes2["WarpedPressurePlate"] = "minecraft:warped_pressure_plate";
  MinecraftBlockTypes2["WarpedRoots"] = "minecraft:warped_roots";
  MinecraftBlockTypes2["WarpedSlab"] = "minecraft:warped_slab";
  MinecraftBlockTypes2["WarpedStairs"] = "minecraft:warped_stairs";
  MinecraftBlockTypes2["WarpedStandingSign"] = "minecraft:warped_standing_sign";
  MinecraftBlockTypes2["WarpedStem"] = "minecraft:warped_stem";
  MinecraftBlockTypes2["WarpedTrapdoor"] = "minecraft:warped_trapdoor";
  MinecraftBlockTypes2["WarpedWallSign"] = "minecraft:warped_wall_sign";
  MinecraftBlockTypes2["WarpedWartBlock"] = "minecraft:warped_wart_block";
  MinecraftBlockTypes2["Water"] = "minecraft:water";
  MinecraftBlockTypes2["Waterlily"] = "minecraft:waterlily";
  MinecraftBlockTypes2["WaxedChiseledCopper"] = "minecraft:waxed_chiseled_copper";
  MinecraftBlockTypes2["WaxedCopper"] = "minecraft:waxed_copper";
  MinecraftBlockTypes2["WaxedCopperBulb"] = "minecraft:waxed_copper_bulb";
  MinecraftBlockTypes2["WaxedCopperDoor"] = "minecraft:waxed_copper_door";
  MinecraftBlockTypes2["WaxedCopperGrate"] = "minecraft:waxed_copper_grate";
  MinecraftBlockTypes2["WaxedCopperTrapdoor"] = "minecraft:waxed_copper_trapdoor";
  MinecraftBlockTypes2["WaxedCutCopper"] = "minecraft:waxed_cut_copper";
  MinecraftBlockTypes2["WaxedCutCopperSlab"] = "minecraft:waxed_cut_copper_slab";
  MinecraftBlockTypes2["WaxedCutCopperStairs"] = "minecraft:waxed_cut_copper_stairs";
  MinecraftBlockTypes2["WaxedDoubleCutCopperSlab"] = "minecraft:waxed_double_cut_copper_slab";
  MinecraftBlockTypes2["WaxedExposedChiseledCopper"] = "minecraft:waxed_exposed_chiseled_copper";
  MinecraftBlockTypes2["WaxedExposedCopper"] = "minecraft:waxed_exposed_copper";
  MinecraftBlockTypes2["WaxedExposedCopperBulb"] = "minecraft:waxed_exposed_copper_bulb";
  MinecraftBlockTypes2["WaxedExposedCopperDoor"] = "minecraft:waxed_exposed_copper_door";
  MinecraftBlockTypes2["WaxedExposedCopperGrate"] = "minecraft:waxed_exposed_copper_grate";
  MinecraftBlockTypes2["WaxedExposedCopperTrapdoor"] = "minecraft:waxed_exposed_copper_trapdoor";
  MinecraftBlockTypes2["WaxedExposedCutCopper"] = "minecraft:waxed_exposed_cut_copper";
  MinecraftBlockTypes2["WaxedExposedCutCopperSlab"] = "minecraft:waxed_exposed_cut_copper_slab";
  MinecraftBlockTypes2["WaxedExposedCutCopperStairs"] = "minecraft:waxed_exposed_cut_copper_stairs";
  MinecraftBlockTypes2["WaxedExposedDoubleCutCopperSlab"] = "minecraft:waxed_exposed_double_cut_copper_slab";
  MinecraftBlockTypes2["WaxedOxidizedChiseledCopper"] = "minecraft:waxed_oxidized_chiseled_copper";
  MinecraftBlockTypes2["WaxedOxidizedCopper"] = "minecraft:waxed_oxidized_copper";
  MinecraftBlockTypes2["WaxedOxidizedCopperBulb"] = "minecraft:waxed_oxidized_copper_bulb";
  MinecraftBlockTypes2["WaxedOxidizedCopperDoor"] = "minecraft:waxed_oxidized_copper_door";
  MinecraftBlockTypes2["WaxedOxidizedCopperGrate"] = "minecraft:waxed_oxidized_copper_grate";
  MinecraftBlockTypes2["WaxedOxidizedCopperTrapdoor"] = "minecraft:waxed_oxidized_copper_trapdoor";
  MinecraftBlockTypes2["WaxedOxidizedCutCopper"] = "minecraft:waxed_oxidized_cut_copper";
  MinecraftBlockTypes2["WaxedOxidizedCutCopperSlab"] = "minecraft:waxed_oxidized_cut_copper_slab";
  MinecraftBlockTypes2["WaxedOxidizedCutCopperStairs"] = "minecraft:waxed_oxidized_cut_copper_stairs";
  MinecraftBlockTypes2["WaxedOxidizedDoubleCutCopperSlab"] = "minecraft:waxed_oxidized_double_cut_copper_slab";
  MinecraftBlockTypes2["WaxedWeatheredChiseledCopper"] = "minecraft:waxed_weathered_chiseled_copper";
  MinecraftBlockTypes2["WaxedWeatheredCopper"] = "minecraft:waxed_weathered_copper";
  MinecraftBlockTypes2["WaxedWeatheredCopperBulb"] = "minecraft:waxed_weathered_copper_bulb";
  MinecraftBlockTypes2["WaxedWeatheredCopperDoor"] = "minecraft:waxed_weathered_copper_door";
  MinecraftBlockTypes2["WaxedWeatheredCopperGrate"] = "minecraft:waxed_weathered_copper_grate";
  MinecraftBlockTypes2["WaxedWeatheredCopperTrapdoor"] = "minecraft:waxed_weathered_copper_trapdoor";
  MinecraftBlockTypes2["WaxedWeatheredCutCopper"] = "minecraft:waxed_weathered_cut_copper";
  MinecraftBlockTypes2["WaxedWeatheredCutCopperSlab"] = "minecraft:waxed_weathered_cut_copper_slab";
  MinecraftBlockTypes2["WaxedWeatheredCutCopperStairs"] = "minecraft:waxed_weathered_cut_copper_stairs";
  MinecraftBlockTypes2["WaxedWeatheredDoubleCutCopperSlab"] = "minecraft:waxed_weathered_double_cut_copper_slab";
  MinecraftBlockTypes2["WeatheredChiseledCopper"] = "minecraft:weathered_chiseled_copper";
  MinecraftBlockTypes2["WeatheredCopper"] = "minecraft:weathered_copper";
  MinecraftBlockTypes2["WeatheredCopperBulb"] = "minecraft:weathered_copper_bulb";
  MinecraftBlockTypes2["WeatheredCopperDoor"] = "minecraft:weathered_copper_door";
  MinecraftBlockTypes2["WeatheredCopperGrate"] = "minecraft:weathered_copper_grate";
  MinecraftBlockTypes2["WeatheredCopperTrapdoor"] = "minecraft:weathered_copper_trapdoor";
  MinecraftBlockTypes2["WeatheredCutCopper"] = "minecraft:weathered_cut_copper";
  MinecraftBlockTypes2["WeatheredCutCopperSlab"] = "minecraft:weathered_cut_copper_slab";
  MinecraftBlockTypes2["WeatheredCutCopperStairs"] = "minecraft:weathered_cut_copper_stairs";
  MinecraftBlockTypes2["WeatheredDoubleCutCopperSlab"] = "minecraft:weathered_double_cut_copper_slab";
  MinecraftBlockTypes2["Web"] = "minecraft:web";
  MinecraftBlockTypes2["WeepingVines"] = "minecraft:weeping_vines";
  MinecraftBlockTypes2["Wheat"] = "minecraft:wheat";
  MinecraftBlockTypes2["WhiteCandle"] = "minecraft:white_candle";
  MinecraftBlockTypes2["WhiteCandleCake"] = "minecraft:white_candle_cake";
  MinecraftBlockTypes2["WhiteCarpet"] = "minecraft:white_carpet";
  MinecraftBlockTypes2["WhiteConcrete"] = "minecraft:white_concrete";
  MinecraftBlockTypes2["WhiteConcretePowder"] = "minecraft:white_concrete_powder";
  MinecraftBlockTypes2["WhiteGlazedTerracotta"] = "minecraft:white_glazed_terracotta";
  MinecraftBlockTypes2["WhiteShulkerBox"] = "minecraft:white_shulker_box";
  MinecraftBlockTypes2["WhiteStainedGlass"] = "minecraft:white_stained_glass";
  MinecraftBlockTypes2["WhiteStainedGlassPane"] = "minecraft:white_stained_glass_pane";
  MinecraftBlockTypes2["WhiteTerracotta"] = "minecraft:white_terracotta";
  MinecraftBlockTypes2["WhiteTulip"] = "minecraft:white_tulip";
  MinecraftBlockTypes2["WhiteWool"] = "minecraft:white_wool";
  MinecraftBlockTypes2["WitherRose"] = "minecraft:wither_rose";
  MinecraftBlockTypes2["WoodenButton"] = "minecraft:wooden_button";
  MinecraftBlockTypes2["WoodenDoor"] = "minecraft:wooden_door";
  MinecraftBlockTypes2["WoodenPressurePlate"] = "minecraft:wooden_pressure_plate";
  MinecraftBlockTypes2["YellowCandle"] = "minecraft:yellow_candle";
  MinecraftBlockTypes2["YellowCandleCake"] = "minecraft:yellow_candle_cake";
  MinecraftBlockTypes2["YellowCarpet"] = "minecraft:yellow_carpet";
  MinecraftBlockTypes2["YellowConcrete"] = "minecraft:yellow_concrete";
  MinecraftBlockTypes2["YellowConcretePowder"] = "minecraft:yellow_concrete_powder";
  MinecraftBlockTypes2["YellowFlower"] = "minecraft:yellow_flower";
  MinecraftBlockTypes2["YellowGlazedTerracotta"] = "minecraft:yellow_glazed_terracotta";
  MinecraftBlockTypes2["YellowShulkerBox"] = "minecraft:yellow_shulker_box";
  MinecraftBlockTypes2["YellowStainedGlass"] = "minecraft:yellow_stained_glass";
  MinecraftBlockTypes2["YellowStainedGlassPane"] = "minecraft:yellow_stained_glass_pane";
  MinecraftBlockTypes2["YellowTerracotta"] = "minecraft:yellow_terracotta";
  MinecraftBlockTypes2["YellowWool"] = "minecraft:yellow_wool";
  return MinecraftBlockTypes2;
})(MinecraftBlockTypes || {});
var MinecraftCameraPresetsTypes = ((MinecraftCameraPresetsTypes2) => {
  MinecraftCameraPresetsTypes2["FirstPerson"] = "minecraft:first_person";
  MinecraftCameraPresetsTypes2["Free"] = "minecraft:free";
  MinecraftCameraPresetsTypes2["ThirdPerson"] = "minecraft:third_person";
  MinecraftCameraPresetsTypes2["ThirdPersonFront"] = "minecraft:third_person_front";
  return MinecraftCameraPresetsTypes2;
})(MinecraftCameraPresetsTypes || {});
var MinecraftCooldownCategoryTypes = ((MinecraftCooldownCategoryTypes2) => {
  MinecraftCooldownCategoryTypes2["Chorusfruit"] = "minecraft:chorusfruit";
  MinecraftCooldownCategoryTypes2["EnderPearl"] = "minecraft:ender_pearl";
  MinecraftCooldownCategoryTypes2["GoatHorn"] = "minecraft:goat_horn";
  MinecraftCooldownCategoryTypes2["Shield"] = "minecraft:shield";
  MinecraftCooldownCategoryTypes2["WindCharge"] = "minecraft:wind_charge";
  return MinecraftCooldownCategoryTypes2;
})(MinecraftCooldownCategoryTypes || {});
var MinecraftDimensionTypes6 = ((MinecraftDimensionTypes22) => {
  MinecraftDimensionTypes22["Nether"] = "minecraft:nether";
  MinecraftDimensionTypes22["Overworld"] = "minecraft:overworld";
  MinecraftDimensionTypes22["TheEnd"] = "minecraft:the_end";
  return MinecraftDimensionTypes22;
})(MinecraftDimensionTypes6 || {});
var MinecraftEffectTypes = ((MinecraftEffectTypes2) => {
  MinecraftEffectTypes2["Absorption"] = "absorption";
  MinecraftEffectTypes2["BadOmen"] = "bad_omen";
  MinecraftEffectTypes2["Blindness"] = "blindness";
  MinecraftEffectTypes2["ConduitPower"] = "conduit_power";
  MinecraftEffectTypes2["Darkness"] = "darkness";
  MinecraftEffectTypes2["Empty"] = "empty";
  MinecraftEffectTypes2["FatalPoison"] = "fatal_poison";
  MinecraftEffectTypes2["FireResistance"] = "fire_resistance";
  MinecraftEffectTypes2["Haste"] = "haste";
  MinecraftEffectTypes2["HealthBoost"] = "health_boost";
  MinecraftEffectTypes2["Hunger"] = "hunger";
  MinecraftEffectTypes2["Infested"] = "infested";
  MinecraftEffectTypes2["InstantDamage"] = "instant_damage";
  MinecraftEffectTypes2["InstantHealth"] = "instant_health";
  MinecraftEffectTypes2["Invisibility"] = "invisibility";
  MinecraftEffectTypes2["JumpBoost"] = "jump_boost";
  MinecraftEffectTypes2["Levitation"] = "levitation";
  MinecraftEffectTypes2["MiningFatigue"] = "mining_fatigue";
  MinecraftEffectTypes2["Nausea"] = "nausea";
  MinecraftEffectTypes2["NightVision"] = "night_vision";
  MinecraftEffectTypes2["Oozing"] = "oozing";
  MinecraftEffectTypes2["Poison"] = "poison";
  MinecraftEffectTypes2["RaidOmen"] = "raid_omen";
  MinecraftEffectTypes2["Regeneration"] = "regeneration";
  MinecraftEffectTypes2["Resistance"] = "resistance";
  MinecraftEffectTypes2["Saturation"] = "saturation";
  MinecraftEffectTypes2["SlowFalling"] = "slow_falling";
  MinecraftEffectTypes2["Slowness"] = "slowness";
  MinecraftEffectTypes2["Speed"] = "speed";
  MinecraftEffectTypes2["Strength"] = "strength";
  MinecraftEffectTypes2["TrialOmen"] = "trial_omen";
  MinecraftEffectTypes2["VillageHero"] = "village_hero";
  MinecraftEffectTypes2["WaterBreathing"] = "water_breathing";
  MinecraftEffectTypes2["Weakness"] = "weakness";
  MinecraftEffectTypes2["Weaving"] = "weaving";
  MinecraftEffectTypes2["WindCharged"] = "wind_charged";
  MinecraftEffectTypes2["Wither"] = "wither";
  return MinecraftEffectTypes2;
})(MinecraftEffectTypes || {});
var MinecraftEnchantmentTypes = ((MinecraftEnchantmentTypes2) => {
  MinecraftEnchantmentTypes2["AquaAffinity"] = "aqua_affinity";
  MinecraftEnchantmentTypes2["BaneOfArthropods"] = "bane_of_arthropods";
  MinecraftEnchantmentTypes2["Binding"] = "binding";
  MinecraftEnchantmentTypes2["BlastProtection"] = "blast_protection";
  MinecraftEnchantmentTypes2["Breach"] = "breach";
  MinecraftEnchantmentTypes2["Channeling"] = "channeling";
  MinecraftEnchantmentTypes2["Density"] = "density";
  MinecraftEnchantmentTypes2["DepthStrider"] = "depth_strider";
  MinecraftEnchantmentTypes2["Efficiency"] = "efficiency";
  MinecraftEnchantmentTypes2["FeatherFalling"] = "feather_falling";
  MinecraftEnchantmentTypes2["FireAspect"] = "fire_aspect";
  MinecraftEnchantmentTypes2["FireProtection"] = "fire_protection";
  MinecraftEnchantmentTypes2["Flame"] = "flame";
  MinecraftEnchantmentTypes2["Fortune"] = "fortune";
  MinecraftEnchantmentTypes2["FrostWalker"] = "frost_walker";
  MinecraftEnchantmentTypes2["Impaling"] = "impaling";
  MinecraftEnchantmentTypes2["Infinity"] = "infinity";
  MinecraftEnchantmentTypes2["Knockback"] = "knockback";
  MinecraftEnchantmentTypes2["Looting"] = "looting";
  MinecraftEnchantmentTypes2["Loyalty"] = "loyalty";
  MinecraftEnchantmentTypes2["LuckOfTheSea"] = "luck_of_the_sea";
  MinecraftEnchantmentTypes2["Lure"] = "lure";
  MinecraftEnchantmentTypes2["Mending"] = "mending";
  MinecraftEnchantmentTypes2["Multishot"] = "multishot";
  MinecraftEnchantmentTypes2["Piercing"] = "piercing";
  MinecraftEnchantmentTypes2["Power"] = "power";
  MinecraftEnchantmentTypes2["ProjectileProtection"] = "projectile_protection";
  MinecraftEnchantmentTypes2["Protection"] = "protection";
  MinecraftEnchantmentTypes2["Punch"] = "punch";
  MinecraftEnchantmentTypes2["QuickCharge"] = "quick_charge";
  MinecraftEnchantmentTypes2["Respiration"] = "respiration";
  MinecraftEnchantmentTypes2["Riptide"] = "riptide";
  MinecraftEnchantmentTypes2["Sharpness"] = "sharpness";
  MinecraftEnchantmentTypes2["SilkTouch"] = "silk_touch";
  MinecraftEnchantmentTypes2["Smite"] = "smite";
  MinecraftEnchantmentTypes2["SoulSpeed"] = "soul_speed";
  MinecraftEnchantmentTypes2["SwiftSneak"] = "swift_sneak";
  MinecraftEnchantmentTypes2["Thorns"] = "thorns";
  MinecraftEnchantmentTypes2["Unbreaking"] = "unbreaking";
  MinecraftEnchantmentTypes2["Vanishing"] = "vanishing";
  MinecraftEnchantmentTypes2["WindBurst"] = "wind_burst";
  return MinecraftEnchantmentTypes2;
})(MinecraftEnchantmentTypes || {});
var MinecraftEntityTypes = ((MinecraftEntityTypes2) => {
  MinecraftEntityTypes2["Agent"] = "agent";
  MinecraftEntityTypes2["Allay"] = "allay";
  MinecraftEntityTypes2["AreaEffectCloud"] = "area_effect_cloud";
  MinecraftEntityTypes2["Armadillo"] = "armadillo";
  MinecraftEntityTypes2["ArmorStand"] = "armor_stand";
  MinecraftEntityTypes2["Arrow"] = "arrow";
  MinecraftEntityTypes2["Axolotl"] = "axolotl";
  MinecraftEntityTypes2["Bat"] = "bat";
  MinecraftEntityTypes2["Bee"] = "bee";
  MinecraftEntityTypes2["Blaze"] = "blaze";
  MinecraftEntityTypes2["Boat"] = "boat";
  MinecraftEntityTypes2["Bogged"] = "bogged";
  MinecraftEntityTypes2["Breeze"] = "breeze";
  MinecraftEntityTypes2["BreezeWindChargeProjectile"] = "breeze_wind_charge_projectile";
  MinecraftEntityTypes2["Camel"] = "camel";
  MinecraftEntityTypes2["Cat"] = "cat";
  MinecraftEntityTypes2["CaveSpider"] = "cave_spider";
  MinecraftEntityTypes2["ChestBoat"] = "chest_boat";
  MinecraftEntityTypes2["ChestMinecart"] = "chest_minecart";
  MinecraftEntityTypes2["Chicken"] = "chicken";
  MinecraftEntityTypes2["Cod"] = "cod";
  MinecraftEntityTypes2["CommandBlockMinecart"] = "command_block_minecart";
  MinecraftEntityTypes2["Cow"] = "cow";
  MinecraftEntityTypes2["Creeper"] = "creeper";
  MinecraftEntityTypes2["Dolphin"] = "dolphin";
  MinecraftEntityTypes2["Donkey"] = "donkey";
  MinecraftEntityTypes2["DragonFireball"] = "dragon_fireball";
  MinecraftEntityTypes2["Drowned"] = "drowned";
  MinecraftEntityTypes2["Egg"] = "egg";
  MinecraftEntityTypes2["ElderGuardian"] = "elder_guardian";
  MinecraftEntityTypes2["EnderCrystal"] = "ender_crystal";
  MinecraftEntityTypes2["EnderDragon"] = "ender_dragon";
  MinecraftEntityTypes2["EnderPearl"] = "ender_pearl";
  MinecraftEntityTypes2["Enderman"] = "enderman";
  MinecraftEntityTypes2["Endermite"] = "endermite";
  MinecraftEntityTypes2["EvocationIllager"] = "evocation_illager";
  MinecraftEntityTypes2["EyeOfEnderSignal"] = "eye_of_ender_signal";
  MinecraftEntityTypes2["Fireball"] = "fireball";
  MinecraftEntityTypes2["FireworksRocket"] = "fireworks_rocket";
  MinecraftEntityTypes2["FishingHook"] = "fishing_hook";
  MinecraftEntityTypes2["Fox"] = "fox";
  MinecraftEntityTypes2["Frog"] = "frog";
  MinecraftEntityTypes2["Ghast"] = "ghast";
  MinecraftEntityTypes2["GlowSquid"] = "glow_squid";
  MinecraftEntityTypes2["Goat"] = "goat";
  MinecraftEntityTypes2["Guardian"] = "guardian";
  MinecraftEntityTypes2["Hoglin"] = "hoglin";
  MinecraftEntityTypes2["HopperMinecart"] = "hopper_minecart";
  MinecraftEntityTypes2["Horse"] = "horse";
  MinecraftEntityTypes2["Husk"] = "husk";
  MinecraftEntityTypes2["IronGolem"] = "iron_golem";
  MinecraftEntityTypes2["LightningBolt"] = "lightning_bolt";
  MinecraftEntityTypes2["LingeringPotion"] = "lingering_potion";
  MinecraftEntityTypes2["Llama"] = "llama";
  MinecraftEntityTypes2["LlamaSpit"] = "llama_spit";
  MinecraftEntityTypes2["MagmaCube"] = "magma_cube";
  MinecraftEntityTypes2["Minecart"] = "minecart";
  MinecraftEntityTypes2["Mooshroom"] = "mooshroom";
  MinecraftEntityTypes2["Mule"] = "mule";
  MinecraftEntityTypes2["Npc"] = "npc";
  MinecraftEntityTypes2["Ocelot"] = "ocelot";
  MinecraftEntityTypes2["OminousItemSpawner"] = "ominous_item_spawner";
  MinecraftEntityTypes2["Panda"] = "panda";
  MinecraftEntityTypes2["Parrot"] = "parrot";
  MinecraftEntityTypes2["Phantom"] = "phantom";
  MinecraftEntityTypes2["Pig"] = "pig";
  MinecraftEntityTypes2["Piglin"] = "piglin";
  MinecraftEntityTypes2["PiglinBrute"] = "piglin_brute";
  MinecraftEntityTypes2["Pillager"] = "pillager";
  MinecraftEntityTypes2["Player"] = "player";
  MinecraftEntityTypes2["PolarBear"] = "polar_bear";
  MinecraftEntityTypes2["Pufferfish"] = "pufferfish";
  MinecraftEntityTypes2["Rabbit"] = "rabbit";
  MinecraftEntityTypes2["Ravager"] = "ravager";
  MinecraftEntityTypes2["Salmon"] = "salmon";
  MinecraftEntityTypes2["Sheep"] = "sheep";
  MinecraftEntityTypes2["Shulker"] = "shulker";
  MinecraftEntityTypes2["ShulkerBullet"] = "shulker_bullet";
  MinecraftEntityTypes2["Silverfish"] = "silverfish";
  MinecraftEntityTypes2["Skeleton"] = "skeleton";
  MinecraftEntityTypes2["SkeletonHorse"] = "skeleton_horse";
  MinecraftEntityTypes2["Slime"] = "slime";
  MinecraftEntityTypes2["SmallFireball"] = "small_fireball";
  MinecraftEntityTypes2["Sniffer"] = "sniffer";
  MinecraftEntityTypes2["SnowGolem"] = "snow_golem";
  MinecraftEntityTypes2["Snowball"] = "snowball";
  MinecraftEntityTypes2["Spider"] = "spider";
  MinecraftEntityTypes2["SplashPotion"] = "splash_potion";
  MinecraftEntityTypes2["Squid"] = "squid";
  MinecraftEntityTypes2["Stray"] = "stray";
  MinecraftEntityTypes2["Strider"] = "strider";
  MinecraftEntityTypes2["Tadpole"] = "tadpole";
  MinecraftEntityTypes2["ThrownTrident"] = "thrown_trident";
  MinecraftEntityTypes2["Tnt"] = "tnt";
  MinecraftEntityTypes2["TntMinecart"] = "tnt_minecart";
  MinecraftEntityTypes2["TraderLlama"] = "trader_llama";
  MinecraftEntityTypes2["TripodCamera"] = "tripod_camera";
  MinecraftEntityTypes2["Tropicalfish"] = "tropicalfish";
  MinecraftEntityTypes2["Turtle"] = "turtle";
  MinecraftEntityTypes2["Vex"] = "vex";
  MinecraftEntityTypes2["Villager"] = "villager";
  MinecraftEntityTypes2["VillagerV2"] = "villager_v2";
  MinecraftEntityTypes2["Vindicator"] = "vindicator";
  MinecraftEntityTypes2["WanderingTrader"] = "wandering_trader";
  MinecraftEntityTypes2["Warden"] = "warden";
  MinecraftEntityTypes2["WindChargeProjectile"] = "wind_charge_projectile";
  MinecraftEntityTypes2["Witch"] = "witch";
  MinecraftEntityTypes2["Wither"] = "wither";
  MinecraftEntityTypes2["WitherSkeleton"] = "wither_skeleton";
  MinecraftEntityTypes2["WitherSkull"] = "wither_skull";
  MinecraftEntityTypes2["WitherSkullDangerous"] = "wither_skull_dangerous";
  MinecraftEntityTypes2["Wolf"] = "wolf";
  MinecraftEntityTypes2["XpBottle"] = "xp_bottle";
  MinecraftEntityTypes2["XpOrb"] = "xp_orb";
  MinecraftEntityTypes2["Zoglin"] = "zoglin";
  MinecraftEntityTypes2["Zombie"] = "zombie";
  MinecraftEntityTypes2["ZombieHorse"] = "zombie_horse";
  MinecraftEntityTypes2["ZombiePigman"] = "zombie_pigman";
  MinecraftEntityTypes2["ZombieVillager"] = "zombie_villager";
  MinecraftEntityTypes2["ZombieVillagerV2"] = "zombie_villager_v2";
  return MinecraftEntityTypes2;
})(MinecraftEntityTypes || {});
var MinecraftFeatureTypes = ((MinecraftFeatureTypes2) => {
  MinecraftFeatureTypes2["AncientCity"] = "minecraft:ancient_city";
  MinecraftFeatureTypes2["BastionRemnant"] = "minecraft:bastion_remnant";
  MinecraftFeatureTypes2["BuriedTreasure"] = "minecraft:buried_treasure";
  MinecraftFeatureTypes2["EndCity"] = "minecraft:end_city";
  MinecraftFeatureTypes2["Fortress"] = "minecraft:fortress";
  MinecraftFeatureTypes2["Mansion"] = "minecraft:mansion";
  MinecraftFeatureTypes2["Mineshaft"] = "minecraft:mineshaft";
  MinecraftFeatureTypes2["Monument"] = "minecraft:monument";
  MinecraftFeatureTypes2["PillagerOutpost"] = "minecraft:pillager_outpost";
  MinecraftFeatureTypes2["RuinedPortal"] = "minecraft:ruined_portal";
  MinecraftFeatureTypes2["Ruins"] = "minecraft:ruins";
  MinecraftFeatureTypes2["Shipwreck"] = "minecraft:shipwreck";
  MinecraftFeatureTypes2["Stronghold"] = "minecraft:stronghold";
  MinecraftFeatureTypes2["Temple"] = "minecraft:temple";
  MinecraftFeatureTypes2["TrailRuins"] = "minecraft:trail_ruins";
  MinecraftFeatureTypes2["TrialChambers"] = "minecraft:trial_chambers";
  MinecraftFeatureTypes2["Village"] = "minecraft:village";
  return MinecraftFeatureTypes2;
})(MinecraftFeatureTypes || {});
var MinecraftItemTypes = ((MinecraftItemTypes2) => {
  MinecraftItemTypes2["AcaciaBoat"] = "minecraft:acacia_boat";
  MinecraftItemTypes2["AcaciaButton"] = "minecraft:acacia_button";
  MinecraftItemTypes2["AcaciaChestBoat"] = "minecraft:acacia_chest_boat";
  MinecraftItemTypes2["AcaciaDoor"] = "minecraft:acacia_door";
  MinecraftItemTypes2["AcaciaFence"] = "minecraft:acacia_fence";
  MinecraftItemTypes2["AcaciaFenceGate"] = "minecraft:acacia_fence_gate";
  MinecraftItemTypes2["AcaciaHangingSign"] = "minecraft:acacia_hanging_sign";
  MinecraftItemTypes2["AcaciaLeaves"] = "minecraft:acacia_leaves";
  MinecraftItemTypes2["AcaciaLog"] = "minecraft:acacia_log";
  MinecraftItemTypes2["AcaciaPlanks"] = "minecraft:acacia_planks";
  MinecraftItemTypes2["AcaciaPressurePlate"] = "minecraft:acacia_pressure_plate";
  MinecraftItemTypes2["AcaciaSapling"] = "minecraft:acacia_sapling";
  MinecraftItemTypes2["AcaciaSign"] = "minecraft:acacia_sign";
  MinecraftItemTypes2["AcaciaSlab"] = "minecraft:acacia_slab";
  MinecraftItemTypes2["AcaciaStairs"] = "minecraft:acacia_stairs";
  MinecraftItemTypes2["AcaciaTrapdoor"] = "minecraft:acacia_trapdoor";
  MinecraftItemTypes2["AcaciaWood"] = "minecraft:acacia_wood";
  MinecraftItemTypes2["ActivatorRail"] = "minecraft:activator_rail";
  MinecraftItemTypes2["Air"] = "minecraft:air";
  MinecraftItemTypes2["AllaySpawnEgg"] = "minecraft:allay_spawn_egg";
  MinecraftItemTypes2["Allium"] = "minecraft:allium";
  MinecraftItemTypes2["Allow"] = "minecraft:allow";
  MinecraftItemTypes2["AmethystBlock"] = "minecraft:amethyst_block";
  MinecraftItemTypes2["AmethystCluster"] = "minecraft:amethyst_cluster";
  MinecraftItemTypes2["AmethystShard"] = "minecraft:amethyst_shard";
  MinecraftItemTypes2["AncientDebris"] = "minecraft:ancient_debris";
  MinecraftItemTypes2["Andesite"] = "minecraft:andesite";
  MinecraftItemTypes2["AndesiteStairs"] = "minecraft:andesite_stairs";
  MinecraftItemTypes2["AnglerPotterySherd"] = "minecraft:angler_pottery_sherd";
  MinecraftItemTypes2["Anvil"] = "minecraft:anvil";
  MinecraftItemTypes2["Apple"] = "minecraft:apple";
  MinecraftItemTypes2["ArcherPotterySherd"] = "minecraft:archer_pottery_sherd";
  MinecraftItemTypes2["ArmadilloScute"] = "minecraft:armadillo_scute";
  MinecraftItemTypes2["ArmadilloSpawnEgg"] = "minecraft:armadillo_spawn_egg";
  MinecraftItemTypes2["ArmorStand"] = "minecraft:armor_stand";
  MinecraftItemTypes2["ArmsUpPotterySherd"] = "minecraft:arms_up_pottery_sherd";
  MinecraftItemTypes2["Arrow"] = "minecraft:arrow";
  MinecraftItemTypes2["AxolotlBucket"] = "minecraft:axolotl_bucket";
  MinecraftItemTypes2["AxolotlSpawnEgg"] = "minecraft:axolotl_spawn_egg";
  MinecraftItemTypes2["Azalea"] = "minecraft:azalea";
  MinecraftItemTypes2["AzaleaLeaves"] = "minecraft:azalea_leaves";
  MinecraftItemTypes2["AzaleaLeavesFlowered"] = "minecraft:azalea_leaves_flowered";
  MinecraftItemTypes2["AzureBluet"] = "minecraft:azure_bluet";
  MinecraftItemTypes2["BakedPotato"] = "minecraft:baked_potato";
  MinecraftItemTypes2["Bamboo"] = "minecraft:bamboo";
  MinecraftItemTypes2["BambooBlock"] = "minecraft:bamboo_block";
  MinecraftItemTypes2["BambooButton"] = "minecraft:bamboo_button";
  MinecraftItemTypes2["BambooChestRaft"] = "minecraft:bamboo_chest_raft";
  MinecraftItemTypes2["BambooDoor"] = "minecraft:bamboo_door";
  MinecraftItemTypes2["BambooFence"] = "minecraft:bamboo_fence";
  MinecraftItemTypes2["BambooFenceGate"] = "minecraft:bamboo_fence_gate";
  MinecraftItemTypes2["BambooHangingSign"] = "minecraft:bamboo_hanging_sign";
  MinecraftItemTypes2["BambooMosaic"] = "minecraft:bamboo_mosaic";
  MinecraftItemTypes2["BambooMosaicSlab"] = "minecraft:bamboo_mosaic_slab";
  MinecraftItemTypes2["BambooMosaicStairs"] = "minecraft:bamboo_mosaic_stairs";
  MinecraftItemTypes2["BambooPlanks"] = "minecraft:bamboo_planks";
  MinecraftItemTypes2["BambooPressurePlate"] = "minecraft:bamboo_pressure_plate";
  MinecraftItemTypes2["BambooRaft"] = "minecraft:bamboo_raft";
  MinecraftItemTypes2["BambooSign"] = "minecraft:bamboo_sign";
  MinecraftItemTypes2["BambooSlab"] = "minecraft:bamboo_slab";
  MinecraftItemTypes2["BambooStairs"] = "minecraft:bamboo_stairs";
  MinecraftItemTypes2["BambooTrapdoor"] = "minecraft:bamboo_trapdoor";
  MinecraftItemTypes2["Banner"] = "minecraft:banner";
  MinecraftItemTypes2["BannerPattern"] = "minecraft:banner_pattern";
  MinecraftItemTypes2["Barrel"] = "minecraft:barrel";
  MinecraftItemTypes2["Barrier"] = "minecraft:barrier";
  MinecraftItemTypes2["Basalt"] = "minecraft:basalt";
  MinecraftItemTypes2["BatSpawnEgg"] = "minecraft:bat_spawn_egg";
  MinecraftItemTypes2["Beacon"] = "minecraft:beacon";
  MinecraftItemTypes2["Bed"] = "minecraft:bed";
  MinecraftItemTypes2["Bedrock"] = "minecraft:bedrock";
  MinecraftItemTypes2["BeeNest"] = "minecraft:bee_nest";
  MinecraftItemTypes2["BeeSpawnEgg"] = "minecraft:bee_spawn_egg";
  MinecraftItemTypes2["Beef"] = "minecraft:beef";
  MinecraftItemTypes2["Beehive"] = "minecraft:beehive";
  MinecraftItemTypes2["Beetroot"] = "minecraft:beetroot";
  MinecraftItemTypes2["BeetrootSeeds"] = "minecraft:beetroot_seeds";
  MinecraftItemTypes2["BeetrootSoup"] = "minecraft:beetroot_soup";
  MinecraftItemTypes2["Bell"] = "minecraft:bell";
  MinecraftItemTypes2["BigDripleaf"] = "minecraft:big_dripleaf";
  MinecraftItemTypes2["BirchBoat"] = "minecraft:birch_boat";
  MinecraftItemTypes2["BirchButton"] = "minecraft:birch_button";
  MinecraftItemTypes2["BirchChestBoat"] = "minecraft:birch_chest_boat";
  MinecraftItemTypes2["BirchDoor"] = "minecraft:birch_door";
  MinecraftItemTypes2["BirchFence"] = "minecraft:birch_fence";
  MinecraftItemTypes2["BirchFenceGate"] = "minecraft:birch_fence_gate";
  MinecraftItemTypes2["BirchHangingSign"] = "minecraft:birch_hanging_sign";
  MinecraftItemTypes2["BirchLeaves"] = "minecraft:birch_leaves";
  MinecraftItemTypes2["BirchLog"] = "minecraft:birch_log";
  MinecraftItemTypes2["BirchPlanks"] = "minecraft:birch_planks";
  MinecraftItemTypes2["BirchPressurePlate"] = "minecraft:birch_pressure_plate";
  MinecraftItemTypes2["BirchSapling"] = "minecraft:birch_sapling";
  MinecraftItemTypes2["BirchSign"] = "minecraft:birch_sign";
  MinecraftItemTypes2["BirchSlab"] = "minecraft:birch_slab";
  MinecraftItemTypes2["BirchStairs"] = "minecraft:birch_stairs";
  MinecraftItemTypes2["BirchTrapdoor"] = "minecraft:birch_trapdoor";
  MinecraftItemTypes2["BirchWood"] = "minecraft:birch_wood";
  MinecraftItemTypes2["BlackCandle"] = "minecraft:black_candle";
  MinecraftItemTypes2["BlackCarpet"] = "minecraft:black_carpet";
  MinecraftItemTypes2["BlackConcrete"] = "minecraft:black_concrete";
  MinecraftItemTypes2["BlackConcretePowder"] = "minecraft:black_concrete_powder";
  MinecraftItemTypes2["BlackDye"] = "minecraft:black_dye";
  MinecraftItemTypes2["BlackGlazedTerracotta"] = "minecraft:black_glazed_terracotta";
  MinecraftItemTypes2["BlackShulkerBox"] = "minecraft:black_shulker_box";
  MinecraftItemTypes2["BlackStainedGlass"] = "minecraft:black_stained_glass";
  MinecraftItemTypes2["BlackStainedGlassPane"] = "minecraft:black_stained_glass_pane";
  MinecraftItemTypes2["BlackTerracotta"] = "minecraft:black_terracotta";
  MinecraftItemTypes2["BlackWool"] = "minecraft:black_wool";
  MinecraftItemTypes2["Blackstone"] = "minecraft:blackstone";
  MinecraftItemTypes2["BlackstoneSlab"] = "minecraft:blackstone_slab";
  MinecraftItemTypes2["BlackstoneStairs"] = "minecraft:blackstone_stairs";
  MinecraftItemTypes2["BlackstoneWall"] = "minecraft:blackstone_wall";
  MinecraftItemTypes2["BladePotterySherd"] = "minecraft:blade_pottery_sherd";
  MinecraftItemTypes2["BlastFurnace"] = "minecraft:blast_furnace";
  MinecraftItemTypes2["BlazePowder"] = "minecraft:blaze_powder";
  MinecraftItemTypes2["BlazeRod"] = "minecraft:blaze_rod";
  MinecraftItemTypes2["BlazeSpawnEgg"] = "minecraft:blaze_spawn_egg";
  MinecraftItemTypes2["BlueCandle"] = "minecraft:blue_candle";
  MinecraftItemTypes2["BlueCarpet"] = "minecraft:blue_carpet";
  MinecraftItemTypes2["BlueConcrete"] = "minecraft:blue_concrete";
  MinecraftItemTypes2["BlueConcretePowder"] = "minecraft:blue_concrete_powder";
  MinecraftItemTypes2["BlueDye"] = "minecraft:blue_dye";
  MinecraftItemTypes2["BlueGlazedTerracotta"] = "minecraft:blue_glazed_terracotta";
  MinecraftItemTypes2["BlueIce"] = "minecraft:blue_ice";
  MinecraftItemTypes2["BlueOrchid"] = "minecraft:blue_orchid";
  MinecraftItemTypes2["BlueShulkerBox"] = "minecraft:blue_shulker_box";
  MinecraftItemTypes2["BlueStainedGlass"] = "minecraft:blue_stained_glass";
  MinecraftItemTypes2["BlueStainedGlassPane"] = "minecraft:blue_stained_glass_pane";
  MinecraftItemTypes2["BlueTerracotta"] = "minecraft:blue_terracotta";
  MinecraftItemTypes2["BlueWool"] = "minecraft:blue_wool";
  MinecraftItemTypes2["Boat"] = "minecraft:boat";
  MinecraftItemTypes2["BoggedSpawnEgg"] = "minecraft:bogged_spawn_egg";
  MinecraftItemTypes2["BoltArmorTrimSmithingTemplate"] = "minecraft:bolt_armor_trim_smithing_template";
  MinecraftItemTypes2["Bone"] = "minecraft:bone";
  MinecraftItemTypes2["BoneBlock"] = "minecraft:bone_block";
  MinecraftItemTypes2["BoneMeal"] = "minecraft:bone_meal";
  MinecraftItemTypes2["Book"] = "minecraft:book";
  MinecraftItemTypes2["Bookshelf"] = "minecraft:bookshelf";
  MinecraftItemTypes2["BorderBlock"] = "minecraft:border_block";
  MinecraftItemTypes2["BordureIndentedBannerPattern"] = "minecraft:bordure_indented_banner_pattern";
  MinecraftItemTypes2["Bow"] = "minecraft:bow";
  MinecraftItemTypes2["Bowl"] = "minecraft:bowl";
  MinecraftItemTypes2["BrainCoral"] = "minecraft:brain_coral";
  MinecraftItemTypes2["BrainCoralBlock"] = "minecraft:brain_coral_block";
  MinecraftItemTypes2["BrainCoralFan"] = "minecraft:brain_coral_fan";
  MinecraftItemTypes2["Bread"] = "minecraft:bread";
  MinecraftItemTypes2["BreezeRod"] = "minecraft:breeze_rod";
  MinecraftItemTypes2["BreezeSpawnEgg"] = "minecraft:breeze_spawn_egg";
  MinecraftItemTypes2["BrewerPotterySherd"] = "minecraft:brewer_pottery_sherd";
  MinecraftItemTypes2["BrewingStand"] = "minecraft:brewing_stand";
  MinecraftItemTypes2["Brick"] = "minecraft:brick";
  MinecraftItemTypes2["BrickBlock"] = "minecraft:brick_block";
  MinecraftItemTypes2["BrickSlab"] = "minecraft:brick_slab";
  MinecraftItemTypes2["BrickStairs"] = "minecraft:brick_stairs";
  MinecraftItemTypes2["BrownCandle"] = "minecraft:brown_candle";
  MinecraftItemTypes2["BrownCarpet"] = "minecraft:brown_carpet";
  MinecraftItemTypes2["BrownConcrete"] = "minecraft:brown_concrete";
  MinecraftItemTypes2["BrownConcretePowder"] = "minecraft:brown_concrete_powder";
  MinecraftItemTypes2["BrownDye"] = "minecraft:brown_dye";
  MinecraftItemTypes2["BrownGlazedTerracotta"] = "minecraft:brown_glazed_terracotta";
  MinecraftItemTypes2["BrownMushroom"] = "minecraft:brown_mushroom";
  MinecraftItemTypes2["BrownMushroomBlock"] = "minecraft:brown_mushroom_block";
  MinecraftItemTypes2["BrownShulkerBox"] = "minecraft:brown_shulker_box";
  MinecraftItemTypes2["BrownStainedGlass"] = "minecraft:brown_stained_glass";
  MinecraftItemTypes2["BrownStainedGlassPane"] = "minecraft:brown_stained_glass_pane";
  MinecraftItemTypes2["BrownTerracotta"] = "minecraft:brown_terracotta";
  MinecraftItemTypes2["BrownWool"] = "minecraft:brown_wool";
  MinecraftItemTypes2["Brush"] = "minecraft:brush";
  MinecraftItemTypes2["BubbleCoral"] = "minecraft:bubble_coral";
  MinecraftItemTypes2["BubbleCoralBlock"] = "minecraft:bubble_coral_block";
  MinecraftItemTypes2["BubbleCoralFan"] = "minecraft:bubble_coral_fan";
  MinecraftItemTypes2["Bucket"] = "minecraft:bucket";
  MinecraftItemTypes2["BuddingAmethyst"] = "minecraft:budding_amethyst";
  MinecraftItemTypes2["BurnPotterySherd"] = "minecraft:burn_pottery_sherd";
  MinecraftItemTypes2["Cactus"] = "minecraft:cactus";
  MinecraftItemTypes2["Cake"] = "minecraft:cake";
  MinecraftItemTypes2["Calcite"] = "minecraft:calcite";
  MinecraftItemTypes2["CalibratedSculkSensor"] = "minecraft:calibrated_sculk_sensor";
  MinecraftItemTypes2["CamelSpawnEgg"] = "minecraft:camel_spawn_egg";
  MinecraftItemTypes2["Campfire"] = "minecraft:campfire";
  MinecraftItemTypes2["Candle"] = "minecraft:candle";
  MinecraftItemTypes2["Carpet"] = "minecraft:carpet";
  MinecraftItemTypes2["Carrot"] = "minecraft:carrot";
  MinecraftItemTypes2["CarrotOnAStick"] = "minecraft:carrot_on_a_stick";
  MinecraftItemTypes2["CartographyTable"] = "minecraft:cartography_table";
  MinecraftItemTypes2["CarvedPumpkin"] = "minecraft:carved_pumpkin";
  MinecraftItemTypes2["CatSpawnEgg"] = "minecraft:cat_spawn_egg";
  MinecraftItemTypes2["Cauldron"] = "minecraft:cauldron";
  MinecraftItemTypes2["CaveSpiderSpawnEgg"] = "minecraft:cave_spider_spawn_egg";
  MinecraftItemTypes2["Chain"] = "minecraft:chain";
  MinecraftItemTypes2["ChainCommandBlock"] = "minecraft:chain_command_block";
  MinecraftItemTypes2["ChainmailBoots"] = "minecraft:chainmail_boots";
  MinecraftItemTypes2["ChainmailChestplate"] = "minecraft:chainmail_chestplate";
  MinecraftItemTypes2["ChainmailHelmet"] = "minecraft:chainmail_helmet";
  MinecraftItemTypes2["ChainmailLeggings"] = "minecraft:chainmail_leggings";
  MinecraftItemTypes2["Charcoal"] = "minecraft:charcoal";
  MinecraftItemTypes2["CherryBoat"] = "minecraft:cherry_boat";
  MinecraftItemTypes2["CherryButton"] = "minecraft:cherry_button";
  MinecraftItemTypes2["CherryChestBoat"] = "minecraft:cherry_chest_boat";
  MinecraftItemTypes2["CherryDoor"] = "minecraft:cherry_door";
  MinecraftItemTypes2["CherryFence"] = "minecraft:cherry_fence";
  MinecraftItemTypes2["CherryFenceGate"] = "minecraft:cherry_fence_gate";
  MinecraftItemTypes2["CherryHangingSign"] = "minecraft:cherry_hanging_sign";
  MinecraftItemTypes2["CherryLeaves"] = "minecraft:cherry_leaves";
  MinecraftItemTypes2["CherryLog"] = "minecraft:cherry_log";
  MinecraftItemTypes2["CherryPlanks"] = "minecraft:cherry_planks";
  MinecraftItemTypes2["CherryPressurePlate"] = "minecraft:cherry_pressure_plate";
  MinecraftItemTypes2["CherrySapling"] = "minecraft:cherry_sapling";
  MinecraftItemTypes2["CherrySign"] = "minecraft:cherry_sign";
  MinecraftItemTypes2["CherrySlab"] = "minecraft:cherry_slab";
  MinecraftItemTypes2["CherryStairs"] = "minecraft:cherry_stairs";
  MinecraftItemTypes2["CherryTrapdoor"] = "minecraft:cherry_trapdoor";
  MinecraftItemTypes2["CherryWood"] = "minecraft:cherry_wood";
  MinecraftItemTypes2["Chest"] = "minecraft:chest";
  MinecraftItemTypes2["ChestBoat"] = "minecraft:chest_boat";
  MinecraftItemTypes2["ChestMinecart"] = "minecraft:chest_minecart";
  MinecraftItemTypes2["Chicken"] = "minecraft:chicken";
  MinecraftItemTypes2["ChickenSpawnEgg"] = "minecraft:chicken_spawn_egg";
  MinecraftItemTypes2["ChiseledBookshelf"] = "minecraft:chiseled_bookshelf";
  MinecraftItemTypes2["ChiseledCopper"] = "minecraft:chiseled_copper";
  MinecraftItemTypes2["ChiseledDeepslate"] = "minecraft:chiseled_deepslate";
  MinecraftItemTypes2["ChiseledNetherBricks"] = "minecraft:chiseled_nether_bricks";
  MinecraftItemTypes2["ChiseledPolishedBlackstone"] = "minecraft:chiseled_polished_blackstone";
  MinecraftItemTypes2["ChiseledTuff"] = "minecraft:chiseled_tuff";
  MinecraftItemTypes2["ChiseledTuffBricks"] = "minecraft:chiseled_tuff_bricks";
  MinecraftItemTypes2["ChorusFlower"] = "minecraft:chorus_flower";
  MinecraftItemTypes2["ChorusFruit"] = "minecraft:chorus_fruit";
  MinecraftItemTypes2["ChorusPlant"] = "minecraft:chorus_plant";
  MinecraftItemTypes2["Clay"] = "minecraft:clay";
  MinecraftItemTypes2["ClayBall"] = "minecraft:clay_ball";
  MinecraftItemTypes2["Clock"] = "minecraft:clock";
  MinecraftItemTypes2["Coal"] = "minecraft:coal";
  MinecraftItemTypes2["CoalBlock"] = "minecraft:coal_block";
  MinecraftItemTypes2["CoalOre"] = "minecraft:coal_ore";
  MinecraftItemTypes2["CoastArmorTrimSmithingTemplate"] = "minecraft:coast_armor_trim_smithing_template";
  MinecraftItemTypes2["CobbledDeepslate"] = "minecraft:cobbled_deepslate";
  MinecraftItemTypes2["CobbledDeepslateSlab"] = "minecraft:cobbled_deepslate_slab";
  MinecraftItemTypes2["CobbledDeepslateStairs"] = "minecraft:cobbled_deepslate_stairs";
  MinecraftItemTypes2["CobbledDeepslateWall"] = "minecraft:cobbled_deepslate_wall";
  MinecraftItemTypes2["Cobblestone"] = "minecraft:cobblestone";
  MinecraftItemTypes2["CobblestoneSlab"] = "minecraft:cobblestone_slab";
  MinecraftItemTypes2["CobblestoneWall"] = "minecraft:cobblestone_wall";
  MinecraftItemTypes2["CocoaBeans"] = "minecraft:cocoa_beans";
  MinecraftItemTypes2["Cod"] = "minecraft:cod";
  MinecraftItemTypes2["CodBucket"] = "minecraft:cod_bucket";
  MinecraftItemTypes2["CodSpawnEgg"] = "minecraft:cod_spawn_egg";
  MinecraftItemTypes2["CommandBlock"] = "minecraft:command_block";
  MinecraftItemTypes2["CommandBlockMinecart"] = "minecraft:command_block_minecart";
  MinecraftItemTypes2["Comparator"] = "minecraft:comparator";
  MinecraftItemTypes2["Compass"] = "minecraft:compass";
  MinecraftItemTypes2["Composter"] = "minecraft:composter";
  MinecraftItemTypes2["Concrete"] = "minecraft:concrete";
  MinecraftItemTypes2["ConcretePowder"] = "minecraft:concrete_powder";
  MinecraftItemTypes2["Conduit"] = "minecraft:conduit";
  MinecraftItemTypes2["CookedBeef"] = "minecraft:cooked_beef";
  MinecraftItemTypes2["CookedChicken"] = "minecraft:cooked_chicken";
  MinecraftItemTypes2["CookedCod"] = "minecraft:cooked_cod";
  MinecraftItemTypes2["CookedMutton"] = "minecraft:cooked_mutton";
  MinecraftItemTypes2["CookedPorkchop"] = "minecraft:cooked_porkchop";
  MinecraftItemTypes2["CookedRabbit"] = "minecraft:cooked_rabbit";
  MinecraftItemTypes2["CookedSalmon"] = "minecraft:cooked_salmon";
  MinecraftItemTypes2["Cookie"] = "minecraft:cookie";
  MinecraftItemTypes2["CopperBlock"] = "minecraft:copper_block";
  MinecraftItemTypes2["CopperBulb"] = "minecraft:copper_bulb";
  MinecraftItemTypes2["CopperDoor"] = "minecraft:copper_door";
  MinecraftItemTypes2["CopperGrate"] = "minecraft:copper_grate";
  MinecraftItemTypes2["CopperIngot"] = "minecraft:copper_ingot";
  MinecraftItemTypes2["CopperOre"] = "minecraft:copper_ore";
  MinecraftItemTypes2["CopperTrapdoor"] = "minecraft:copper_trapdoor";
  MinecraftItemTypes2["Coral"] = "minecraft:coral";
  MinecraftItemTypes2["CoralBlock"] = "minecraft:coral_block";
  MinecraftItemTypes2["CoralFan"] = "minecraft:coral_fan";
  MinecraftItemTypes2["CoralFanDead"] = "minecraft:coral_fan_dead";
  MinecraftItemTypes2["Cornflower"] = "minecraft:cornflower";
  MinecraftItemTypes2["CowSpawnEgg"] = "minecraft:cow_spawn_egg";
  MinecraftItemTypes2["CrackedDeepslateBricks"] = "minecraft:cracked_deepslate_bricks";
  MinecraftItemTypes2["CrackedDeepslateTiles"] = "minecraft:cracked_deepslate_tiles";
  MinecraftItemTypes2["CrackedNetherBricks"] = "minecraft:cracked_nether_bricks";
  MinecraftItemTypes2["CrackedPolishedBlackstoneBricks"] = "minecraft:cracked_polished_blackstone_bricks";
  MinecraftItemTypes2["Crafter"] = "minecraft:crafter";
  MinecraftItemTypes2["CraftingTable"] = "minecraft:crafting_table";
  MinecraftItemTypes2["CreeperBannerPattern"] = "minecraft:creeper_banner_pattern";
  MinecraftItemTypes2["CreeperSpawnEgg"] = "minecraft:creeper_spawn_egg";
  MinecraftItemTypes2["CrimsonButton"] = "minecraft:crimson_button";
  MinecraftItemTypes2["CrimsonDoor"] = "minecraft:crimson_door";
  MinecraftItemTypes2["CrimsonFence"] = "minecraft:crimson_fence";
  MinecraftItemTypes2["CrimsonFenceGate"] = "minecraft:crimson_fence_gate";
  MinecraftItemTypes2["CrimsonFungus"] = "minecraft:crimson_fungus";
  MinecraftItemTypes2["CrimsonHangingSign"] = "minecraft:crimson_hanging_sign";
  MinecraftItemTypes2["CrimsonHyphae"] = "minecraft:crimson_hyphae";
  MinecraftItemTypes2["CrimsonNylium"] = "minecraft:crimson_nylium";
  MinecraftItemTypes2["CrimsonPlanks"] = "minecraft:crimson_planks";
  MinecraftItemTypes2["CrimsonPressurePlate"] = "minecraft:crimson_pressure_plate";
  MinecraftItemTypes2["CrimsonRoots"] = "minecraft:crimson_roots";
  MinecraftItemTypes2["CrimsonSign"] = "minecraft:crimson_sign";
  MinecraftItemTypes2["CrimsonSlab"] = "minecraft:crimson_slab";
  MinecraftItemTypes2["CrimsonStairs"] = "minecraft:crimson_stairs";
  MinecraftItemTypes2["CrimsonStem"] = "minecraft:crimson_stem";
  MinecraftItemTypes2["CrimsonTrapdoor"] = "minecraft:crimson_trapdoor";
  MinecraftItemTypes2["Crossbow"] = "minecraft:crossbow";
  MinecraftItemTypes2["CryingObsidian"] = "minecraft:crying_obsidian";
  MinecraftItemTypes2["CutCopper"] = "minecraft:cut_copper";
  MinecraftItemTypes2["CutCopperSlab"] = "minecraft:cut_copper_slab";
  MinecraftItemTypes2["CutCopperStairs"] = "minecraft:cut_copper_stairs";
  MinecraftItemTypes2["CyanCandle"] = "minecraft:cyan_candle";
  MinecraftItemTypes2["CyanCarpet"] = "minecraft:cyan_carpet";
  MinecraftItemTypes2["CyanConcrete"] = "minecraft:cyan_concrete";
  MinecraftItemTypes2["CyanConcretePowder"] = "minecraft:cyan_concrete_powder";
  MinecraftItemTypes2["CyanDye"] = "minecraft:cyan_dye";
  MinecraftItemTypes2["CyanGlazedTerracotta"] = "minecraft:cyan_glazed_terracotta";
  MinecraftItemTypes2["CyanShulkerBox"] = "minecraft:cyan_shulker_box";
  MinecraftItemTypes2["CyanStainedGlass"] = "minecraft:cyan_stained_glass";
  MinecraftItemTypes2["CyanStainedGlassPane"] = "minecraft:cyan_stained_glass_pane";
  MinecraftItemTypes2["CyanTerracotta"] = "minecraft:cyan_terracotta";
  MinecraftItemTypes2["CyanWool"] = "minecraft:cyan_wool";
  MinecraftItemTypes2["DangerPotterySherd"] = "minecraft:danger_pottery_sherd";
  MinecraftItemTypes2["DarkOakBoat"] = "minecraft:dark_oak_boat";
  MinecraftItemTypes2["DarkOakButton"] = "minecraft:dark_oak_button";
  MinecraftItemTypes2["DarkOakChestBoat"] = "minecraft:dark_oak_chest_boat";
  MinecraftItemTypes2["DarkOakDoor"] = "minecraft:dark_oak_door";
  MinecraftItemTypes2["DarkOakFence"] = "minecraft:dark_oak_fence";
  MinecraftItemTypes2["DarkOakFenceGate"] = "minecraft:dark_oak_fence_gate";
  MinecraftItemTypes2["DarkOakHangingSign"] = "minecraft:dark_oak_hanging_sign";
  MinecraftItemTypes2["DarkOakLeaves"] = "minecraft:dark_oak_leaves";
  MinecraftItemTypes2["DarkOakLog"] = "minecraft:dark_oak_log";
  MinecraftItemTypes2["DarkOakPlanks"] = "minecraft:dark_oak_planks";
  MinecraftItemTypes2["DarkOakPressurePlate"] = "minecraft:dark_oak_pressure_plate";
  MinecraftItemTypes2["DarkOakSapling"] = "minecraft:dark_oak_sapling";
  MinecraftItemTypes2["DarkOakSign"] = "minecraft:dark_oak_sign";
  MinecraftItemTypes2["DarkOakSlab"] = "minecraft:dark_oak_slab";
  MinecraftItemTypes2["DarkOakStairs"] = "minecraft:dark_oak_stairs";
  MinecraftItemTypes2["DarkOakTrapdoor"] = "minecraft:dark_oak_trapdoor";
  MinecraftItemTypes2["DarkOakWood"] = "minecraft:dark_oak_wood";
  MinecraftItemTypes2["DarkPrismarineStairs"] = "minecraft:dark_prismarine_stairs";
  MinecraftItemTypes2["DaylightDetector"] = "minecraft:daylight_detector";
  MinecraftItemTypes2["DeadBrainCoral"] = "minecraft:dead_brain_coral";
  MinecraftItemTypes2["DeadBrainCoralBlock"] = "minecraft:dead_brain_coral_block";
  MinecraftItemTypes2["DeadBrainCoralFan"] = "minecraft:dead_brain_coral_fan";
  MinecraftItemTypes2["DeadBubbleCoral"] = "minecraft:dead_bubble_coral";
  MinecraftItemTypes2["DeadBubbleCoralBlock"] = "minecraft:dead_bubble_coral_block";
  MinecraftItemTypes2["DeadBubbleCoralFan"] = "minecraft:dead_bubble_coral_fan";
  MinecraftItemTypes2["DeadFireCoral"] = "minecraft:dead_fire_coral";
  MinecraftItemTypes2["DeadFireCoralBlock"] = "minecraft:dead_fire_coral_block";
  MinecraftItemTypes2["DeadFireCoralFan"] = "minecraft:dead_fire_coral_fan";
  MinecraftItemTypes2["DeadHornCoral"] = "minecraft:dead_horn_coral";
  MinecraftItemTypes2["DeadHornCoralBlock"] = "minecraft:dead_horn_coral_block";
  MinecraftItemTypes2["DeadHornCoralFan"] = "minecraft:dead_horn_coral_fan";
  MinecraftItemTypes2["DeadTubeCoral"] = "minecraft:dead_tube_coral";
  MinecraftItemTypes2["DeadTubeCoralBlock"] = "minecraft:dead_tube_coral_block";
  MinecraftItemTypes2["DeadTubeCoralFan"] = "minecraft:dead_tube_coral_fan";
  MinecraftItemTypes2["Deadbush"] = "minecraft:deadbush";
  MinecraftItemTypes2["DecoratedPot"] = "minecraft:decorated_pot";
  MinecraftItemTypes2["Deepslate"] = "minecraft:deepslate";
  MinecraftItemTypes2["DeepslateBrickSlab"] = "minecraft:deepslate_brick_slab";
  MinecraftItemTypes2["DeepslateBrickStairs"] = "minecraft:deepslate_brick_stairs";
  MinecraftItemTypes2["DeepslateBrickWall"] = "minecraft:deepslate_brick_wall";
  MinecraftItemTypes2["DeepslateBricks"] = "minecraft:deepslate_bricks";
  MinecraftItemTypes2["DeepslateCoalOre"] = "minecraft:deepslate_coal_ore";
  MinecraftItemTypes2["DeepslateCopperOre"] = "minecraft:deepslate_copper_ore";
  MinecraftItemTypes2["DeepslateDiamondOre"] = "minecraft:deepslate_diamond_ore";
  MinecraftItemTypes2["DeepslateEmeraldOre"] = "minecraft:deepslate_emerald_ore";
  MinecraftItemTypes2["DeepslateGoldOre"] = "minecraft:deepslate_gold_ore";
  MinecraftItemTypes2["DeepslateIronOre"] = "minecraft:deepslate_iron_ore";
  MinecraftItemTypes2["DeepslateLapisOre"] = "minecraft:deepslate_lapis_ore";
  MinecraftItemTypes2["DeepslateRedstoneOre"] = "minecraft:deepslate_redstone_ore";
  MinecraftItemTypes2["DeepslateTileSlab"] = "minecraft:deepslate_tile_slab";
  MinecraftItemTypes2["DeepslateTileStairs"] = "minecraft:deepslate_tile_stairs";
  MinecraftItemTypes2["DeepslateTileWall"] = "minecraft:deepslate_tile_wall";
  MinecraftItemTypes2["DeepslateTiles"] = "minecraft:deepslate_tiles";
  MinecraftItemTypes2["Deny"] = "minecraft:deny";
  MinecraftItemTypes2["DetectorRail"] = "minecraft:detector_rail";
  MinecraftItemTypes2["Diamond"] = "minecraft:diamond";
  MinecraftItemTypes2["DiamondAxe"] = "minecraft:diamond_axe";
  MinecraftItemTypes2["DiamondBlock"] = "minecraft:diamond_block";
  MinecraftItemTypes2["DiamondBoots"] = "minecraft:diamond_boots";
  MinecraftItemTypes2["DiamondChestplate"] = "minecraft:diamond_chestplate";
  MinecraftItemTypes2["DiamondHelmet"] = "minecraft:diamond_helmet";
  MinecraftItemTypes2["DiamondHoe"] = "minecraft:diamond_hoe";
  MinecraftItemTypes2["DiamondHorseArmor"] = "minecraft:diamond_horse_armor";
  MinecraftItemTypes2["DiamondLeggings"] = "minecraft:diamond_leggings";
  MinecraftItemTypes2["DiamondOre"] = "minecraft:diamond_ore";
  MinecraftItemTypes2["DiamondPickaxe"] = "minecraft:diamond_pickaxe";
  MinecraftItemTypes2["DiamondShovel"] = "minecraft:diamond_shovel";
  MinecraftItemTypes2["DiamondSword"] = "minecraft:diamond_sword";
  MinecraftItemTypes2["Diorite"] = "minecraft:diorite";
  MinecraftItemTypes2["DioriteStairs"] = "minecraft:diorite_stairs";
  MinecraftItemTypes2["Dirt"] = "minecraft:dirt";
  MinecraftItemTypes2["DirtWithRoots"] = "minecraft:dirt_with_roots";
  MinecraftItemTypes2["DiscFragment5"] = "minecraft:disc_fragment_5";
  MinecraftItemTypes2["Dispenser"] = "minecraft:dispenser";
  MinecraftItemTypes2["DolphinSpawnEgg"] = "minecraft:dolphin_spawn_egg";
  MinecraftItemTypes2["DonkeySpawnEgg"] = "minecraft:donkey_spawn_egg";
  MinecraftItemTypes2["DoublePlant"] = "minecraft:double_plant";
  MinecraftItemTypes2["DragonBreath"] = "minecraft:dragon_breath";
  MinecraftItemTypes2["DragonEgg"] = "minecraft:dragon_egg";
  MinecraftItemTypes2["DriedKelp"] = "minecraft:dried_kelp";
  MinecraftItemTypes2["DriedKelpBlock"] = "minecraft:dried_kelp_block";
  MinecraftItemTypes2["DripstoneBlock"] = "minecraft:dripstone_block";
  MinecraftItemTypes2["Dropper"] = "minecraft:dropper";
  MinecraftItemTypes2["DrownedSpawnEgg"] = "minecraft:drowned_spawn_egg";
  MinecraftItemTypes2["DuneArmorTrimSmithingTemplate"] = "minecraft:dune_armor_trim_smithing_template";
  MinecraftItemTypes2["Dye"] = "minecraft:dye";
  MinecraftItemTypes2["EchoShard"] = "minecraft:echo_shard";
  MinecraftItemTypes2["Egg"] = "minecraft:egg";
  MinecraftItemTypes2["ElderGuardianSpawnEgg"] = "minecraft:elder_guardian_spawn_egg";
  MinecraftItemTypes2["Elytra"] = "minecraft:elytra";
  MinecraftItemTypes2["Emerald"] = "minecraft:emerald";
  MinecraftItemTypes2["EmeraldBlock"] = "minecraft:emerald_block";
  MinecraftItemTypes2["EmeraldOre"] = "minecraft:emerald_ore";
  MinecraftItemTypes2["EmptyMap"] = "minecraft:empty_map";
  MinecraftItemTypes2["EnchantedBook"] = "minecraft:enchanted_book";
  MinecraftItemTypes2["EnchantedGoldenApple"] = "minecraft:enchanted_golden_apple";
  MinecraftItemTypes2["EnchantingTable"] = "minecraft:enchanting_table";
  MinecraftItemTypes2["EndBrickStairs"] = "minecraft:end_brick_stairs";
  MinecraftItemTypes2["EndBricks"] = "minecraft:end_bricks";
  MinecraftItemTypes2["EndCrystal"] = "minecraft:end_crystal";
  MinecraftItemTypes2["EndPortalFrame"] = "minecraft:end_portal_frame";
  MinecraftItemTypes2["EndRod"] = "minecraft:end_rod";
  MinecraftItemTypes2["EndStone"] = "minecraft:end_stone";
  MinecraftItemTypes2["EnderChest"] = "minecraft:ender_chest";
  MinecraftItemTypes2["EnderDragonSpawnEgg"] = "minecraft:ender_dragon_spawn_egg";
  MinecraftItemTypes2["EnderEye"] = "minecraft:ender_eye";
  MinecraftItemTypes2["EnderPearl"] = "minecraft:ender_pearl";
  MinecraftItemTypes2["EndermanSpawnEgg"] = "minecraft:enderman_spawn_egg";
  MinecraftItemTypes2["EndermiteSpawnEgg"] = "minecraft:endermite_spawn_egg";
  MinecraftItemTypes2["EvokerSpawnEgg"] = "minecraft:evoker_spawn_egg";
  MinecraftItemTypes2["ExperienceBottle"] = "minecraft:experience_bottle";
  MinecraftItemTypes2["ExplorerPotterySherd"] = "minecraft:explorer_pottery_sherd";
  MinecraftItemTypes2["ExposedChiseledCopper"] = "minecraft:exposed_chiseled_copper";
  MinecraftItemTypes2["ExposedCopper"] = "minecraft:exposed_copper";
  MinecraftItemTypes2["ExposedCopperBulb"] = "minecraft:exposed_copper_bulb";
  MinecraftItemTypes2["ExposedCopperDoor"] = "minecraft:exposed_copper_door";
  MinecraftItemTypes2["ExposedCopperGrate"] = "minecraft:exposed_copper_grate";
  MinecraftItemTypes2["ExposedCopperTrapdoor"] = "minecraft:exposed_copper_trapdoor";
  MinecraftItemTypes2["ExposedCutCopper"] = "minecraft:exposed_cut_copper";
  MinecraftItemTypes2["ExposedCutCopperSlab"] = "minecraft:exposed_cut_copper_slab";
  MinecraftItemTypes2["ExposedCutCopperStairs"] = "minecraft:exposed_cut_copper_stairs";
  MinecraftItemTypes2["EyeArmorTrimSmithingTemplate"] = "minecraft:eye_armor_trim_smithing_template";
  MinecraftItemTypes2["Farmland"] = "minecraft:farmland";
  MinecraftItemTypes2["Feather"] = "minecraft:feather";
  MinecraftItemTypes2["Fence"] = "minecraft:fence";
  MinecraftItemTypes2["FenceGate"] = "minecraft:fence_gate";
  MinecraftItemTypes2["FermentedSpiderEye"] = "minecraft:fermented_spider_eye";
  MinecraftItemTypes2["Fern"] = "minecraft:fern";
  MinecraftItemTypes2["FieldMasonedBannerPattern"] = "minecraft:field_masoned_banner_pattern";
  MinecraftItemTypes2["FilledMap"] = "minecraft:filled_map";
  MinecraftItemTypes2["FireCharge"] = "minecraft:fire_charge";
  MinecraftItemTypes2["FireCoral"] = "minecraft:fire_coral";
  MinecraftItemTypes2["FireCoralBlock"] = "minecraft:fire_coral_block";
  MinecraftItemTypes2["FireCoralFan"] = "minecraft:fire_coral_fan";
  MinecraftItemTypes2["FireworkRocket"] = "minecraft:firework_rocket";
  MinecraftItemTypes2["FireworkStar"] = "minecraft:firework_star";
  MinecraftItemTypes2["FishingRod"] = "minecraft:fishing_rod";
  MinecraftItemTypes2["FletchingTable"] = "minecraft:fletching_table";
  MinecraftItemTypes2["Flint"] = "minecraft:flint";
  MinecraftItemTypes2["FlintAndSteel"] = "minecraft:flint_and_steel";
  MinecraftItemTypes2["FlowArmorTrimSmithingTemplate"] = "minecraft:flow_armor_trim_smithing_template";
  MinecraftItemTypes2["FlowBannerPattern"] = "minecraft:flow_banner_pattern";
  MinecraftItemTypes2["FlowPotterySherd"] = "minecraft:flow_pottery_sherd";
  MinecraftItemTypes2["FlowerBannerPattern"] = "minecraft:flower_banner_pattern";
  MinecraftItemTypes2["FlowerPot"] = "minecraft:flower_pot";
  MinecraftItemTypes2["FloweringAzalea"] = "minecraft:flowering_azalea";
  MinecraftItemTypes2["FoxSpawnEgg"] = "minecraft:fox_spawn_egg";
  MinecraftItemTypes2["Frame"] = "minecraft:frame";
  MinecraftItemTypes2["FriendPotterySherd"] = "minecraft:friend_pottery_sherd";
  MinecraftItemTypes2["FrogSpawn"] = "minecraft:frog_spawn";
  MinecraftItemTypes2["FrogSpawnEgg"] = "minecraft:frog_spawn_egg";
  MinecraftItemTypes2["FrostedIce"] = "minecraft:frosted_ice";
  MinecraftItemTypes2["Furnace"] = "minecraft:furnace";
  MinecraftItemTypes2["GhastSpawnEgg"] = "minecraft:ghast_spawn_egg";
  MinecraftItemTypes2["GhastTear"] = "minecraft:ghast_tear";
  MinecraftItemTypes2["GildedBlackstone"] = "minecraft:gilded_blackstone";
  MinecraftItemTypes2["Glass"] = "minecraft:glass";
  MinecraftItemTypes2["GlassBottle"] = "minecraft:glass_bottle";
  MinecraftItemTypes2["GlassPane"] = "minecraft:glass_pane";
  MinecraftItemTypes2["GlisteringMelonSlice"] = "minecraft:glistering_melon_slice";
  MinecraftItemTypes2["GlobeBannerPattern"] = "minecraft:globe_banner_pattern";
  MinecraftItemTypes2["GlowBerries"] = "minecraft:glow_berries";
  MinecraftItemTypes2["GlowFrame"] = "minecraft:glow_frame";
  MinecraftItemTypes2["GlowInkSac"] = "minecraft:glow_ink_sac";
  MinecraftItemTypes2["GlowLichen"] = "minecraft:glow_lichen";
  MinecraftItemTypes2["GlowSquidSpawnEgg"] = "minecraft:glow_squid_spawn_egg";
  MinecraftItemTypes2["Glowstone"] = "minecraft:glowstone";
  MinecraftItemTypes2["GlowstoneDust"] = "minecraft:glowstone_dust";
  MinecraftItemTypes2["GoatHorn"] = "minecraft:goat_horn";
  MinecraftItemTypes2["GoatSpawnEgg"] = "minecraft:goat_spawn_egg";
  MinecraftItemTypes2["GoldBlock"] = "minecraft:gold_block";
  MinecraftItemTypes2["GoldIngot"] = "minecraft:gold_ingot";
  MinecraftItemTypes2["GoldNugget"] = "minecraft:gold_nugget";
  MinecraftItemTypes2["GoldOre"] = "minecraft:gold_ore";
  MinecraftItemTypes2["GoldenApple"] = "minecraft:golden_apple";
  MinecraftItemTypes2["GoldenAxe"] = "minecraft:golden_axe";
  MinecraftItemTypes2["GoldenBoots"] = "minecraft:golden_boots";
  MinecraftItemTypes2["GoldenCarrot"] = "minecraft:golden_carrot";
  MinecraftItemTypes2["GoldenChestplate"] = "minecraft:golden_chestplate";
  MinecraftItemTypes2["GoldenHelmet"] = "minecraft:golden_helmet";
  MinecraftItemTypes2["GoldenHoe"] = "minecraft:golden_hoe";
  MinecraftItemTypes2["GoldenHorseArmor"] = "minecraft:golden_horse_armor";
  MinecraftItemTypes2["GoldenLeggings"] = "minecraft:golden_leggings";
  MinecraftItemTypes2["GoldenPickaxe"] = "minecraft:golden_pickaxe";
  MinecraftItemTypes2["GoldenRail"] = "minecraft:golden_rail";
  MinecraftItemTypes2["GoldenShovel"] = "minecraft:golden_shovel";
  MinecraftItemTypes2["GoldenSword"] = "minecraft:golden_sword";
  MinecraftItemTypes2["Granite"] = "minecraft:granite";
  MinecraftItemTypes2["GraniteStairs"] = "minecraft:granite_stairs";
  MinecraftItemTypes2["GrassBlock"] = "minecraft:grass_block";
  MinecraftItemTypes2["GrassPath"] = "minecraft:grass_path";
  MinecraftItemTypes2["Gravel"] = "minecraft:gravel";
  MinecraftItemTypes2["GrayCandle"] = "minecraft:gray_candle";
  MinecraftItemTypes2["GrayCarpet"] = "minecraft:gray_carpet";
  MinecraftItemTypes2["GrayConcrete"] = "minecraft:gray_concrete";
  MinecraftItemTypes2["GrayConcretePowder"] = "minecraft:gray_concrete_powder";
  MinecraftItemTypes2["GrayDye"] = "minecraft:gray_dye";
  MinecraftItemTypes2["GrayGlazedTerracotta"] = "minecraft:gray_glazed_terracotta";
  MinecraftItemTypes2["GrayShulkerBox"] = "minecraft:gray_shulker_box";
  MinecraftItemTypes2["GrayStainedGlass"] = "minecraft:gray_stained_glass";
  MinecraftItemTypes2["GrayStainedGlassPane"] = "minecraft:gray_stained_glass_pane";
  MinecraftItemTypes2["GrayTerracotta"] = "minecraft:gray_terracotta";
  MinecraftItemTypes2["GrayWool"] = "minecraft:gray_wool";
  MinecraftItemTypes2["GreenCandle"] = "minecraft:green_candle";
  MinecraftItemTypes2["GreenCarpet"] = "minecraft:green_carpet";
  MinecraftItemTypes2["GreenConcrete"] = "minecraft:green_concrete";
  MinecraftItemTypes2["GreenConcretePowder"] = "minecraft:green_concrete_powder";
  MinecraftItemTypes2["GreenDye"] = "minecraft:green_dye";
  MinecraftItemTypes2["GreenGlazedTerracotta"] = "minecraft:green_glazed_terracotta";
  MinecraftItemTypes2["GreenShulkerBox"] = "minecraft:green_shulker_box";
  MinecraftItemTypes2["GreenStainedGlass"] = "minecraft:green_stained_glass";
  MinecraftItemTypes2["GreenStainedGlassPane"] = "minecraft:green_stained_glass_pane";
  MinecraftItemTypes2["GreenTerracotta"] = "minecraft:green_terracotta";
  MinecraftItemTypes2["GreenWool"] = "minecraft:green_wool";
  MinecraftItemTypes2["Grindstone"] = "minecraft:grindstone";
  MinecraftItemTypes2["GuardianSpawnEgg"] = "minecraft:guardian_spawn_egg";
  MinecraftItemTypes2["Gunpowder"] = "minecraft:gunpowder";
  MinecraftItemTypes2["GusterBannerPattern"] = "minecraft:guster_banner_pattern";
  MinecraftItemTypes2["GusterPotterySherd"] = "minecraft:guster_pottery_sherd";
  MinecraftItemTypes2["HangingRoots"] = "minecraft:hanging_roots";
  MinecraftItemTypes2["HardStainedGlass"] = "minecraft:hard_stained_glass";
  MinecraftItemTypes2["HardStainedGlassPane"] = "minecraft:hard_stained_glass_pane";
  MinecraftItemTypes2["HardenedClay"] = "minecraft:hardened_clay";
  MinecraftItemTypes2["HayBlock"] = "minecraft:hay_block";
  MinecraftItemTypes2["HeartOfTheSea"] = "minecraft:heart_of_the_sea";
  MinecraftItemTypes2["HeartPotterySherd"] = "minecraft:heart_pottery_sherd";
  MinecraftItemTypes2["HeartbreakPotterySherd"] = "minecraft:heartbreak_pottery_sherd";
  MinecraftItemTypes2["HeavyCore"] = "minecraft:heavy_core";
  MinecraftItemTypes2["HeavyWeightedPressurePlate"] = "minecraft:heavy_weighted_pressure_plate";
  MinecraftItemTypes2["HoglinSpawnEgg"] = "minecraft:hoglin_spawn_egg";
  MinecraftItemTypes2["HoneyBlock"] = "minecraft:honey_block";
  MinecraftItemTypes2["HoneyBottle"] = "minecraft:honey_bottle";
  MinecraftItemTypes2["Honeycomb"] = "minecraft:honeycomb";
  MinecraftItemTypes2["HoneycombBlock"] = "minecraft:honeycomb_block";
  MinecraftItemTypes2["Hopper"] = "minecraft:hopper";
  MinecraftItemTypes2["HopperMinecart"] = "minecraft:hopper_minecart";
  MinecraftItemTypes2["HornCoral"] = "minecraft:horn_coral";
  MinecraftItemTypes2["HornCoralBlock"] = "minecraft:horn_coral_block";
  MinecraftItemTypes2["HornCoralFan"] = "minecraft:horn_coral_fan";
  MinecraftItemTypes2["HorseSpawnEgg"] = "minecraft:horse_spawn_egg";
  MinecraftItemTypes2["HostArmorTrimSmithingTemplate"] = "minecraft:host_armor_trim_smithing_template";
  MinecraftItemTypes2["HowlPotterySherd"] = "minecraft:howl_pottery_sherd";
  MinecraftItemTypes2["HuskSpawnEgg"] = "minecraft:husk_spawn_egg";
  MinecraftItemTypes2["Ice"] = "minecraft:ice";
  MinecraftItemTypes2["InfestedDeepslate"] = "minecraft:infested_deepslate";
  MinecraftItemTypes2["InkSac"] = "minecraft:ink_sac";
  MinecraftItemTypes2["IronAxe"] = "minecraft:iron_axe";
  MinecraftItemTypes2["IronBars"] = "minecraft:iron_bars";
  MinecraftItemTypes2["IronBlock"] = "minecraft:iron_block";
  MinecraftItemTypes2["IronBoots"] = "minecraft:iron_boots";
  MinecraftItemTypes2["IronChestplate"] = "minecraft:iron_chestplate";
  MinecraftItemTypes2["IronDoor"] = "minecraft:iron_door";
  MinecraftItemTypes2["IronGolemSpawnEgg"] = "minecraft:iron_golem_spawn_egg";
  MinecraftItemTypes2["IronHelmet"] = "minecraft:iron_helmet";
  MinecraftItemTypes2["IronHoe"] = "minecraft:iron_hoe";
  MinecraftItemTypes2["IronHorseArmor"] = "minecraft:iron_horse_armor";
  MinecraftItemTypes2["IronIngot"] = "minecraft:iron_ingot";
  MinecraftItemTypes2["IronLeggings"] = "minecraft:iron_leggings";
  MinecraftItemTypes2["IronNugget"] = "minecraft:iron_nugget";
  MinecraftItemTypes2["IronOre"] = "minecraft:iron_ore";
  MinecraftItemTypes2["IronPickaxe"] = "minecraft:iron_pickaxe";
  MinecraftItemTypes2["IronShovel"] = "minecraft:iron_shovel";
  MinecraftItemTypes2["IronSword"] = "minecraft:iron_sword";
  MinecraftItemTypes2["IronTrapdoor"] = "minecraft:iron_trapdoor";
  MinecraftItemTypes2["Jigsaw"] = "minecraft:jigsaw";
  MinecraftItemTypes2["Jukebox"] = "minecraft:jukebox";
  MinecraftItemTypes2["JungleBoat"] = "minecraft:jungle_boat";
  MinecraftItemTypes2["JungleButton"] = "minecraft:jungle_button";
  MinecraftItemTypes2["JungleChestBoat"] = "minecraft:jungle_chest_boat";
  MinecraftItemTypes2["JungleDoor"] = "minecraft:jungle_door";
  MinecraftItemTypes2["JungleFence"] = "minecraft:jungle_fence";
  MinecraftItemTypes2["JungleFenceGate"] = "minecraft:jungle_fence_gate";
  MinecraftItemTypes2["JungleHangingSign"] = "minecraft:jungle_hanging_sign";
  MinecraftItemTypes2["JungleLeaves"] = "minecraft:jungle_leaves";
  MinecraftItemTypes2["JungleLog"] = "minecraft:jungle_log";
  MinecraftItemTypes2["JunglePlanks"] = "minecraft:jungle_planks";
  MinecraftItemTypes2["JunglePressurePlate"] = "minecraft:jungle_pressure_plate";
  MinecraftItemTypes2["JungleSapling"] = "minecraft:jungle_sapling";
  MinecraftItemTypes2["JungleSign"] = "minecraft:jungle_sign";
  MinecraftItemTypes2["JungleSlab"] = "minecraft:jungle_slab";
  MinecraftItemTypes2["JungleStairs"] = "minecraft:jungle_stairs";
  MinecraftItemTypes2["JungleTrapdoor"] = "minecraft:jungle_trapdoor";
  MinecraftItemTypes2["JungleWood"] = "minecraft:jungle_wood";
  MinecraftItemTypes2["Kelp"] = "minecraft:kelp";
  MinecraftItemTypes2["Ladder"] = "minecraft:ladder";
  MinecraftItemTypes2["Lantern"] = "minecraft:lantern";
  MinecraftItemTypes2["LapisBlock"] = "minecraft:lapis_block";
  MinecraftItemTypes2["LapisLazuli"] = "minecraft:lapis_lazuli";
  MinecraftItemTypes2["LapisOre"] = "minecraft:lapis_ore";
  MinecraftItemTypes2["LargeAmethystBud"] = "minecraft:large_amethyst_bud";
  MinecraftItemTypes2["LargeFern"] = "minecraft:large_fern";
  MinecraftItemTypes2["LavaBucket"] = "minecraft:lava_bucket";
  MinecraftItemTypes2["Lead"] = "minecraft:lead";
  MinecraftItemTypes2["Leather"] = "minecraft:leather";
  MinecraftItemTypes2["LeatherBoots"] = "minecraft:leather_boots";
  MinecraftItemTypes2["LeatherChestplate"] = "minecraft:leather_chestplate";
  MinecraftItemTypes2["LeatherHelmet"] = "minecraft:leather_helmet";
  MinecraftItemTypes2["LeatherHorseArmor"] = "minecraft:leather_horse_armor";
  MinecraftItemTypes2["LeatherLeggings"] = "minecraft:leather_leggings";
  MinecraftItemTypes2["Leaves"] = "minecraft:leaves";
  MinecraftItemTypes2["Leaves2"] = "minecraft:leaves2";
  MinecraftItemTypes2["Lectern"] = "minecraft:lectern";
  MinecraftItemTypes2["Lever"] = "minecraft:lever";
  MinecraftItemTypes2["LightBlock"] = "minecraft:light_block";
  MinecraftItemTypes2["LightBlueCandle"] = "minecraft:light_blue_candle";
  MinecraftItemTypes2["LightBlueCarpet"] = "minecraft:light_blue_carpet";
  MinecraftItemTypes2["LightBlueConcrete"] = "minecraft:light_blue_concrete";
  MinecraftItemTypes2["LightBlueConcretePowder"] = "minecraft:light_blue_concrete_powder";
  MinecraftItemTypes2["LightBlueDye"] = "minecraft:light_blue_dye";
  MinecraftItemTypes2["LightBlueGlazedTerracotta"] = "minecraft:light_blue_glazed_terracotta";
  MinecraftItemTypes2["LightBlueShulkerBox"] = "minecraft:light_blue_shulker_box";
  MinecraftItemTypes2["LightBlueStainedGlass"] = "minecraft:light_blue_stained_glass";
  MinecraftItemTypes2["LightBlueStainedGlassPane"] = "minecraft:light_blue_stained_glass_pane";
  MinecraftItemTypes2["LightBlueTerracotta"] = "minecraft:light_blue_terracotta";
  MinecraftItemTypes2["LightBlueWool"] = "minecraft:light_blue_wool";
  MinecraftItemTypes2["LightGrayCandle"] = "minecraft:light_gray_candle";
  MinecraftItemTypes2["LightGrayCarpet"] = "minecraft:light_gray_carpet";
  MinecraftItemTypes2["LightGrayConcrete"] = "minecraft:light_gray_concrete";
  MinecraftItemTypes2["LightGrayConcretePowder"] = "minecraft:light_gray_concrete_powder";
  MinecraftItemTypes2["LightGrayDye"] = "minecraft:light_gray_dye";
  MinecraftItemTypes2["LightGrayShulkerBox"] = "minecraft:light_gray_shulker_box";
  MinecraftItemTypes2["LightGrayStainedGlass"] = "minecraft:light_gray_stained_glass";
  MinecraftItemTypes2["LightGrayStainedGlassPane"] = "minecraft:light_gray_stained_glass_pane";
  MinecraftItemTypes2["LightGrayTerracotta"] = "minecraft:light_gray_terracotta";
  MinecraftItemTypes2["LightGrayWool"] = "minecraft:light_gray_wool";
  MinecraftItemTypes2["LightWeightedPressurePlate"] = "minecraft:light_weighted_pressure_plate";
  MinecraftItemTypes2["LightningRod"] = "minecraft:lightning_rod";
  MinecraftItemTypes2["Lilac"] = "minecraft:lilac";
  MinecraftItemTypes2["LilyOfTheValley"] = "minecraft:lily_of_the_valley";
  MinecraftItemTypes2["LimeCandle"] = "minecraft:lime_candle";
  MinecraftItemTypes2["LimeCarpet"] = "minecraft:lime_carpet";
  MinecraftItemTypes2["LimeConcrete"] = "minecraft:lime_concrete";
  MinecraftItemTypes2["LimeConcretePowder"] = "minecraft:lime_concrete_powder";
  MinecraftItemTypes2["LimeDye"] = "minecraft:lime_dye";
  MinecraftItemTypes2["LimeGlazedTerracotta"] = "minecraft:lime_glazed_terracotta";
  MinecraftItemTypes2["LimeShulkerBox"] = "minecraft:lime_shulker_box";
  MinecraftItemTypes2["LimeStainedGlass"] = "minecraft:lime_stained_glass";
  MinecraftItemTypes2["LimeStainedGlassPane"] = "minecraft:lime_stained_glass_pane";
  MinecraftItemTypes2["LimeTerracotta"] = "minecraft:lime_terracotta";
  MinecraftItemTypes2["LimeWool"] = "minecraft:lime_wool";
  MinecraftItemTypes2["LingeringPotion"] = "minecraft:lingering_potion";
  MinecraftItemTypes2["LitPumpkin"] = "minecraft:lit_pumpkin";
  MinecraftItemTypes2["LlamaSpawnEgg"] = "minecraft:llama_spawn_egg";
  MinecraftItemTypes2["Lodestone"] = "minecraft:lodestone";
  MinecraftItemTypes2["LodestoneCompass"] = "minecraft:lodestone_compass";
  MinecraftItemTypes2["Log"] = "minecraft:log";
  MinecraftItemTypes2["Log2"] = "minecraft:log2";
  MinecraftItemTypes2["Loom"] = "minecraft:loom";
  MinecraftItemTypes2["Mace"] = "minecraft:mace";
  MinecraftItemTypes2["MagentaCandle"] = "minecraft:magenta_candle";
  MinecraftItemTypes2["MagentaCarpet"] = "minecraft:magenta_carpet";
  MinecraftItemTypes2["MagentaConcrete"] = "minecraft:magenta_concrete";
  MinecraftItemTypes2["MagentaConcretePowder"] = "minecraft:magenta_concrete_powder";
  MinecraftItemTypes2["MagentaDye"] = "minecraft:magenta_dye";
  MinecraftItemTypes2["MagentaGlazedTerracotta"] = "minecraft:magenta_glazed_terracotta";
  MinecraftItemTypes2["MagentaShulkerBox"] = "minecraft:magenta_shulker_box";
  MinecraftItemTypes2["MagentaStainedGlass"] = "minecraft:magenta_stained_glass";
  MinecraftItemTypes2["MagentaStainedGlassPane"] = "minecraft:magenta_stained_glass_pane";
  MinecraftItemTypes2["MagentaTerracotta"] = "minecraft:magenta_terracotta";
  MinecraftItemTypes2["MagentaWool"] = "minecraft:magenta_wool";
  MinecraftItemTypes2["Magma"] = "minecraft:magma";
  MinecraftItemTypes2["MagmaCream"] = "minecraft:magma_cream";
  MinecraftItemTypes2["MagmaCubeSpawnEgg"] = "minecraft:magma_cube_spawn_egg";
  MinecraftItemTypes2["MangroveBoat"] = "minecraft:mangrove_boat";
  MinecraftItemTypes2["MangroveButton"] = "minecraft:mangrove_button";
  MinecraftItemTypes2["MangroveChestBoat"] = "minecraft:mangrove_chest_boat";
  MinecraftItemTypes2["MangroveDoor"] = "minecraft:mangrove_door";
  MinecraftItemTypes2["MangroveFence"] = "minecraft:mangrove_fence";
  MinecraftItemTypes2["MangroveFenceGate"] = "minecraft:mangrove_fence_gate";
  MinecraftItemTypes2["MangroveHangingSign"] = "minecraft:mangrove_hanging_sign";
  MinecraftItemTypes2["MangroveLeaves"] = "minecraft:mangrove_leaves";
  MinecraftItemTypes2["MangroveLog"] = "minecraft:mangrove_log";
  MinecraftItemTypes2["MangrovePlanks"] = "minecraft:mangrove_planks";
  MinecraftItemTypes2["MangrovePressurePlate"] = "minecraft:mangrove_pressure_plate";
  MinecraftItemTypes2["MangrovePropagule"] = "minecraft:mangrove_propagule";
  MinecraftItemTypes2["MangroveRoots"] = "minecraft:mangrove_roots";
  MinecraftItemTypes2["MangroveSign"] = "minecraft:mangrove_sign";
  MinecraftItemTypes2["MangroveSlab"] = "minecraft:mangrove_slab";
  MinecraftItemTypes2["MangroveStairs"] = "minecraft:mangrove_stairs";
  MinecraftItemTypes2["MangroveTrapdoor"] = "minecraft:mangrove_trapdoor";
  MinecraftItemTypes2["MangroveWood"] = "minecraft:mangrove_wood";
  MinecraftItemTypes2["MediumAmethystBud"] = "minecraft:medium_amethyst_bud";
  MinecraftItemTypes2["MelonBlock"] = "minecraft:melon_block";
  MinecraftItemTypes2["MelonSeeds"] = "minecraft:melon_seeds";
  MinecraftItemTypes2["MelonSlice"] = "minecraft:melon_slice";
  MinecraftItemTypes2["MilkBucket"] = "minecraft:milk_bucket";
  MinecraftItemTypes2["Minecart"] = "minecraft:minecart";
  MinecraftItemTypes2["MinerPotterySherd"] = "minecraft:miner_pottery_sherd";
  MinecraftItemTypes2["MobSpawner"] = "minecraft:mob_spawner";
  MinecraftItemTypes2["MojangBannerPattern"] = "minecraft:mojang_banner_pattern";
  MinecraftItemTypes2["MonsterEgg"] = "minecraft:monster_egg";
  MinecraftItemTypes2["MooshroomSpawnEgg"] = "minecraft:mooshroom_spawn_egg";
  MinecraftItemTypes2["MossBlock"] = "minecraft:moss_block";
  MinecraftItemTypes2["MossCarpet"] = "minecraft:moss_carpet";
  MinecraftItemTypes2["MossyCobblestone"] = "minecraft:mossy_cobblestone";
  MinecraftItemTypes2["MossyCobblestoneStairs"] = "minecraft:mossy_cobblestone_stairs";
  MinecraftItemTypes2["MossyStoneBrickStairs"] = "minecraft:mossy_stone_brick_stairs";
  MinecraftItemTypes2["MournerPotterySherd"] = "minecraft:mourner_pottery_sherd";
  MinecraftItemTypes2["Mud"] = "minecraft:mud";
  MinecraftItemTypes2["MudBrickSlab"] = "minecraft:mud_brick_slab";
  MinecraftItemTypes2["MudBrickStairs"] = "minecraft:mud_brick_stairs";
  MinecraftItemTypes2["MudBrickWall"] = "minecraft:mud_brick_wall";
  MinecraftItemTypes2["MudBricks"] = "minecraft:mud_bricks";
  MinecraftItemTypes2["MuddyMangroveRoots"] = "minecraft:muddy_mangrove_roots";
  MinecraftItemTypes2["MuleSpawnEgg"] = "minecraft:mule_spawn_egg";
  MinecraftItemTypes2["MushroomStew"] = "minecraft:mushroom_stew";
  MinecraftItemTypes2["MusicDisc11"] = "minecraft:music_disc_11";
  MinecraftItemTypes2["MusicDisc13"] = "minecraft:music_disc_13";
  MinecraftItemTypes2["MusicDisc5"] = "minecraft:music_disc_5";
  MinecraftItemTypes2["MusicDiscBlocks"] = "minecraft:music_disc_blocks";
  MinecraftItemTypes2["MusicDiscCat"] = "minecraft:music_disc_cat";
  MinecraftItemTypes2["MusicDiscChirp"] = "minecraft:music_disc_chirp";
  MinecraftItemTypes2["MusicDiscCreator"] = "minecraft:music_disc_creator";
  MinecraftItemTypes2["MusicDiscCreatorMusicBox"] = "minecraft:music_disc_creator_music_box";
  MinecraftItemTypes2["MusicDiscFar"] = "minecraft:music_disc_far";
  MinecraftItemTypes2["MusicDiscMall"] = "minecraft:music_disc_mall";
  MinecraftItemTypes2["MusicDiscMellohi"] = "minecraft:music_disc_mellohi";
  MinecraftItemTypes2["MusicDiscOtherside"] = "minecraft:music_disc_otherside";
  MinecraftItemTypes2["MusicDiscPigstep"] = "minecraft:music_disc_pigstep";
  MinecraftItemTypes2["MusicDiscPrecipice"] = "minecraft:music_disc_precipice";
  MinecraftItemTypes2["MusicDiscRelic"] = "minecraft:music_disc_relic";
  MinecraftItemTypes2["MusicDiscStal"] = "minecraft:music_disc_stal";
  MinecraftItemTypes2["MusicDiscStrad"] = "minecraft:music_disc_strad";
  MinecraftItemTypes2["MusicDiscWait"] = "minecraft:music_disc_wait";
  MinecraftItemTypes2["MusicDiscWard"] = "minecraft:music_disc_ward";
  MinecraftItemTypes2["Mutton"] = "minecraft:mutton";
  MinecraftItemTypes2["Mycelium"] = "minecraft:mycelium";
  MinecraftItemTypes2["NameTag"] = "minecraft:name_tag";
  MinecraftItemTypes2["NautilusShell"] = "minecraft:nautilus_shell";
  MinecraftItemTypes2["NetherBrick"] = "minecraft:nether_brick";
  MinecraftItemTypes2["NetherBrickFence"] = "minecraft:nether_brick_fence";
  MinecraftItemTypes2["NetherBrickSlab"] = "minecraft:nether_brick_slab";
  MinecraftItemTypes2["NetherBrickStairs"] = "minecraft:nether_brick_stairs";
  MinecraftItemTypes2["NetherGoldOre"] = "minecraft:nether_gold_ore";
  MinecraftItemTypes2["NetherSprouts"] = "minecraft:nether_sprouts";
  MinecraftItemTypes2["NetherStar"] = "minecraft:nether_star";
  MinecraftItemTypes2["NetherWart"] = "minecraft:nether_wart";
  MinecraftItemTypes2["NetherWartBlock"] = "minecraft:nether_wart_block";
  MinecraftItemTypes2["Netherbrick"] = "minecraft:netherbrick";
  MinecraftItemTypes2["NetheriteAxe"] = "minecraft:netherite_axe";
  MinecraftItemTypes2["NetheriteBlock"] = "minecraft:netherite_block";
  MinecraftItemTypes2["NetheriteBoots"] = "minecraft:netherite_boots";
  MinecraftItemTypes2["NetheriteChestplate"] = "minecraft:netherite_chestplate";
  MinecraftItemTypes2["NetheriteHelmet"] = "minecraft:netherite_helmet";
  MinecraftItemTypes2["NetheriteHoe"] = "minecraft:netherite_hoe";
  MinecraftItemTypes2["NetheriteIngot"] = "minecraft:netherite_ingot";
  MinecraftItemTypes2["NetheriteLeggings"] = "minecraft:netherite_leggings";
  MinecraftItemTypes2["NetheritePickaxe"] = "minecraft:netherite_pickaxe";
  MinecraftItemTypes2["NetheriteScrap"] = "minecraft:netherite_scrap";
  MinecraftItemTypes2["NetheriteShovel"] = "minecraft:netherite_shovel";
  MinecraftItemTypes2["NetheriteSword"] = "minecraft:netherite_sword";
  MinecraftItemTypes2["NetheriteUpgradeSmithingTemplate"] = "minecraft:netherite_upgrade_smithing_template";
  MinecraftItemTypes2["Netherrack"] = "minecraft:netherrack";
  MinecraftItemTypes2["NormalStoneStairs"] = "minecraft:normal_stone_stairs";
  MinecraftItemTypes2["Noteblock"] = "minecraft:noteblock";
  MinecraftItemTypes2["OakBoat"] = "minecraft:oak_boat";
  MinecraftItemTypes2["OakChestBoat"] = "minecraft:oak_chest_boat";
  MinecraftItemTypes2["OakFence"] = "minecraft:oak_fence";
  MinecraftItemTypes2["OakHangingSign"] = "minecraft:oak_hanging_sign";
  MinecraftItemTypes2["OakLeaves"] = "minecraft:oak_leaves";
  MinecraftItemTypes2["OakLog"] = "minecraft:oak_log";
  MinecraftItemTypes2["OakPlanks"] = "minecraft:oak_planks";
  MinecraftItemTypes2["OakSapling"] = "minecraft:oak_sapling";
  MinecraftItemTypes2["OakSign"] = "minecraft:oak_sign";
  MinecraftItemTypes2["OakSlab"] = "minecraft:oak_slab";
  MinecraftItemTypes2["OakStairs"] = "minecraft:oak_stairs";
  MinecraftItemTypes2["OakWood"] = "minecraft:oak_wood";
  MinecraftItemTypes2["Observer"] = "minecraft:observer";
  MinecraftItemTypes2["Obsidian"] = "minecraft:obsidian";
  MinecraftItemTypes2["OcelotSpawnEgg"] = "minecraft:ocelot_spawn_egg";
  MinecraftItemTypes2["OchreFroglight"] = "minecraft:ochre_froglight";
  MinecraftItemTypes2["OminousBottle"] = "minecraft:ominous_bottle";
  MinecraftItemTypes2["OminousTrialKey"] = "minecraft:ominous_trial_key";
  MinecraftItemTypes2["OrangeCandle"] = "minecraft:orange_candle";
  MinecraftItemTypes2["OrangeCarpet"] = "minecraft:orange_carpet";
  MinecraftItemTypes2["OrangeConcrete"] = "minecraft:orange_concrete";
  MinecraftItemTypes2["OrangeConcretePowder"] = "minecraft:orange_concrete_powder";
  MinecraftItemTypes2["OrangeDye"] = "minecraft:orange_dye";
  MinecraftItemTypes2["OrangeGlazedTerracotta"] = "minecraft:orange_glazed_terracotta";
  MinecraftItemTypes2["OrangeShulkerBox"] = "minecraft:orange_shulker_box";
  MinecraftItemTypes2["OrangeStainedGlass"] = "minecraft:orange_stained_glass";
  MinecraftItemTypes2["OrangeStainedGlassPane"] = "minecraft:orange_stained_glass_pane";
  MinecraftItemTypes2["OrangeTerracotta"] = "minecraft:orange_terracotta";
  MinecraftItemTypes2["OrangeTulip"] = "minecraft:orange_tulip";
  MinecraftItemTypes2["OrangeWool"] = "minecraft:orange_wool";
  MinecraftItemTypes2["OxeyeDaisy"] = "minecraft:oxeye_daisy";
  MinecraftItemTypes2["OxidizedChiseledCopper"] = "minecraft:oxidized_chiseled_copper";
  MinecraftItemTypes2["OxidizedCopper"] = "minecraft:oxidized_copper";
  MinecraftItemTypes2["OxidizedCopperBulb"] = "minecraft:oxidized_copper_bulb";
  MinecraftItemTypes2["OxidizedCopperDoor"] = "minecraft:oxidized_copper_door";
  MinecraftItemTypes2["OxidizedCopperGrate"] = "minecraft:oxidized_copper_grate";
  MinecraftItemTypes2["OxidizedCopperTrapdoor"] = "minecraft:oxidized_copper_trapdoor";
  MinecraftItemTypes2["OxidizedCutCopper"] = "minecraft:oxidized_cut_copper";
  MinecraftItemTypes2["OxidizedCutCopperSlab"] = "minecraft:oxidized_cut_copper_slab";
  MinecraftItemTypes2["OxidizedCutCopperStairs"] = "minecraft:oxidized_cut_copper_stairs";
  MinecraftItemTypes2["PackedIce"] = "minecraft:packed_ice";
  MinecraftItemTypes2["PackedMud"] = "minecraft:packed_mud";
  MinecraftItemTypes2["Painting"] = "minecraft:painting";
  MinecraftItemTypes2["PandaSpawnEgg"] = "minecraft:panda_spawn_egg";
  MinecraftItemTypes2["Paper"] = "minecraft:paper";
  MinecraftItemTypes2["ParrotSpawnEgg"] = "minecraft:parrot_spawn_egg";
  MinecraftItemTypes2["PearlescentFroglight"] = "minecraft:pearlescent_froglight";
  MinecraftItemTypes2["Peony"] = "minecraft:peony";
  MinecraftItemTypes2["PetrifiedOakSlab"] = "minecraft:petrified_oak_slab";
  MinecraftItemTypes2["PhantomMembrane"] = "minecraft:phantom_membrane";
  MinecraftItemTypes2["PhantomSpawnEgg"] = "minecraft:phantom_spawn_egg";
  MinecraftItemTypes2["PigSpawnEgg"] = "minecraft:pig_spawn_egg";
  MinecraftItemTypes2["PiglinBannerPattern"] = "minecraft:piglin_banner_pattern";
  MinecraftItemTypes2["PiglinBruteSpawnEgg"] = "minecraft:piglin_brute_spawn_egg";
  MinecraftItemTypes2["PiglinSpawnEgg"] = "minecraft:piglin_spawn_egg";
  MinecraftItemTypes2["PillagerSpawnEgg"] = "minecraft:pillager_spawn_egg";
  MinecraftItemTypes2["PinkCandle"] = "minecraft:pink_candle";
  MinecraftItemTypes2["PinkCarpet"] = "minecraft:pink_carpet";
  MinecraftItemTypes2["PinkConcrete"] = "minecraft:pink_concrete";
  MinecraftItemTypes2["PinkConcretePowder"] = "minecraft:pink_concrete_powder";
  MinecraftItemTypes2["PinkDye"] = "minecraft:pink_dye";
  MinecraftItemTypes2["PinkGlazedTerracotta"] = "minecraft:pink_glazed_terracotta";
  MinecraftItemTypes2["PinkPetals"] = "minecraft:pink_petals";
  MinecraftItemTypes2["PinkShulkerBox"] = "minecraft:pink_shulker_box";
  MinecraftItemTypes2["PinkStainedGlass"] = "minecraft:pink_stained_glass";
  MinecraftItemTypes2["PinkStainedGlassPane"] = "minecraft:pink_stained_glass_pane";
  MinecraftItemTypes2["PinkTerracotta"] = "minecraft:pink_terracotta";
  MinecraftItemTypes2["PinkTulip"] = "minecraft:pink_tulip";
  MinecraftItemTypes2["PinkWool"] = "minecraft:pink_wool";
  MinecraftItemTypes2["Piston"] = "minecraft:piston";
  MinecraftItemTypes2["PitcherPlant"] = "minecraft:pitcher_plant";
  MinecraftItemTypes2["PitcherPod"] = "minecraft:pitcher_pod";
  MinecraftItemTypes2["Planks"] = "minecraft:planks";
  MinecraftItemTypes2["PlentyPotterySherd"] = "minecraft:plenty_pottery_sherd";
  MinecraftItemTypes2["Podzol"] = "minecraft:podzol";
  MinecraftItemTypes2["PointedDripstone"] = "minecraft:pointed_dripstone";
  MinecraftItemTypes2["PoisonousPotato"] = "minecraft:poisonous_potato";
  MinecraftItemTypes2["PolarBearSpawnEgg"] = "minecraft:polar_bear_spawn_egg";
  MinecraftItemTypes2["PolishedAndesite"] = "minecraft:polished_andesite";
  MinecraftItemTypes2["PolishedAndesiteStairs"] = "minecraft:polished_andesite_stairs";
  MinecraftItemTypes2["PolishedBasalt"] = "minecraft:polished_basalt";
  MinecraftItemTypes2["PolishedBlackstone"] = "minecraft:polished_blackstone";
  MinecraftItemTypes2["PolishedBlackstoneBrickSlab"] = "minecraft:polished_blackstone_brick_slab";
  MinecraftItemTypes2["PolishedBlackstoneBrickStairs"] = "minecraft:polished_blackstone_brick_stairs";
  MinecraftItemTypes2["PolishedBlackstoneBrickWall"] = "minecraft:polished_blackstone_brick_wall";
  MinecraftItemTypes2["PolishedBlackstoneBricks"] = "minecraft:polished_blackstone_bricks";
  MinecraftItemTypes2["PolishedBlackstoneButton"] = "minecraft:polished_blackstone_button";
  MinecraftItemTypes2["PolishedBlackstonePressurePlate"] = "minecraft:polished_blackstone_pressure_plate";
  MinecraftItemTypes2["PolishedBlackstoneSlab"] = "minecraft:polished_blackstone_slab";
  MinecraftItemTypes2["PolishedBlackstoneStairs"] = "minecraft:polished_blackstone_stairs";
  MinecraftItemTypes2["PolishedBlackstoneWall"] = "minecraft:polished_blackstone_wall";
  MinecraftItemTypes2["PolishedDeepslate"] = "minecraft:polished_deepslate";
  MinecraftItemTypes2["PolishedDeepslateSlab"] = "minecraft:polished_deepslate_slab";
  MinecraftItemTypes2["PolishedDeepslateStairs"] = "minecraft:polished_deepslate_stairs";
  MinecraftItemTypes2["PolishedDeepslateWall"] = "minecraft:polished_deepslate_wall";
  MinecraftItemTypes2["PolishedDiorite"] = "minecraft:polished_diorite";
  MinecraftItemTypes2["PolishedDioriteStairs"] = "minecraft:polished_diorite_stairs";
  MinecraftItemTypes2["PolishedGranite"] = "minecraft:polished_granite";
  MinecraftItemTypes2["PolishedGraniteStairs"] = "minecraft:polished_granite_stairs";
  MinecraftItemTypes2["PolishedTuff"] = "minecraft:polished_tuff";
  MinecraftItemTypes2["PolishedTuffSlab"] = "minecraft:polished_tuff_slab";
  MinecraftItemTypes2["PolishedTuffStairs"] = "minecraft:polished_tuff_stairs";
  MinecraftItemTypes2["PolishedTuffWall"] = "minecraft:polished_tuff_wall";
  MinecraftItemTypes2["PoppedChorusFruit"] = "minecraft:popped_chorus_fruit";
  MinecraftItemTypes2["Poppy"] = "minecraft:poppy";
  MinecraftItemTypes2["Porkchop"] = "minecraft:porkchop";
  MinecraftItemTypes2["Potato"] = "minecraft:potato";
  MinecraftItemTypes2["Potion"] = "minecraft:potion";
  MinecraftItemTypes2["PowderSnowBucket"] = "minecraft:powder_snow_bucket";
  MinecraftItemTypes2["Prismarine"] = "minecraft:prismarine";
  MinecraftItemTypes2["PrismarineBricksStairs"] = "minecraft:prismarine_bricks_stairs";
  MinecraftItemTypes2["PrismarineCrystals"] = "minecraft:prismarine_crystals";
  MinecraftItemTypes2["PrismarineShard"] = "minecraft:prismarine_shard";
  MinecraftItemTypes2["PrismarineStairs"] = "minecraft:prismarine_stairs";
  MinecraftItemTypes2["PrizePotterySherd"] = "minecraft:prize_pottery_sherd";
  MinecraftItemTypes2["Pufferfish"] = "minecraft:pufferfish";
  MinecraftItemTypes2["PufferfishBucket"] = "minecraft:pufferfish_bucket";
  MinecraftItemTypes2["PufferfishSpawnEgg"] = "minecraft:pufferfish_spawn_egg";
  MinecraftItemTypes2["Pumpkin"] = "minecraft:pumpkin";
  MinecraftItemTypes2["PumpkinPie"] = "minecraft:pumpkin_pie";
  MinecraftItemTypes2["PumpkinSeeds"] = "minecraft:pumpkin_seeds";
  MinecraftItemTypes2["PurpleCandle"] = "minecraft:purple_candle";
  MinecraftItemTypes2["PurpleCarpet"] = "minecraft:purple_carpet";
  MinecraftItemTypes2["PurpleConcrete"] = "minecraft:purple_concrete";
  MinecraftItemTypes2["PurpleConcretePowder"] = "minecraft:purple_concrete_powder";
  MinecraftItemTypes2["PurpleDye"] = "minecraft:purple_dye";
  MinecraftItemTypes2["PurpleGlazedTerracotta"] = "minecraft:purple_glazed_terracotta";
  MinecraftItemTypes2["PurpleShulkerBox"] = "minecraft:purple_shulker_box";
  MinecraftItemTypes2["PurpleStainedGlass"] = "minecraft:purple_stained_glass";
  MinecraftItemTypes2["PurpleStainedGlassPane"] = "minecraft:purple_stained_glass_pane";
  MinecraftItemTypes2["PurpleTerracotta"] = "minecraft:purple_terracotta";
  MinecraftItemTypes2["PurpleWool"] = "minecraft:purple_wool";
  MinecraftItemTypes2["PurpurBlock"] = "minecraft:purpur_block";
  MinecraftItemTypes2["PurpurStairs"] = "minecraft:purpur_stairs";
  MinecraftItemTypes2["Quartz"] = "minecraft:quartz";
  MinecraftItemTypes2["QuartzBlock"] = "minecraft:quartz_block";
  MinecraftItemTypes2["QuartzBricks"] = "minecraft:quartz_bricks";
  MinecraftItemTypes2["QuartzOre"] = "minecraft:quartz_ore";
  MinecraftItemTypes2["QuartzSlab"] = "minecraft:quartz_slab";
  MinecraftItemTypes2["QuartzStairs"] = "minecraft:quartz_stairs";
  MinecraftItemTypes2["Rabbit"] = "minecraft:rabbit";
  MinecraftItemTypes2["RabbitFoot"] = "minecraft:rabbit_foot";
  MinecraftItemTypes2["RabbitHide"] = "minecraft:rabbit_hide";
  MinecraftItemTypes2["RabbitSpawnEgg"] = "minecraft:rabbit_spawn_egg";
  MinecraftItemTypes2["RabbitStew"] = "minecraft:rabbit_stew";
  MinecraftItemTypes2["Rail"] = "minecraft:rail";
  MinecraftItemTypes2["RaiserArmorTrimSmithingTemplate"] = "minecraft:raiser_armor_trim_smithing_template";
  MinecraftItemTypes2["RavagerSpawnEgg"] = "minecraft:ravager_spawn_egg";
  MinecraftItemTypes2["RawCopper"] = "minecraft:raw_copper";
  MinecraftItemTypes2["RawCopperBlock"] = "minecraft:raw_copper_block";
  MinecraftItemTypes2["RawGold"] = "minecraft:raw_gold";
  MinecraftItemTypes2["RawGoldBlock"] = "minecraft:raw_gold_block";
  MinecraftItemTypes2["RawIron"] = "minecraft:raw_iron";
  MinecraftItemTypes2["RawIronBlock"] = "minecraft:raw_iron_block";
  MinecraftItemTypes2["RecoveryCompass"] = "minecraft:recovery_compass";
  MinecraftItemTypes2["RedCandle"] = "minecraft:red_candle";
  MinecraftItemTypes2["RedCarpet"] = "minecraft:red_carpet";
  MinecraftItemTypes2["RedConcrete"] = "minecraft:red_concrete";
  MinecraftItemTypes2["RedConcretePowder"] = "minecraft:red_concrete_powder";
  MinecraftItemTypes2["RedDye"] = "minecraft:red_dye";
  MinecraftItemTypes2["RedFlower"] = "minecraft:red_flower";
  MinecraftItemTypes2["RedGlazedTerracotta"] = "minecraft:red_glazed_terracotta";
  MinecraftItemTypes2["RedMushroom"] = "minecraft:red_mushroom";
  MinecraftItemTypes2["RedMushroomBlock"] = "minecraft:red_mushroom_block";
  MinecraftItemTypes2["RedNetherBrick"] = "minecraft:red_nether_brick";
  MinecraftItemTypes2["RedNetherBrickStairs"] = "minecraft:red_nether_brick_stairs";
  MinecraftItemTypes2["RedSandstone"] = "minecraft:red_sandstone";
  MinecraftItemTypes2["RedSandstoneStairs"] = "minecraft:red_sandstone_stairs";
  MinecraftItemTypes2["RedShulkerBox"] = "minecraft:red_shulker_box";
  MinecraftItemTypes2["RedStainedGlass"] = "minecraft:red_stained_glass";
  MinecraftItemTypes2["RedStainedGlassPane"] = "minecraft:red_stained_glass_pane";
  MinecraftItemTypes2["RedTerracotta"] = "minecraft:red_terracotta";
  MinecraftItemTypes2["RedTulip"] = "minecraft:red_tulip";
  MinecraftItemTypes2["RedWool"] = "minecraft:red_wool";
  MinecraftItemTypes2["Redstone"] = "minecraft:redstone";
  MinecraftItemTypes2["RedstoneBlock"] = "minecraft:redstone_block";
  MinecraftItemTypes2["RedstoneLamp"] = "minecraft:redstone_lamp";
  MinecraftItemTypes2["RedstoneOre"] = "minecraft:redstone_ore";
  MinecraftItemTypes2["RedstoneTorch"] = "minecraft:redstone_torch";
  MinecraftItemTypes2["ReinforcedDeepslate"] = "minecraft:reinforced_deepslate";
  MinecraftItemTypes2["Repeater"] = "minecraft:repeater";
  MinecraftItemTypes2["RepeatingCommandBlock"] = "minecraft:repeating_command_block";
  MinecraftItemTypes2["RespawnAnchor"] = "minecraft:respawn_anchor";
  MinecraftItemTypes2["RibArmorTrimSmithingTemplate"] = "minecraft:rib_armor_trim_smithing_template";
  MinecraftItemTypes2["RoseBush"] = "minecraft:rose_bush";
  MinecraftItemTypes2["RottenFlesh"] = "minecraft:rotten_flesh";
  MinecraftItemTypes2["Saddle"] = "minecraft:saddle";
  MinecraftItemTypes2["Salmon"] = "minecraft:salmon";
  MinecraftItemTypes2["SalmonBucket"] = "minecraft:salmon_bucket";
  MinecraftItemTypes2["SalmonSpawnEgg"] = "minecraft:salmon_spawn_egg";
  MinecraftItemTypes2["Sand"] = "minecraft:sand";
  MinecraftItemTypes2["Sandstone"] = "minecraft:sandstone";
  MinecraftItemTypes2["SandstoneSlab"] = "minecraft:sandstone_slab";
  MinecraftItemTypes2["SandstoneStairs"] = "minecraft:sandstone_stairs";
  MinecraftItemTypes2["Sapling"] = "minecraft:sapling";
  MinecraftItemTypes2["Scaffolding"] = "minecraft:scaffolding";
  MinecraftItemTypes2["ScrapePotterySherd"] = "minecraft:scrape_pottery_sherd";
  MinecraftItemTypes2["Sculk"] = "minecraft:sculk";
  MinecraftItemTypes2["SculkCatalyst"] = "minecraft:sculk_catalyst";
  MinecraftItemTypes2["SculkSensor"] = "minecraft:sculk_sensor";
  MinecraftItemTypes2["SculkShrieker"] = "minecraft:sculk_shrieker";
  MinecraftItemTypes2["SculkVein"] = "minecraft:sculk_vein";
  MinecraftItemTypes2["SeaLantern"] = "minecraft:sea_lantern";
  MinecraftItemTypes2["SeaPickle"] = "minecraft:sea_pickle";
  MinecraftItemTypes2["Seagrass"] = "minecraft:seagrass";
  MinecraftItemTypes2["SentryArmorTrimSmithingTemplate"] = "minecraft:sentry_armor_trim_smithing_template";
  MinecraftItemTypes2["ShaperArmorTrimSmithingTemplate"] = "minecraft:shaper_armor_trim_smithing_template";
  MinecraftItemTypes2["SheafPotterySherd"] = "minecraft:sheaf_pottery_sherd";
  MinecraftItemTypes2["Shears"] = "minecraft:shears";
  MinecraftItemTypes2["SheepSpawnEgg"] = "minecraft:sheep_spawn_egg";
  MinecraftItemTypes2["ShelterPotterySherd"] = "minecraft:shelter_pottery_sherd";
  MinecraftItemTypes2["Shield"] = "minecraft:shield";
  MinecraftItemTypes2["ShortGrass"] = "minecraft:short_grass";
  MinecraftItemTypes2["Shroomlight"] = "minecraft:shroomlight";
  MinecraftItemTypes2["ShulkerBox"] = "minecraft:shulker_box";
  MinecraftItemTypes2["ShulkerShell"] = "minecraft:shulker_shell";
  MinecraftItemTypes2["ShulkerSpawnEgg"] = "minecraft:shulker_spawn_egg";
  MinecraftItemTypes2["SilenceArmorTrimSmithingTemplate"] = "minecraft:silence_armor_trim_smithing_template";
  MinecraftItemTypes2["SilverGlazedTerracotta"] = "minecraft:silver_glazed_terracotta";
  MinecraftItemTypes2["SilverfishSpawnEgg"] = "minecraft:silverfish_spawn_egg";
  MinecraftItemTypes2["SkeletonHorseSpawnEgg"] = "minecraft:skeleton_horse_spawn_egg";
  MinecraftItemTypes2["SkeletonSpawnEgg"] = "minecraft:skeleton_spawn_egg";
  MinecraftItemTypes2["Skull"] = "minecraft:skull";
  MinecraftItemTypes2["SkullBannerPattern"] = "minecraft:skull_banner_pattern";
  MinecraftItemTypes2["SkullPotterySherd"] = "minecraft:skull_pottery_sherd";
  MinecraftItemTypes2["Slime"] = "minecraft:slime";
  MinecraftItemTypes2["SlimeBall"] = "minecraft:slime_ball";
  MinecraftItemTypes2["SlimeSpawnEgg"] = "minecraft:slime_spawn_egg";
  MinecraftItemTypes2["SmallAmethystBud"] = "minecraft:small_amethyst_bud";
  MinecraftItemTypes2["SmallDripleafBlock"] = "minecraft:small_dripleaf_block";
  MinecraftItemTypes2["SmithingTable"] = "minecraft:smithing_table";
  MinecraftItemTypes2["Smoker"] = "minecraft:smoker";
  MinecraftItemTypes2["SmoothBasalt"] = "minecraft:smooth_basalt";
  MinecraftItemTypes2["SmoothQuartzStairs"] = "minecraft:smooth_quartz_stairs";
  MinecraftItemTypes2["SmoothRedSandstoneStairs"] = "minecraft:smooth_red_sandstone_stairs";
  MinecraftItemTypes2["SmoothSandstoneStairs"] = "minecraft:smooth_sandstone_stairs";
  MinecraftItemTypes2["SmoothStone"] = "minecraft:smooth_stone";
  MinecraftItemTypes2["SmoothStoneSlab"] = "minecraft:smooth_stone_slab";
  MinecraftItemTypes2["SnifferEgg"] = "minecraft:sniffer_egg";
  MinecraftItemTypes2["SnifferSpawnEgg"] = "minecraft:sniffer_spawn_egg";
  MinecraftItemTypes2["SnortPotterySherd"] = "minecraft:snort_pottery_sherd";
  MinecraftItemTypes2["SnoutArmorTrimSmithingTemplate"] = "minecraft:snout_armor_trim_smithing_template";
  MinecraftItemTypes2["Snow"] = "minecraft:snow";
  MinecraftItemTypes2["SnowGolemSpawnEgg"] = "minecraft:snow_golem_spawn_egg";
  MinecraftItemTypes2["SnowLayer"] = "minecraft:snow_layer";
  MinecraftItemTypes2["Snowball"] = "minecraft:snowball";
  MinecraftItemTypes2["SoulCampfire"] = "minecraft:soul_campfire";
  MinecraftItemTypes2["SoulLantern"] = "minecraft:soul_lantern";
  MinecraftItemTypes2["SoulSand"] = "minecraft:soul_sand";
  MinecraftItemTypes2["SoulSoil"] = "minecraft:soul_soil";
  MinecraftItemTypes2["SoulTorch"] = "minecraft:soul_torch";
  MinecraftItemTypes2["SpawnEgg"] = "minecraft:spawn_egg";
  MinecraftItemTypes2["SpiderEye"] = "minecraft:spider_eye";
  MinecraftItemTypes2["SpiderSpawnEgg"] = "minecraft:spider_spawn_egg";
  MinecraftItemTypes2["SpireArmorTrimSmithingTemplate"] = "minecraft:spire_armor_trim_smithing_template";
  MinecraftItemTypes2["SplashPotion"] = "minecraft:splash_potion";
  MinecraftItemTypes2["Sponge"] = "minecraft:sponge";
  MinecraftItemTypes2["SporeBlossom"] = "minecraft:spore_blossom";
  MinecraftItemTypes2["SpruceBoat"] = "minecraft:spruce_boat";
  MinecraftItemTypes2["SpruceButton"] = "minecraft:spruce_button";
  MinecraftItemTypes2["SpruceChestBoat"] = "minecraft:spruce_chest_boat";
  MinecraftItemTypes2["SpruceDoor"] = "minecraft:spruce_door";
  MinecraftItemTypes2["SpruceFence"] = "minecraft:spruce_fence";
  MinecraftItemTypes2["SpruceFenceGate"] = "minecraft:spruce_fence_gate";
  MinecraftItemTypes2["SpruceHangingSign"] = "minecraft:spruce_hanging_sign";
  MinecraftItemTypes2["SpruceLeaves"] = "minecraft:spruce_leaves";
  MinecraftItemTypes2["SpruceLog"] = "minecraft:spruce_log";
  MinecraftItemTypes2["SprucePlanks"] = "minecraft:spruce_planks";
  MinecraftItemTypes2["SprucePressurePlate"] = "minecraft:spruce_pressure_plate";
  MinecraftItemTypes2["SpruceSapling"] = "minecraft:spruce_sapling";
  MinecraftItemTypes2["SpruceSign"] = "minecraft:spruce_sign";
  MinecraftItemTypes2["SpruceSlab"] = "minecraft:spruce_slab";
  MinecraftItemTypes2["SpruceStairs"] = "minecraft:spruce_stairs";
  MinecraftItemTypes2["SpruceTrapdoor"] = "minecraft:spruce_trapdoor";
  MinecraftItemTypes2["SpruceWood"] = "minecraft:spruce_wood";
  MinecraftItemTypes2["Spyglass"] = "minecraft:spyglass";
  MinecraftItemTypes2["SquidSpawnEgg"] = "minecraft:squid_spawn_egg";
  MinecraftItemTypes2["StainedGlass"] = "minecraft:stained_glass";
  MinecraftItemTypes2["StainedGlassPane"] = "minecraft:stained_glass_pane";
  MinecraftItemTypes2["StainedHardenedClay"] = "minecraft:stained_hardened_clay";
  MinecraftItemTypes2["Stick"] = "minecraft:stick";
  MinecraftItemTypes2["StickyPiston"] = "minecraft:sticky_piston";
  MinecraftItemTypes2["Stone"] = "minecraft:stone";
  MinecraftItemTypes2["StoneAxe"] = "minecraft:stone_axe";
  MinecraftItemTypes2["StoneBlockSlab"] = "minecraft:stone_block_slab";
  MinecraftItemTypes2["StoneBlockSlab2"] = "minecraft:stone_block_slab2";
  MinecraftItemTypes2["StoneBlockSlab3"] = "minecraft:stone_block_slab3";
  MinecraftItemTypes2["StoneBlockSlab4"] = "minecraft:stone_block_slab4";
  MinecraftItemTypes2["StoneBrickSlab"] = "minecraft:stone_brick_slab";
  MinecraftItemTypes2["StoneBrickStairs"] = "minecraft:stone_brick_stairs";
  MinecraftItemTypes2["StoneButton"] = "minecraft:stone_button";
  MinecraftItemTypes2["StoneHoe"] = "minecraft:stone_hoe";
  MinecraftItemTypes2["StonePickaxe"] = "minecraft:stone_pickaxe";
  MinecraftItemTypes2["StonePressurePlate"] = "minecraft:stone_pressure_plate";
  MinecraftItemTypes2["StoneShovel"] = "minecraft:stone_shovel";
  MinecraftItemTypes2["StoneStairs"] = "minecraft:stone_stairs";
  MinecraftItemTypes2["StoneSword"] = "minecraft:stone_sword";
  MinecraftItemTypes2["Stonebrick"] = "minecraft:stonebrick";
  MinecraftItemTypes2["StonecutterBlock"] = "minecraft:stonecutter_block";
  MinecraftItemTypes2["StraySpawnEgg"] = "minecraft:stray_spawn_egg";
  MinecraftItemTypes2["StriderSpawnEgg"] = "minecraft:strider_spawn_egg";
  MinecraftItemTypes2["String"] = "minecraft:string";
  MinecraftItemTypes2["StrippedAcaciaLog"] = "minecraft:stripped_acacia_log";
  MinecraftItemTypes2["StrippedAcaciaWood"] = "minecraft:stripped_acacia_wood";
  MinecraftItemTypes2["StrippedBambooBlock"] = "minecraft:stripped_bamboo_block";
  MinecraftItemTypes2["StrippedBirchLog"] = "minecraft:stripped_birch_log";
  MinecraftItemTypes2["StrippedBirchWood"] = "minecraft:stripped_birch_wood";
  MinecraftItemTypes2["StrippedCherryLog"] = "minecraft:stripped_cherry_log";
  MinecraftItemTypes2["StrippedCherryWood"] = "minecraft:stripped_cherry_wood";
  MinecraftItemTypes2["StrippedCrimsonHyphae"] = "minecraft:stripped_crimson_hyphae";
  MinecraftItemTypes2["StrippedCrimsonStem"] = "minecraft:stripped_crimson_stem";
  MinecraftItemTypes2["StrippedDarkOakLog"] = "minecraft:stripped_dark_oak_log";
  MinecraftItemTypes2["StrippedDarkOakWood"] = "minecraft:stripped_dark_oak_wood";
  MinecraftItemTypes2["StrippedJungleLog"] = "minecraft:stripped_jungle_log";
  MinecraftItemTypes2["StrippedJungleWood"] = "minecraft:stripped_jungle_wood";
  MinecraftItemTypes2["StrippedMangroveLog"] = "minecraft:stripped_mangrove_log";
  MinecraftItemTypes2["StrippedMangroveWood"] = "minecraft:stripped_mangrove_wood";
  MinecraftItemTypes2["StrippedOakLog"] = "minecraft:stripped_oak_log";
  MinecraftItemTypes2["StrippedOakWood"] = "minecraft:stripped_oak_wood";
  MinecraftItemTypes2["StrippedSpruceLog"] = "minecraft:stripped_spruce_log";
  MinecraftItemTypes2["StrippedSpruceWood"] = "minecraft:stripped_spruce_wood";
  MinecraftItemTypes2["StrippedWarpedHyphae"] = "minecraft:stripped_warped_hyphae";
  MinecraftItemTypes2["StrippedWarpedStem"] = "minecraft:stripped_warped_stem";
  MinecraftItemTypes2["StructureBlock"] = "minecraft:structure_block";
  MinecraftItemTypes2["StructureVoid"] = "minecraft:structure_void";
  MinecraftItemTypes2["Sugar"] = "minecraft:sugar";
  MinecraftItemTypes2["SugarCane"] = "minecraft:sugar_cane";
  MinecraftItemTypes2["Sunflower"] = "minecraft:sunflower";
  MinecraftItemTypes2["SuspiciousGravel"] = "minecraft:suspicious_gravel";
  MinecraftItemTypes2["SuspiciousSand"] = "minecraft:suspicious_sand";
  MinecraftItemTypes2["SuspiciousStew"] = "minecraft:suspicious_stew";
  MinecraftItemTypes2["SweetBerries"] = "minecraft:sweet_berries";
  MinecraftItemTypes2["TadpoleBucket"] = "minecraft:tadpole_bucket";
  MinecraftItemTypes2["TadpoleSpawnEgg"] = "minecraft:tadpole_spawn_egg";
  MinecraftItemTypes2["TallGrass"] = "minecraft:tall_grass";
  MinecraftItemTypes2["Tallgrass"] = "minecraft:tallgrass";
  MinecraftItemTypes2["Target"] = "minecraft:target";
  MinecraftItemTypes2["TideArmorTrimSmithingTemplate"] = "minecraft:tide_armor_trim_smithing_template";
  MinecraftItemTypes2["TintedGlass"] = "minecraft:tinted_glass";
  MinecraftItemTypes2["Tnt"] = "minecraft:tnt";
  MinecraftItemTypes2["TntMinecart"] = "minecraft:tnt_minecart";
  MinecraftItemTypes2["Torch"] = "minecraft:torch";
  MinecraftItemTypes2["Torchflower"] = "minecraft:torchflower";
  MinecraftItemTypes2["TorchflowerSeeds"] = "minecraft:torchflower_seeds";
  MinecraftItemTypes2["TotemOfUndying"] = "minecraft:totem_of_undying";
  MinecraftItemTypes2["TraderLlamaSpawnEgg"] = "minecraft:trader_llama_spawn_egg";
  MinecraftItemTypes2["Trapdoor"] = "minecraft:trapdoor";
  MinecraftItemTypes2["TrappedChest"] = "minecraft:trapped_chest";
  MinecraftItemTypes2["TrialKey"] = "minecraft:trial_key";
  MinecraftItemTypes2["TrialSpawner"] = "minecraft:trial_spawner";
  MinecraftItemTypes2["Trident"] = "minecraft:trident";
  MinecraftItemTypes2["TripwireHook"] = "minecraft:tripwire_hook";
  MinecraftItemTypes2["TropicalFish"] = "minecraft:tropical_fish";
  MinecraftItemTypes2["TropicalFishBucket"] = "minecraft:tropical_fish_bucket";
  MinecraftItemTypes2["TropicalFishSpawnEgg"] = "minecraft:tropical_fish_spawn_egg";
  MinecraftItemTypes2["TubeCoral"] = "minecraft:tube_coral";
  MinecraftItemTypes2["TubeCoralBlock"] = "minecraft:tube_coral_block";
  MinecraftItemTypes2["TubeCoralFan"] = "minecraft:tube_coral_fan";
  MinecraftItemTypes2["Tuff"] = "minecraft:tuff";
  MinecraftItemTypes2["TuffBrickSlab"] = "minecraft:tuff_brick_slab";
  MinecraftItemTypes2["TuffBrickStairs"] = "minecraft:tuff_brick_stairs";
  MinecraftItemTypes2["TuffBrickWall"] = "minecraft:tuff_brick_wall";
  MinecraftItemTypes2["TuffBricks"] = "minecraft:tuff_bricks";
  MinecraftItemTypes2["TuffSlab"] = "minecraft:tuff_slab";
  MinecraftItemTypes2["TuffStairs"] = "minecraft:tuff_stairs";
  MinecraftItemTypes2["TuffWall"] = "minecraft:tuff_wall";
  MinecraftItemTypes2["TurtleEgg"] = "minecraft:turtle_egg";
  MinecraftItemTypes2["TurtleHelmet"] = "minecraft:turtle_helmet";
  MinecraftItemTypes2["TurtleScute"] = "minecraft:turtle_scute";
  MinecraftItemTypes2["TurtleSpawnEgg"] = "minecraft:turtle_spawn_egg";
  MinecraftItemTypes2["TwistingVines"] = "minecraft:twisting_vines";
  MinecraftItemTypes2["UndyedShulkerBox"] = "minecraft:undyed_shulker_box";
  MinecraftItemTypes2["Vault"] = "minecraft:vault";
  MinecraftItemTypes2["VerdantFroglight"] = "minecraft:verdant_froglight";
  MinecraftItemTypes2["VexArmorTrimSmithingTemplate"] = "minecraft:vex_armor_trim_smithing_template";
  MinecraftItemTypes2["VexSpawnEgg"] = "minecraft:vex_spawn_egg";
  MinecraftItemTypes2["VillagerSpawnEgg"] = "minecraft:villager_spawn_egg";
  MinecraftItemTypes2["VindicatorSpawnEgg"] = "minecraft:vindicator_spawn_egg";
  MinecraftItemTypes2["Vine"] = "minecraft:vine";
  MinecraftItemTypes2["WanderingTraderSpawnEgg"] = "minecraft:wandering_trader_spawn_egg";
  MinecraftItemTypes2["WardArmorTrimSmithingTemplate"] = "minecraft:ward_armor_trim_smithing_template";
  MinecraftItemTypes2["WardenSpawnEgg"] = "minecraft:warden_spawn_egg";
  MinecraftItemTypes2["WarpedButton"] = "minecraft:warped_button";
  MinecraftItemTypes2["WarpedDoor"] = "minecraft:warped_door";
  MinecraftItemTypes2["WarpedFence"] = "minecraft:warped_fence";
  MinecraftItemTypes2["WarpedFenceGate"] = "minecraft:warped_fence_gate";
  MinecraftItemTypes2["WarpedFungus"] = "minecraft:warped_fungus";
  MinecraftItemTypes2["WarpedFungusOnAStick"] = "minecraft:warped_fungus_on_a_stick";
  MinecraftItemTypes2["WarpedHangingSign"] = "minecraft:warped_hanging_sign";
  MinecraftItemTypes2["WarpedHyphae"] = "minecraft:warped_hyphae";
  MinecraftItemTypes2["WarpedNylium"] = "minecraft:warped_nylium";
  MinecraftItemTypes2["WarpedPlanks"] = "minecraft:warped_planks";
  MinecraftItemTypes2["WarpedPressurePlate"] = "minecraft:warped_pressure_plate";
  MinecraftItemTypes2["WarpedRoots"] = "minecraft:warped_roots";
  MinecraftItemTypes2["WarpedSign"] = "minecraft:warped_sign";
  MinecraftItemTypes2["WarpedSlab"] = "minecraft:warped_slab";
  MinecraftItemTypes2["WarpedStairs"] = "minecraft:warped_stairs";
  MinecraftItemTypes2["WarpedStem"] = "minecraft:warped_stem";
  MinecraftItemTypes2["WarpedTrapdoor"] = "minecraft:warped_trapdoor";
  MinecraftItemTypes2["WarpedWartBlock"] = "minecraft:warped_wart_block";
  MinecraftItemTypes2["WaterBucket"] = "minecraft:water_bucket";
  MinecraftItemTypes2["Waterlily"] = "minecraft:waterlily";
  MinecraftItemTypes2["WaxedChiseledCopper"] = "minecraft:waxed_chiseled_copper";
  MinecraftItemTypes2["WaxedCopper"] = "minecraft:waxed_copper";
  MinecraftItemTypes2["WaxedCopperBulb"] = "minecraft:waxed_copper_bulb";
  MinecraftItemTypes2["WaxedCopperDoor"] = "minecraft:waxed_copper_door";
  MinecraftItemTypes2["WaxedCopperGrate"] = "minecraft:waxed_copper_grate";
  MinecraftItemTypes2["WaxedCopperTrapdoor"] = "minecraft:waxed_copper_trapdoor";
  MinecraftItemTypes2["WaxedCutCopper"] = "minecraft:waxed_cut_copper";
  MinecraftItemTypes2["WaxedCutCopperSlab"] = "minecraft:waxed_cut_copper_slab";
  MinecraftItemTypes2["WaxedCutCopperStairs"] = "minecraft:waxed_cut_copper_stairs";
  MinecraftItemTypes2["WaxedExposedChiseledCopper"] = "minecraft:waxed_exposed_chiseled_copper";
  MinecraftItemTypes2["WaxedExposedCopper"] = "minecraft:waxed_exposed_copper";
  MinecraftItemTypes2["WaxedExposedCopperBulb"] = "minecraft:waxed_exposed_copper_bulb";
  MinecraftItemTypes2["WaxedExposedCopperDoor"] = "minecraft:waxed_exposed_copper_door";
  MinecraftItemTypes2["WaxedExposedCopperGrate"] = "minecraft:waxed_exposed_copper_grate";
  MinecraftItemTypes2["WaxedExposedCopperTrapdoor"] = "minecraft:waxed_exposed_copper_trapdoor";
  MinecraftItemTypes2["WaxedExposedCutCopper"] = "minecraft:waxed_exposed_cut_copper";
  MinecraftItemTypes2["WaxedExposedCutCopperSlab"] = "minecraft:waxed_exposed_cut_copper_slab";
  MinecraftItemTypes2["WaxedExposedCutCopperStairs"] = "minecraft:waxed_exposed_cut_copper_stairs";
  MinecraftItemTypes2["WaxedOxidizedChiseledCopper"] = "minecraft:waxed_oxidized_chiseled_copper";
  MinecraftItemTypes2["WaxedOxidizedCopper"] = "minecraft:waxed_oxidized_copper";
  MinecraftItemTypes2["WaxedOxidizedCopperBulb"] = "minecraft:waxed_oxidized_copper_bulb";
  MinecraftItemTypes2["WaxedOxidizedCopperDoor"] = "minecraft:waxed_oxidized_copper_door";
  MinecraftItemTypes2["WaxedOxidizedCopperGrate"] = "minecraft:waxed_oxidized_copper_grate";
  MinecraftItemTypes2["WaxedOxidizedCopperTrapdoor"] = "minecraft:waxed_oxidized_copper_trapdoor";
  MinecraftItemTypes2["WaxedOxidizedCutCopper"] = "minecraft:waxed_oxidized_cut_copper";
  MinecraftItemTypes2["WaxedOxidizedCutCopperSlab"] = "minecraft:waxed_oxidized_cut_copper_slab";
  MinecraftItemTypes2["WaxedOxidizedCutCopperStairs"] = "minecraft:waxed_oxidized_cut_copper_stairs";
  MinecraftItemTypes2["WaxedWeatheredChiseledCopper"] = "minecraft:waxed_weathered_chiseled_copper";
  MinecraftItemTypes2["WaxedWeatheredCopper"] = "minecraft:waxed_weathered_copper";
  MinecraftItemTypes2["WaxedWeatheredCopperBulb"] = "minecraft:waxed_weathered_copper_bulb";
  MinecraftItemTypes2["WaxedWeatheredCopperDoor"] = "minecraft:waxed_weathered_copper_door";
  MinecraftItemTypes2["WaxedWeatheredCopperGrate"] = "minecraft:waxed_weathered_copper_grate";
  MinecraftItemTypes2["WaxedWeatheredCopperTrapdoor"] = "minecraft:waxed_weathered_copper_trapdoor";
  MinecraftItemTypes2["WaxedWeatheredCutCopper"] = "minecraft:waxed_weathered_cut_copper";
  MinecraftItemTypes2["WaxedWeatheredCutCopperSlab"] = "minecraft:waxed_weathered_cut_copper_slab";
  MinecraftItemTypes2["WaxedWeatheredCutCopperStairs"] = "minecraft:waxed_weathered_cut_copper_stairs";
  MinecraftItemTypes2["WayfinderArmorTrimSmithingTemplate"] = "minecraft:wayfinder_armor_trim_smithing_template";
  MinecraftItemTypes2["WeatheredChiseledCopper"] = "minecraft:weathered_chiseled_copper";
  MinecraftItemTypes2["WeatheredCopper"] = "minecraft:weathered_copper";
  MinecraftItemTypes2["WeatheredCopperBulb"] = "minecraft:weathered_copper_bulb";
  MinecraftItemTypes2["WeatheredCopperDoor"] = "minecraft:weathered_copper_door";
  MinecraftItemTypes2["WeatheredCopperGrate"] = "minecraft:weathered_copper_grate";
  MinecraftItemTypes2["WeatheredCopperTrapdoor"] = "minecraft:weathered_copper_trapdoor";
  MinecraftItemTypes2["WeatheredCutCopper"] = "minecraft:weathered_cut_copper";
  MinecraftItemTypes2["WeatheredCutCopperSlab"] = "minecraft:weathered_cut_copper_slab";
  MinecraftItemTypes2["WeatheredCutCopperStairs"] = "minecraft:weathered_cut_copper_stairs";
  MinecraftItemTypes2["Web"] = "minecraft:web";
  MinecraftItemTypes2["WeepingVines"] = "minecraft:weeping_vines";
  MinecraftItemTypes2["Wheat"] = "minecraft:wheat";
  MinecraftItemTypes2["WheatSeeds"] = "minecraft:wheat_seeds";
  MinecraftItemTypes2["WhiteCandle"] = "minecraft:white_candle";
  MinecraftItemTypes2["WhiteCarpet"] = "minecraft:white_carpet";
  MinecraftItemTypes2["WhiteConcrete"] = "minecraft:white_concrete";
  MinecraftItemTypes2["WhiteConcretePowder"] = "minecraft:white_concrete_powder";
  MinecraftItemTypes2["WhiteDye"] = "minecraft:white_dye";
  MinecraftItemTypes2["WhiteGlazedTerracotta"] = "minecraft:white_glazed_terracotta";
  MinecraftItemTypes2["WhiteShulkerBox"] = "minecraft:white_shulker_box";
  MinecraftItemTypes2["WhiteStainedGlass"] = "minecraft:white_stained_glass";
  MinecraftItemTypes2["WhiteStainedGlassPane"] = "minecraft:white_stained_glass_pane";
  MinecraftItemTypes2["WhiteTerracotta"] = "minecraft:white_terracotta";
  MinecraftItemTypes2["WhiteTulip"] = "minecraft:white_tulip";
  MinecraftItemTypes2["WhiteWool"] = "minecraft:white_wool";
  MinecraftItemTypes2["WildArmorTrimSmithingTemplate"] = "minecraft:wild_armor_trim_smithing_template";
  MinecraftItemTypes2["WindCharge"] = "minecraft:wind_charge";
  MinecraftItemTypes2["WitchSpawnEgg"] = "minecraft:witch_spawn_egg";
  MinecraftItemTypes2["WitherRose"] = "minecraft:wither_rose";
  MinecraftItemTypes2["WitherSkeletonSpawnEgg"] = "minecraft:wither_skeleton_spawn_egg";
  MinecraftItemTypes2["WitherSpawnEgg"] = "minecraft:wither_spawn_egg";
  MinecraftItemTypes2["WolfArmor"] = "minecraft:wolf_armor";
  MinecraftItemTypes2["WolfSpawnEgg"] = "minecraft:wolf_spawn_egg";
  MinecraftItemTypes2["Wood"] = "minecraft:wood";
  MinecraftItemTypes2["WoodenAxe"] = "minecraft:wooden_axe";
  MinecraftItemTypes2["WoodenButton"] = "minecraft:wooden_button";
  MinecraftItemTypes2["WoodenDoor"] = "minecraft:wooden_door";
  MinecraftItemTypes2["WoodenHoe"] = "minecraft:wooden_hoe";
  MinecraftItemTypes2["WoodenPickaxe"] = "minecraft:wooden_pickaxe";
  MinecraftItemTypes2["WoodenPressurePlate"] = "minecraft:wooden_pressure_plate";
  MinecraftItemTypes2["WoodenShovel"] = "minecraft:wooden_shovel";
  MinecraftItemTypes2["WoodenSlab"] = "minecraft:wooden_slab";
  MinecraftItemTypes2["WoodenSword"] = "minecraft:wooden_sword";
  MinecraftItemTypes2["Wool"] = "minecraft:wool";
  MinecraftItemTypes2["WritableBook"] = "minecraft:writable_book";
  MinecraftItemTypes2["YellowCandle"] = "minecraft:yellow_candle";
  MinecraftItemTypes2["YellowCarpet"] = "minecraft:yellow_carpet";
  MinecraftItemTypes2["YellowConcrete"] = "minecraft:yellow_concrete";
  MinecraftItemTypes2["YellowConcretePowder"] = "minecraft:yellow_concrete_powder";
  MinecraftItemTypes2["YellowDye"] = "minecraft:yellow_dye";
  MinecraftItemTypes2["YellowFlower"] = "minecraft:yellow_flower";
  MinecraftItemTypes2["YellowGlazedTerracotta"] = "minecraft:yellow_glazed_terracotta";
  MinecraftItemTypes2["YellowShulkerBox"] = "minecraft:yellow_shulker_box";
  MinecraftItemTypes2["YellowStainedGlass"] = "minecraft:yellow_stained_glass";
  MinecraftItemTypes2["YellowStainedGlassPane"] = "minecraft:yellow_stained_glass_pane";
  MinecraftItemTypes2["YellowTerracotta"] = "minecraft:yellow_terracotta";
  MinecraftItemTypes2["YellowWool"] = "minecraft:yellow_wool";
  MinecraftItemTypes2["ZoglinSpawnEgg"] = "minecraft:zoglin_spawn_egg";
  MinecraftItemTypes2["ZombieHorseSpawnEgg"] = "minecraft:zombie_horse_spawn_egg";
  MinecraftItemTypes2["ZombiePigmanSpawnEgg"] = "minecraft:zombie_pigman_spawn_egg";
  MinecraftItemTypes2["ZombieSpawnEgg"] = "minecraft:zombie_spawn_egg";
  MinecraftItemTypes2["ZombieVillagerSpawnEgg"] = "minecraft:zombie_villager_spawn_egg";
  return MinecraftItemTypes2;
})(MinecraftItemTypes || {});

// scripts/stacker/stacker.ts
world45.afterEvents.entitySpawn.subscribe((e) => {
  const { entity, cause } = e;
  if (entity.getComponent(EntityComponentTypes11.Item) != void 0 || entity.typeId == MinecraftEntityTypes.Player || entity.typeId == MinecraftEntityTypes.XpOrb)
    return;
  let nearbyStacks = world45.getDimension(entity.dimension.id).getEntities({
    families: ["mob"],
    excludeTypes: [MinecraftEntityTypes.XpOrb, "item"],
    maxDistance: 20,
    type: entity.typeId,
    tags: ["stacked"],
    location: entity.location
  });
  if (nearbyStacks.length === 0) {
    entity.addTag("stacked");
    entity.setDynamicProperty("stackAmount", 1);
    entity.nameTag = `\xA78[\xA7b${titleCase(entity.typeId.replace("minecraft:", "").replace("alpha:", "").replaceAll("_", " "))}\xA78] \xA7f- \xA7a${entity.getDynamicProperty("stackAmount")}`;
  } else {
    entity.remove();
    nearbyStacks.sort((a, b) => {
      return b.getDynamicProperty("stackAmount") - a.getDynamicProperty("stackAmount");
    });
    nearbyStacks[0].setDynamicProperty("stackAmount", nearbyStacks[0].getDynamicProperty("stackAmount") + 1);
    nearbyStacks[0].nameTag = `\xA78[\xA7b${titleCase(nearbyStacks[0].typeId.replace("minecraft:", "").replace("alpha:", "").replaceAll("_", " "))}\xA78] \xA7f- \xA7ax${nearbyStacks[0].getDynamicProperty("stackAmount")}`;
  }
});
system22.runInterval(() => {
  let stackedEntities = world45.getDimension(MinecraftDimensionTypes7.overworld).getEntities({ excludeTypes: [MinecraftEntityTypes.Player, "item"], families: ["mob"], tags: ["stacked"] });
  stackedEntities.forEach((stack) => {
    let nearbyStacks = world45.getDimension(stack.dimension.id).getEntities({
      families: ["mob"],
      excludeTypes: [MinecraftEntityTypes.XpOrb, "item"],
      maxDistance: 15,
      tags: ["stacked"],
      type: stack.typeId,
      location: stack.location
    });
    if (nearbyStacks.length === 0)
      return;
    nearbyStacks.sort((a, b) => {
      return b.getDynamicProperty("stackAmount") - a.getDynamicProperty("stackAmount");
    });
    const totalAmount = nearbyStacks.map((entity) => {
      return entity.getDynamicProperty("stackAmount");
    }).reduce((a, b) => a + b, 0);
    nearbyStacks[0].setDynamicProperty("stackAmount", totalAmount);
    nearbyStacks[0].nameTag = `\xA78[\xA7b${titleCase(nearbyStacks[0].typeId.replace("minecraft:", "").replace("crab:", "").replaceAll("_", " "))}\xA78] \xA7f- \xA7ax${nearbyStacks[0].getDynamicProperty("stackAmount")}`;
    if (nearbyStacks.length == 1)
      return;
    for (let i = 1; i < nearbyStacks.length; i++) {
      nearbyStacks[i].remove();
    }
  });
  let stackedEntitiesNether = world45.getDimension(MinecraftDimensionTypes7.nether).getEntities({ excludeTypes: [MinecraftEntityTypes.Player, "item"], families: ["mob"], tags: ["stacked"] });
  stackedEntitiesNether.forEach((stack) => {
    let nearbyStacks = world45.getDimension(stack.dimension.id).getEntities({
      families: ["mob"],
      excludeTypes: [MinecraftEntityTypes.XpOrb, "item"],
      maxDistance: 15,
      tags: ["stacked"],
      type: stack.typeId,
      location: stack.location
    });
    if (nearbyStacks.length === 0)
      return;
    nearbyStacks.sort((a, b) => {
      return b.getDynamicProperty("stackAmount") - a.getDynamicProperty("stackAmount");
    });
    const totalAmount = nearbyStacks.map((entity) => {
      return entity.getDynamicProperty("stackAmount");
    }).reduce((a, b) => a + b, 0);
    nearbyStacks[0].setDynamicProperty("stackAmount", totalAmount);
    nearbyStacks[0].nameTag = `\xA78[\xA7b${titleCase(nearbyStacks[0].typeId.replace("minecraft:", "").replace("alpha:", "").replaceAll("_", " "))}\xA78] \xA7f- \xA7ax${nearbyStacks[0].getDynamicProperty("stackAmount")}`;
    if (nearbyStacks.length == 1)
      return;
    for (let i = 1; i < nearbyStacks.length; i++) {
      nearbyStacks[i].remove();
    }
  });
}, 40);
world45.afterEvents.entityDie.subscribe((e) => {
  const { deadEntity } = e;
  if (deadEntity.hasTag("stacked")) {
    const amount = deadEntity.getDynamicProperty("stackAmount");
    console.log(amount, typeof amount);
    if (amount === 1)
      return;
    let newEntity = deadEntity.dimension.spawnEntity(deadEntity.typeId, deadEntity.location, {
      initialRotation: deadEntity.getRotation().x
    });
    system22.runTimeout(() => {
      newEntity.setDynamicProperty("stackAmount", amount - 1);
      newEntity.addTag("stacked");
      if (newEntity.hasComponent(EntityComponentTypes11.IsBaby))
        newEntity.triggerEvent("minecraft:ageable_grow_up");
      console.log("2", amount, typeof amount);
      console.log("e24", newEntity.getDynamicProperty("stackAmount"));
      newEntity.nameTag = `\xA78[\xA7b${titleCase(newEntity.typeId.replace("minecraft:", "").replace("alpha:", "").replaceAll("_", " "))}\xA78] \xA7f- \xA7ax${newEntity.getDynamicProperty("stackAmount")}`;
    }, 1);
  }
});

// scripts/lagClear/lagManager.ts
import { EntityComponentTypes as EntityComponentTypes12, MinecraftDimensionTypes as MinecraftDimensionTypes8, system as system23, world as world46 } from "@minecraft/server";
system23.runInterval(() => {
  countdown(5);
}, 3e3);
function countdown(seconds) {
  world46.sendMessage(`\xA7aLag Clear In ${seconds}`);
  system23.runTimeout(() => {
    if (seconds > 0) {
      countdown(seconds - 1);
    } else {
      clearEntities();
      world46.sendMessage(`\xA7aLag has been cleared`);
    }
  }, 20);
}
function clearEntities() {
  const entities = world46.getDimension(MinecraftDimensionTypes8.overworld).getEntities({
    excludeTypes: [MinecraftEntityTypes.Villager, MinecraftEntityTypes.VillagerV2, "item"],
    families: ["mob"]
  });
  const items = world46.getDimension(MinecraftDimensionTypes8.overworld).getEntities({ type: "item" });
  const orbs = world46.getDimension(MinecraftDimensionTypes8.overworld).getEntities({ type: MinecraftEntityTypes.XpOrb });
  orbs.forEach((orb) => {
    orb.remove();
  });
  entities.forEach((ent) => {
    if (!ent.hasComponent(EntityComponentTypes12.Item)) {
      ent.remove();
    }
  });
  items.forEach((item) => {
    console.log("e", item.getComponent(EntityComponentTypes12.Item)?.itemStack.typeId);
    if (!item.getComponent(EntityComponentTypes12.Item)?.itemStack.typeId.includes("shulker")) {
      item.remove();
    }
  });
  const entitiesNether = world46.getDimension(MinecraftDimensionTypes8.nether).getEntities({
    excludeTypes: [MinecraftEntityTypes.Villager, MinecraftEntityTypes.VillagerV2, "item"],
    families: ["mob"]
  });
  const itemsNether = world46.getDimension(MinecraftDimensionTypes8.overworld).getEntities({ type: "item" });
  const orbsNether = world46.getDimension(MinecraftDimensionTypes8.overworld).getEntities({ type: MinecraftEntityTypes.XpOrb });
  orbsNether.forEach((orb) => {
    orb.remove();
  });
  entitiesNether.forEach((ent) => {
    if (!ent.hasComponent(EntityComponentTypes12.Item)) {
      ent.remove();
    }
  });
  itemsNether.forEach((item) => {
    console.log("e", item.getComponent(EntityComponentTypes12.Item)?.itemStack.typeId);
    if (!item.getComponent(EntityComponentTypes12.Item)?.itemStack.typeId.includes("shulker")) {
      item.remove();
    }
  });
}

// scripts/main.ts
var homesDB = new Database("homes");
var CRABENGINEGLOBALCONFIG = {
  SCORES: {
    avgClicks: "avgClicks",
    blocksBroken: "blocksBroken",
    blocksPlaced: "blocksPlaced",
    clanID: "clanID",
    clicks: "clicks",
    clog: "clog",
    deaths: "deaths",
    hours: "hours",
    joins: "joins",
    kills: "kills",
    minutes: "minutes",
    money: "money",
    seconds: "seconds",
    spam: "spam"
  },
  TAGS: {
    combat: "combat",
    discordKit: "discordKit",
    joined: "joined"
  }
};
export {
  CRABENGINEGLOBALCONFIG,
  homesDB
};
//! No Longer Exists
//! system.afterEvents.subscribe((data) => {
//!   const player = data.sender;
//!   const command = data.command;
//!   messageDB.set(player.id, { player: player.name, command, timestamp: Date.now() });
//! });

//# sourceMappingURL=../debug/main.js.map
