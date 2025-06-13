import { Player, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { addScore, getScore } from "./getScore";

export function thisPlayerIsAFirstTimeJoiner(player: Player) {
  if (player.hasTag("joined")) {
    return;
  }

  player.addTag("rank:member");
  addScore(player, "money", 100);
  addScore(player, "clanID", 0);
  player.setDynamicProperty("claimtime", Date.now());

  const statsToInitialize = ["kills", "deaths", "blocksBroken", "blocksPlaced", "afk", "xp", "level"];

  statsToInitialize.forEach((stat) => {
    addScore(player, stat, 0);
  });

  showWelcomeUI(player);
}

function showWelcomeUI(player: Player) {
  const welcomeForm = new ActionFormData()
    .title("§eWelcome to §cCrab§fSMP!")
    .body(
      `§gWelcome! This server is owned by §6Ozorical, Christian and Inset, §gand developed by §6Chickenman & Ozorical.\n\n` +
        `§gMake sure to join our discord:\n` +
        `§cdiscord.gg/crabsmp\n\n` +
        `§fUse the §cCompass GUI §fto see all commands and features\n` +
        `§fType §e-help §fin the chat for a list of utility commands.\n `
    )
    .button("§aNext", "textures/ui/check.png");

  welcomeForm.show(player as any).then((response) => {
    if (response.canceled) {
      return showWelcomeUI(player);
    }
    if (response.selection === 0) {
      showConnectionInfoUI(player); // Changed to show new form first
    }
  });
}

function showConnectionInfoUI(player: Player) {
  const connectionForm = new ActionFormData()
    .title("§6WARNING")
    .body(
      "§fIf you joined through an §eInvite, §fWe recommend you join the §9Discord §for note down the §cIP and Port §fso you don't lose access to §bour server!\n\n" +
      "§cIP: §f51.81.83.79\n" +
      "§bPort: §f19132\n" +
      " §fdiscord.gg/crabsmp\n "
    )
    .button("§aNext", "textures/ui/check.png");

  connectionForm.show(player as any).then((response) => {
    if (response.canceled) {
      return showConnectionInfoUI(player);
    }
    if (response.selection === 0) {
      showRulesUI(player);
    }
  });
}

function showRulesUI(player: Player) {
  const rulesForm = new ActionFormData()
    .title("§cCrab§fSMP §8- §eFinally...")
    .body(
      "§r§fLocated in the §cStarter Kit, §fYou will find a rules book. By playing our §rserver, §fYou §aAutomatically agree §fto the rules, and our TOS.\n\n" +
        "§6Warning: §fWe recommend you §cturn off §dPaper doll §fin your §7settings §a(Press pause -> Settings -> Video -> Hide paper doll) §ffor the best §6UI experience.\n\n" +
        "§eHave Fun!"
    )
    .button("§aAccept and close", "textures/ui/check.png")
    .button("§4Deny ToS", "textures/blocks/barrier");

  rulesForm.show(player as any).then((result) => {
    if (result.canceled) {
      return showRulesUI(player);
    }

    if (result.selection === 0) {
      player.playSound("random.toast");
      player.sendMessage("§e- discord.gg/dmcE6B7sRX: §gCrabSMP Discord Server");
      player.sendMessage("§e- Join for the free §gDiscord Kit!");
      player.sendMessage("§e- Owners: §gOzorical and Christian");
      player.sendMessage("§e- Developers: §gChickenman, Nebby");
      player.sendMessage("§e- Crab-Engine: §gV4");
      player.addTag("joined");
      player.runCommand("summon fireworks_rocket ~ ~ ~");
    } else if (result.selection === 1) {
      player.runCommand(`kick "${player.name}" §cYou need to accept all ToS agreements to play CrabSMP.`);
    }
  });
}

export function setScoresForNewPlayers() {
  const scoreValues = {
    money: 100,
    clanID: 0,
    kills: 0,
    deaths: 0,
    blocksBroken: 0,
    blocksPlaced: 0,
  };
}