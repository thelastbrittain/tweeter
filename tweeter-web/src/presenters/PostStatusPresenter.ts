import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { infoMessageView, Presenter } from "./Presenter";
export interface PostStatusView extends infoMessageView {
  setPost: (post: string) => void;
}
export class PostStatusPresenter extends Presenter<PostStatusView> {
  private _statusService: StatusService;

  constructor(view: PostStatusView) {
    super(view);
    this._statusService = new StatusService();
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

  public get statusService() {
    return this._statusService;
  }
}
