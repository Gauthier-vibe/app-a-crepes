import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Image as ImageIcon, Video, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { charactersById, messages as seedMessages, type ChatMessage, type CharacterId } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/player/chat")({
  head: () => ({ meta: [{ title: "Chat — Murder Party" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { character } = useCurrentCharacter();
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  if (!character) return null;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;
    setMessages((m) => [
      ...m,
      {
        id: `m-local-${m.length}`,
        senderId: character.id,
        content: value,
        mediaType: "text",
        timestamp: new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-5rem)]">
      <header className="px-4 py-3 border-b border-border bg-card/60">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Salon commun
        </p>
        <h1 className="font-serif text-xl leading-none mt-0.5">Le chat des convives</h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 space-y-3">
          {messages.map((m) => (
            <Bubble key={m.id} message={m} currentId={character.id} />
          ))}
        </div>
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-border bg-card/80 backdrop-blur px-3 py-2.5"
      >
        <Button type="button" variant="ghost" size="icon" aria-label="Joindre une image" disabled>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Joindre une vidéo" disabled>
          <Video className="h-4 w-4" />
        </Button>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Murmurer un message…"
          className="flex-1 bg-background"
        />
        <Button type="submit" size="icon" aria-label="Envoyer">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function Bubble({ message, currentId }: { message: ChatMessage; currentId: CharacterId }) {
  if (message.senderId === "system") {
    return (
      <div className="flex justify-center">
        <span className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground bg-muted/70 rounded-full px-3 py-1">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.senderId === "corbeau") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[80%] rounded-md border border-dashed border-primary/60 bg-primary/5 px-4 py-3 shadow-paper">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">
            ✉ Le Corbeau
          </p>
          <p className="font-serif italic text-foreground text-[15px] leading-snug">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  const sender = charactersById[message.senderId];
  const isMine = message.senderId === currentId;

  return (
    <div className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
      {!isMine && (
        <img
          src={sender.image}
          alt={sender.name}
          width={64}
          height={64}
          loading="lazy"
          className="h-8 w-8 rounded-full object-cover ring-1 ring-border self-end"
        />
      )}
      <div className={cn("max-w-[78%]", isMine && "items-end")}>
        {!isMine && (
          <p className="text-[11px] text-muted-foreground ml-2 mb-0.5 font-medium">
            {sender.name}
          </p>
        )}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-[15px] leading-snug shadow-paper",
            isMine
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card text-foreground border border-border rounded-bl-sm",
          )}
        >
          {message.mediaType === "image" || message.mediaType === "video" ? (
            <div className="space-y-1.5">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md p-2",
                  isMine ? "bg-primary-foreground/10" : "bg-muted",
                )}
              >
                {message.mediaType === "video" ? (
                  <Video className="h-4 w-4 shrink-0" />
                ) : (
                  <ImageIcon className="h-4 w-4 shrink-0" />
                )}
                <span className="text-xs italic">{message.mediaCaption}</span>
              </div>
              <p>{message.content}</p>
            </div>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        <p
          className={cn(
            "text-[10px] text-muted-foreground mt-0.5 font-mono",
            isMine ? "text-right mr-1" : "ml-2",
          )}
        >
          {message.timestamp}
        </p>
      </div>
      {isMine && (
        <span className="self-end h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Feather className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}
