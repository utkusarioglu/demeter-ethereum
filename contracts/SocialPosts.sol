// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

/**
 * This contract holds posts as NFTs for the Demeter project
 * Please refer to https://github.com/utkusarioglu/demeter-ethereum
 *
 * @title Social Posts contract for Demeter project
 * @author Utku Sarioglu <utkusarioglu@hotmail.com>
 * @notice This contract is at pre-alpha stage
 */
contract SocialPosts is ERC721URIStorageUpgradeable {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  struct PostContent {
    address creator;
    string uri;
    bool retired;
  }
  CountersUpgradeable.Counter private _tokenIds;
  mapping(uint256 => bool) private _retiredMap;
  uint256[] private _postsList;
  bytes8 public constant version = "1.0.0";

  event NewPost(
    uint256 indexed postId,
    address indexed creator,
    string uri,
    string indexed title,
    string content
  );

  /**
   * Creates a new post on behalf of the sender. The function emits
   * `NewPost` event upon successful transaction
   * @param _uri uri for the post's rich media content
   * @param title posts's title
   * @param content post's content
   * @dev
   *   - The function cannot be invoked by anything other than EOAs.
   *   - The function has upper and lower limits on the lengths of
   *     uri, title, and content
   */
  function createPost(
    string memory _uri,
    string calldata title,
    string calldata content
  ) external {
    require(msg.sender == tx.origin, "external_contract_call_not_allowed");
    require(bytes(_uri).length > 10, "uri_too_short");
    require(bytes(_uri).length < 50, "uri_too_long");
    require(bytes(title).length > 0, "title_too_short");
    require(bytes(title).length <= 100, "title_too_long");
    require(bytes(content).length > 0, "content_too_short");
    require(bytes(content).length <= 1000, "content_too_long");

    _tokenIds.increment();
    uint256 _postId = _tokenIds.current();
    _mint(msg.sender, _postId);
    _setTokenURI(_postId, _uri);
    _postsList.push(_postId);
    emit NewPost(_postId, msg.sender, _uri, title, content);
  }

  /**
   * Returns a PostContent struct for the post with the given `postId`
   * This is the function to call if you are intending on populating a
   * post feed
   * @param _postId id of the post to return
   * @return `PostContent` struct
   */
  function getPost(uint256 _postId) external view returns (PostContent memory) {
    return
      PostContent(ownerOf(_postId), tokenURI(_postId), _retiredMap[_postId]);
  }

  /**
   * Returns the last used post id. The algorithm is set in a way such
   * that this number also tells how many posts the contract holds. This allows
   * the consumer to use the return of this function as the upper bound for
   * post feed pagination
   */
  function getLastPostId() external view returns (uint256) {
    return _tokenIds.current();
  }

  /**
   * Upgradeable contract initializer function
   */
  function initialize() public initializer {
    __ERC721_init("SocialPosts", "SP");
  }
}
