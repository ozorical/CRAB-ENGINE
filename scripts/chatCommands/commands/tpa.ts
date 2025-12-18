import { Player, PlayerLeaveBeforeEvent, system, world } from "@minecraft/server";
import { ActionFormData, FormCancelationReason, ModalFormData } from "@minecraft/server-ui";

const TP_REQUESTS_KEY = "tpRequests";
const TP_COOLDOWNS_KEY = "tpCooldowns";

function getDynamicProperty<T>(key: string): T {
  const value = world.getDynamicProperty(key);
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error(`Failed to parse dynamic property ${key}:`, e);
    }
  }
  return {} as T;
}

function setDynamicProperty(key: string, value: any): void {
  world.setDynamicProperty(key, JSON.stringify(value));
}

export function nameToClass(playerName: string): Player | undefined {
  if (!playerName) return undefined;

  for (const player of world.getAllPlayers()) {
    if (player.name.toLowerCase() === playerName.toLowerCase()) {
      return player;
    }
  }
  return undefined;
}

export function sendTPARequest(player: Player, target: Player | undefined) {
  if (!target) return player.sendMessage(`§cPlayer not found.`);

  const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
  const tpCooldowns = getDynamicProperty<Record<string, number>>(TP_COOLDOWNS_KEY);

  if (tpRequests[player.name]) return player.sendMessage(`§cYou already have an outgoing teleport request.`);
  if (tpCooldowns[player.name] > Date.now()) return player.sendMessage(`§cYou are on cooldown.`);
  if (target.name === player.name) return player.sendMessage(`§cYou cannot teleport to yourself.`);

  tpRequests[player.name] = { target: target.name, time: Date.now() };
  tpCooldowns[player.name] = Date.now() + 3 * 20;

  setDynamicProperty(TP_REQUESTS_KEY, tpRequests);
  setDynamicProperty(TP_COOLDOWNS_KEY, tpCooldowns);

  target.sendMessage(`§a${player.name} has requested to teleport to you. Use -accept <name> or -deny <name>.`);
  player.sendMessage(`§aTeleport request sent to ${target.name}.`);

  system.runTimeout(() => {
    const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
    if (tpRequests[player.name]) {
      delete tpRequests[player.name];
      setDynamicProperty(TP_REQUESTS_KEY, tpRequests);
      player.sendMessage(`§eYour teleport request to ${target.name} has expired.`);
      target.sendMessage(`§eThe teleport request from ${player.name} has expired.`);
    }
  }, 60 * 40);
}

export function acceptTPARequest(player: Player, target: Player | undefined) {
  const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
  const request = target
    ? Object.entries(tpRequests).find(([_, data]) => data.target.toLowerCase() === player.name.toLowerCase() && (data.target.toLowerCase() === target.name.toLowerCase() || _.toLowerCase() === target.name.toLowerCase()))
    : Object.entries(tpRequests)
        .reverse()
        .find(([_, data]) => data.target.toLowerCase() === player.name.toLowerCase());

  if (!request) return player.sendMessage(`§cNo valid incoming teleport requests.`);

  const [requesterName] = request;
  const requester = nameToClass(requesterName);
  if (!requester) {
    player.sendMessage(`§cThe requester is no longer online.`);
    delete tpRequests[requesterName];
    setDynamicProperty(TP_REQUESTS_KEY, tpRequests);
    return;
  }

  let teleportCanceled = false;

  player.sendMessage(`§aTeleporting ${requester.name} to you in 3 seconds.`);
  requester.sendMessage(`§aTeleporting to ${player.name} in 3 seconds.`);
  let checks = 3;

  const initialLocation = { ...player.location };
  const timer = system.runInterval(() => {
    if (teleportCanceled) {
      player.sendMessage(`§cTeleport canceled.`);
      system.clearRun(timer);
      return;
    }
    if (checks > 0) {
      requester.sendMessage(`§aTeleporting in ${checks} seconds...`);
      player.sendMessage(`§aTeleporting "${requester.name}" in ${checks} seconds...`);
      checks = checks - 1;
    } else {
      system.clearRun(timer);
    }
  }, 20);

  const warmUpTask = system.runTimeout(() => {
    if (teleportCanceled) return;
    try {
      requester.teleport(player.location, { dimension: player.dimension });
      delete tpRequests[requesterName];
      setDynamicProperty(TP_REQUESTS_KEY, tpRequests);
      player.sendMessage(`§a${requester.name} has been teleported to you.`);
      requester.sendMessage(`§aYou have been teleported to ${player.name}.`);
    } catch (error) {
      console.error("Error during teleportation:", error);
    } finally {
      teleportCanceled = true;
    }
  }, Number(3 + 1) * 20);

  const movementCheckTask = system.runInterval(() => {
    if (teleportCanceled) {
      system.clearRun(warmUpTask);
      system.clearRun(timer);
      system.clearRun(movementCheckTask);
      return;
    }
    if (Math.abs(player.location.x - initialLocation.x) > 0.1 || Math.abs(player.location.y - initialLocation.y) > 0.1 || Math.abs(player.location.z - initialLocation.z) > 0.1) {
      teleportCanceled = true;
      system.clearRun(warmUpTask);
      system.clearRun(timer);
      system.clearRun(movementCheckTask);
      player.sendMessage(`§cTeleport canceled due to movement.`);
    }
  }, 5);
}

export function denyTPARequest(player: Player, target: Player | undefined) {
  try {
    const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
    const request = target
      ? Object.entries(tpRequests).find(([_, data]) => data.target.toLowerCase() === player.name.toLowerCase() && (data.target.toLowerCase() === target.name.toLowerCase() || _.toLowerCase() === target.name.toLowerCase()))
      : Object.entries(tpRequests)
          .reverse()
          .find(([_, data]) => data.target.toLowerCase() === player.name.toLowerCase());

    if (!request) return player.sendMessage(`§cNo valid incoming teleport requests.`);

    const [requesterName] = request;
    const requester = nameToClass(requesterName);

    if (requester) {
      requester.sendMessage(`§cYour teleport request to ${player.name} was denied.`);
    }
    player.sendMessage(`§aYou denied the teleport request from ${requesterName}.`);
    delete tpRequests[requesterName];
    setDynamicProperty(TP_REQUESTS_KEY, tpRequests);
  } catch (e) {
    console.log(e);
  }
}

export function cancelTPARequest(player: Player) {
  const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
  if (!tpRequests[player.name]) return player.sendMessage(`§cYou have no outgoing teleport requests.`);

  const target = nameToClass(tpRequests[player.name].target)!;

  player.sendMessage(`§aCanceled teleport request to ${target.name}.`);

  if (target) target.sendMessage(`§eTeleport request from ${player.name} was canceled.`);
  delete tpRequests[player.name];
  setDynamicProperty(TP_REQUESTS_KEY, tpRequests);
}

export function showTPARequests(player: Player) {
  const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
  const outgoingRequest = tpRequests[player.name];
  const incomingRequests = Object.entries(tpRequests).filter(([_, data]) => data.target.toLowerCase() === player.name.toLowerCase());

  let message = "§6Teleport Requests:\n";

  if (outgoingRequest) {
    message += `§aOutgoing: §fTo ${outgoingRequest.target} (sent ${Math.floor((Date.now() - outgoingRequest.time) / 1000)}s ago)\n`;
  } else {
    message += "§cNo outgoing teleport requests.\n";
  }

  if (incomingRequests.length > 0) {
    message += "§aIncoming:\n";
    incomingRequests.forEach(([requesterName, data]) => {
      message += ` - From ${requesterName} (sent ${Math.floor((Date.now() - data.time) / 1000)}s ago)\n`;
    });
  } else {
    message += "§cNo incoming teleport requests.\n";
  }

  player.sendMessage(message);
}

export function tpaMenu(player: Player) {
  const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
  const outgoingRequest = tpRequests[player.name];
  const incomingRequests = Object.entries(tpRequests).filter(([_, data]) => data.target.toLowerCase() === player.name.toLowerCase());

  let form = new ActionFormData()
    .title(`§5Nexus§fSMP §8- §eTP`)
    .body(
      `§7Manage your teleport requests:
§eCredit: §fNebby`
    )
    .button(`§l§9Send Request§r\n§8[ §fOne at a Time §8]`, `textures/items/ender_pearl`)
    .button(`§l§bIncoming Requests§r\n§8[§f ${incomingRequests.length} §fRequests §8]`, `textures/items/ender_eye`)
    .button(`§l§7Sent Requests§r\n§8[§f ${outgoingRequest ? `§fCancel Request` : `§fNo requests`} §8]`, `textures/items/arrow`)
    .button(`§l§pRefresh§r\n§8[ §fUpdate Data §8]§r`, `textures/ui/icon_timer`)
    .button("§l§4Close Menu§r\n§8[ §fExit the GUI §8]§r", "textures/blocks/barrier");

  form.show(player as any).then((response) => {
    if (response.cancelationReason === `UserBusy`) return tpaMenu(player);
    if (response.canceled) return;
    switch (response.selection) {
      case 0:
        sendRequestMenu(player);
        break;
      case 1:
        incomingRequestsMenu(player);
        break;
      case 2:
        sentRequestsMenu(player);
        break;
      case 3:
        tpaMenu(player);
        break;
    }
  });
}

function sendRequestMenu(player: Player) {
  const players = [...world.getPlayers()];
  let form = new ModalFormData()
    .title(`§eSend Teleport Request`)
    .dropdown(
      `§l§cSelect a player!`,
      players.map((p) => `§f` + p.name)
    )
    .submitButton(`Send Request`);
  form.show(player as any).then((response) => {
    if (response.canceled) return tpaMenu(player);

    const targetPlayer = players[Number(response.formValues)];

    sendTPARequest(player, targetPlayer);
  });
}

function incomingRequestsMenu(player: Player) {
  const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
  const incomingRequests = Object.entries(tpRequests).filter(([_, data]) => data.target.toLowerCase() === player.name.toLowerCase());

  let form = new ActionFormData()
    .title("§eIncoming Requests")
    .body(incomingRequests.length > 0 ? "§fSelect a request to respond to:" : "§cNo incoming requests!")
    .button(`§l§fRefresh`, `textures/ui/icon_timer`);
  incomingRequests.forEach(([requesterName, data]) => {
    form.button(`§l§a${requesterName}\n§8[${Math.floor((Date.now() - data.time) / 1000)} ago]`);
  });

  form.show(player as any).then((response) => {
    if (response.canceled) return tpaMenu(player);
    if (response.selection === 0) return incomingRequestsMenu(player);
    let selectedRequest = incomingRequests[Number(response.selection) - 1];
    respondToRequestMenu(player, selectedRequest[0]);
  });
}

function respondToRequestMenu(player: Player, sender: string) {
  let form = new ActionFormData().title(`§eRespond to ${sender}`).body(`§fDo you want to accept or deny this request?`).button(`§l§aAccept`, `textures/items/dye_powder_lime`).button(`§l§4Deny`, `textures/items/dye_powder_red`);

  form.show(player as any).then((response) => {
    if (response.canceled) return incomingRequestsMenu(player);
    if (response.selection === 0) acceptTPARequest(player, nameToClass(sender)!);
    if (response.selection === 1) denyTPARequest(player, nameToClass(sender)!);
  });
}

function sentRequestsMenu(player: Player) {
  const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
  const outgoingRequest = tpRequests[player.name];

  let form = new ActionFormData()
    .title("§eSent Requests")
    .body(outgoingRequest ? "§fSelect a request to cancel:" : "§cNo sent requests!")
    .button(`§l§fRefresh`, `textures/ui/icon_timer`);
  if (outgoingRequest) form.button(`§l§c${outgoingRequest.target}\n§8[${Math.floor((Date.now() - outgoingRequest.time) / 1000)} ago]`);

  form.show(player as any).then((response) => {
    if (response.canceled) return tpaMenu(player);
    if (response.selection === 0) return sentRequestsMenu(player);
    cancelTPARequest(player);
  });
}

//fail safes

export function clearTPAS(evd: PlayerLeaveBeforeEvent) {
  const tpRequests = getDynamicProperty<Record<string, { target: string; time: number }>>(TP_REQUESTS_KEY);
  const outgoingRequest = tpRequests[evd.player.name];
  if (outgoingRequest) cancelTPARequest(evd.player);
}
