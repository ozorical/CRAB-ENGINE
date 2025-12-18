import { world } from "@minecraft/server";

/**
 * A generic database class that uses Minecraft's world dynamic properties for persistent storage.
 * Provides a key-value store interface with JSON serialization.
 *
 * @template T - The type of values stored in the database
 */
export class crabDB<T extends any> {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Gets a value from the database by key.
   *
   * @param key - The key to retrieve the value for
   * @returns The value associated with the key, or undefined if not found
   */
  public get(key: string): undefined | T {
    const fromStorage = world.getDynamicProperty(this.name);
    if (!fromStorage) return undefined;

    const db = JSON.parse(fromStorage as string);
    return db[key];
  }

  /**
   * Sets a value in the database for the given key.
   *
   * @param key - The key to store the value under
   * @param value - The value to store
   */
  public set(key: string, value: T): void {
    let fromStorage = world.getDynamicProperty(this.name);
    const db = JSON.parse((fromStorage as string) || "{}");
    db[key] = value;
    console.warn(`Set value for key '${key}' in database '${this.name}'`);
    world.setDynamicProperty(this.name, JSON.stringify(db));
  }

  /**
   * Deletes a key-value pair from the database.
   *
   * @param key - The key to delete
   */
  public delete(key: string): void {
    let fromStorage = world.getDynamicProperty(this.name);
    if (!fromStorage) return;

    const db = JSON.parse(fromStorage as string);
    delete db[key];
    console.warn(`Deleted key '${key}' from database '${this.name}'`);
    world.setDynamicProperty(this.name, JSON.stringify(db));
  }

  /**
   * Gets all keys currently stored in the database.
   *
   * @returns An array of all keys in the database
   */
  public keys(): string[] {
    const fromStorage = world.getDynamicProperty(this.name);
    if (!fromStorage) return [];

    const db = JSON.parse(fromStorage as string);
    return Object.keys(db);
  }

  /**
   * Checks if a key exists in the database.
   *
   * @param key - The key to check for existence
   * @returns True if the key exists, false otherwise
   */
  public has(key: string): boolean {
    const fromStorage = world.getDynamicProperty(this.name);
    if (!fromStorage) return false;
    const db = JSON.parse(fromStorage as string);
    return key in db;
  }

  /**
   * Finds the first key that maps to the given value.
   *
   * @param value - The value to search for
   * @returns The key associated with the value, or undefined if not found
   */
  public getKeyFromValue(value: T): string | undefined {
    const fromStorage = world.getDynamicProperty(this.name);
    if (!fromStorage) return undefined;
    const db = JSON.parse(fromStorage as string);
    return Object.keys(db).find((key) => db[key] === value);
  }

  /**
   * Gets all values currently stored in the database.
   *
   * @returns An array of all values in the database
   */
  public values(): T[] {
    const fromStorage = world.getDynamicProperty(this.name);
    if (!fromStorage) return [];

    const db = JSON.parse(fromStorage as string);
    return Object.values(db);
  }

  /**
   * Clears all data from the database.
   */
  public clear(): void {
    world.setDynamicProperty(this.name, "{}");
    console.warn(`Cleared database '${this.name}'`);
  }
}
