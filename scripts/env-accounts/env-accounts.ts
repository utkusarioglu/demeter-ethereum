import { EnvParser } from "./env-parser";
import type {
  GroupIndeterminate,
  GroupLower,
  UserIndeterminate,
  AccountProps,
  UserLower,
  BalanceOptional,
  NetworkLower,
  NetworkIndeterminate,
} from "./types";
import { EnvPrefix } from "./env-prefix";
import { RequiredAccounts } from "./required-accounts";

/**
 * Provides consumer with different ways of querying account related
 * environment variables.
 */
export class EnvAccounts {
  private readonly requiredAccounts = new RequiredAccounts();
  private readonly envPrefix = new EnvPrefix();
  private readonly parser: EnvParser;
  private networkAliases = new Map<string, NetworkLower[]>();
  private defaultBalance = "1" + "0".repeat(18); // 1 Ether

  /**
   * Instantiates the class
   * @param source source object from which to read environment variables
   */
  constructor(source: NodeJS.ProcessEnv = process.env) {
    this.parser = new EnvParser(source);
  }

  /**
   * Returns true if the given group was found among source
   * @param group group for which to query
   * @returns true indicating the group was found in source
   */
  public hasGroup(group: GroupIndeterminate): boolean {
    const groupLower = group.toLowerCase() as GroupLower;
    return this.parser.getGroupMap().hasL1(groupLower);
  }

  /**
   * The class looks for a certain prefix among environment variables
   * to determine which variables will be used as account data.
   * @example
   * Setting `ACCOUNT_` as the prefix will result in every key in
   * `process.env` that starts with `ACCOUNT_` to be parsed as account data
   * @param envPrefix string to use as test prefix
   * @returns this
   */
  public setEnvPrefix(envPrefix: string): this {
    this.envPrefix.set(envPrefix);
    return this;
  }

  /**
   * Returns true if a certain `user` exists in the given `group`
   * @param group group in which to search for a user
   * @param user user for which to search
   * @returns true if the user was found in the given group
   */
  public hasGroupUser(
    group: GroupIndeterminate,
    user: UserIndeterminate
  ): boolean {
    const groupLower = group.toLowerCase() as GroupLower;
    const userLower = user.toLowerCase() as UserLower;
    return this.parser.getGroupMap().hasL2(groupLower, userLower);
  }

  /**
   * Sets the given group as a source of data for the given network names.
   * This is useful for setting named accounts. Refer to the method
   * `getUserNetworkProps` for more information.
   * @example
   * if you specify:
   * ```ts
   * envAccounts.setNetworkAlias("local", ["hardhat", "localNetwork"])
   * ```
   * This will result in `local` group's data to be set for networks `hardhat`
   * and `localNetwork` when used in tandem with the method
   * `getUserNetworkProps`.
   * ```ts
   * {
   *    "deployer": {
   *      "hardhat": "<local's data>",
   *      "localNetwork": "<local's data>"
   *    }
   * }
   * ```
   * If the consumer did not set any aliases, then the group name is used as
   * the network alias
   * @param group group from which to get data
   * @param networks array for strings to populate
   * @returns this
   */
  public setNetworkAlias(
    group: GroupIndeterminate,
    networks: NetworkIndeterminate[]
  ): this {
    const networksLower = networks.map(
      (network) => network.toLowerCase() as NetworkLower
    );
    this.networkAliases.set(group, networksLower);
    return this;
  }

  /**
   * Returns a map of network aliases that were set by the user
   * @returns map of set network aliases
   */
  public getNetworkAliases(): Map<string, NetworkLower[]> {
    return this.networkAliases;
  }

  /**
   * The class tries to read balance information from every account variable.
   * If no such data is provided, then the class uses the default balance
   * set by this method to assign a value for the account.
   * This is useful for creating `hardhat` network's accounts.
   * @param wei wei amount to set
   * @returns this
   */
  public setDefaultBalance(wei: string): this {
    this.defaultBalance = wei;
    return this;
  }

  /**
   * Returns the default balance set by the consumer
   * @returns default balance as a stringified number
   */
  public getDefaultBalance(): string {
    return this.defaultBalance;
  }

  /**
   * Your code may require certain user accounts to be always present for
   * healthy testing or deployment. The class will throw an error if the
   * names set by this account do not exist among the environment variables.
   * @warn
   * Values set by this method are case-insensitive
   * @example
   * ```ts
   * envAccounts.setRequiredAccounts("hello_kitty").setEnvPrefix("ACC_");
   * ```
   * The code above will require the variable `ACC_HELLO_KITTY` to be
   * set.
   * @param names names of required accounts
   * @returns this
   */
  public readonly setRequiredAccounts = (
    ...names: Parameters<typeof this.requiredAccounts.set>
  ) => {
    this.requiredAccounts.set(...names);
    return this;
  };

  /**
   * Starts the parsing of the environment variables once the desired
   * settings were made by the user. This is the final method you shall
   * call during initialization.
   * @returns this
   */
  public parse(): this {
    const prefix = this.envPrefix.get();
    this.parser.parse(prefix);
    this.doAfterParseChecks();
    return this;
  }

  /**
   * Runs the checks that are required for healthy functioning of the class.
   * @remarks
   * These checks include whether the pars has actualized, whether the
   * required accounts exist in the parsed data, etc.
   */
  private doAfterParseChecks() {
    this.parser.checkIfParsed();
    const accounts = this.parser.getRawAccountKeys();
    this.requiredAccounts.check(accounts);
  }

  /**
   * Retrieves a single prop for a given user in a given group.
   * @param group group in which to search
   * @param user user whose data to retrieve
   * @param prop account prop to retrieve
   * @param strict setting true will throw an error if the desired value
   * doesn't exist. Otherwise the method will silently return undefined.
   * @returns desired value or an error
   */
  public getProp(
    group: GroupIndeterminate,
    user: UserIndeterminate,
    prop: keyof AccountProps,
    strict: boolean = false
  ): AccountProps[keyof AccountProps] | undefined {
    this.parser.checkIfParsed();
    try {
      const groupLower = group.toLowerCase() as GroupLower;
      const userLower = user.toLowerCase() as UserLower;
      const data = this.parser.getGroupMap().getData(groupLower, userLower);
      let single = data[prop];
      if (single === undefined) {
        if (prop === "balance") {
          single = this.getDefaultBalance() as BalanceOptional;
        }
      }
      return single;
    } catch (e) {
      if (strict) {
        throw e;
      }
    }
  }

  /**
   * Creates an object with `user` => `network` => `prop` structure. Network
   * aliases set through the method `setNetworkAlias` are used for converting
   * group names into network names.
   * @example
   * Imagine your .env file has variables with groups `local` and `goerli`.
   * If the code is initialized with the following settings:
   * ```ts
   * const envAccounts = new EnvAccounts()
   *   .setNetworkAlias("local", ["hardhat", "localhost"])
   *   .parse();
   * const networkAccounts = envAccounts.getUserNetworkProps();
   * ```
   * This will result with the `networkAccounts`:
   * ```ts
   * {
   *    "deployer": {
   *      "hardhat": "<local's data>",
   *      "localhost": "<local's data>",
   *      "goerli": "<goerli's data>"
   *    }
   * }
   * ```
   * @remarks
   * This method is useful for casting `namedAccounts` for hardhat through the
   * command:
   * ```ts
   * envAccounts.getUserNetworkProps(({address}) => address)
   * ```
   * This results in the `address` prop being returned as a string for each
   * network.
   * @param dataCb a callback for picking particular account props by default,
   * the method will return every prop
   * @returns picked account props
   * @privateRemarks
   * The doc string for this method is very similar with the string for
   * `getNetworkUserProps`. Please reflect any relevant change in this doc
   * in that the other method as well.
   */
  public getUserNetworkProps<T>(
    dataCb: (data: AccountProps) => T = (data) => data as unknown as T
  ) {
    this.parser.checkIfParsed();
    const aliases = this.getNetworkAliases();
    const record: Record<UserLower, Record<NetworkLower, T>> = {};
    const userMap = this.parser.getUserMap().getMap();

    userMap.forEach((groupMap, user) => {
      record[user] = {};
      groupMap.forEach((data, group) => {
        const networks =
          aliases.get(group) || ([group] as unknown as [NetworkLower]);
        networks.forEach((network) => {
          record[user][network] = dataCb(data);
        });
      });
    });
    return record;
  }

  /**
   * Creates an object with `network` => `user` => `prop` structure. Network
   * aliases set through the method `setNetworkAlias` are used for converting
   * group names into network names.
   * @example
   * Imagine your .env file has variables with groups `local` and `goerli`.
   * If the code is initialized with the following settings:
   * ```ts
   * const envAccounts = new EnvAccounts()
   *   .setNetworkAlias("local", ["hardhat", "localhost"])
   *   .parse();
   * const networkAccounts = envAccounts.getUserNetworkProps();
   * ```
   * This will result with the `networkAccounts`:
   * ```ts
   * {
   *    "hardhat": {
   *      "deployer": "<local's data for deployer>",
   *      "creator": "<local's data for creator>",
   *    },
   *    "localhost": {
   *      "deployer": "<local's data for deployer>",
   *      "creator": "<local's data for creator>",
   *    },
   *    "goerli": {
   *      "deployer": "<goerli's data for deployer>"
   *      "creator": "<goerli's data for creator>",
   *    }
   * }
   * ```
   * @param dataCb a callback for picking particular account props by default,
   * the method will return every prop
   * @returns picked account props
   * @privateRemarks
   * The doc string for this method is very similar with the string for
   * `getUserNetworkProps`. Please reflect any relevant change in this doc
   * in that the other method as well.
   */
  public getNetworkUserProps<T>(
    dataCb: (data: AccountProps) => T = (data) => data as unknown as T
  ) {
    this.parser.checkIfParsed();
    const aliases = this.getNetworkAliases();
    const record: Record<NetworkLower, Record<UserLower, T>> = {};
    const groupMap = this.parser.getGroupMap().getMap();

    groupMap.forEach((userMap, group) => {
      const networks =
        aliases.get(group) || ([group] as unknown as [NetworkLower]);
      networks.forEach((network) => {
        record[network] = {};
        userMap.forEach((data, user) => {
          record[network][user] = dataCb(data);
        });
      });
    });
    return record;
  }

  /**
   * Returns the data of the given group in the array form.
   * The array will have the same order in the environment variables
   * @param group group for which to return the data array
   * @returns account props array for the given group
   */
  public groupArray(group: GroupIndeterminate): AccountProps[] {
    this.parser.checkIfParsed();
    const groupLower = group.toLowerCase() as GroupLower;
    return this.parser.getGroupMap().L2Array(groupLower);
  }
}
