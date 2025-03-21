import { Type } from "../domain/PostSegment";

export interface PostSegmentDto {
  readonly text: string;
  readonly startPostion: number;
  readonly endPosition: number;
  readonly type: Type;
}
