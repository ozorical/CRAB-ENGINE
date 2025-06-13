import { ChatSendBeforeEvent, system, Player, Entity } from "@minecraft/server";
import { tpaMenu, nameToClass, denyTPARequest, sendTPARequest, showTPARequests, acceptTPARequest, cancelTPARequest } from "./commands/tpa";
import { moneyTransfer } from "./commands/moneyTransfer";
import { warpCommand } from "./commands/warp";
import { startWildTeleport } from "../helperFunctions/randomTP";
import { marketplaceSelect } from "../guiPages/marketSelectPage";
import { discordKitForm } from "../guiPages/discordKit";
import { clanMenu } from "../clans/clanSetup";
import { bountyMenu } from "../bounties/bounty";
import { reportMenu } from "../reportSystem/reportMenu";
import { world } from "@minecraft/server";
import { warpTeleport, warpMenu } from "../guiPages/warps";
import { customMenu } from "../guiPages/playerCustom";

//completely rewrote from JS to TS - nebby.dev
const commandRegistry: Record<string, Command> = {};

class Command {
  name: string = "";
  description: string = "";
  aliases: string[] = [];
  staff: boolean = false;
  pvp: boolean = false;
  examples: string[] = [];
  info: string = "";
  action: (player: Player, input: string[]) => void = () => {};

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setAlias(aliases: string[]): this {
    this.aliases = aliases;
    return this;
  }

  setStaff(staff: boolean): this {
    this.staff = staff;
    return this;
  }

  setPvp(pvp: boolean): this {
    this.pvp = pvp;
    return this;
  }

  setAction(action: (player: Player, input: string[]) => void): this {
    this.action = action;
    return this;
  }

  setExamples(examples: string[]): this {
    this.examples = examples;
    return this;
  }

  setDetailedInfo(info: string): this {
    this.info = info;
    return this;
  }

  register(): void {
    if (!this.name) {
      throw new Error("Command must have a name before registering.");
    }
    commandRegistry[this.name.toLowerCase()] = this;
    this.aliases.forEach((alias) => {
      commandRegistry[alias.toLowerCase()] = this;
    });
  }
}

function displayHelp(player: Player, commandName = "", page = 1) {
  const commandsPerPage = 10;
  const allCommands = Object.values(commandRegistry).filter((cmd, index, self) => self.indexOf(cmd) === index);
  const availableCommands = allCommands.filter((cmd) => player.hasTag(`staffstatus`) || !cmd.staff);
  const totalPages = Math.ceil(availableCommands.length / commandsPerPage);

  if (commandName) {
    const command = availableCommands.find((cmd) => cmd.name === commandName || cmd.aliases.includes(commandName));
    if (command) {
      let message = `§r§c----- ${command.name.toUpperCase()} §eCOMMAND DETAILS §c-----\n`;
      message += `§r§c-${command.name} §c${command.aliases.length ? `(${command.aliases.join(", ")})` : ""}: §r§c${command.description}\n`;
      if (command.examples) message += `§r§cExamples: §r§c${command.examples.join(", ")}\n`;
      if (command.info) message += `§r§cDetails: §r§c${command.info}\n`;
      message += `§r§cUse -help to return to the help menu.`;
      player.sendMessage(message);
      return;
    } else return player.sendMessage(`§cUnknown command: ${commandName}. Use -help for a list of commands.`);
  }

  if (page < 1 || page > totalPages) return player.sendMessage(`§cInvalid page number. There are ${totalPages} pages.`);

  let message = `\n§r§8----- §r§cHELP (Page §r§c${page}§r§c/§c${totalPages}§c) §r§8-----§r\n`;
  const commandsOnPage = availableCommands.slice((page - 1) * commandsPerPage, page * commandsPerPage);
  commandsOnPage.forEach((command) => {
    message += `§r§c-${command.name}: §r§7${command.description}\n`;
  });
  message += `\n§r§eUse -help <page> to navigate.`;

  player.sendMessage(message);
}

world.beforeEvents.chatSend.subscribe((evd) => {
  if (evd.message.startsWith(`-`)) {
    evd.cancel = true;
    system.run(() => chatSendAfterEvent(evd));
  }
});
function chatSendAfterEvent(evd: any) {
  const player = evd.sender;
  if (evd.message.startsWith(`-`)) {
    const inputs = evd.message.split(/\s+/);
    commandHandler(player, inputs.shift()?.slice(`-`.length), inputs);
    return;
  }
}

// never gon use this system, and it fucks up crates so
//system.afterEvents.scriptEventReceive.subscribe((event) => {
//  const { id, message, sourceEntity } = event;
//  if (id.toLowerCase() == `crab:`) return
//  const commandName = id.toLowerCase().replace(/^cmd:/, '');
//  commandHandler(sourceEntity, commandName, message ? message.split(' ') : []);
//});

export function commandHandler(player: any, commandName: string, input: string[] = []) {
  const firstArg: string = input[0] ? input[0].toLowerCase() : "";
  if (commandName === "help") {
    const page = parseInt(firstArg, 10);
    if (!isNaN(page) && page > 0) displayHelp(player, "", page);
    else displayHelp(player, firstArg || "", 1);
    return;
  }

  const command = commandRegistry[commandName];

  if (command) {
    if (command.pvp && player.hasTag("combat")) return player.sendMessage("You cannot use this command while in combat!");
    if (command.staff && !player.hasTag(`staffstatus`)) return player.sendMessage(`§cUnknown command: ${commandName}. Use -help for a list of commands.`);
    try {
      command.action(player, input);
    } catch (e) {
      console.log(e);
    }
  } else player.sendMessage(`§cUnknown command: ${commandName}. Use -help for a list of commands.`);
}
new Command() // settings cmd
  .setName("settings")
  .setDescription("Opens the clan UI.")
  .setAlias(["setting", "setings", `seting`])
  .setPvp(false)
  .setAction((player) => {
    player.sendMessage("§aClose chat to open the Settings UI!");
    customMenu(player);
  });
new Command() // transfer cmd
  .setName("transfer")
  .setDescription("Opens the Money Transfer UI.")
  .setAlias(["money"])
  .setPvp(false)
  .setAction((player) => {
    player.sendMessage("§aClose chat to open the Report UI!");
    moneyTransfer(player, true, 5);
  })
  .register();
new Command() // report cmd
  .setName("report")
  .setDescription("Opens the Report UI.")
  .setAlias(["rep"])
  .setPvp(false)
  .setAction((player) => {
    player.sendMessage("§aClose chat to open the Report UI!");
    reportMenu(player, true, 5);
  })
  .register();
new Command() // clan cmd
  .setName("clan")
  .setDescription("Opens the clan UI.")
  .setAlias(["clan", "gang", `team`])
  .setPvp(false)
  .setAction((player) => {
    player.sendMessage("§aClose chat to open the clan UI!");
    clanMenu(player, true, 5);
  })
  .register();
new Command() // bounty cmd
  .setName("bounty")
  .setDescription("Opens the Bounty UI.")
  .setAlias(["bounty", "bout"])
  .setPvp(false)
  .setAction((player) => {
    player.sendMessage("§aClose chat to open the Bounty UI!");
    bountyMenu(player, true, 5);
  })
  .register();
new Command() // discord cmd
  .setName("discord")
  .setDescription("Opens the discord UI.")
  .setAlias(["disc", "disco"])
  .setPvp(false)
  .setAction((player) => {
    player.sendMessage("§aClose chat to open the discord UI!");
    discordKitForm(player, true, 5);
  })
  .register();
new Command() // marketplace cmd
  .setName("marketplace")
  .setDescription("Opens the Marketplace.")
  .setAlias(["market", "shop"])
  .setPvp(false)
  .setAction((player) => {
    player.sendMessage("§aClose chat to open the Marketplace UI!");
    marketplaceSelect(player, true, 5);
  })
  .register();
new Command() // wild / rtp cmd
  .setName("rtp")
  .setDescription("Warps you to a random location.")
  .setAlias([`rtp`, `wild`])
  .setPvp(true)
  .setAction((player, input) => {
    warpTeleport(player, 2);
  })
  .register();

new Command()
  .setName("tpa <player?>")
  .setDescription("Sends a TPA request to a player, or opens the TPA UI.")
  .setAlias(["tpa", "tpgui"])
  .setPvp(true)
  .setAction((player, input) => {
    if (input.length == 0) {
      system.run(() => {
        player.sendMessage(`§aClose Chat to open the TPA Menu!`);
        tpaMenu(player);
      });
    } else {
      if (!nameToClass(input[0])) return player.sendMessage(`§cNo players found with the name "${input[0]}"`);
      sendTPARequest(player, nameToClass(input[0]));
    }
  })
  .register();

new Command()
  .setName("accept <player>")
  .setDescription("Accepts a ongoing TPA request.")
  .setAlias(["accept", "tpaccept"])
  .setPvp(true)
  .setAction((player, input) => {
    if (input.length == 0) {
      system.run(() => {
        player.sendMessage(`§cYou need to input a valid name!`);
      });
    } else {
      if (!nameToClass(input[0])) return player.sendMessage(`§cNo players found with the name "${input[0]}"`);
      acceptTPARequest(player, nameToClass(input[0]));
    }
  })
  .register();

new Command()
  .setName("deny <player>")
  .setDescription("Denys a TPA request.")
  .setAlias(["deny", "tpdeny"])
  .setPvp(true)
  .setAction((player, input) => {
    if (input.length == 0) {
      system.run(() => {
        player.sendMessage(`§cYou need to input a valid name!`);
      });
    } else {
      if (!nameToClass(input[0])) return player.sendMessage(`§cNo players found with the name "${input[0]}"`);
      denyTPARequest(player, nameToClass(input[0]));
    }
  })
  .register();

new Command()
  .setName("cancel")
  .setDescription("Cancels your ongoing TPA request.")
  .setAlias(["cancel", "tpcancel"])
  .setPvp(true)
  .setAction((player, input) => {
    cancelTPARequest(player);
  })
  .register();

new Command() // warp cmd
  .setName("warp <location?>")
  .setDescription("Warps you to the select location (Spawn, Wild, Discord, Freeplay, Nether, & End)")
  .setAlias(["tp", "w", `warp`])
  .setPvp(true)
  .setAction((player, input) => {
    if (input.length == 0) {
      system.run(() => {
        player.sendMessage(`§aClose Chat to open the Warp Menu!`);
        warpMenu(player, true);
      });
    } else {
      system.run(() => {
        switch (input[0].toLowerCase()) {
          case "spawn":
            warpTeleport(player, 0);
            break;
          case "wild":
            warpTeleport(player, 2);
            break;
          case "discord":
            warpTeleport(player, 5);
            break;
          case "nether":
            warpTeleport(player, 3);
            break;
          case "end":
            warpTeleport(player, 4);
            break;
          case "freeplay":
            warpTeleport(player, 1);
            break;
          default:
            player.sendMessage("§cUnknown Warp Location");
            break;
        }
      });
    }
  })
  .register();
