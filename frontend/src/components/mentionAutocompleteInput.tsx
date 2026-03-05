"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ProfileSuggestion = {
  username: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

type MentionAutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  className?: string;
};

type MentionCursorState = {
  query: string;
  tokenStart: number;
  cursorEnd: number;
};

function ResolveMentionCursorState(text: string, cursorEnd: number): MentionCursorState | null {
  const beforeCursor = text.slice(0, cursorEnd);
  const matchItem = beforeCursor.match(/(^|\s)@([a-zA-Z0-9_]*)$/);
  if (!matchItem) {
    return null;
  }
  const mentionValue = matchItem[2] ?? "";
  const tokenStart = beforeCursor.length - mentionValue.length - 1;
  return {
    query: mentionValue,
    tokenStart,
    cursorEnd,
  };
}

export function MentionAutocompleteInput({
  value,
  onChange,
  placeholder,
  maxLength,
  className,
}: MentionAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [cursorState, setCursorState] = useState<MentionCursorState | null>(null);
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const resolvedClassName = useMemo(
    () =>
      className ??
      "w-full rounded-md border border-borderColor bg-background px-3 py-2 text-sm text-foreground",
    [className],
  );

  useEffect(() => {
    const mentionQuery = cursorState?.query?.trim() ?? "";
    if (!isOpen || mentionQuery.length === 0) {
      return;
    }
    const timeoutId = setTimeout(() => {
      void fetch(`/api/profile-search?query=${encodeURIComponent(mentionQuery)}`, {
        method: "GET",
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) {
            setSuggestions([]);
            return;
          }
          const payload = (await response.json()) as ProfileSuggestion[];
          setSuggestions(payload);
        })
        .catch(() => {
          setSuggestions([]);
        });
    }, 120);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [cursorState?.query, isOpen]);

  const shouldShowSuggestions =
    isOpen && (cursorState?.query?.trim()?.length ?? 0) > 0 && suggestions.length > 0;

  const handleValueChange = (nextValue: string) => {
    onChange(nextValue);
    const inputElement = inputRef.current;
    const currentCursor = inputElement?.selectionStart ?? nextValue.length;
    const mentionState = ResolveMentionCursorState(nextValue, currentCursor);
    if (!mentionState) {
      setIsOpen(false);
      setCursorState(null);
      return;
    }
    setCursorState(mentionState);
    setIsOpen(true);
  };

  const handleMentionSelect = (selectedUsername: string) => {
    if (!cursorState) {
      return;
    }
    const nextValue =
      value.slice(0, cursorState.tokenStart) +
      `@${selectedUsername} ` +
      value.slice(cursorState.cursorEnd);
    const nextCursorPosition = cursorState.tokenStart + selectedUsername.length + 2;
    onChange(nextValue);
    setIsOpen(false);
    setCursorState(null);
    requestAnimationFrame(() => {
      if (!inputRef.current) {
        return;
      }
      inputRef.current.focus();
      inputRef.current.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => handleValueChange(event.target.value)}
        onClick={(event) => {
          const mentionState = ResolveMentionCursorState(
            value,
            (event.currentTarget as HTMLInputElement).selectionStart ?? value.length,
          );
          if (!mentionState) {
            setIsOpen(false);
            setCursorState(null);
            return;
          }
          setCursorState(mentionState);
          setIsOpen(true);
        }}
        onKeyUp={(event) => {
          const mentionState = ResolveMentionCursorState(
            value,
            (event.currentTarget as HTMLInputElement).selectionStart ?? value.length,
          );
          if (!mentionState) {
            setIsOpen(false);
            setCursorState(null);
            return;
          }
          setCursorState(mentionState);
          setIsOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 120);
        }}
        placeholder={placeholder}
        className={resolvedClassName}
        maxLength={maxLength}
      />
      {shouldShowSuggestions ? (
        <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg border border-borderColor bg-background shadow-md">
          {suggestions.map((suggestionItem) => (
            <button
              key={suggestionItem.username}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleMentionSelect(suggestionItem.username);
              }}
              className="flex w-full items-center gap-3 border-b border-borderColor px-3 py-2 text-left last:border-b-0 hover:bg-surface"
            >
              <img
                src={
                  suggestionItem.avatarUrl ??
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                }
                alt={`Avatar de ${suggestionItem.username}`}
                className="h-8 w-8 rounded-full border border-borderColor object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {suggestionItem.name}
                </span>
                <span className="block truncate text-xs text-muted">@{suggestionItem.username}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
