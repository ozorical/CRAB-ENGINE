"use strict";
import { system, world, Player } from "@minecraft/server";

/**
 * Sends a simple message to the NexusEngine bot
 * @param packet - The message to send
 * @example
 * relay("Hello from Minecraft server!");
 */
export function relay(packet: string): void {
    system.run(() => {
        const bot: Player | undefined = world.getAllPlayers().find(p => p.name === "NexusEngine");
        if (bot) {
            bot.sendMessage(packet);
        }
    });
}

/**
 * Sends an advanced message with Discord embed formatting to the NexusEngine bot
 * @param channelID - The Discord channel ID to send this relay to
 * @param message - The embed description
 * @param title - The embed title (optional)
 * @param color - The embed color (hex color code without # prefix) (optional)
 * @param thumbnail - The embed thumbnail (must be a valid URL) (optional)
 * @example
 * advancedRelay("123456789012345678", "Server has started successfully!");
 */
export function advancedRelay(
    channelID: string,
    message: string,
    title: string = "",
    color: string = "0xFFFFFF",
    thumbnail: string | null = null
): void {
    system.run(() => {
        const bot: Player | undefined = world.getAllPlayers().find(p => p.name === "NexusEngine");
        if (bot) {
            let relayMessage = `[Relay] "${channelID}" "${message}"`;

            if (title || color !== "0xFFFFFF" || thumbnail) {
                relayMessage += ` "${title}"`;
                if (color !== "0xFFFFFF" || thumbnail) {
                    relayMessage += ` "${color}"`;
                    if (thumbnail) {
                        relayMessage += ` "${thumbnail}"`;
                    }
                }
            }

            bot.sendMessage(relayMessage);
        }
    });
}
