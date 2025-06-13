import { Player, Vector3 } from "@minecraft/server";
import { getScore, addScore } from "../../helperFunctions/getScore";
import { TravelRegister } from "./travelQuests";

export function travelTracker(player: Player) {
  const currentLocation = player.location;
  const currentDimension = player.dimension.id;
  const lastLocation = (player.getDynamicProperty("lastPos") as Vector3) ?? currentLocation;
  const lastDimesion = (player.getDynamicProperty("lastDim") as string) ?? player.dimension.id;

  if (currentDimension != lastDimesion) return;

  const distanceMovedX = Math.abs(Math.abs(player.location.x) - Math.abs(lastLocation.x));
  const distanceMovedz = Math.abs(Math.abs(player.location.z) - Math.abs(lastLocation.z));
  const totalDistance = distanceMovedX + distanceMovedz;

  player.setDynamicProperty("lastPos", player.location);
  player.setDynamicProperty("lastDim", player.dimension.id);
  if (totalDistance === 0 || getScore(player, "distanceMoved")! > 2000000000) return;
  console.log(totalDistance, Math.abs(player.location.x), Math.abs(lastLocation.x), Math.abs(Math.abs(player.location.x) - Math.abs(lastLocation.x)), getScore(player, "distanceMoved")! > 2000000000);
  if (totalDistance > 400) return;

  addScore(player, "distanceMoved", totalDistance);
  Object.entries(TravelRegister).forEach((travel) => {
    if (player.getDynamicProperty(travel[1].questName) === undefined) {
      player.setDynamicProperty(travel[1].questName, 0);
    }
    travel[1].rewardsAction(player, travel[1]);
  });
}
