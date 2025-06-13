import { world, system, Player, ChatSendBeforeEvent } from "@minecraft/server";
import { getClan } from "../clans/clanFunctions/getClan";
import { clanData } from "../types";
import { MuteDB } from "../adminGUI/AdminGui";
import { getScore, removeScore, setScore } from "../helperFunctions/getScore";
import { CRABSCORES } from "../enums";
import { playSoundTo } from "../helperFunctions/sounds";

const STAFF_HIERARCHY: string[] = [
  "member",
  "helper",
  "staff",
  "admin",
  "dev",
  "owner",
];

function updatePlayerRank(player: Player) {
  const tags = player.getTags();
  let highestRank: string | null = null;

  for (const tag of tags) {
    if (tag.startsWith("rank:")) {
      const rank = tag.replace("rank:", "");
      if (STAFF_HIERARCHY.includes(rank)) {
        if (!highestRank || STAFF_HIERARCHY.indexOf(rank) > STAFF_HIERARCHY.indexOf(highestRank)) {
          highestRank = rank;
        }
      }
    }
  }

  if (highestRank) {
    const highestRankIndex = STAFF_HIERARCHY.indexOf(highestRank);
    for (const tag of tags) {
      if (tag.startsWith("rank:")) {
        const rank = tag.replace("rank:", "");
        if (STAFF_HIERARCHY.includes(rank) && STAFF_HIERARCHY.indexOf(rank) < highestRankIndex) {
          player.removeTag(tag);
        }
      }
    }
  }
}

function assignRank(player: Player, newRank: string) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("rank:")) {
      player.removeTag(tag);
    }
  }

  player.addTag(`rank:${newRank}`);
  updatePlayerRank(player);
}

export function chatSpamCooldown(player: Player) {
  if (getScore(player, CRABSCORES.spam)! > 0) {
    removeScore(player, CRABSCORES.spam, 1);
  }
}

export function handlePlayerChat(chat: ChatSendBeforeEvent) {
  let player = chat.sender;
  let muted = MuteDB.get(player.name);

  if (chat.message.includes("* External") || chat.message.includes("* external") || chat.message.includes("tsl") || chat.message.includes("NUKED")) {
    chat.cancel = true;
    try {
      player.runCommand(`kick ${player.name} §cSuspected Bot Detected.`);
      player.sendMessage(`§cSuspected Bot Detected.`);
    } catch {
      console.warn("Crab-Engine mitigated a potential external bot.");
    }
    return;
  }

  if (player.hasTag("staffstatus") && chat.message === ".clearlag") {
    
    chat.cancel = true;
    return;
  }

  if (!player.hasTag("staffstatus") && !player.hasTag("realmbot")) {
    system.run(() => {
      if (getScore(player, CRABSCORES.spam)! == 0) {
        setScore(player, CRABSCORES.spam, 5);
      }
    });

    if (getScore(player, CRABSCORES.spam) != 0) {
      player.sendMessage("§cYou Can Only Send A Message Every 5 Seconds");
      chat.cancel = true;
      return;
    }
  }

  if (muted != undefined) {
    if (muted.endTime < Date.now()) {
      MuteDB.delete(player.name);
      player.sendMessage("§aYour mute has been lifted.");
    } else {
      player.sendMessage(`§cYou cannot talk - You are muted.`);
      chat.cancel = true;
      return;
    }
  }

  let clan: Array<clanData> = getClan(chat.sender)!;
  let clanText = "";
  chat.cancel = true;

  if (clan) {
    clanText = `§8[${clan[0].clanName}§r§8] §7│§r  `;
  }

  system.run(() => {
    for (const realmbot of world.getPlayers({ tags: ["realmbot"] })) {
      realmbot.sendMessage(`<${player.name}> ${chat.message}`);
      playSoundTo(realmbot, "BubblePop");
    }

    for (const notrealmbot of world.getPlayers({ excludeTags: ["realmbot", "nochat"] })) {
      notrealmbot.sendMessage(`${clanText}${getChatRanks(player)}§8 §7<${player.name}> §f${chat.message}`);
      playSoundTo(notrealmbot, "BubblePop");
    }

    for (const chatmuted of world.getPlayers({ tags: ["nochat"] })) {
      player.sendMessage(`§cYou have chat muted!`);
      chat.cancel = true;
    }
  });
}

function getChatRanks(player: Player) {
  let tags = player.getTags();
  let rankList: Array<string> = [];
  let donatorRank: string | null = null;

  for (let tag of tags) {
    if (tag.includes("rank:")) {
      let rank = tag.replace("rank:", "");

      switch (rank) {
        case "member":
          rankList.push("§8[§aMember§8]");
          break;
        case "helper":
          rankList.push("§8[§pHelper§8]");
          break;
        case "staff":
          rankList.push("§8[§5Staff§8]");
          break;
        case "admin":
          rankList.push("§8[§cAdmin§8]");
          break;
        case "dev":
          rankList.push("§8[§bDeveloper§8]");
          break;
        case "ceo":
          rankList.push("§8[§gOwner§8]");
          break;
      }
    }
  }

  for (let tag of tags) {
    if (tag.includes("rank:")) {
      let rank = tag.replace("rank:", "");

      switch (rank) {
        case "donator":
          rankList.push("§8[§dDonator§8]");
          break;
        case "donatorplus":
          rankList.push("§8[§dDonator§f+§8]");
          break;
      }
    }
  }

  return rankList.join(" ");
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    updatePlayerRank(player);
  }
}, 50);

export function playParticleEffects(player: Player) {
  let tags = player.getTags();
  for (let i = 0; i <= tags.length; i++) {
    try {
      if (tags[i].includes("rank:")) {
        let rank = tags[i].replace("rank:", "");

        switch (rank) {
          case "donator":
            player.spawnParticle("combocurve", player.location);
            playSoundTo(player, "Chime");
            break;

          case "donatorplus":
            player.spawnParticle("combocurve", player.location);
            playSoundTo(player, "Chime");
            break;
        }
      }
    } catch {
      let rank = "";
      return rank;
    }
  }
}