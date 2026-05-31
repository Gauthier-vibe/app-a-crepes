import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Image as ImageIcon, Feather, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentCharacter } from "@/hooks/useCurrentCharacter";
import { charactersById, type CharacterId } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/player/chat")({
  head: () => ({ meta: [{ title: "Chat — Murder Party" }] }),
  component: ChatPage,
});


interface LiveMessage {
  id: string;
  channel: string;
  sender_character_id: string;
  sender_display_name: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}


function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function ChatPage() {
  const { character } = useCurrentCharacter();
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Initial load + realtime subscription
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("channel", "global")
        .order("created_at", { ascending: true })
        .limit(500);
      if (!mounted) return;
      if (error) {
        toast.error("Chat indisponible", { description: error.message });
      } else {
        setMessages(data as LiveMessage[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel("chat_messages:global")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: "channel=eq.global" },
        (payload) => {
          setMessages((m) => {
            const next = payload.new as LiveMessage;
            if (m.some((x) => x.id === next.id)) return m;
            return [...m, next];
          });
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  if (!character) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value || sending) return;
    setSending(true);
    setDraft("");
    const { error } = await supabase.from("chat_messages").insert({
      channel: "global",
      sender_character_id: character.id,
      sender_display_name: character.name,
      content: value,
    });
    if (error) {
      toast.error("Message non envoyé", { description: error.message });
      setDraft(value);
    }
    setSending(false);
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format non supporté", { description: "Choisissez une image." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image trop lourde", { description: "Taille maximum : 8 Mo." });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${character.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("chat-media")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      toast.error("Envoi de l'image impossible", { description: upErr.message });
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from("chat-media").getPublicUrl(path);
    const { error } = await supabase.from("chat_messages").insert({
      channel: "global",
      sender_character_id: character.id,
      sender_display_name: character.name,
      content: null,
      image_url: pub.publicUrl,
    });
    if (error) {
      toast.error("Message non envoyé", { description: error.message });
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-5rem)]">
      <header className="px-4 py-3 border-b border-border bg-card/60">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Salon commun · en direct
        </p>
        <h1 className="font-serif text-xl leading-none mt-0.5">Le chat des convives</h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Chargement des messages…
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-center text-xs text-muted-foreground italic py-6">
              Aucun message. Soyez le premier à briser le silence.
            </p>
          )}
          {messages.map((m) => (
            <Bubble key={m.id} message={m} currentId={character.id} />
          ))}
        </div>
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-border bg-card/80 backdrop-blur px-3 py-2.5"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Joindre une image"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>

        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Murmurer un message…"
          className="flex-1 bg-background"
          maxLength={500}
        />
        <Button type="submit" size="icon" aria-label="Envoyer" disabled={sending || !draft.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}

function Bubble({ message, currentId }: { message: LiveMessage; currentId: CharacterId }) {
  const senderId = message.sender_character_id;

  if (senderId === "system") {
    return (
      <div className="flex justify-center">
        <span className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground bg-muted/70 rounded-full px-3 py-1">
          {message.content}
        </span>
      </div>
    );
  }

  if (senderId === "corbeau") {
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

  const sender = charactersById[senderId as CharacterId];
  const isMine = senderId === currentId;
  const displayName = sender?.name ?? message.sender_display_name;
  const image = sender?.image;

  return (
    <div className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}>
      {!isMine && image && (
        <img
          src={image}
          alt={displayName}
          width={64}
          height={64}
          loading="lazy"
          className="h-8 w-8 rounded-full object-cover ring-1 ring-border self-end"
        />
      )}
      <div className={cn("max-w-[78%]", isMine && "items-end")}>
        {!isMine && (
          <p className="text-[11px] text-muted-foreground ml-2 mb-0.5 font-medium">
            {displayName}
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
          <p>{message.content}</p>
        </div>
        <p
          className={cn(
            "text-[10px] text-muted-foreground mt-0.5 font-mono",
            isMine ? "text-right mr-1" : "ml-2",
          )}
        >
          {formatTime(message.created_at)}
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
