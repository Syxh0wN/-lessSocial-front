"use client";

import type { NotificationItem, NotificationsResponse } from "@/lib/api";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function formatNotificationDate(rawValue: string) {
  return new Date(rawValue).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok || !isMounted) {
          return;
        }
        const payload = (await response.json()) as NotificationsResponse;
        setNotifications(payload.items);
        setUnreadCount(payload.unreadCount);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadNotifications();
    const intervalId = setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const hasNotifications = useMemo(() => notifications.length > 0, [notifications]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:text-primary"
        aria-label="Notificacoes"
      >
        <Bell size={16} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-11 z-30 w-80 overflow-hidden rounded-xl border border-borderColor bg-background shadow-lg">
          <div className="border-b border-borderColor px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notificacoes</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-3 text-xs text-muted">CarregandoNotificacoes</p>
            ) : !hasNotifications ? (
              <p className="px-4 py-3 text-xs text-muted">SemNotificacoesNoMomento</p>
            ) : (
              notifications.map((notificationItem) => (
                <div
                  key={notificationItem.id}
                  className="border-b border-borderColor px-4 py-3 text-xs"
                >
                  <p className="text-foreground">
                    <b>@{notificationItem.actorUsername}</b> {notificationItem.message}
                  </p>
                  <p className="mt-1 text-muted">
                    {formatNotificationDate(notificationItem.createdAt)}
                  </p>
                  {notificationItem.targetId ? (
                    <Link
                      href={`/posts/${notificationItem.targetId}`}
                      className="mt-2 inline-block text-[11px] text-primary hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      VerInteracao
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
