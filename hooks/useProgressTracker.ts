"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";

const SCRATCH_GUI_ORIGIN =
  process.env.NEXT_PUBLIC_SCRATCH_GUI_URL ?? "http://localhost:8601";
const PYTHON_EDITOR_ORIGIN =
  process.env.NEXT_PUBLIC_PYTHON_EDITOR_URL ?? "http://localhost:3000";

type ProgressRecord = {
  status: string;
  topicTaskId: string;
  projectId: string | null;
  completedAt: string | null;
};

type ProgressMap = Record<string, ProgressRecord>;

function getTaskStatusFromMap(progress: ProgressMap, taskId: string) {
  if (progress[taskId]?.status === "completed") return "completed";
  if (progress[taskId]?.status === "in_progress") return "in_progress";
  return "available";
}

export function useProgressTracker(studentId: string) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loaded, setLoaded] = useState(false);
  const tutorialWindowRef = useRef<Window | null>(null);
  const activeLevelRef = useRef<{ levelId: string; url: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!studentId) {
      setProgress({});
      setLoaded(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const records = await api.roadmap.fetchStudentProgress(studentId);
        if (cancelled || !records) return;
        const mapped: ProgressMap = {};
        for (const r of records) {
          const code = r.topicTask?.code;
          if (!code) continue;
          mapped[code] = {
            status: r.status,
            topicTaskId: r.topicTaskId,
            projectId: r.metadata
              ? (() => {
                  try {
                    return JSON.parse(r.metadata).projectId;
                  } catch {
                    return null;
                  }
                })()
              : null,
            completedAt: r.completedAt,
          };
        }
        setProgress(mapped);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const applyProgress = useCallback(
    (levelId: string, status: string, projectId?: string | null) => {
      setProgress((prev) => ({
        ...prev,
        [levelId]: {
          ...prev[levelId],
          status,
          projectId: projectId ?? null,
          completedAt:
            status === "completed" ? new Date().toISOString() : null,
        },
      }));
    },
    [],
  );

  const sendProgressToServer = useCallback(
    (levelId: string, status: string, projectId?: string | null) => {
      if (!studentId) return;
      api.roadmap.upsertProgress({
        studentId,
        topicTaskCode: levelId,
        status,
        metadata: JSON.stringify({
          projectId,
          source: "postmessage",
        }),
      }).catch(() => {});
    },
    [studentId],
  );

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const { type, payload } = event.data ?? {};

      if (type === "scratch-progress") {
        if (event.origin !== SCRATCH_GUI_ORIGIN) return;

        const { taskId, status, projectId, studentId: msgStudentId } =
          payload ?? {};

        const effectiveStudentId = msgStudentId || studentId;
        if (!effectiveStudentId) return;

        if (taskId === "session-start") return;

        const levelId =
          taskId === "project-complete" && activeLevelRef.current
            ? activeLevelRef.current.levelId
            : taskId;

        if (!levelId) return;

        applyProgress(levelId, status, projectId);
        sendProgressToServer(levelId, status, projectId);
        return;
      }

      if (type === "python-editor:progress" || type === "python-editor:done") {
        if (event.origin !== PYTHON_EDITOR_ORIGIN) return;

        const { status, taskCode } = payload ?? {};
        if (!taskCode || !status) return;

        applyProgress(taskCode, status);
        sendProgressToServer(taskCode, status);
        return;
      }
    },
    [studentId, applyProgress, sendProgressToServer],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const openTutorial = useCallback(
    (
      url: string,
      projectId: string,
      levelId: string,
      options?: {
        type?: "SCRATCH" | "PYTHON";
        instructions?: string | null;
        defaultCode?: string | null;
        title?: string | null;
      },
    ) => {
      if (!studentId) return;

      const effectiveUrl =
        options?.type === "PYTHON" ? url : `${url}#0`;

      const tutorialWindow = window.open(
        effectiveUrl,
        "scratch-tutorial",
        "width=1200,height=800",
      );

      if (!tutorialWindow) return;

      tutorialWindowRef.current = tutorialWindow;
      activeLevelRef.current = { levelId, url };

      pollRef.current = setInterval(() => {
        if (tutorialWindow.closed) {
          if (pollRef.current) clearInterval(pollRef.current);
          tutorialWindowRef.current = null;
          activeLevelRef.current = null;
        }
      }, 1000);

      setTimeout(() => {
        if (tutorialWindow && !tutorialWindow.closed) {
          if (options?.type === "PYTHON") {
            tutorialWindow.postMessage(
              {
                type: "python-editor:init",
                payload: {
                  instructions: options.instructions ?? undefined,
                  defaultCode: options.defaultCode ?? undefined,
                  title: options.title ?? undefined,
                  studentId,
                  token: `token-${studentId}`,
                  fallbackUrl: `${window.location.origin}/api/v1/academic/student-topic-progress`,
                  taskCode: levelId,
                  projectId,
                },
              },
              "*",
            );
          } else {
            tutorialWindow.postMessage(
              {
                type: "scratch-integration-config",
                payload: {
                  fallbackUrl: `${window.location.origin}/api/v1/academic/student-topic-progress`,
                  studentId,
                  token: `token-${studentId}`,
                  projectId,
                },
              },
              "*",
            );
          }
        }
      }, 2000);
    },
    [studentId],
  );

  const getTaskStatus = useCallback(
    (taskId: string) => getTaskStatusFromMap(progress, taskId),
    [progress],
  );

  const setTaskStatus = useCallback(
    (taskId: string, status: string) => {
      setProgress((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          status,
          completedAt:
            status === "completed" ? new Date().toISOString() : null,
        },
      }));

      if (studentId) {
        api.roadmap.upsertProgress({
          studentId,
          topicTaskCode: taskId,
          status,
        }).catch(() => {});
      }
    },
    [studentId],
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return {
    progress,
    loaded,
    openTutorial,
    getTaskStatus,
    setTaskStatus,
  };
}
