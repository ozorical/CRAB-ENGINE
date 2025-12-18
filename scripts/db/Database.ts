import { world, ScoreboardObjective } from "@minecraft/server";

export class Database<T extends any> {
  private MEMORY: { [key: string]: T } | null = null;
  private QUEUE: Array<() => void> = [];
  private onLoadCallback: ((data: { [key: string]: T } | null) => void) | undefined;
  private objective: ScoreboardObjective;
  private readonly ENCRYPTION_KEY: number = 5;
  private decryptedDataCache: string | null = null;
  private readonly MAX_CHUNKS: number = 100;

  constructor(public tableName: string) {
    this.objective = world.scoreboard.getObjective(this.tableName) || 
                     world.scoreboard.addObjective(this.tableName, this.tableName);
    
    const LOADED_DATA = this.fetch();
    this.MEMORY = LOADED_DATA;
    this.onLoadCallback?.(LOADED_DATA);
    this.QUEUE.forEach(v => v());
    this.QUEUE = [];
  }

  private encrypt(str: string): string {
    return str.split("").map(char => 
      String.fromCharCode(char.charCodeAt(0) + this.ENCRYPTION_KEY)
    ).join("");
  }

  private decrypt(str: string): string {
    return str.split("").map(char => 
      String.fromCharCode(char.charCodeAt(0) - this.ENCRYPTION_KEY)
    ).join("");
  }

  private fetch(): { [key: string]: T } {
    const participants = this.objective.getParticipants();
    if (participants.length === 0) return {};

    const sortedParticipants = [...participants].sort((a, b) => 
      (this.objective.getScore(a) || 0) - (this.objective.getScore(b) || 0)
    );

    let collectedData = "";
    for (const participant of sortedParticipants) {
      collectedData += participant.displayName;
    }

    try {
      if (this.decryptedDataCache !== collectedData) {
        this.decryptedDataCache = this.decrypt(collectedData);
      }
      return JSON.parse(this.decryptedDataCache);
    } catch (error) {
      console.warn(`[DATABASE]: Failed to parse data: ${error}`);
      return {};
    }
  }

  private async saveData(): Promise<void> {
    if (!this.MEMORY) return;

    world.scoreboard.removeObjective(this.tableName);
    this.objective = world.scoreboard.addObjective(this.tableName, this.tableName);

    const stringData = JSON.stringify(this.MEMORY);
    const encryptedData = this.encrypt(stringData);
    const chunks = this.chunkString(encryptedData, 32000).slice(0, this.MAX_CHUNKS);

    chunks.forEach((chunk, index) => {
      this.objective.setScore(chunk, index);
    });
  }

  private chunkString(str: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  }

  private async addQueueTask(): Promise<void> {
    return new Promise(resolve => this.QUEUE.push(resolve));
  }

  async onLoad(callback: (data: { [key: string]: T } | null) => void) {
    if (this.MEMORY) return callback(this.MEMORY);
    this.onLoadCallback = callback;
  }

  async set(key: string, value: T): Promise<void> {
    if (!this.MEMORY) throw new Error("Data not loaded!");
    this.MEMORY[key] = value;
    await this.saveData();
  }

  get(key: string): T | null {
    if (!this.MEMORY) throw new Error("Data not loaded!");
    return this.MEMORY[key] || null;
  }

  async getSync(key: string): Promise<T | null> {
    if (this.MEMORY) return this.get(key);
    await this.addQueueTask();
    return this.MEMORY?.[key] ?? null;
  }

  keys(): string[] {
    if (!this.MEMORY) throw new Error("Data not loaded!");
    return Object.keys(this.MEMORY);
  }

  async keysSync(): Promise<string[]> {
    if (this.MEMORY) return this.keys();
    await this.addQueueTask();
    return this.MEMORY ? Object.keys(this.MEMORY) : [];
  }

  values(): T[] {
    if (!this.MEMORY) throw new Error("Data not loaded!");
    return Object.values(this.MEMORY);
  }

  async valuesSync(): Promise<T[]> {
    if (this.MEMORY) return this.values();
    await this.addQueueTask();
    return this.MEMORY ? Object.values(this.MEMORY) : [];
  }

  has(key: string): boolean {
    if (!this.MEMORY) throw new Error("Data not loaded!");
    return key in this.MEMORY;
  }

  async hasSync(key: string): Promise<boolean> {
    if (this.MEMORY) return this.has(key);
    await this.addQueueTask();
    return this.MEMORY ? key in this.MEMORY : false;
  }

  collection(): { [key: string]: T } {
    if (!this.MEMORY) throw new Error("Data not loaded!");
    return this.MEMORY;
  }

  async collectionSync(): Promise<{ [key: string]: T }> {
    if (this.MEMORY) return this.collection();
    await this.addQueueTask();
    return this.MEMORY || {};
  }

  async delete(key: string): Promise<boolean> {
    if (!this.MEMORY) return false;
    const status = delete this.MEMORY[key];
    await this.saveData();
    return status;
  }

  async clear(): Promise<void> {
    this.MEMORY = {};
    await this.saveData();
  }

  getKeyByValue(value: T): string | null {
    if (!this.MEMORY) throw new Error("Data not loaded!");
    return Object.entries(this.MEMORY).find(([_, v]) => v === value)?.[0] || null;
  }
}