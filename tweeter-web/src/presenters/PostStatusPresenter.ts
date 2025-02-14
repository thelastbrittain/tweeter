import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";

export interface postStatusView {
  displayInfoMessage: (message: string, duration: number) => void;
  setPost: (post: string) => void;
  displayErrorMessage: (message: string) => void;
  clearLastInfoMessage: () => void;
}
export class PostStatusPresenter {
  private view: postStatusView;
  private statusService: StatusService;

  constructor(view: postStatusView) {
    this.view = view;
    this.statusService = new StatusService();
  }
  public async submitPost(
    authToken: AuthToken,
    post: string,
    currentUser: User | null
  ) {
    try {
      this.view.displayInfoMessage("Posting status...", 0);

      const status = new Status(post, currentUser!, Date.now());

      await this.statusService.postStatus(authToken!, status);

      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`
      );
    } finally {
      this.view.clearLastInfoMessage();
    }
  }
}
