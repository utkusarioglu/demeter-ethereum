import chai from "chai";
import { getNamedAccounts, ethers, upgrades, config } from "hardhat";
import { solidity } from "ethereum-waffle";
chai.use(solidity);
const { expect } = chai;
import type { SocialPosts } from "../artifacts/types/SocialPosts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import errors from "../errors";

let socialPostsDeployer: SocialPosts;
let socialPostsUser1: SocialPosts;
let deployer: string;
let user1: string;
let user1Signer: SignerWithAddress;

// These are useful for a bunch of tuples that are used in tests
type s = string;
type PostArgs = [s, s, s];

describe("SocialPosts", () => {
  beforeEach(async () => {
    const namedAccounts = await getNamedAccounts();
    deployer = namedAccounts.deployer;
    user1 = namedAccounts.user1;
    const signers = await ethers.getSigners();
    user1Signer = signers[1];
    const SocialPostsFactoryDeployer = await ethers.getContractFactory(
      "SocialPosts"
    );
    socialPostsDeployer = (await upgrades.deployProxy(
      SocialPostsFactoryDeployer
    )) as SocialPosts;
    await socialPostsDeployer.deployed();
    socialPostsUser1 = socialPostsDeployer.connect(user1Signer);
  });

  describe("initialize", async () => {
    /**
     * The NFT shall have the symbol `SP`
     */
    describe("symbol assignment", () => {
      it("from: deployer", async () => {
        expect(await socialPostsDeployer.symbol()).to.equal("SP");
      });
    });

    /**
     * The NFT shall have the name `SocialPosts`
     */
    describe("name assignment", () => {
      it("from: deployer", async () => {
        expect(await socialPostsDeployer.name()).to.equal("SocialPosts");
      });
    });
  });

  describe("createPost", () => {
    /**
     * The input values of the function has some lower limit.
     * This test checks the behavior of the function at the lower
     * accepted limits
     */
    describe("happy @ low limits", () => {
      const postArgs: PostArgs = ["u".repeat(11), "t", "c"];

      it("from: deployer", async () => {
        expect(socialPostsDeployer.createPost(...postArgs))
          .to.emit(socialPostsDeployer, "NewPost")
          .withArgs(1, deployer, ...postArgs);
      });

      it("from: user1", async () => {
        expect(socialPostsUser1.createPost(...postArgs))
          .to.emit(socialPostsDeployer, "NewPost")
          .withArgs(1, user1, ...postArgs);
      });
    });

    /**
     * The input values of the function has some upper limits
     * This test checks the behavior of the function at the higher
     * accepted limits
     */
    describe("happy @ high limits", () => {
      const postArgs: PostArgs = [
        "u".repeat(49),
        "t".repeat(100),
        "c".repeat(1000),
      ];

      it("from: deployer", async () => {
        expect(socialPostsDeployer.createPost(...postArgs))
          .to.emit(socialPostsDeployer, "NewPost")
          .withArgs(1, deployer, ...postArgs);
      });

      it("from: user1", async () => {
        expect(socialPostsUser1.createPost(...postArgs))
          .to.emit(socialPostsUser1, "NewPost")
          .withArgs(1, user1, ...postArgs);
      });
    });

    /**
     * Checks whether the function reverts if the given uri for the NFT is
     * shorter than what's allowed
     */
    describe("error: uri_too_short @ high limit", () => {
      const postArgs: PostArgs = ["t".repeat(10), "t", "c"];

      it("from: deployer", async () => {
        expect(socialPostsDeployer.createPost(...postArgs)).to.revertedWith(
          "uri_too_short"
        );
      });

      it("from: user1", async () => {
        expect(socialPostsUser1.createPost(...postArgs)).to.revertedWith(
          "uri_too_short"
        );
      });
    });

    /**
     * Checks whether the function reverts if the given uri for the NFT is
     * longer than what's allowed
     */
    describe("error: uri_too_long @ low limit", () => {
      const postArgs: PostArgs = [
        "u".repeat(101),
        "t".repeat(1),
        "c".repeat(1),
      ];

      it("from: deployer", async () => {
        expect(socialPostsDeployer.createPost(...postArgs)).to.revertedWith(
          "uri_too_long"
        );
      });

      it("from: user1", async () => {
        expect(socialPostsUser1.createPost(...postArgs)).to.revertedWith(
          "uri_too_long"
        );
      });
    });

    /**
     * The title attribute cannot have 0 length. This test checks whether
     * the function reverts at the highest illegal length, which is 0
     * with the current settings
     */
    describe("error: title_too_short @ high limit", () => {
      const postArgs: PostArgs = ["u".repeat(11), "", "c".repeat(11)];

      it("from: deployer", async () => {
        expect(socialPostsDeployer.createPost(...postArgs)).to.revertedWith(
          "title_too_short"
        );
      });

      it("from: user1", async () => {
        expect(socialPostsUser1.createPost(...postArgs)).to.revertedWith(
          "title_too_short"
        );
      });
    });

    /**
     * Checks if the function reverts if the title param is longer than
     * max allowed title length
     */
    describe("error: title_too_long @ low limit", () => {
      const postArgs: PostArgs = [
        "u".repeat(11),
        "t".repeat(101),
        "c".repeat(10),
      ];

      it("from: deployer", async () => {
        expect(socialPostsDeployer.createPost(...postArgs)).to.revertedWith(
          "title_too_long"
        );
      });

      it("from: user1", async () => {
        expect(socialPostsUser1.createPost(...postArgs)).to.revertedWith(
          "title_too_long"
        );
      });
    });

    /**
     * Checks whether the function reverts if the `content` param is
     * shorter than the min allowed length. This test is done at the
     * highest possible illegal length with the current settings of the
     * contract. Which is 0.
     */
    describe("error: content_too_short @ high limit", () => {
      const postArgs: PostArgs = ["u".repeat(11), "t", ""];

      it("from: deployer", async () => {
        expect(socialPostsDeployer.createPost(...postArgs)).to.revertedWith(
          "content_too_short"
        );
      });

      it("from: user1", async () => {
        expect(socialPostsUser1.createPost(...postArgs)).to.revertedWith(
          "content_too_short"
        );
      });
    });

    /**
     * Checks whether the function reverts at the lowest possible illegal
     * content length
     */
    describe("error: content_too_long @ low limit", () => {
      const postArgs: PostArgs = ["u".repeat(11), "t", "c".repeat(1001)];

      it("from: deployer", async () => {
        expect(socialPostsDeployer.createPost(...postArgs)).to.revertedWith(
          "content_too_long"
        );
      });

      it("from: user1", async () => {
        expect(socialPostsUser1.createPost(...postArgs)).to.revertedWith(
          "content_too_long"
        );
      });
    });

    /**
     * This function isn't allowed to be called by any other on chain
     * contract. This function ensures that the function reverts if such
     * a call occurs
     */
    describe("error: external_contract_call_not_allowed", () => {
      it("from: deployer", async () => {
        const SocialPostsMockCaller = await ethers.getContractFactory(
          "SocialPostsMockCaller"
        );
        const socialPostsMockCaller = await SocialPostsMockCaller.deploy(
          socialPostsDeployer.address
        );
        await socialPostsMockCaller.deployed();
        expect(socialPostsMockCaller.tryCreatePost()).to.be.revertedWith(
          "external_contract_call_not_allowed"
        );
      });

      it("from: user1", async () => {
        const SocialPostsMockCaller = await ethers.getContractFactory(
          "SocialPostsMockCaller",
          user1Signer
        );
        const socialPostsMockCaller = await SocialPostsMockCaller.deploy(
          socialPostsUser1.address
        );
        await socialPostsMockCaller.deployed();
        expect(socialPostsMockCaller.tryCreatePost()).to.be.revertedWith(
          "external_contract_call_not_allowed"
        );
      });
    });
  });

  describe("getPost", () => {
    /**
     * Checks if the `getPost` function returns the same data as the emitted
     * by `NewPost` event
     */
    describe("happy @ event", () => {
      const postArgs: PostArgs = ["u".repeat(11), "t", "c"];

      // #1: `postId` is at position 0 in struct PostContent
      it("from: deployer", async () => {
        const tx = await socialPostsDeployer.createPost(...postArgs);
        const receipt = await tx.wait();
        const newPostLogParsed = receipt.logs
          .map((log) => socialPostsDeployer.interface.parseLog(log))
          .find((log) => log.name === "NewPost");
        if (!newPostLogParsed) {
          throw new Error(errors.TESTING_EVENT_SHOULD_HAVE_RETURNED_POST);
        }
        const postContent = await socialPostsDeployer.getPost(
          ethers.BigNumber.from(newPostLogParsed.args[0]) // #1
        );
        expect(postContent[0]).to.equal(deployer);
        expect(postContent[1]).to.equal(postArgs[0]);
        expect(postContent[2]).to.equal(false);
      });

      // #1: `postId` is at position 0 in struct PostContent
      it("from: user1", async () => {
        const tx = await socialPostsUser1.createPost(...postArgs);
        const receipt = await tx.wait();
        const newPostLogParsed = receipt.logs
          .map((log) => socialPostsUser1.interface.parseLog(log))
          .find((log) => log.name === "NewPost");
        if (!newPostLogParsed) {
          throw Error(errors.TESTING_EVENT_SHOULD_HAVE_RETURNED_POST);
        }
        const postContent = await socialPostsUser1.getPost(
          ethers.BigNumber.from(newPostLogParsed.args[0]) // #1
        );
        expect(postContent[0]).to.equal(user1);
        expect(postContent[1]).to.equal(postArgs[0]);
        expect(postContent[2]).to.equal(false);
      });
    });
  });

  describe("version", () => {
    /**
     * Checks if the contract is uploaded with the intended version
     */
    describe("happy (get)", () => {
      const expected = ethers.utils
        .hexlify(ethers.utils.toUtf8Bytes("1.0.0"))
        .padEnd(2 + 8 * 2, "0");

      it("from: deployer", async () => {
        expect(await socialPostsDeployer.version()).to.equal(expected);
      });

      it("from: user1", async () => {
        expect(await socialPostsUser1.version()).to.equal(expected);
      });
    });

    // TODO write a test that checks whether the variable is set as constant
  });

  /**
   * Checks whether the contract uses a deterministic postId.
   * This value will be used by the feed to pull posts while emulating
   * pagination
   */
  describe("getLastPostId", () => {
    describe("happy", () => {
      const count = 10;
      let posts: Promise<unknown>[];

      beforeEach(async () => {
        posts = Array(count)
          .fill(undefined)
          .map((_, i) => {
            return socialPostsUser1.createPost(
              i.toString().padStart(11),
              "t",
              "c"
            );
          });
        await Promise.all(posts);
      });

      it("from: deployer", async () => {
        expect(await socialPostsDeployer.getLastPostId()).to.equal(count);
      });

      it("from: user1", async () => {
        expect(await socialPostsUser1.getLastPostId()).to.equal(count);
      });
    });
  });

  describe("indexing", () => {
    describe("happy", () => {
      const deployerPostsCount = 10;
      const user1PostsCount = 11;
      let posts: Promise<unknown>[] = [];

      const pushBy = (
        posts: Promise<unknown>[],
        pusher: SocialPosts,
        count: number
      ) => {
        posts.push(
          ...Array(count)
            .fill(undefined)
            .map((_, i) => {
              return pusher.createPost(i.toString().padStart(11), `t${i}`, "c");
            })
        );
      };

      beforeEach(async () => {
        pushBy(posts, socialPostsDeployer, deployerPostsCount);
        pushBy(posts, socialPostsUser1, user1PostsCount);
        await Promise.all(posts);
      });

      /**
       * Checks whether `postId` is indexed in `NewPost` event
       */
      it("by postId", async () => {
        const filtered = await socialPostsUser1.queryFilter(
          socialPostsUser1.filters["NewPost"](ethers.BigNumber.from("1"))
        );
        expect(filtered.length).to.equal(1);
      });

      /**
       * Checks whether `creator` is indexed in `NewPost` event
       */
      it("by creator", async () => {
        const deployerFiltered = await socialPostsDeployer.queryFilter(
          socialPostsDeployer.filters["NewPost"](null, deployer)
        );
        const user1filtered = await socialPostsUser1.queryFilter(
          socialPostsUser1.filters["NewPost"](null, user1)
        );
        expect(deployerFiltered.length).to.equal(deployerPostsCount);
        expect(user1filtered.length).to.equal(user1PostsCount);
      });

      /**
       * Checks whether `title` is indexed in `NewPost` event
       */
      it("by title", async () => {
        const deployerFiltered4 = await socialPostsDeployer.queryFilter(
          socialPostsDeployer.filters["NewPost"](null, null, null, "t4")
        );
        const user1filtered4 = await socialPostsUser1.queryFilter(
          socialPostsUser1.filters["NewPost"](null, null, null, "t4")
        );
        const deployerFiltered11 = await socialPostsDeployer.queryFilter(
          socialPostsDeployer.filters["NewPost"](null, null, null, "t10")
        );
        const user1filtered11 = await socialPostsUser1.queryFilter(
          socialPostsUser1.filters["NewPost"](null, null, null, "t10")
        );
        expect(deployerFiltered4.length).to.equal(2);
        expect(user1filtered4.length).to.equal(2);
        expect(deployerFiltered11.length).to.equal(1);
        expect(user1filtered11.length).to.equal(1);
      });
    });
  });
});
