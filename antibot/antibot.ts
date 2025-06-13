import { world, system, Player, PlayerSpawnAfterEvent, ChatSendBeforeEvent } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";

function isValidText(text: string): boolean {
    const validTextRegex = /^[a-zA-Z0-9_\-\.\s!@#$%^&*()+=,.:;'"<>?\/\[\]{}|~` ]{1,100}$/;
    const suspiciousUnicodeRegex = /[^\x00-\x7F]/;
    const asciiArtPattern = /[█▄▀▌▐▓▒░◊○●]|.{3,}\n.{3,}/;
    
    return validTextRegex.test(text) && 
           !suspiciousUnicodeRegex.test(text) && 
           !asciiArtPattern.test(text);
}

function containsIllegalFormatting(name: string): boolean {
    if (name === "§l§4Requiem Pack Downloader") return false;
    if (name === "Un1queShield") return false;
    const formattingPattern = /§[^a-fk-or0-9]|§§+/i;
    return formattingPattern.test(name);
}

function isNameSpoofing(name: string): boolean {
    const spoofingPatterns = [
        /§"[\w\s]+/,
        /§'[\w\s]+/,  
        /§\s*[\w\s]+/, 
        /§[^a-zA-Z0-9]/,
        /§§+/,
        /^§[^l§4]|§$/,
        /§[^ ]+ /,
        / §/
    ];
    return spoofingPatterns.some(pattern => pattern.test(name));
}

export function botCheck(ev: PlayerSpawnAfterEvent) {
    if (!ev.initialSpawn) return;

    system.run(() => {
        const player = ev.player;

        if (player.hasTag("realmbot") || player.hasTag("staffstatus")) return;
        if (player.name === "§l§4Requiem Pack Downloader") return;

        if (containsIllegalFormatting(player.name) || isNameSpoofing(player.name)) {
            console.warn(`Blocked player ${player.name} for illegal formatting`);
            player.runCommand(`kick "${player.name}"`);
            return;
        }

        const renderDistance = player.clientSystemInfo.maxRenderDistance;
        if (
            renderDistance === 0 || 
            renderDistance === null ||
            renderDistance < 2 ||
            ev.player.graphicsMode === undefined ||
            !isValidText(player.name)
        ) {
            console.warn(`Blocked player ${player.name} for client anomalies`);
            player.runCommand(`kick "${player.name}"`);
            player.remove();
            return;
        }

        const numericSuffixRegex = /\(\d+\)$/;
        if (numericSuffixRegex.test(player.name)) {
            console.warn(`Blocked player ${player.name} for numeric suffix`);
            player.runCommand(`kick "${player.name}"`);
            return;
        }

        const players = world.getPlayers();
        const duplicatePlayer = players.find(p => 
            p.name.toLowerCase() === player.name.toLowerCase() && 
            p.id !== player.id
        );

        if (duplicatePlayer) {
            console.warn(`Blocked player ${player.name} for duplicate name`);
            player.runCommand(`kick "${player.name}"`);
            return;
        }
    });
}
export function chatLength(ev: ChatSendBeforeEvent) {
    system.run(() => {
        const sender = ev.sender;
        if (sender.hasTag("staffstatus")) return;
        
        if (ev.message.length > 200) {
            console.warn(`Blocked ${sender.name} for long message`);
            sender.runCommand(`kick "${sender.name}" §cMessage too long (max 200 characters)`);
            ev.cancel = true;
        }
        else if (!isValidText(ev.message)) {
            console.warn(`Blocked ${sender.name} for invalid message`);
            ev.cancel = true;
        }
    });
}

export function handleWatchdogTerminate() {
    system.beforeEvents.watchdogTerminate.subscribe((data) => {
        data.cancel = true;
        console.warn("Watchdog termination was prevented");
        world.getDimension(MinecraftDimensionTypes.Overworld)
            .runCommand(`/tellraw @a[tag=staffstatus] {"rawtext":[{"text":"§eWatchdog has been disabled by Crab-Engine."}]}`);
    });
}

handleWatchdogTerminate();

world.beforeEvents.chatSend.subscribe(chatLength);