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
    .title("§eWelcome to §5Nexus§fSMP!")
    .body(
      `§bWelcome! This server is owned by §6Ozorical, Adem, Christian and Inset, §gand developed by §6Chickenman, BendieGames, Adem, and Ozorical.\n\n` +
        `§gMake sure to join our discord:\n` +
        `§9discord.gg/nexussmp\n\n` +
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
      "§cIP: §fplay.nexussmp.xyz\n" +
      "§bPort: §f19132\n" +
      " §fdiscord.gg/nexussmp\n "
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
    .title("§5Nexus§fSMP §8- §eFinally...")
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
      player.sendMessage("§5- discord.gg/nexussmp: §uNexusSMP Discord Server");
      player.sendMessage("§5- Join for the free §uDiscord Kit!");
      player.sendMessage("§5- Owners: §uOzorical, Christian, and Adem");
      player.sendMessage("§5- Developers: §uChickenman, BendieGames, and Nebby");
      player.sendMessage("§5- Crab-Engine: §uV5");
      player.addTag("joined");
      player.dimension.spawnEntity("minecraft:fireworks_rocket", player.location);
    } else if (result.selection === 1) {
      player.runCommand(`kick "${player.name}" §cYou need to accept all ToS agreements to play NexusSMP.`);
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