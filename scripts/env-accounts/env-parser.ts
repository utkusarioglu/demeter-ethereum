import { strict as assert } from "assert";
import type {
  GroupIndeterminate,
  Address,
  PrivateKey,
  Raw,
  AccountProps,
  GroupLower,
  UserLower,
  EnvAccountNameShortened,
  EnvAccountValue,
  UserIndeterminate,
  Source,
  BalanceOptional,
} from "./types";
import { TwoLevelMap } from "./two-level-map";

/**
 * Parses account information as 2 tiered data
 *
 * @example
 * Think of the line:
 * ```bash
 * ACCOUNT_LOCAL_DEPLOYER="address:privateKey:balance"
 * ```
 * This class parses this data in the following ways:
 * ```ts
 * {
 *   "local": {
 *      "deployer": {
 *        "address": "..."
 *        "privateKey": "..."
 *        "balance": "..."
 *      }
 *    }
 * }
 * ```
 * Note that `local` and `deployer` are now lowercase. Also note that the
 * class parses `address`, `privateKey`, and `balance` in the order given.
 *
 * The class also makes a parse with the encapsulation order reversed, with
 * `deployer` outside and `local` inside.
 */
export class EnvParser {
  private raw: Raw = new Map<EnvAccountNameShortened, EnvAccountValue>();
  private source: Source;
  private parsed = false;
  private readonly groupUserProps = new TwoLevelMap<
    GroupLower,
    UserLower,
    AccountProps
  >();
  private readonly userGroupProps = new TwoLevelMap<
    UserLower,
    GroupLower,
    AccountProps
  >();

  /**
   * Instantiates the EnvParser class
   * @param source default source is `process.env`. But you can set any other
   * data source you prefer as long as it has the same shape as .env
   */
  constructor(source: Source = process.env) {
    this.source = source;
  }

  /**
   * Returns the keys from `process.env` that start with the `prefix` given
   * during `parse` command.
   * @returns array of environment variable keys with the prefix removed.
   */
  public getRawAccountKeys(): EnvAccountNameShortened[] {
    return Array.from(this.getRaw().keys());
  }

  /**
   * Returns the lowercase versions of the group names that were found in
   * the source during parsing.
   * @returns lowercase string array of group names
   */
  public getGroups(): GroupLower[] {
    const groups = this.getGroupMap();
    return Object.keys(groups) as GroupLower[];
  }

  /**
   * Returns the provided group's users that were found in the source
   * @param group group name for which to return the users
   * @returns lowercase string array of user names
   */
  public getGroupUsers(group: GroupIndeterminate): UserLower[] {
    const groupLower = group.toLowerCase() as GroupLower;
    return this.getGroupMap().getL2Keys(groupLower);
  }

  /**
   * Returns the provided user's groups that were found in the source
   * @param user user for which to return the groups
   * @returns lowercase string array of group names
   */
  public getUserGroups(user: UserIndeterminate): GroupLower[] {
    const userLower = user.toLowerCase() as UserLower;
    return this.getUserMap().getL2Keys(userLower);
  }

  /**
   * Returns a map object that contains the raw data from which all other
   * maps are computed
   * @returns map object populated with source data that fit the prefix check
   */
  public getRaw(): Raw {
    assert(!!this.raw, "Cannot call before parse");
    return this.raw;
  }

  /**
   * Returns a map object that has the following nesting:
   * ```
   * group => user => account props
   * ```
   * @returns nested map object that has group name as level one
   */
  public getGroupMap(): TwoLevelMap<GroupLower, UserLower, AccountProps> {
    assert(!!this.raw, "cannot call before parse");
    return this.groupUserProps;
  }

  /**
   * Returns a map object that has the following nesting:
   * ```
   * user => group => account props
   * ```
   * @returns a nested map object that has the user name as level one
   */
  public getUserMap(): TwoLevelMap<UserLower, GroupLower, AccountProps> {
    assert(!!this.raw, "cannot call before parse");
    return this.userGroupProps;
  }

  /**
   * Parses the specified source, using the param `prefix` to test keys
   * @param prefix the prefix string that is used for testing source keys
   * @returns this
   */
  public parse(prefix: string): this {
    this.parseRaw(prefix);
    this.parseMaps();
    this.parsed = true;
    return this;
  }

  /**
   * Returns a boolean indicating whether the parsing has happened. This
   * is useful for scripts that need to know whether the parser has done its
   * work.
   * @returns true indicating that the parsing has been completed
   */
  public isParsed(): boolean {
    return this.parsed;
  }

  /**
   * Throws an error if the parsing has not been done at the time of execution
   */
  public checkIfParsed(): void | never {
    if (!this.parsed) {
      throw new Error("call before parsed");
    }
  }

  /**
   * Parses the source object to populate `raw`
   * @param prefix prefix used for testing source keys
   * @returns this
   */
  private parseRaw(prefix: string): this {
    Object.entries(this.source).forEach(([rawKey, rawValue]) => {
      if (!rawValue) {
        return;
      }
      if (!rawKey.startsWith(prefix)) {
        return;
      }
      const account = rawKey.slice(prefix.length) as EnvAccountNameShortened;
      const value = rawValue as EnvAccountValue;
      this.raw.set(account, value);
    });
    return this;
  }

  /**
   * Parses the two-level map data by using the raw parse
   */
  private parseMaps(): void {
    this.getRaw().forEach((value, key) => {
      const [group, user] = EnvParser.parseEnvAccountNameShortened(key);
      const props = EnvParser.parseEnvAccountValue(value);
      this.userGroupProps.addOne(user, group, props);
      this.groupUserProps.addOne(group, user, props);
    });
  }

  /**
   * Receives the shortened account key, that is the key without the
   * `prefix` attached. Splits the given input into the data as
   * `group` and `user`
   * @param envAccountName shortened account name key
   * @returns group and user lowercase strings as a tuple
   */
  private static parseEnvAccountNameShortened(
    envAccountName: EnvAccountNameShortened
  ): [GroupLower, UserLower] {
    const separator = "_";
    const [group, user] = envAccountName.toLowerCase().split(separator) as [
      GroupLower,
      UserLower
    ];
    return [group, user];
  }

  /**
   * Parses the environment variable value as an object
   * @param value environment variable value
   * @returns privateKey, address, balance as an object
   */
  private static parseEnvAccountValue(value: EnvAccountValue): AccountProps {
    const divider = ":";
    const [address, privateKey, balance] = value.split(divider) as [
      Address,
      PrivateKey,
      BalanceOptional
    ];
    return {
      privateKey,
      address,
      balance,
    };
  }
}
