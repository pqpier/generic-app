import React, { useEffect, useState } from "react";
import { useCollection } from "@/hooks/useCollection";
import { useDocument } from "@/hooks/useDocument";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@/hooks/useQuery";
import Row from "@/reusable/Row";
import { useAuthContext } from "@/hooks/useAuthContext";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import "./VideoPlayer.css";
import VideoPlayer from "./VideoPlayer";
import { Button } from "@/shadcn/components/ui/button";
import { useFirestore } from "@/hooks/useFirestore";

export default function Course() {
  const query = useQuery();
  const { user } = useAuthContext();
  const { document: course } = useDocument("courses", "9DwWIAtShVCPXyRPSbqF");
  const { addDocument: addProgress, updateDocument: updateProgress } =
    useFirestore("progress");
  const { documents: lessons } = useCollection("lessons", [
    "courseId",
    "==",
    "9DwWIAtShVCPXyRPSbqF",
  ]);

  const [selectedLesson, setSelectedLesson] = useState(null);

  const { documents: progressDocs } = useCollection(
    "progress",
    ["userId", "==", user.uid],
    null,
    ["courseId", "==", "9DwWIAtShVCPXyRPSbqF"]
  );

  const watchLesson = (moduleId, lesson) => {
    localStorage.setItem(`lastModuleWatched-9DwWIAtShVCPXyRPSbqF`, moduleId);
    localStorage.setItem(`lastWatchedLesson-9DwWIAtShVCPXyRPSbqF`, lesson.id);
    setSelectedLesson(lesson);
  };

  const previousLesson = () => {
    const moduleId = selectedLesson.moduleId;
    const lesson = selectedLesson;

    const previousLesson = lessons.find(
      (l) => l.moduleId === moduleId && l.index === lesson.index - 1
    );

    if (previousLesson) {
      watchLesson(moduleId, previousLesson);
    } else {
      const module = course.modules.find(
        (m) => m.id === selectedLesson.moduleId
      );

      const previousModule = course.modules.find(
        (m) => m.index === module.index - 1
      );

      if (previousModule) {
        const previousLesson = lessons.find(
          (l) => l.moduleId === previousModule.id && l.index === 0
        );
        watchLesson(previousModule.id, previousLesson);
      }
    }
  };

  const nextLesson = () => {
    const moduleId = selectedLesson.moduleId;
    const lesson = selectedLesson;

    const nextLesson = lessons.find(
      (l) => l.moduleId === moduleId && l.index === lesson.index + 1
    );

    if (nextLesson) {
      watchLesson(moduleId, nextLesson);
    } else {
      const module = course.modules.find(
        (m) => m.id === selectedLesson.moduleId
      );

      const nextModule = course.modules.find(
        (m) => m.index === module.index + 1
      );

      if (nextModule) {
        const nextLesson = lessons.find(
          (l) => l.moduleId === nextModule.id && l.index === 0
        );
        watchLesson(nextModule.id, nextLesson);
      }
    }
  };

  const completeLesson = async () => {
    const progress = progressDocs.find(
      (doc) => doc.lessonId === selectedLesson.id
    );

    if (progress) {
      await updateProgress(progress.id, {
        status: "completed",
        completedAt: new Date(),
      });
    } else {
      await addProgress({
        lessonId: selectedLesson.id,
        moduleId: selectedLesson.moduleId,
        courseId: course.id,
        userId: user.uid,
        status: "completed",
        completedAt: new Date(),
      });
    }

    let nextLesson = lessons.find(
      (l) =>
        l.moduleId === selectedLesson.moduleId &&
        l.index === selectedLesson.index + 1
    );

    // Add a condition that verifies if there is another module, then define the next lesson as the first lesson of the next module

    const module = course.modules.find((m) => m.id === selectedLesson.moduleId);

    if (!nextLesson && course.modules.length > module.index + 1) {
      const nextModule = course.modules.find(
        (m) => m.index === module.index + 1
      );
      if (nextModule) {
        const firstLesson = lessons.find(
          (l) => l.moduleId === nextModule.id && l.index === 0
        );
        watchLesson(nextModule.id, firstLesson);
        return;
      }
    }

    if (nextLesson) {
      watchLesson(selectedLesson.moduleId, nextLesson);
    }
  };

  useEffect(() => {
    if (lessons && lessons.length) {
      const lastWatchedLesson = localStorage.getItem(
        "lastWatchedLesson-9DwWIAtShVCPXyRPSbqF"
      );
      const lesson =
        lessons.find((lesson) => lesson.id === lastWatchedLesson) || lessons[0];
      setSelectedLesson(lesson);
    }
  }, [lessons]);

  const sortedLessons = lessons?.sort((a, b) => {
    const moduleA = course?.modules.find((module) => module.id === a.moduleId);
    const moduleB = course?.modules.find((module) => module.id === b.moduleId);

    if (!moduleA || !moduleB) return 0;

    if (moduleA.index === moduleB.index) {
      return a.index - b.index;
    }
    return moduleA.index - moduleB.index;
  });

  if (!course || !selectedLesson) return;

  return (
    <div className="w-full sm:flex sm:gap-6 sm:p-5">
      <div className="sm:w-2/3 mt-12 sm:mt-0">
        <div className="w-full text-center flex sm:hidden divide-x divide-white/20">
          <div
            className="w-1/2 py-2 px-4 flex gap-2 items-center mb-px cursor-pointer"
            onClick={previousLesson}
          >
            <ArrowLeftIcon className="mt-px h-5 w-5" /> <p>Anterior</p>
          </div>
          <div
            className="w-1/2 py-2 px-4 flex gap-2 items-center justify-end mb-px cursor-pointer"
            onClick={nextLesson}
          >
            <p>Próxima</p>
            <ArrowRightIcon className="mt-px h-5 w-5" />
          </div>
        </div>
        <VideoPlayer videoId={selectedLesson.videoId} />
        <div className="w-full flex justify-end sm:justify-between px-2 sm:px-0 mt-2.5">
          <Button
            className="block sm:hidden"
            size="sm"
            onClick={completeLesson}
          >
            <Row className="gap-0.5 items-center">
              <CheckIcon />
              Marcar como vista
            </Row>
          </Button>

          <Button className="hidden sm:block" onClick={completeLesson}>
            <Row className="gap-0.5 items-center">
              <CheckIcon className="h-5 w-5" />
              Marcar como vista
            </Row>
          </Button>

          <div className="flex gap-2.5">
            <Button
              className="hidden sm:block"
              variant="secondary"
              size="lg"
              onClick={previousLesson}
            >
              <Row className="gap-2.5 items-center pl-2 text-md">
                <ChevronLeftIcon className="h-5 w-5" />
                Anterior
              </Row>
            </Button>
            <Button
              className="hidden sm:block"
              variant="secondary"
              size="lg"
              onClick={nextLesson}
            >
              <Row className="gap-2.5 items-center pl-2 text-md">
                Próxima <ChevronRightIcon className="h-5 w-5" />
              </Row>
            </Button>
          </div>
        </div>
        <div className="mt-5 px-2.5">
          <h3 className="text-lg font-medium mb-4">{selectedLesson.title}</h3>
          <div
            className="font-light"
            dangerouslySetInnerHTML={{ __html: selectedLesson.description }}
          ></div>
        </div>
      </div>
      <div className="sm:w-1/3 sm:mr-5 px-2.5 mt-16 sm:mt-0">
        <div className="w-full">
          {course?.modules.map((module, idx) => {
            return (
              <div key={module.id} className={idx === 0 ? undefined : "pt-5"}>
                <h3 className="text-start">{module.name}</h3>
                <div>
                  <div>
                    {sortedLessons
                      ?.filter((lesson) => lesson.moduleId === module.id)
                      .map((lesson, lidx) => (
                        <div
                          key={lidx}
                          role="button"
                          className={`${
                            lidx !== sortedLessons.length - 1
                              ? "border-b border-border"
                              : ""
                          } pt-5 px-2.5 pb-5 flex items-center gap-2.5 hover:bg-muted/25 transition-all duration-300 relative`}
                          onClick={() => watchLesson(module.id, lesson)}
                        >
                          {progressDocs &&
                          progressDocs.some(
                            (doc) =>
                              doc.lessonId === lesson.id &&
                              doc.status === "completed"
                          ) ? (
                            <div className="h-4 w-4 rounded-sm bg-emerald-500 flex justify-center items-center text-white">
                              <CheckIcon />
                            </div>
                          ) : (
                            <div className="h-4 w-4 rounded-sm border border-border flex justify-center items-center text-primary">
                              <CheckIcon className="invisible" />
                            </div>
                          )}

                          <img
                            src={lesson.videoThumb}
                            alt="thumb da aula"
                            className="w-16 h-9 rounded-md border border-border"
                          />

                          {lesson.title}
                          {lesson.new && (
                            <div className="absolute text-xs bg-red-900/40 text-red-500 font-medium pl-1.5 pr-1 py-0.5 rounded-full top-2 right-2">
                              Atualizada 🔥{" "}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
