// import { BadRequest } from "../../Error/BadRequest";
// import { Service } from "./Service";

// export abstract class ItemService extends Service {
//   protected async loadMoreItems<T>(
//     token: string,
//     userAlias: string,
//     pageSize: number,
//     lastItem: string | null,
//     getPageOfItems: (
//       userAlias: string,
//       pageSize: number,
//       lastItem: string | null
//     ) => Promise<[string[], boolean]>,
//     queryMethod: (items: string) => Promise<[T[]]>
//   ): Promise<[T[], boolean]> {
//     return await this.tryRequest(async () => {
//       await this.verifyAuth(token);

//       const result = await getPageOfItems(
//         userAlias,
//         pageSize,
//         lastItem ?? null
//       );
//       if (!result) {
//         throw new BadRequest("There are no more followees");
//       }
//       const [, hasMore] = result;
//       const items: T[] = await queryMethod(items);
//       this.userDAO.batchGetUser(items);
//       return [items, hasMore];
//     }, "Failed to load more followers");
//   }
// }
