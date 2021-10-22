import type { Levels, EnvKeyValuePair, TwoLevelMapRaw } from "./types";

/**
 * A nested map structure for storing two-level data.
 */
export class TwoLevelMap<
  L1 extends Levels,
  L2 extends Levels,
  D extends EnvKeyValuePair
> {
  private map = new Map<L1, Map<L2, D>>();

  /**
   * Adds a single data object to the nested map
   * @param level1 level one key
   * @param level2 level two key
   * @param data data object to store
   */
  public addOne<
    L1 extends Levels,
    L2 extends Levels,
    D extends EnvKeyValuePair
  >(level1: L1, level2: L2, data: D): void {
    // @ts-expect-error
    if (!this.map.has(level1)) {
      // @ts-ignore
      this.map.set(level1, new Map<L1, D>());
    }
    // @ts-expect-error
    if (this.map.get(level1)?.has(level2)) {
      throw new Error(`Duplicate ${level1}.${level2}`);
    }
    // @ts-expect-error
    this.map.get(level1)?.set(level2, data);
  }

  /**
   * Returns the map object stored by the class
   * @returns the entire map object
   */
  public getMap(): TwoLevelMapRaw<L1, L2, D> {
    return this.map;
  }

  /**
   * Returns the data object at the given level1 and level2 keys
   * @param level1 level one key
   * @param level2 level two key
   * @returns data object
   */
  public getData(level1: L1, level2: L2): D {
    const l2 = this.getL2(level1);
    const data = l2.get(level2);
    if (!data) {
      throw new Error(`L2: ${level2} get required before being defined`);
    }
    return data;
  }

  /**
   * Returns the level 2 map stored at the level 1 key
   * @param level1 level 1 key
   * @returns level 2 map
   */
  public getL2(level1: L1) {
    const l2 = this.map.get(level1);
    if (!l2) {
      throw new Error(`L1: ${level1} get request before being defined`);
    }
    return l2;
  }

  /**
   * Returns an array of level 1 keys
   * @returns array of level 1 keys
   */
  public getL1Keys(): L1[] {
    return Array.from(this.map.keys());
  }

  /**
   * Returns an array of level 2 keys stored at the level 1 key location
   * @param level1 level 1 key
   * @returns level 2 keys
   */
  public getL2Keys(level1: L1): L2[] {
    const l2 = this.getL2(level1);
    return Array.from(l2.keys());
  }

  /**
   * Returns a boolean representing the existence of the given level
   * one key.
   * @param level1 level one key to look for
   * @returns true if the queried level 1 key exists
   */
  public hasL1(level1: L1): boolean {
    return this.map.has(level1);
  }

  /**
   * Returns a boolean representing whether the given level 2 key exists
   * at the given level 1 key location.
   * @param level1 level one key at which to search
   * @param level2 level two key to look for
   * @returns true if the given level 2 key exists
   */
  public hasL2(level1: L1, level2: L2): boolean {
    try {
      const l2 = this.getL2(level1);
      return l2.has(level2);
    } catch (e) {
      return false;
    }
  }

  /**
   * Returns an array representation of all the data held inside
   * the level 1 key.
   * @remarks
   * The return of this method does not contain any data
   * about the level 2 keys. The ordering in the returned array is the same as
   * the source data from which the class is populated.
   * @param level1 level one key
   * @returns An array of level 2 data
   */
  public L2Array(level1: L1): D[] {
    const l2 = this.getL2(level1);
    const arr: D[] = [];
    l2.forEach((data) => {
      arr.push(data);
    });
    return arr;
  }
}
