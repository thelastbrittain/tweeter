import { AuthToken, FakeData, User } from "tweeter-shared";
import useToastListener from "../toaster/ToastListenerHook";
import useUserInfo from "../userInfo/UserInfoHook";
import {
  userNavHookPresenter,
  userNavHookView,
} from "../../presenters/userNavHookPresenter";

const useNavigateToUser = () => {
  const { setDisplayedUser, currentUser, authToken } = useUserInfo();
  const { displayErrorMessage } = useToastListener();

  const listener: userNavHookView = {
    setDisplayedUser: setDisplayedUser,
    displayErrorMessage: displayErrorMessage,
  };

  const presenter = new userNavHookPresenter(listener);

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();
    presenter.navToUser(authToken!, event.target.toString(), currentUser!);
  };

  return navigateToUser;
};

export default useNavigateToUser;
