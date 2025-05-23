import { Status, StatusDto, UserDto, User } from "tweeter-shared";
import { AuthDAO } from "../../dataaccess/auth/AuthDAO";
import { UserDAO } from "../../dataaccess/user/UserDAO";
import { Service } from "./Service";
import { StoryDAO } from "../../dataaccess/story/StoryDAO";
import { FeedDAO } from "../../dataaccess/feed/FeedDAO";
import { FollowDAO } from "../../dataaccess/follows/FollowDAO";
import { BadRequest } from "../../Error/BadRequest";
import { Post } from "../../dataaccess/Post";

export class StatusService extends Service {
  private storyDAO: StoryDAO;
  private feedDAO: FeedDAO;
  private followDAO: FollowDAO;

  public constructor(
    userDAO: UserDAO,
    authDAO: AuthDAO,
    storyDAO: StoryDAO,
    feedDAO: FeedDAO,
    followDAO: FollowDAO
  ) {
    super(userDAO, authDAO);
    this.storyDAO = storyDAO;
    this.feedDAO = feedDAO;
    this.followDAO = followDAO;
  }

  public async loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[StatusDto[], boolean]> {
    const lastItemDto = lastItem?.dto ?? null;
    return this.loadMoreItems(
      token,
      userAlias,
      pageSize,
      lastItem,
      async () => {
        return this.storyDAO.getPageOfStoryItems(
          userAlias,
          pageSize,
          lastItem?.dto
        );
      }
    );
  }

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[StatusDto[], boolean]> {
    return await this.loadMoreItems(
      token,
      userAlias,
      pageSize,
      lastItem,
      async () => {
        return await this.feedDAO.getPageOfFeedItems(
          userAlias,
          pageSize,
          lastItem?.dto
        );
      }
    );
  }

  public async postStatusToStory(
    token: string,
    newStatus: Status
  ): Promise<void> {
    console.log("Starting postStatus...");
    console.log("Token received:", token);
    console.log("New status received:", newStatus);

    await this.tryRequest(async () => {
      console.log("Attempting to verify authentication...");
      await this.verifyAuth(token);
      console.log("Authentication verified successfully.");

      console.log("Adding new status to the story table...");
      await this.storyDAO.putStatus(newStatus);
      console.log("New status added to the story table.");
    }, "Failed to post status");

    console.log("postStatus completed successfully.");
    return;
  }

  public async postStatusToFeed(
    newStatus: Status,
    followerAliases: string[]
  ): Promise<void> {
    console.log("Starting postStatusToFeed...");
    console.log("New status received:", newStatus);

    await this.tryRequest(async () => {
      // all of this is for getting it to other feeds
      console.log("Fetching alias for the given token...");
      const alias = newStatus.user.alias;
      // const alias = await this.authDAO.getAlias(token);
      console.log("Alias fetched:", alias);

      if (!alias) {
        console.error("Alias does not exist for the provided token.");
        throw new BadRequest("Alias does not exist");
      }

      // console.log(`Fetching all followers for alias: ${alias}...`);
      // // make sure this is actualyl able to get 10k followers
      // // right now it can only get 50
      // const followerAliases = await this.followDAO.getAllFollowers(alias);
      // console.log(`Followers fetched for alias ${alias}:`, followerAliases);

      console.log(`Uploading status to follower feeds for alias: ${alias}...`);
      await this.feedDAO.uploadToFollowerFeeds(
        alias,
        followerAliases,
        newStatus
      );
      console.log(
        `Successfully uploaded status to follower feeds for alias: ${alias}.`
      );
    }, "Failed to post status");

    console.log("postStatus completed successfully.");
    return;
  }

  private async loadMoreItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
    getItems: (
      alias: string,
      pageSize: number,
      lastItem?: StatusDto
    ) => Promise<[Post[], boolean]>
  ): Promise<[StatusDto[], boolean]> {
    return this.tryRequest(async () => {
      console.log("--- In loadMoreItems first line");
      console.log(`These are the variables
        token: ${token}, userAlias: ${userAlias}, pageSize: $${pageSize},
        lastItem: ${lastItem ? lastItem : "items not defined"}`);
      await this.verifyAuth(token);

      // query story table for a number of statuses
      let posts: Post[] = [];
      let statuses: StatusDto[] = [];
      let hasMore = false;
      const result = await getItems(userAlias, pageSize, lastItem?.dto);
      if (result) {
        console.log("In loadMoreitems, have already called getItems.");
        console.log("This is the result: ", result);
        [posts, hasMore] = result;
      }
      console.log(`In loadMoreitems, this is posts: ${JSON.stringify(posts)}, 
        and this is hasMore ${hasMore}`);
      statuses = await this.getStatusDtos(posts);
      console.log("In loadMoreitems, have called getStatusDtos");
      console.log(`These are the statuses: ${statuses}`);
      return [statuses, hasMore];
    }, "Failed to load items");
  }

  // purpose is to get statusDto based on a post
  // to do that you need users
  private async getStatusDtos(posts: Post[]): Promise<StatusDto[]> {
    console.log("made it into getStatusDtos");
    console.log("This is posts:", JSON.stringify(posts));
    return await this.tryRequest(async () => {
      const aliases: string[] = posts.map((item) => item.ownerAlias);
      const uniqueAliasesSet: Set<string> = new Set(
        posts.map((item) => item.ownerAlias)
      );
      const uniqueAliases: string[] = Array.from(uniqueAliasesSet);

      console.log("About to batch get user");
      const users: UserDto[] = await this.userDAO.batchGetUser(uniqueAliases);

      const userMap: Record<string, UserDto> = {};
      users.forEach((user) => {
        userMap[user.alias] = user;
      });

      console.log("About to make statusDtos");

      const statusDtos: StatusDto[] = posts.map((post) => {
        const user = userMap[post.ownerAlias];
        if (!user) {
          throw new BadRequest(`User not found for alias: ${post.ownerAlias}`);
        }
        return new Status(post.post, User.fromDto(user)!, post.timestamp).dto;
      });

      console.log("Going to return the statuses: ", JSON.stringify(statusDtos));

      return statusDtos;
    }, "Failed to get statusDtos");
  }
}
