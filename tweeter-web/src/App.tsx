import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import useUserInfo from "./components/userInfo/UserInfoHook";
import { FolloweePresenter } from "./presenters/userItemPresenters/FolloweePresenter";
import { FollowerPresenter } from "./presenters/userItemPresenters/FollowerPresenter";
import { FeedItemPresenter } from "./presenters/statusItemPresenters/FeedItemPresenter";
import { StoryItemPresenter } from "./presenters/statusItemPresenters/StoryItemPresenter";
import ItemScroller from "./components/mainLayout/ItemScroller";
import { Status, User } from "tweeter-shared";
import { StatusService } from "./model/service/StatusService";
import { PagedItemView } from "./presenters/PagedItemPresenter";
import StatusItem from "./components/statusItem/StatusItem";
import UserItem from "./components/userItem/UserItem";
import { FollowService } from "./model/service/FollowService";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/feed" />} />
        <Route
          path="feed"
          element={
            <ItemScroller<Status, StatusService>
              key={1}
              presenterGenerator={(view: PagedItemView<Status>) =>
                new FeedItemPresenter(view)
              }
              itemComponentGenerator={(item: Status) => {
                return <StatusItem status={item} />;
              }}
            />
          }
        />
        <Route
          path="story"
          element={
            <ItemScroller<Status, StatusService>
              key={2}
              presenterGenerator={(view: PagedItemView<Status>) =>
                new StoryItemPresenter(view)
              }
              itemComponentGenerator={(item: Status) => {
                return <StatusItem status={item} />;
              }}
            />
          }
        />
        <Route
          path="followees"
          element={
            <ItemScroller<User, FollowService>
              key={3}
              presenterGenerator={(view: PagedItemView<User>) =>
                new FolloweePresenter(view)
              }
              itemComponentGenerator={(item: User) => {
                return <UserItem value={item} />;
              }}
            />
          }
        />
        <Route
          path="followers"
          element={
            <ItemScroller<User, FollowService>
              key={4}
              presenterGenerator={(view: PagedItemView<User>) =>
                new FollowerPresenter(view)
              }
              itemComponentGenerator={(item: User) => {
                return <UserItem value={item} />;
              }}
            />
            // <UserItemScroller
            //   key={2}
            //   presenterGenerator={(view: UserItemView) =>
            //     new FollowerPresenter(view)
            //   }
            // />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/feed" />} />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
