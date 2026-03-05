import Link from "next/link";
import { NotificationsBell } from "@/components/notificationsBell";

type TopBarProps = {
  username?: string;
  hideHomeActions?: boolean;
};

export function TopBar({ username, hideHomeActions = false }: TopBarProps) {
  const isLoggedIn = Boolean(username);

  return (
    <header className="border-b border-borderColor bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-primaryActive">
          LessSocial
        </Link>
        {isLoggedIn ? (
          <nav className="flex items-center gap-4 text-sm">
            {!hideHomeActions ? <NotificationsBell /> : null}
            {!hideHomeActions ? <Link href="/feed">Feed</Link> : null}
            <Link href={`/${username}`}>Perfil</Link>
            {!hideHomeActions ? <Link href={`/${username}`}>Minha Conta</Link> : null}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
