import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

export function rulesPage(player: Player) {
  let infoMenu = new ActionFormData()
    .title("§cCrab§fSMP §8- §eRules")
    .body(
      "§l§6Main Realm Rules§r\n\n§l§e1. Be respectful at all times:§r\n§7Please treat staff and realm members with respect.§r\n\n§l§e2. No Hatespeech:§r\n§7Keep it clean! Respect others and don’t put each other down.§r\n\n§l§e3. No Griefing:§r\n§7Please don’t grief areas that are not meant to be griefed.§r\n\n§l§e4. No Hacking:§r\n§7The use of 3rd party exploits to gain an unfair advantage is strictly prohibited.§r\n\n§l§e5. No AFKing:§r\n§7Hogging player slots is not allowed. You will be kicked if caught AFKing.§r\n\n§l§e6. No Duping / Exploiting Glitches:§r\n§7Please do not exploit glitches or bugs for personal gain.§r\n\n§l§e7. No Racism:§r\n§7Treat all players with respect, regardless of their background.§r\n\n§l§e8. No Spamming:§r\n§7Do not attempt to bypass the spam filter.§r\n\n§l§e9. Privacy:§r\n§7Do not share personal information with strangers.§r\n\n§l§e10. Money and Trading:§r\n§7Trading in-game items for real-life money is against our rules and will result in a permanent ban.§r\n\n§l§e11. Follow the MCBE-EULA:§r\n§7All players must follow the Minecraft Bedrock Edition EULA to ensure a safe, fair environment.§r\n\n§l§e12. No C-Logging:§r\n§7Logging out during combat will result in a 3-day ban.§r\n\n\n§l§6Discord Vault Rules§r\n§7• Only one person is allowed inside the vault at a time, otherwise, the kit will not function properly.\n§7• Do not share the code with anyone outside the Discord.§r\n\n\n§l§6KOTH Rules§r\n§7• No teaming allowed.\n§7• No C-Logging allowed.§r\n\n§l§eMost of all, have fun!§r\n\n§7Follow the rules and you’re guaranteed a great experience on CrabSMP. Be smart, and don’t try to find loopholes!§r\n\n§l§cSCROLL UP TO VIEW ALL RULES§r"
    )
    .button("§fClose Menu\n§8[ §cExit the GUI §8]", "textures/blocks/barrier")
    .show(player as any);
}
