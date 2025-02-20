import { Button } from "@/shadcn/components/ui/button";
import HeartPng from "../assets/heart.png";
import { useFirestore } from "@/hooks/useFirestore";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { useAuthContext } from "@/hooks/useAuthContext";
import { timestamp } from "@/firebase/config";
import { useEffect, useState, useRef } from "react";
import { Textarea } from "@/shadcn/components/ui/textarea";
import { getUniqueId } from "@/utils/getUniqueId";
import getInitials from "@/utils/getInitials";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import { TrashIcon } from "@radix-ui/react-icons";

const CommentList = ({ comments, userDoc }) => {
  const { user } = useAuthContext();
  const { updateDocument: updateComment, addDocument: addComment } =
    useFirestore("comments");
  const [localComments, setLocalComments] = useState(comments);
  const [replyContent, setReplyContent] = useState("");
  const [commentToBeReplied, setCommentToBeReplied] = useState(null);
  const [activeReply, setActiveReply] = useState(null);
  const textareaRef = useRef(null);

  const getLessonId = () => {
    const lessonId = window.location.pathname.substring(
      window.location.pathname.lastIndexOf("/") + 1
    );
    return lessonId;
  };

  const publishReply = async () => {
    await addComment({
      lessonId: commentToBeReplied.lessonId,
      pic: user.photoURL,
      authorName: user.displayName || userDoc?.name,
      authorId: user.uid,
      content: replyContent,
      likes: [],
      timestamp: timestamp,
      replyTo: commentToBeReplied.id,
      deleted: false,
    });

    setReplyContent("");
  };

  const deleteComment = async (comment, index) => {
    const updatedComments = [...localComments];
    updatedComments.splice(index, 1);
    setLocalComments(updatedComments);
    await updateComment(comment.id, {
      deleted: true,
    });
  };

  const timeAgo = (createdAt) => {
    if (!createdAt?.seconds) return;
    const now = new Date();
    const timeDate = createdAt?.toDate();
    const diffInSeconds = Math.floor((now - timeDate) / 1000);

    let timeAgo = "";

    if (diffInSeconds < 60) {
      timeAgo = "agora há pouco";
    } else if (diffInSeconds < 3600) {
      timeAgo = `${Math.floor(diffInSeconds / 60)} m`;
    } else if (diffInSeconds < 86400) {
      timeAgo = `${Math.floor(diffInSeconds / 3600)} h`;
    } else if (diffInSeconds < 604800) {
      timeAgo = `${Math.floor(diffInSeconds / 86400)} d`;
    } else if (diffInSeconds < 2592000) {
      timeAgo = `${Math.floor(diffInSeconds / 604800)} s`;
    } else {
      timeAgo = `${Math.floor(diffInSeconds / 2592000)} M`;
    }
    return timeAgo;
  };

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const likeComment = async (comment) => {
    if (comment.likes.includes(user.uid)) {
      await updateComment(comment.id, {
        likes: arrayRemove(user.uid),
      });
    } else {
      await updateComment(comment.id, {
        likes: arrayUnion(user.uid),
      });
    }
  };

  const replyComment = (comment, index, maxLevel) => {
    const updatedComments = [...localComments];
    let newComment;
    let newCommentId = getUniqueId();

    if (maxLevel) {
      const commentToBe = updatedComments.find((c) => c.id === comment.replyTo);
      setCommentToBeReplied(commentToBe);

      newComment = {
        id: newCommentId,
        lessonId: comment.lessonId,
        pic: user.photoURL,
        authorName: user.displayName || userDoc?.name,
        authorId: user.uid,
        content: replyContent,
        likes: [],
        createdAt: timestamp,
        replyTo: commentToBe.id,
        prov: true,
      };
    } else {
      setCommentToBeReplied(comment);

      newComment = {
        id: newCommentId,
        lessonId: comment.lessonId,
        pic: user.photoURL,
        authorName: user.displayName || userDoc?.name,
        authorId: user.uid,
        content: replyContent,
        likes: [],
        createdAt: timestamp,
        replyTo: comment.id,
        prov: true,
      };
    }

    if (activeReply) {
      updatedComments.splice(
        updatedComments.findIndex((c) => c.id === activeReply),
        1
      );
    }

    updatedComments.splice(index + 1, 0, newComment);
    setLocalComments(updatedComments);
    setActiveReply(newCommentId);
    setReplyContent(`@${comment.authorName} `);
  };

  useEffect(() => {
    if (textareaRef.current) {
      const length = replyContent.length;
      setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(length, length);
      }, 0);
    }
  }, [replyContent]);

  const renderComments = (parentID, level = 0, maxLevel = 1) => {
    const filteredComments = localComments?.filter(
      (c) => c.replyTo === parentID
    );

    if (level !== 0) {
      // Se não for um comentário raiz, inverta a ordem
      filteredComments.sort(
        (a, b) => a.createdAt?.seconds - b.createdAt?.seconds
      );
    }

    return filteredComments?.map((comment, index) => (
      <div
        key={comment.id}
        className={`my-4`}
        style={{ marginLeft: level * 48 }}
      >
        <div className="flex flex-col text-gray-400">
          <div className="flex gap-2">
            <Avatar>
              <AvatarImage src={comment.pic} alt="avatar" />
              <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
            </Avatar>
            {comment.prov ? (
              <div className="w-full">
                <Textarea
                  ref={textareaRef}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full text-primary"
                  maxLength={500}
                />
                <Button
                  size="xs"
                  className="mt-1.5 text-xs"
                  onClick={() => publishReply(level >= maxLevel)}
                >
                  Enviar
                </Button>
              </div>
            ) : (
              <div className="relative bg-input/25 border border-input pr-2.5 py-1.5 rounded-xl w-full">
                <span className="ml-2 text-primary font-medium text-sm">
                  {comment.authorName}
                </span>
                <p className="ml-2 text-primary/90 text-[13px]">
                  {comment.content}
                </p>
                {comment.likes.length ? (
                  <div className="absolute -bottom-2 right-2 flex items-center justify-end">
                    <span className="ml-2 flex items-center gap-1 bg-background/75 drop-shadow-sm w-fit py-0.25 px-1.5 rounded-full text-[11px]">
                      <img src={HeartPng} />
                      {comment.likes.length}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          {comment.prov ? null : (
            <div className="flex items-center gap-4 ml-14">
              <Button
                variant="Link"
                size="min"
                onClick={() => likeComment(comment)}
              >
                {comment.likes.includes(user.uid) ? "Descurtir" : "Curtir"}
              </Button>
              <Button
                variant="Link"
                size="min"
                onClick={() => replyComment(comment, index, level >= maxLevel)}
              >
                Responder
              </Button>
              {(comment.authorId === user.uid || userDoc.admin) && (
                <Button
                  variant="Link"
                  size="min"
                  onClick={() => deleteComment(comment, index)}
                >
                  <TrashIcon className="text-red-400" />
                </Button>
              )}
              <span className="inline-flex text-[11px]">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
          )}
        </div>
        {renderComments(comment.id, level + 1, maxLevel)}
      </div>
    ));
  };

  return <div>{renderComments(null)}</div>;
};

export default CommentList;
