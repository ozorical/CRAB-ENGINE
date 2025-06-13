import { world, Player, Vector3, system, EntityHitEntityAfterEvent } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { playSoundTo } from "../helperFunctions/sounds";

const BASE_CLAIM_SIZE = 16;
const BASE_CLAIM_COST = 2500;
const CLAIM_STORAGE_KEY = "land_claims_data";
const PROTECTED_AREAS = [
    { x: 19974, y: 146, z: 19842 , radius: 1000 },
    { x: 380, y: 117, z: 935 , radius: 300 },
];

type ClaimData = Record<
  string,
  {
    owner: string;
    size: number;
    timestamp: number;
    sharedWith?: string[];
    flags?: Record<string, boolean>;
  }
>;

let claimsCache: ClaimData | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5000;

export function saveClaims(claims: ClaimData): void {
  try {
    world.setDynamicProperty(CLAIM_STORAGE_KEY, JSON.stringify(claims));
    claimsCache = claims;
    lastCacheUpdate = Date.now();
  } catch (error) {
    console.error("Failed to save claims:", error);
  }
}

export function loadClaims(): ClaimData {
  if (claimsCache && Date.now() - lastCacheUpdate < CACHE_TTL) {
    return claimsCache;
  }

  try {
    const saved = world.getDynamicProperty(CLAIM_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved as string) : {};
    claimsCache = parsed;
    lastCacheUpdate = Date.now();
    return parsed;
  } catch (error) {
    console.error("Failed to load claims:", error);
    return {};
  }
}

export function getClaimKey(location: Vector3, size: number = BASE_CLAIM_SIZE): string {
  const chunkX = Math.floor(location.x / size) * size;
  const chunkZ = Math.floor(location.z / size) * size;
  return `${chunkX},${chunkZ}`;
}

export function getClaimAtLocation(location: Vector3, claims: ClaimData) {
  for (const size of [16, 32, 64]) {
    const key = getClaimKey(location, size);
    if (claims[key]) {
      const claim = claims[key];
      const bounds = getClaimBounds(location, size);

      if (location.x >= bounds.minX && location.x <= bounds.maxX && location.z >= bounds.minZ && location.z <= bounds.maxZ) {
        return {
          ...claim,
          size: size,
          key: key,
          bounds: bounds,
        };
      }
    }
  }
  return null;
}

function getClaimBounds(location: Vector3, size: number) {
  const baseX = Math.floor(location.x / size) * size;
  const baseZ = Math.floor(location.z / size) * size;
  return {
    minX: baseX,
    maxX: baseX + size - 1,
    minZ: baseZ,
    maxZ: baseZ + size - 1,
  };
}

export function isInAnyClaim(location: Vector3, claims: ClaimData): boolean {
  return !!getClaimAtLocation(location, claims);
}

export function isLandClaimed(location: Vector3, claims: ClaimData): boolean {
  return isInAnyClaim(location, claims);
}

export function getLandOwner(location: Vector3, claims: ClaimData): string | null {
  const claim = getClaimAtLocation(location, claims);
  return claim?.owner || null;
}

export function getLandInfo(location: Vector3, claims: ClaimData) {
  return getClaimAtLocation(location, claims);
}

export function isNearProtectedLocation(location: Vector3): boolean {
  for (const area of PROTECTED_AREAS) {
    const distanceSquared = Math.pow(location.x - area.x, 2) + Math.pow(location.z - area.z, 2);

    if (distanceSquared < Math.pow(area.radius, 2)) return true;
  }
  return false;
}

export function hasClaimAccess(player: Player, claim: any): boolean {
  if (!claim) return false;
  return claim.owner === player.name || (claim.sharedWith && claim.sharedWith.includes(player.name)) || player.isOp();
}

export function claimLand(player: Player, location: Vector3, size: number, claims: ClaimData): boolean {
  if (isNearProtectedLocation(location)) {
    playSoundTo(player, "Error");
    player.sendMessage("§cYou cannot claim land near protected locations!");
    return false;
  }

  const baseX = Math.floor(location.x / size) * size;
  const baseZ = Math.floor(location.z / size) * size;

  for (let x = baseX; x < baseX + size; x++) {
    for (let z = baseZ; z < baseZ + size; z++) {
      const checkLoc = { x: x, y: 0, z: z };
      if (isInAnyClaim(checkLoc, claims)) {
        playSoundTo(player, "Error");
        player.sendMessage("§cThis area overlaps with an existing claim!");
        return false;
      }
    }
  }

  const cost = BASE_CLAIM_COST * Math.pow(size / BASE_CLAIM_SIZE, 2);
  const scoreboard = world.scoreboard.getObjective("money");
  if (!scoreboard) {
    playSoundTo(player, "Error");
    player.sendMessage("§cEconomy system not available!");
    return false;
  }

  const playerMoney = scoreboard.getScore(player);
  if (playerMoney === undefined || playerMoney < cost) {
    playSoundTo(player, "Error");
    player.sendMessage(`§cYou need §6${cost}§c money to claim this land!`);
    return false;
  }

  scoreboard.setScore(player, playerMoney - cost);

  const newClaims = { ...claims };
  const key = getClaimKey(location, size);
  newClaims[key] = {
    owner: player.name,
    size: size,
    timestamp: Date.now(),
    sharedWith: [],
    flags: {
      pvp: false,
      mobSpawning: true,
      fireSpread: false,
    },
  };

  saveClaims(newClaims);
  playSoundTo(player, "Success");
  return true;
}



export function unclaimLand(player: Player, location: Vector3, claims: ClaimData): boolean {
  const claim = getClaimAtLocation(location, claims);
  if (!claim || (claim.owner !== player.name && !player.isOp())) {
    playSoundTo(player, "Error");
    return false;
  }

  const newClaims = { ...claims };
  delete newClaims[claim.key];

  saveClaims(newClaims);
  playSoundTo(player, "BubblePop");

  const refundAmount = Math.floor(BASE_CLAIM_COST * Math.pow(claim.size / BASE_CLAIM_SIZE, 2) * 0.5);
  const scoreboard = world.scoreboard.getObjective("money");
  if (scoreboard) {
    const currentMoney = scoreboard.getScore(player) || 0;
    scoreboard.setScore(player, currentMoney + refundAmount);
    player.sendMessage(`§aRefunded §6${refundAmount}§a for unclaiming land!`);
  }

  return true;
}

export function showEnhancedClaimParticles(player: Player, center: Vector3, size: number): void {
  const particleCount = Math.min(size, 32);
  const interval = Math.max(1, Math.floor(size / particleCount));

  const particleType = size === 16 ? "minecraft:heart_particle" : size === 32 ? "minecraft:villager_happy" : "minecraft:endrod";

  for (let i = 0; i < size; i += interval) {
    system.runTimeout(() => {
      // Top boundary
      player.spawnParticle(particleType, {
        x: center.x + i - size / 2,
        y: center.y + 1,
        z: center.z - size / 2,
      });

      // Bottom boundary
      player.spawnParticle(particleType, {
        x: center.x + i - size / 2,
        y: center.y + 1,
        z: center.z + size / 2,
      });

      // Left boundary
      player.spawnParticle(particleType, {
        x: center.x - size / 2,
        y: center.y + 1,
        z: center.z + i - size / 2,
      });

      // Right boundary
      player.spawnParticle(particleType, {
        x: center.x + size / 2,
        y: center.y + 1,
        z: center.z + i - size / 2,
      });

      // Corner markers
      if (i % (size / 4) === 0) {
        player.spawnParticle("minecraft:flame_particle", {
          x: center.x + i - size / 2,
          y: center.y + 2,
          z: center.z - size / 2,
        });
      }
    }, i * 2);
  }
}

const playerCurrentClaims = new Map<string, { key: string; lastNotify: number }>();

world.afterEvents.playerSpawn.subscribe(event => {
    const player = event.player;
    const claims = loadClaims();
    const currentClaim = getClaimAtLocation(player.location, claims);
    
    if (currentClaim) {
        player.sendMessage(`§6Entered ${currentClaim.owner}'s territory`);
        playSoundTo(player, "Ping");
        playerCurrentClaims.set(player.id, { key: currentClaim.key, lastNotify: Date.now() });
    }
  }
),

world.afterEvents.playerLeave.subscribe((event) => {
  playerCurrentClaims.delete(event.playerId);
});

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  checkPlayerTerritory(event.player);
});

function checkPlayerTerritory(player: Player) {
  const claims = loadClaims();
  const currentClaim = getClaimAtLocation(player.location, claims);
  const playerId = player.id;
  const playerData = playerCurrentClaims.get(playerId);
  const now = Date.now();

  if (currentClaim) {
    if (!playerData || playerData.key !== currentClaim.key || now - playerData.lastNotify > 30000) {
      player.sendMessage(`§6You are in §b${currentClaim.owner}§6's territory`);
      playSoundTo(player, "Ping");
      playerCurrentClaims.set(playerId, {
        key: currentClaim.key,
        lastNotify: now,
      });
    }
  } else if (playerData) {
    playerCurrentClaims.delete(playerId);
  }
}

const PROTECTED_BLOCKS = [
    "minecraft:chest",
    "minecraft:barrel",
    "minecraft:hopper",
    "minecraft:dropper",
    "minecraft:dispenser",
    "minecraft:shulker_box",
    "minecraft:furnace",
    "minecraft:blast_furnace",
    "minecraft:smoker",
    "minecraft:brewing_stand"
];

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;
  const claims = loadClaims();

  const claim = getClaimAtLocation(block.location, claims);
  if (claim && !hasClaimAccess(player, claim)) {
    const blockType = block.typeId;

    if (PROTECTED_BLOCKS.includes(blockType)) {
      event.cancel = true;
      playSoundTo(player, "Error");
      player.sendMessage(`§cYou cannot interact with this in §b${claim.owner}§c's territory!`);
    }
  }
});

export async function showEnhancedLandMenu(player: Player): Promise<void> {
  const claims = loadClaims();
  const location = player.location;
  const isClaimed = isLandClaimed(location, claims);
  const landInfo = getLandInfo(location, claims);

  const form = new ActionFormData().title("§cCrab§fSMP §8- §eLand Claim").body(`Location: §b${Math.floor(location.x)}, ${Math.floor(location.z)}`);

  if (isClaimed) {
    form.button("§l§aCheck Owner\n§r§8[ §fSee who owns this land §8]", "textures/items/paper");
    form.button("§l§bView Land Stats\n§r§8[ §fDetailed claim information §8]", "textures/items/book_normal");
    form.button("§l§eView Claim Boundaries\n§r§8[ §fVisualize claim borders §8]", "textures/items/map_empty");

    if (landInfo && (landInfo.owner === player.name || player.isOp())) {
      form.button("§l§4Unclaim Land\n§r§8[ §fRemove your claim §8]", "textures/blocks/barrier");
      form.button("§l§dManage Sharing\n§r§8[ §fControl access §8]", "textures/items/name_tag");
      form.button("§l§5Claim Settings\n§r§8[ §fConfigure protections §8]", "textures/items/diamond");
    } else if (landInfo && landInfo.sharedWith?.includes(player.name)) {
      form.button("§l§aShared Access\n§r§8[ §fYou have permissions §8]", "textures/items/emerald");
    }
  } else {
    form.button("§l§aClaim Land\n§r§8[ §fProtect this area §8]", "textures/items/gold_ingot");
    form.button("§l§bCheck Nearby Claims\n§r§8[ §fView nearby territories §8]", "textures/items/map_filled");
    form.button("§l§eClaim Info\n§r§8[ §fLearn about claiming §8]", "textures/items/book_written");
  }

  const response = await form.show(player as any);
  if (response.canceled) {
    playSoundTo(player, "RandomPop");
    return;
  }

  try {
    switch (response.selection) {
      case 0:
        if (isClaimed) {
          const owner = getLandOwner(location, claims);
          player.sendMessage(`§3Land owner: §b${owner}`);
          playSoundTo(player, "Hat");
        } else {
          await showClaimSizeSelection(player, location, claims);
        }
        break;

      case 1:
        if (isClaimed && landInfo) {
          await showLandStats(player, landInfo, location);
        } else if (!isClaimed) {
          await showNearbyClaims(player, location, claims);
        }
        break;

      case 2:
        if (isClaimed && landInfo) {
          showEnhancedClaimParticles(player, location, landInfo.size);
          player.sendMessage("§aShowing claim boundaries");
          playSoundTo(player, "Ping");
        } else if (!isClaimed) {
          await showClaimInfoMenu(player);
        }
        break;

      case 3:
        if (landInfo && (landInfo.owner === player.name || player.isOp())) {
          if (unclaimLand(player, location, claims)) {
            player.sendMessage("§aSuccessfully unclaimed land");
          } else {
            player.sendMessage("§cFailed to unclaim land");
          }
        }
        break;

      case 4:
        if (landInfo && (landInfo.owner === player.name || player.isOp())) {
          await showShareClaimMenu(player, landInfo, claims);
        } else if (!isClaimed) {
          await showClaimInfoMenu(player);
        }
        break;

      case 5:
        if (landInfo && (landInfo.owner === player.name || player.isOp())) {
          await showClaimSettingsMenu(player, landInfo, claims);
        }
        break;
    }
  } catch (error) {
    console.error("Error in land menu:", error);
    playSoundTo(player, "Error");
    player.sendMessage("§cAn error occurred while processing your request");
  }
}

async function showLandStats(player: Player, claim: any, location: Vector3) {
  const date = new Date(claim.timestamp);
  const daysOwned = Math.floor((Date.now() - claim.timestamp) / (1000 * 60 * 60 * 24));

  const stats = [
    "§b=== Land Stats ===",
    `§3Owner: §b${claim.owner}`,
    `§3Size: §b${claim.size}x${claim.size}`,
    `§3Claimed: §b${date.toLocaleString()}`,
    `§3Days Owned: §b${daysOwned}`,
    `§3Protected: §b${isNearProtectedLocation(location) ? "Yes" : "No"}`,
    `§3Shared with: §b${claim.sharedWith?.join(", ") || "None"}`,
    "§b=================",
  ];

  player.sendMessage(stats.join("\n"));
  playSoundTo(player, "Chime");
}

async function showClaimInfoMenu(player: Player) {
  const form = new ActionFormData().title("§cCrab§fSMP §8- §eClaim Info").body(`§bWelcome to the land claim system! This allows you to protect your builds and areas from other players.
            
§c=== Claim Basics ===
§3- §bBase Claim Size§3: §a16x16 blocks
§3- §bLarger Claims§3: §a32x32 and 64x64 available
§3- §bCost§3: §a2,500 money for 16x16 (scales with size)
§3- §bMax Claims§3: §aNo limit (limited by your funds)
            
§c=== Protection Features ===
§3- §bBuild Protection§3: §aOthers can't build/break in your claim
§3- §bContainer Protection§3: §aChests/furnaces/etc. are secured
§3- §bEntity Protection§3: §aItem frames, armor stands protected
§3- §bCustom Settings§3: §aToggle PvP, mob spawning, fire spread
            
§c=== Sharing & Management ===
§3- §bShare Access§3: §aGrant specific players access
§3- §bBoundary View§3: §aVisualize claim borders
§3- §bUnclaiming§3: §aGet 50% refund when removing claim
            
§c=== Restrictions ===
§3- §bProtected Areas§3: §aSome zones can't be claimed
§3- §bAdmin Override§3: §aStaff can bypass protections
            
§eThis is a BETA feature - report issues to staff!`);

  form.button("§aClose", "textures/blocks/barrier");

  const response = await form.show(player as any);
  if (!response.canceled) {
    playSoundTo(player, "RandomPop");
  }
}

async function showShareClaimMenu(player: Player, claim: any, claims: ClaimData) {
  const form = new ModalFormData().title("Share Claim").textField("Player Name", "Enter player name to share with").dropdown("Action", ["Add Access", "Remove Access"]);

  const response = await form.show(player as any);
  if (response.canceled) return;

  const [playerName, actionIndex] = response.formValues as [string, number];
  const action = actionIndex === 0 ? "add" : "remove";

  if (!playerName || !playerName.trim()) {
    playSoundTo(player, "Error");
    player.sendMessage("§cPlease enter a valid player name!");
    return;
  }

  const newClaims = { ...claims };
  const claimData = newClaims[claim.key];

  if (!claimData.sharedWith) claimData.sharedWith = [];

  if (action === "add") {
    if (claimData.sharedWith.includes(playerName)) {
      playSoundTo(player, "Error");
      player.sendMessage(`§c${playerName} already has access!`);
      return;
    }

    claimData.sharedWith.push(playerName);
    saveClaims(newClaims);
    playSoundTo(player, "Success");
    player.sendMessage(`§aShared claim with §b${playerName}`);
  } else {
    if (!claimData.sharedWith.includes(playerName)) {
      playSoundTo(player, "Error");
      player.sendMessage(`§c${playerName} doesn't have access!`);
      return;
    }

    claimData.sharedWith = claimData.sharedWith.filter((name) => name !== playerName);
    saveClaims(newClaims);
    playSoundTo(player, "BubblePop");
    player.sendMessage(`§aRemoved sharing with §b${playerName}`);
  }
}

async function showClaimSettingsMenu(player: Player, claim: any, claims: ClaimData) {
  const form = new ModalFormData()
    .title("§cCrab§fSMP §8- §eClaim-Config")
    .toggle("Allow PvP", claim.flags?.pvp || false)
    .toggle("Allow Mob Spawning", { defaultValue: claim.flags?.mobSpawning || true })
    .toggle("Allow Fire Spread", { defaultValue: claim.flags?.fireSpread || false });

  const response = await form.show(player as any);
  if (response.canceled) return;

  const [pvp, mobSpawning, fireSpread] = response.formValues as [boolean, boolean, boolean];

  const newClaims = { ...claims };
  const claimData = newClaims[claim.key];

  if (!claimData.flags) claimData.flags = {};

  claimData.flags.pvp = pvp;
  claimData.flags.mobSpawning = mobSpawning;
  claimData.flags.fireSpread = fireSpread;

  saveClaims(newClaims);
  playSoundTo(player, "Success");
  player.sendMessage("§aClaim settings updated!");
}

async function showClaimSizeSelection(player: Player, location: Vector3, claims: ClaimData) {
  const form = new ModalFormData().title("§eSelect Claim Size").dropdown("Size", [`16x16 (${BASE_CLAIM_COST})`, `32x32 (${BASE_CLAIM_COST * 4})`, `64x64 (${BASE_CLAIM_COST * 16})`]);

  const response = await form.show(player as any);
  if (response.canceled) {
    playSoundTo(player, "RandomPop");
    return;
  }

  const sizes = [16, 32, 64];
  const selectedSize = sizes[response.formValues![0] as number];

  if (claimLand(player, location, selectedSize, claims)) {
    player.sendMessage(`§aSuccessfully claimed §b${selectedSize}x${selectedSize}§a land!`);
    showEnhancedClaimParticles(player, location, selectedSize);
  }
}

async function showNearbyClaims(player: Player, location: Vector3, claims: ClaimData) {
  const nearbyClaims: { distance: number; claim: any; center: Vector3 }[] = [];

  // Iterate through all claims in the database
  for (const [key, claim] of Object.entries(claims)) {
    if (!key.includes(",")) continue;

    const [xStr, zStr] = key.split(",");
    const x = parseInt(xStr);
    const z = parseInt(zStr);
    const size = claim.size || BASE_CLAIM_SIZE;

    // Calculate center of the claim
    const claimCenter = {
      x: x + size / 2,
      y: location.y,
      z: z + size / 2,
    };

    // Calculate distance to claim center
    const distance = Math.sqrt(Math.pow(location.x - claimCenter.x, 2) + Math.pow(location.z - claimCenter.z, 2));

    // Only show claims within 150 blocks
    if (distance < 150) {
      nearbyClaims.push({
        distance: Math.floor(distance),
        claim: claim,
        center: claimCenter,
      });
    }
  }

  // Sort by distance (nearest first)
  nearbyClaims.sort((a, b) => a.distance - b.distance);

  // Create the form
  const form = new ActionFormData().title("§6Nearby Claims").body("§bClaims within 150 blocks:");

  // Add buttons for each nearby claim (max 5)
  for (const nc of nearbyClaims.slice(0, 5)) {
    const size = nc.claim.size || BASE_CLAIM_SIZE;
    const sizeColor = size === 16 ? "§a" : size === 32 ? "§e" : "§6";
    form.button(`${sizeColor}${nc.claim.owner}'s land (${nc.distance}m)`, "textures/items/map_empty");
  }

  // Handle case when no claims are nearby
  if (nearbyClaims.length === 0) {
    form.body("§aNo nearby claims found within 150 blocks");
  }

  // Show the form to the player
  const response = await form.show(player as any);
  if (response.canceled) {
    playSoundTo(player, "RandomPop");
    return;
  }

  // Handle player selection
  const selectedIndex = response.selection;
  if (selectedIndex !== undefined && selectedIndex < nearbyClaims.length) {
    const selected = nearbyClaims[selectedIndex];
    const date = new Date(selected.claim.timestamp);
    const daysOwned = Math.floor((Date.now() - selected.claim.timestamp) / (1000 * 60 * 60 * 24));

    // Show claim info
    player.sendMessage(
      [
        "§b=== Nearby Claim Info ===",
        `§3Owner: §b${selected.claim.owner}`,
        `§3Size: §b${selected.claim.size || BASE_CLAIM_SIZE}x${selected.claim.size || BASE_CLAIM_SIZE}`,
        `§3Distance: §b${selected.distance}m`,
        `§3Direction: §b${getDirection(location, selected.center)}`,
        `§3Claimed: §b${date.toLocaleDateString()}`,
        `§3Days Owned: §b${daysOwned}`,
        `§3Shared with: §b${selected.claim.sharedWith?.join(", ") || "None"}`,
        "§b=======================",
      ].join("\n")
    );

    playSoundTo(player, "Chime");

    // Show particles around the claim boundaries
    system.runTimeout(() => {
      showEnhancedClaimParticles(player, { x: parseInt(selected.center.x.toString()) - selected.claim.size / 2, y: location.y, z: parseInt(selected.center.z.toString()) - selected.claim.size / 2 }, selected.claim.size || BASE_CLAIM_SIZE);
    }, 10);
  }
}

function getDirection(from: Vector3, to: Vector3): string {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const angle = (Math.atan2(dz, dx) * 180) / Math.PI;

  const directions = ["East", "Northeast", "North", "Northwest", "West", "Southwest", "South", "Southeast"];

  const index = Math.round(((angle + 180) % 360) / 45) % 8;
  return directions[index];
}

world.beforeEvents.playerPlaceBlock.subscribe((event) => {
  const player = event.player;
  if (player.isOp()) return;

  const claims = loadClaims();
  const blockLocation = event.block.location;

  const claim = getClaimAtLocation(blockLocation, claims);
  if (claim && !hasClaimAccess(player, claim)) {
    event.cancel = true;
    playSoundTo(player, "Error");
    player.sendMessage(`§cYou cannot build in §b${claim.owner}§c's territory!`);
  }
});

world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  if (player.isOp()) return;

  const claims = loadClaims();
  const blockLocation = event.block.location;

  const claim = getClaimAtLocation(blockLocation, claims);
  if (claim && !hasClaimAccess(player, claim)) {
    event.cancel = true;
    playSoundTo(player, "Error");
    player.sendMessage(`§cYou cannot break blocks in §b${claim.owner}§c's territory!`);
  }
});

world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
  const player = event.player;
  if (player.isOp()) return;

  const entity = event.target;
  const claims = loadClaims();

  const claim = getClaimAtLocation(entity.location, claims);
  if (claim && !hasClaimAccess(player, claim)) {
    if (entity.typeId.includes("item_frame") || entity.typeId.includes("armor_stand")) {
      event.cancel = true;
      playSoundTo(player, "Error");
      player.sendMessage(`§cYou cannot interact with entities in §b${claim.owner}§c's territory!`);
    }
  }
});

world.afterEvents.entityHitEntity.subscribe((event) => {
  const damager = event.damagingEntity;
  const target = event.hitEntity;

  if (!(damager instanceof Player) || !(target instanceof Player)) return;
  const claims = loadClaims();
  const targetLocation = target.location;
  const claim = getClaimAtLocation(targetLocation, claims);

  if (claim && (!claim.flags?.pvp || !hasClaimAccess(damager, claim))) {
    playSoundTo(damager, "Error");
    damager.sendMessage(`§cPvP is disabled in §b${claim.owner}§c's territory!`);

    playSoundTo(target, "Ping");
    target.sendMessage(`§a${damager.name} tried to attack you in your protected territory!`);
  }
});
