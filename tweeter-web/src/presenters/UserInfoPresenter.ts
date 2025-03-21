import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { infoMessageView, Presenter } from "./Presenter";

export interface userInfoView extends infoMessageView {
  setIsFollower: (value: boolean) => void;
  setFolloweeCount: (newCount: number) => void;
  setFollowerCount: (newCount: number) => void;
}

export class UserInfoPresenter extends Presenter<userInfoView> {
  private followService: FollowService;

  constructor(view: userInfoView) {
    super(view);
    this.followService = new FollowService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    await this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.followService.getIsFollowerStatus(
            authToken!,
            currentUser!,
            displayedUser!
          )
        );
      }
    }, "determine follower status");
  }

  public async setNumberAquantances(message: string, setCount: () => void) {
    await this.doFailureReportingOperation(async () => {
      await setCount();
    }, `get ${message} count`);
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    await this.setNumberAquantances("followees", async () => {
      return this.view.setFolloweeCount(
        await this.followService.getFolloweeCount(authToken, displayedUser)
      );
    });
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    await this.setNumberAquantances("followers", async () => {
      await this.view.setFollowerCount(
        await this.followService.getFollowerCount(authToken, displayedUser)
      );
    });
  }

  public async changeRelationshipDisplayedUser(
    displayedUser: User,
    nowFollowing: boolean,
    followMethod: () => Promise<[number, number]>
  ): Promise<void> {
    let regMessage: string;
    let errorMessage: string;
    nowFollowing ? (regMessage = "Following") : (regMessage = "Unfollowing");
    nowFollowing ? (errorMessage = "follow") : (errorMessage = "unfollow");

    await this.doFailureReportingOperation(async () => {
      this.view.displayInfoMessage(
        `${regMessage} ${displayedUser!.name}...`,
        0
      );
      const [followerCount, followeeCount] = await followMethod();
      this.view.setIsFollower(nowFollowing);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    }, `${errorMessage} user`);
    this.view.clearLastInfoMessage();
  }

  public async followDisplayedUser(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    this.changeRelationshipDisplayedUser(displayedUser, true, () => {
      return this.followService.follow(authToken!, displayedUser!);
    });
  }

  public async unfollowDisplayedUser(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    this.changeRelationshipDisplayedUser(displayedUser, false, () => {
      return this.followService.unfollow(authToken!, displayedUser!);
    });
  }
}
