/**
 * Holds the prefix string used in EnvAccounts class.
 */
export class EnvPrefix {
  private envPrefix!: string;

  /**
   * Sets the prefix string
   * @param envPrefix string prefix
   * @returns this
   */
  public set(envPrefix: string): this {
    this.envPrefix = envPrefix;
    return this;
  }

  /**
   * Returns the set env prefix string
   * @returns string prefix
   * @throw if the method is called before the prefix is set
   */
  public get(): string | never {
    if (!this.envPrefix) {
      throw new Error("EnvPrefix hasn't been set");
    }
    return this.envPrefix;
  }
}
