"use client";

import { useState } from "react";

type FollowProfileButtonProps = {
  targetUserId: string;
  isAuthenticated: boolean;
  compact?: boolean;
};

export function FollowProfileButton({
  targetUserId,
  isAuthenticated,
  compact = false,
}: FollowProfileButtonProps) {
  const [followState, setFollowState] = useState<"idle" | "pending" | "accepted">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleFollow = async () => {
    if (isSubmitting || followState === "pending" || followState === "accepted") {
      return;
    }
    if (!isAuthenticated) {
      setStatusText("Faca login para seguir.");
      return;
    }
    if (!targetUserId) {
      setStatusText("Perfil indisponivel para seguir.");
      return;
    }
    setIsSubmitting(true);
    setStatusText("");
    try {
      const response = await fetch("/api/friends/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: targetUserId,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        const errorMessage = String(payload.message ?? payload.error ?? "Nao foi possivel seguir.");
        if (errorMessage.toLowerCase().includes("invalid token")) {
          setStatusText("Sessao expirada. Faca login novamente.");
          return;
        }
        setStatusText(errorMessage);
        return;
      }
      if (payload.status === "accepted") {
        setFollowState("accepted");
        setStatusText("Voce ja segue este perfil.");
        return;
      }
      setFollowState("pending");
      setStatusText("Solicitacao enviada.");
    } catch {
      setStatusText("Nao foi possivel seguir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={compact ? "" : "mt-12 md:mt-10"}>
      <button
        type="button"
        onClick={() => void handleFollow()}
        disabled={isSubmitting || followState === "pending" || followState === "accepted"}
        className={`rounded-full border border-borderColor bg-background font-medium text-foreground transition hover:bg-primarySoft disabled:opacity-70 ${
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
        }`}
      >
        {isSubmitting
          ? "Enviando..."
          : followState === "pending"
            ? "Solicitado"
            : followState === "accepted"
              ? "Seguindo"
              : "Seguir"}
      </button>
      {statusText ? <p className="mt-1 text-[11px] text-muted">{statusText}</p> : null}
    </div>
  );
}
