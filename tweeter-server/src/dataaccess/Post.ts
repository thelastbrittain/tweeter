export interface Post {
  ownerAlias: string;
  timestamp: number;
  post: string;
  followerAlias: string | null;
}
