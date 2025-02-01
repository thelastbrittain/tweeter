import { Status, Type } from "tweeter-shared";
import { Link } from "react-router-dom";
import useNavigateToUser from "../useNavigationHook/useNavigationHook";

interface Props {
  status: Status;
}

const Post = (props: Props) => {
  return (
    <>
      {props.status.segments.map((segment, index) =>
        segment.type === Type.alias ? (
          <Link
            key={index}
            to={segment.text}
            onClick={(event) => useNavigateToUser(event)}
          >
            {segment.text}
          </Link>
        ) : segment.type === Type.url ? (
          <a
            key={index}
            href={segment.text}
            target="_blank"
            rel="noopener noreferrer"
          >
            {segment.text}
          </a>
        ) : segment.type === Type.newline ? (
          <br key={index} />
        ) : (
          segment.text
        )
      )}
    </>
  );
};

export default Post;
