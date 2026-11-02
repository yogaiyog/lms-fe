"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { api, API_BASE_URL } from "@/lib/api";

const SCRATCH_GUI_ORIGIN =
  process.env.NEXT_PUBLIC_SCRATCH_GUI_URL ?? "https://scratch.juaraku.web.id";

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
  // Sesi editor yang sedang dibuka: config dikirim HANYA ke origin & window ini.
  const launchRef = useRef<{
    win: Window;
    origin: string;
    type: "SCRATCH" | "PYTHON";
    payload: Record<string, unknown>;
    token?: string;
    sent: boolean;
  } | null>(null);

  const sendLaunchConfig = useCallback(() => {
    const launch = launchRef.current;
    if (!launch || launch.win.closed) return;
    const payload = { ...launch.payload, ...(launch.token ? { progressToken: launch.token } : {}) };
    launch.win.postMessage(
      launch.type === "PYTHON"
        ? { type: "python-editor:init", payload }
        : { type: "scratch-integration-config", payload },
      launch.origin,
    );
    launch.sent = true;
  }, []);

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

      // Editor selesai dimuat → kirim (ulang) config + progress token.
      if (type === "scratch-integration-ready" || type === "python-editor:ready") {
        const launch = launchRef.current;
        if (launch && event.origin === launch.origin && event.source === launch.win) {
          sendLaunchConfig();
        }
        return;
      }

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

        // UI optimistic only. Persistence is handled by the scratch window
        // itself via direct fetch (with res.ok check) — sending another POST
        // here caused a duplicate-fire race (409 on upsert "create").
        applyProgress(levelId, status, projectId);
        return;
      }

      if (type === "python-editor:progress" || type === "python-editor:done") {
        // Hanya terima dari editor yang sedang kita buka.
        const launch = launchRef.current;
        if (!launch || event.origin !== launch.origin || event.source !== launch.win) return;

        const { status, taskCode } = payload ?? {};
        if (!taskCode || !status) return;

        applyProgress(taskCode, status);
        sendProgressToServer(taskCode, status);
        return;
      }
    },
    [studentId, applyProgress, sendProgressToServer, sendLaunchConfig],
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

      const fallbackUrl = `${API_BASE_URL}/api/v1/academic/student-topic-progress`;

      let effectiveUrl = url;
      if (options?.type !== "PYTHON") {
        const params = new URLSearchParams({
          studentId,
          projectId,
          taskCode: levelId,
          fallbackUrl,
        });
        const base = url.split("#")[0];
        effectiveUrl = `${base}${base.includes("?") ? "&" : "?"}${params.toString()}#0`;
      }

      const tutorialWindow = window.open(
        effectiveUrl,
        "scratch-tutorial",
        "width=1200,height=800",
      );

      if (!tutorialWindow) return;

      tutorialWindowRef.current = tutorialWindow;
      activeLevelRef.current = { levelId, url };

      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (tutorialWindow.closed) {
          if (pollRef.current) clearInterval(pollRef.current);
          tutorialWindowRef.current = null;
          activeLevelRef.current = null;
          if (launchRef.current?.win === tutorialWindow) launchRef.current = null;
        }
      }, 1000);

      let origin: string;
      try {
        origin = new URL(url, window.location.href).origin;
      } catch {
        return;
      }

      const launchPayload: Record<string, unknown> =
        options?.type === "PYTHON"
          ? {
              instructions: options.instructions ?? undefined,
              defaultCode: options.defaultCode ?? undefined,
              title: options.title ?? undefined,
              studentId,
              fallbackUrl,
              taskCode: levelId,
              projectId,
            }
          : { fallbackUrl, studentId, projectId, taskCode: levelId };

      launchRef.current = {
        win: tutorialWindow,
        origin,
        type: options?.type === "PYTHON" ? "PYTHON" : "SCRATCH",
        payload: launchPayload,
        sent: false,
      };

      // Progress token: izin bagi editor untuk menyimpan progress task ini saja.
      api.roadmap
        .getLaunchToken(studentId, levelId)
        .then(({ token }) => {
          const launch = launchRef.current;
          if (!launch || launch.win !== tutorialWindow) return;
          launch.token = token;
          // Config tanpa token sudah terkirim → kirim ulang dengan token.
          if (launch.sent) sendLaunchConfig();
        })
        .catch(() => {
          // Backend lama / gagal: editor tetap jalan, progress tersimpan lewat postMessage ke tab ini.
        });

      // Fallback untuk editor versi lama yang belum mengirim pesan "ready".
      setTimeout(() => {
        const launch = launchRef.current;
        if (launch && launch.win === tutorialWindow && !launch.sent) sendLaunchConfig();
      }, 2000);
    },
    [studentId, sendLaunchConfig],
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
