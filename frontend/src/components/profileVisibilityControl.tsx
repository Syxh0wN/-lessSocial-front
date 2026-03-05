"use client";

import { useState } from "react";

type ProfileVisibilityControlProps = {
  initialIsPrivate: boolean;
};

export function ProfileVisibilityControl({
  initialIsPrivate,
}: ProfileVisibilityControlProps) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [isSaving, setIsSaving] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleSave = async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    setStatusText("");
    try {
      const response = await fetch("/api/profiles/visibility", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPrivate }),
      });
      if (!response.ok) {
        setStatusText("Nao foi possivel salvar.");
        return;
      }
      setStatusText("Visibilidade atualizada.");
    } catch {
      setStatusText("Nao foi possivel salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-borderColor bg-background p-4">
      <h2 className="text-sm font-semibold text-foreground">Visibilidade Do Perfil</h2>
      <p className="mt-1 text-xs text-muted">
        Perfil privado: so seguidores veem suas publicacoes. Perfil publico: todos veem.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setIsPrivate(false)}
          className={`rounded-lg px-3 py-2 text-sm transition ${
            !isPrivate ? "bg-primary text-white" : "bg-surface text-foreground"
          }`}
        >
          Perfil Publico
        </button>
        <button
          type="button"
          onClick={() => setIsPrivate(true)}
          className={`rounded-lg px-3 py-2 text-sm transition ${
            isPrivate ? "bg-primary text-white" : "bg-surface text-foreground"
          }`}
        >
          Perfil Privado
        </button>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive disabled:opacity-70"
      >
        {isSaving ? "Salvando..." : "Salvar"}
      </button>
      {statusText ? <p className="mt-2 text-xs text-muted">{statusText}</p> : null}
    </div>
  );
}
