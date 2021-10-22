import {
  EnvAccountNameShortened,
  EnvAccountNameShortenedIndeterminate,
} from "./types";

/**
 * Stores the required accounts for EnvAccounts class
 */
export class RequiredAccounts {
  private required: EnvAccountNameShortened[] = [];

  /**
   * Returns the array representation of the required account strings
   * @returns array of required accounts
   */
  public get(): EnvAccountNameShortened[] {
    return this.required;
  }

  /**
   * Sets the given strings as required accounts. The method converts the
   * strings to lowercase before assigning the values.
   * @param names the names to set as required accounts
   */
  public set(...names: EnvAccountNameShortenedIndeterminate[]) {
    this.required = names.map(
      (name) => name.toUpperCase() as EnvAccountNameShortened
    );
  }

  /**
   * Checks the required accounts against a list given by the consumer.
   * @param list the list to check whether all the required accounts are
   * present
   * @throws if the given list doesn't contain at least one of the required
   * accounts
   */
  public check(list: EnvAccountNameShortened[]): void | never {
    this.get().forEach((requiredAccount) => {
      if (!list.includes(requiredAccount)) {
        throw new Error(`ACCOUNT_${requiredAccount} is required in .env`);
      }
    });
  }
}
