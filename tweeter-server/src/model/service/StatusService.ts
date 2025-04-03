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

  public async postStatus(token: string, newStatus: Status): Promise<void> {
    await this.tryRequest(async () => {
      await this.verifyAuth(token);
      // add to story table the post
      await this.storyDAO.putStatus(newStatus);
      const alias = await this.authDAO.getAlias(token);
      if (!alias) {
        throw new BadRequest("Alias does not exist");
      }
      // get all followers
      const followerAliases = await this.followDAO.getAllFollowers(alias);
      // batch upload items to feed table
      await this.feedDAO.uploadToFollowerFeeds(
        alias,
        followerAliases,
        newStatus
      );
    }, "Failed to post status");
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
