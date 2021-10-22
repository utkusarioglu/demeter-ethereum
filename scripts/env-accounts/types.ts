import type { Bnf } from "brands-and-flavors";

/**
 * Brand for shortened version of the env account keys.
 * Shortened versions of the keys do not include envPrefix string.
 * This type represents uppercase keys
 */
export type EnvAccountNameShortened = Bnf<
  string,
  "env-account-name-shortened",
  true
>;
/**
 * Brand for shortened version of the env account keys.
 * Shortened versions of the keys do not include envPrefix string.
 * This type represents indeterminate casing.
 */
export type EnvAccountNameShortenedIndeterminate = Bnf<
  string,
  "env-account-name-shortened-indeterminate"
>;

/**
 * Brand for representing the values of the account environment variables
 */
export type EnvAccountValue = Bnf<string, "env-account-value", true>;

/**
 * Map object inside the EnvParser method.
 */
export type Raw = Map<EnvAccountNameShortened, EnvAccountValue>;

/**
 * Represents EnvAccounts source object. This object is likely
 * `process.env` but it can be any other object with the same structure.
 */
export type Source = Record<string, string | undefined>;

// Group name related types
export type GroupLower = Bnf<string, "group-lowercase", true>;
export type GroupIndeterminate = Bnf<string, "group-indeterminate">;

// User name related types
export type UserIndeterminate = Bnf<string, "user-indeterminate">;
export type UserLower = Bnf<string, "user-lowercase", true>;
export type UsersLower = UserLower[];

// Account prop related types
export type PrivateKey = Bnf<string, "private-key", true>;
export type Address = Bnf<string, "address", true>;
export type BalanceOptional = Bnf<string | undefined, "balance", true>;
/**
 * The parsed versions of the account properties in the source file.
 * `balance` may be populated by EnvAccounts if it's not present in .env
 */
export type AccountProps = {
  privateKey: PrivateKey;
  address: Address;
  balance: BalanceOptional;
};

// Network name related types
export type NetworkLower = Bnf<string, "network-lower", true>;
export type NetworkIndeterminate = Bnf<string, "network-indeterminate">;

export type UserGroupProps = Record<
  UserLower,
  Record<GroupLower, AccountProps>
>;

// Todo this type may be useless
export type Levels = UserLower | GroupLower;
/**
 * Represent a single key value pair of a the .env object
 */
export type EnvKeyValuePair = Record<string, string>;

/**
 * Map object inside the TwoLevelMap class
 */
export type TwoLevelMapRaw<L1, L2, D> = Map<L1, Map<L2, D>>;
