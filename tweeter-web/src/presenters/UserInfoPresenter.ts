import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";

export interface userInfoView {
  setIsFollower: (value: boolean) => void;
  setFolloweeCount: (newCount: number) => void;
  setFollowerCount: (newCount: number) => void;
  displayErrorMessage: (message: string) => void;
  displayInfoMessage: (message: string, duration: number) => void;
  clearLastInfoMessage: () => void;
}

export class UserInfoPresenter {
  private view: userInfoView;
  private followService: FollowService;

  constructor(view: userInfoView) {
    this.view = view;
    this.followService = new FollowService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    try {
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
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to determine follower status because of exception: ${error}`
      );
    }
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    try {
      this.view.setFolloweeCount(
        await this.followService.getFolloweeCount(authToken, displayedUser)
      );
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followees count because of exception: ${error}`
      );
    }
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    try {
      this.view.setFollowerCount(
        await this.followService.getFollowerCount(authToken, displayedUser)
      );
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followers count because of exception: ${error}`
      );
    }
  }

  public async followDisplayedUser(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    try {
      this.view.displayInfoMessage(`Following ${displayedUser!.name}...`, 0);

      const [followerCount, followeeCount] = await this.followService.follow(
        authToken!,
        displayedUser!
      );

      this.view.setIsFollower(true);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to follow user because of exception: ${error}`
      );
    } finally {
      this.view.clearLastInfoMessage();
    }
  }

  public async unfollowDisplayedUser(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    try {
      this.view.displayInfoMessage(`Unfollowing ${displayedUser!.name}...`, 0);

      const [followerCount, followeeCount] = await this.followService.unfollow(
        authToken!,
        displayedUser!
      );

      this.view.setIsFollower(false);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to unfollow user because of exception: ${error}`
      );
    } finally {
      this.view.clearLastInfoMessage();
    }
  }
}
