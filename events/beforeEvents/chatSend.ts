"use strict";
import { world } from "@minecraft/server";
import { ifThisPlayerIsMutedDoThis } from "../../adminGUI/AdminGui";
import { handlePlayerChat } from "../../chatRanks/ranks";
import { chatLength } from "../../antibot/antibot";

world.beforeEvents.chatSend.subscribe((e) => {
  if (e.message.startsWith(`-`)) return e.cancel = true
  ifThisPlayerIsMutedDoThis(e);
  handlePlayerChat(e);
  chatLength(e);
});
