import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { infoMessageView, Presenter } from "./Presenter";
export interface postStatusView extends infoMessageView {
  setPost: (post: string) => void;
}
export class PostStatusPresenter extends Presenter<postStatusView> {
  private statusService: StatusService;

  constructor(view: postStatusView) {
    super(view);
    this.statusService = new StatusService();
  }
  public async submitPost(
    authToken: AuthToken,
    post: string,
    currentUser: User | null
  ) {
    this.view.displayInfoMessage("Posting status...", 0);
    await this.doFailureReportingOperation(async () => {
      const status = new Status(post, currentUser!, Date.now());
      await this.statusService.postStatus(authToken!, status);
      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
    }, "post the status");

    this.view.clearLastInfoMessage();
  }
}
