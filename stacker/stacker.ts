import { Entity, EntityComponentTypes, system, world } from "@minecraft/server";
import { MinecraftDimensionTypes, MinecraftEntityTypes } from "@minecraft/vanilla-data";
import { titleCase } from "../helperFunctions/functions";

const STACK_DISTANCE = 15;
const STACK_LIMIT = 100;
const STACK_COOLDOWN = 2;
const BLACKLISTED_PREFIXES = ["npc:", "crab:", "Crate:", "crate:", "nicothekid:", "oreville:" ];
const BLACKLISTED_ENTITY_TYPES = [
  MinecraftEntityTypes.Player,
  MinecraftEntityTypes.XpBottle,
  MinecraftEntityTypes.Blaze,
  MinecraftEntityTypes.EnderPearl,
  MinecraftEntityTypes.Npc,
  MinecraftEntityTypes.ArmorStand,
  MinecraftEntityTypes.IronGolem,
  MinecraftEntityTypes.Villager,
  MinecraftEntityTypes.Pillager,
  MinecraftEntityTypes.Slime,
  MinecraftEntityTypes.ShulkerBullet,
];

function isBlacklisted(entity: Entity): boolean {
  return BLACKLISTED_ENTITY_TYPES.includes(entity.typeId as MinecraftEntityTypes) || BLACKLISTED_PREFIXES.some((prefix) => entity.typeId.startsWith(prefix));
}

world.afterEvents.entitySpawn.subscribe((e) => {
  const { entity } = e;
  if (entity.getComponent(EntityComponentTypes.Item) || isBlacklisted(entity)) return;
  if (entity.dimension.id === undefined) return;
  const nearbyStacks = world.getDimension(entity.dimension.id).getEntities({
    type: entity.typeId,
    tags: ["stacked"],
    location: entity.location,
    maxDistance: STACK_DISTANCE,
    excludeTypes: [MinecraftEntityTypes.XpOrb, "item"],
  });

  if (nearbyStacks.length === 0) {
    entity.addTag("stacked");
    entity.setDynamicProperty("stackAmount", 1);
    entity.nameTag = `§f${titleCase(entity.typeId.replace("minecraft:", "").replaceAll("_", " "))} §8- §ax1`;
  } else {
    let remainingAmount = 1;

    for (const stack of nearbyStacks) {
      const currentAmount = stack.getDynamicProperty("stackAmount") as number;

      if (currentAmount < STACK_LIMIT) {
        const spaceLeft = STACK_LIMIT - currentAmount;
        const amountToAdd = Math.min(spaceLeft, remainingAmount);

        stack.setDynamicProperty("stackAmount", currentAmount + amountToAdd);
        stack.nameTag = `§f${titleCase(stack.typeId.replace("minecraft:", "").replaceAll("_", " "))} §8- §ax${currentAmount + amountToAdd}`;
        remainingAmount -= amountToAdd;

        if (remainingAmount <= 0) {
          entity.remove();
          break;
        }
      }
    }

    if (remainingAmount > 0) {
      entity.addTag("stacked");
      entity.setDynamicProperty("stackAmount", remainingAmount);
      entity.nameTag = `§f${titleCase(entity.typeId.replace("minecraft:", "").replaceAll("_", " "))} §8- §ax${remainingAmount}`;
    }
  }
});

system.runInterval(() => {
  const dimensions = [MinecraftDimensionTypes.Overworld, MinecraftDimensionTypes.Nether];

  dimensions.forEach((dimension) => {
    const stackedEntities = world.getDimension(dimension).getEntities({
      tags: ["stacked"],
      excludeTypes: [MinecraftEntityTypes.Player, "item"],
    });

    stackedEntities.forEach((stack) => {
      const nearbyStacks = world.getDimension(stack.dimension.id).getEntities({
        type: stack.typeId,
        tags: ["stacked"],
        location: stack.location,
        maxDistance: STACK_DISTANCE,
        excludeTypes: [MinecraftEntityTypes.XpOrb, "item"],
      });

      if (nearbyStacks.length <= 1) return;

      nearbyStacks.sort((a, b) => (b.getDynamicProperty("stackAmount") as number) - (a.getDynamicProperty("stackAmount") as number));
      const largestStack = nearbyStacks[0];
      const totalAmount = nearbyStacks.reduce((sum, entity) => sum + (entity.getDynamicProperty("stackAmount") as number), 0);

      if (totalAmount <= STACK_LIMIT) {
        largestStack.setDynamicProperty("stackAmount", totalAmount);
        largestStack.nameTag = `§f${titleCase(largestStack.typeId.replace("minecraft:", "").replaceAll("_", " "))} §8- §ax${totalAmount}`;

        for (let i = 1; i < nearbyStacks.length; i++) {
          nearbyStacks[i].remove();
        }
      }
    });
  });
}, STACK_COOLDOWN);

world.afterEvents.entityDie.subscribe((e) => {
  const { deadEntity } = e;

  if (deadEntity.hasTag("stacked")) {
    const amount = deadEntity.getDynamicProperty("stackAmount") as number;

    if (amount > 1) {
      const newEntity = deadEntity.dimension.spawnEntity({ id: deadEntity.typeId }, deadEntity.location);
      newEntity.setDynamicProperty("stackAmount", amount - 1);
      newEntity.addTag("stacked");
      newEntity.nameTag = `§f${titleCase(newEntity.typeId.replace("minecraft:", "").replaceAll("_", " "))} §8- §ax${amount - 1}`;

      if (newEntity.hasComponent(EntityComponentTypes.IsBaby)) {
        newEntity.triggerEvent("minecraft:ageable_grow_up");
      }
    }
  }
});
