import { system, world, Entity, EntityComponentTypes } from "@minecraft/server";
import { MinecraftDimensionTypes, MinecraftEntityTypes } from "@minecraft/vanilla-data";

const DESPAWN_TIME: number = 300;
const STACK_DISTANCE: number = 12;
const STACK_LIMIT: number = 100;
const STACK_COOLDOWN: number = 2;
const BLACKLISTED_PREFIXES: string[] = ["npc:", "crab:", "Crate:", "crate:"];
const BLACKLISTED_ENTITY_TYPES: string[] = [
  "minecraft:player",
  "myname:crab",
  "minecraft:xp_bottle",
  "minecraft:xp_orb",
  "minecraft:blaze",
  "minecraft:ender_pearl",
  "minecraft:npc",
  "minecraft:armor_stand",
  "minecraft:villager_v2",
  "minecraft:villager",
  "minecraft:slime",
  "minecraft:shulker_bullet",
  "minecraft:wolf",
  "minecraft:cat",
  "minecraft:minecart",
  "minecraft:boat",
  "minecraft:npc",
];

const SPLIT_COOLDOWN_TAG: string = "split_cooldown";
const SPLIT_COOLDOWN_DURATION: number = 40;

const trackedItems: Map<string, string> = new Map();
const stackedEntities: Map<string, { typeId: string; dimension: string; location: { x: number; y: number; z: number }; stackAmount: number }> = new Map();

function isBlacklisted(entity: Entity): boolean {
  return BLACKLISTED_ENTITY_TYPES.includes(entity.typeId) || BLACKLISTED_PREFIXES.some((prefix) => entity.typeId.startsWith(prefix));
}

function isDroppedItem(entity: Entity): boolean {
  return entity.typeId === "minecraft:item";
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function updateStackAmount(entity: Entity, newAmount: number): boolean {
  if (!entity.isValid) return false;
  entity.setDynamicProperty("stackAmount", newAmount);
  const entityType = titleCase(entity.typeId.replace("minecraft:", "").replaceAll("_", " "));
  entity.nameTag = `§f${entityType} §8- §ax${newAmount}`;
  if (stackedEntities.has(entity.id)) {
    const data = stackedEntities.get(entity.id);
    if (data) {
      data.stackAmount = newAmount;
      stackedEntities.set(entity.id, data);
    }
  }
  return true;
}

function handleEntityInitialization(entity: Entity): void {
  if (!entity.isValid) return;
  if (entity.hasTag(SPLIT_COOLDOWN_TAG)) return;
  if (isBlacklisted(entity)) return;

  if (isDroppedItem(entity)) {
    const spawnTime = new Date().toISOString();
    entity.setDynamicProperty("spawnTime", spawnTime);
    trackedItems.set(entity.id, spawnTime);
    return;
  }

  const dimension = world.getDimension(entity.dimension.id);
  const nearbyStacks = dimension.getEntities({
    type: entity.typeId,
    tags: ["stacked"],
    location: entity.location,
    maxDistance: STACK_DISTANCE,
    excludeTypes: ["minecraft:xp_orb", "minecraft:item"],
  });

  if (nearbyStacks.length === 0) {
    entity.addTag("stacked");
    updateStackAmount(entity, 1);
    stackedEntities.set(entity.id, {
      typeId: entity.typeId,
      dimension: entity.dimension.id,
      location: entity.location,
      stackAmount: 1,
    });
  } else {
    nearbyStacks.sort((a, b) => ((b.getDynamicProperty("stackAmount") as number) || 0) - ((a.getDynamicProperty("stackAmount") as number) || 0));
    const largestStack = nearbyStacks[0];
    const currentAmount = (largestStack.getDynamicProperty("stackAmount") as number) || 0;

    if (currentAmount < STACK_LIMIT) {
      if (updateStackAmount(largestStack, currentAmount + 1)) {
        entity.remove();
      }
    }
  }
}

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
  handleEntityInitialization(entity);
});

world.afterEvents.entityLoad.subscribe(({ entity }) => {
  handleEntityInitialization(entity);
});

system.runInterval(() => {
  const currentTime = Date.now();
  for (const [itemId, spawnTime] of trackedItems.entries()) {
    const item = world.getEntity(itemId);
    if (!item?.isValid) {
      trackedItems.delete(itemId);
      continue;
    }

    const timePassed = currentTime - new Date(spawnTime).getTime();
    if (timePassed >= DESPAWN_TIME * 1000) {
      item.remove();
      trackedItems.delete(itemId);
    }
  }

  [MinecraftDimensionTypes.Overworld, MinecraftDimensionTypes.Nether].forEach((dimType) => {
    const dimension = world.getDimension(dimType);
    const stacks = dimension.getEntities({ tags: ["stacked"] });

    stacks.forEach((stack) => {
      if (!stack.isValid || stack.hasTag(SPLIT_COOLDOWN_TAG)) return;

      const nearby = dimension.getEntities({
        type: stack.typeId,
        tags: ["stacked"],
        location: stack.location,
        maxDistance: STACK_DISTANCE,
        excludeTypes: ["minecraft:xp_orb", "minecraft:item"],
      });

      if (nearby.length > 1) {
        nearby.sort((a, b) => ((b.getDynamicProperty("stackAmount") as number) || 0) - ((a.getDynamicProperty("stackAmount") as number) || 0));
        const largest = nearby[0];
        const total = nearby.reduce((sum, e) => sum + ((e.getDynamicProperty("stackAmount") as number) || 0), 0);

        if (total <= STACK_LIMIT && updateStackAmount(largest, total)) {
          nearby.slice(1).forEach((e) => e.remove());
        }
      }
    });
  });
}, STACK_COOLDOWN);

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  const entity = deadEntity;
  if (!stackedEntities.has(entity.id)) return;

  const data = stackedEntities.get(entity.id);
  if (!data) return;

  const { stackAmount } = data;

  if (stackAmount > 1) {
    stackedEntities.delete(entity.id);
  }
});

system.runInterval(() => {
  [MinecraftDimensionTypes.Overworld, MinecraftDimensionTypes.Nether].forEach((dimType) => {
    const dimension = world.getDimension(dimType);
    dimension.getEntities({ tags: [SPLIT_COOLDOWN_TAG] }).forEach((entity) => {
      if (entity.isValid) {
        entity.removeTag(SPLIT_COOLDOWN_TAG);
      }
    });
  });
}, SPLIT_COOLDOWN_DURATION * 2);

function countdown(seconds: number) {
  if (seconds === 30) {
    world.sendMessage(` §eLag clear in §c30 seconds`);
  } else if (seconds === 10) {
    world.sendMessage(` §eLag clear in §c10 seconds`);
  } else if (seconds <= 3 && seconds > 0) {
    world.sendMessage(` §eLag clear in §c${seconds}`);
  } else if (seconds === 0) {
    clearEntities();
  }

  if (seconds > 0) {
    system.runTimeout(() => countdown(seconds - 1), 20);
  }
}
function clearEntities() {
  let removedEntities = 0;
  let removedItems = 0;
  let removedOrbs = 0;

  const dimensions = [MinecraftDimensionTypes.Overworld, MinecraftDimensionTypes.Nether, MinecraftDimensionTypes.TheEnd];

  for (const dimensionType of dimensions) {
    const dimension = world.getDimension(dimensionType);

    const entities = dimension.getEntities({
      excludeTypes: [MinecraftEntityTypes.Villager, MinecraftEntityTypes.VillagerV2, "item"],
      families: ["mob"],
    });
    const items = dimension.getEntities({ type: "item" });
    const orbs = dimension.getEntities({ type: MinecraftEntityTypes.XpOrb });

    orbs.forEach((orb) => {
      orb.remove();
      removedOrbs++;
    });

    entities.forEach((ent) => {
      if (!ent.hasComponent(EntityComponentTypes.Item)) {
        ent.remove();
        removedEntities++;
      }
    });

    items.forEach((item) => {
      if (!item.getComponent(EntityComponentTypes.Item)?.itemStack.typeId.includes("shulker")) {
        item.remove();
        removedItems++;
      }
    });
  }

  world.sendMessage(` §aLag has been cleared.\nRemoved: §c${removedEntities} mobs, §6${removedItems} items, §b${removedOrbs} XP orbs.`);
}

function checkEntityCount() {
  const dimensions = [MinecraftDimensionTypes.Overworld, MinecraftDimensionTypes.Nether, MinecraftDimensionTypes.TheEnd];
  let totalEntityCount = 0;

  for (const dimensionType of dimensions) {
    const dimension = world.getDimension(dimensionType);
    const entities = dimension.getEntities();
    totalEntityCount += entities.length;
  }

  if (totalEntityCount > 125) {
    world.sendMessage(` §cEntity count exceeded 125! Clearing lag...`);
    clearEntities();
  }
}

system.runInterval(() => {
  countdown(30);
}, 24000);

system.runInterval(() => {
  checkEntityCount();
}, 10000);
