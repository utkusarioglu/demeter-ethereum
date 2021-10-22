// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "../SocialPosts.sol";

/**
 * This contract exists as a stand-in for any on-chain contract that
 * could try to call `SocialPosts.createPost`. The `SocialPosts`
 * contract is set to revert transaction from other contracts
 */
contract SocialPostsMockCaller {
  SocialPosts private _socialPosts;

  constructor(address _socialPostsAddress) {
    _socialPosts = SocialPosts(_socialPostsAddress);
  }

  function tryCreatePost() external payable {
    _socialPosts.createPost("u", "t", "c");
  }
}
