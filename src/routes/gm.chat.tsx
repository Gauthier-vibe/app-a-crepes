import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { charactersById, messages as seed, type ChatMessage } from "@/data/mock";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gm/chat")({
  head: () => ({ meta: [{ title: "Modération chat — Game Master" }] }),
  component: GmChatPage,
});

function GmChatPage() {
  const [list, setList] = useState<ChatMessage[]>(seed);
  const [draft, setDraft] = useState("");

  const sendAsCorbeau = (e: React.FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v) return;
    setList((l) => [
      ...l,
      {
        id: `m-corbeau-${l.length}`,
        senderId: "corbeau",
        content: v,
        mediaType: "text",
        timestamp: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      },
    ]);
    setDraft("");
    toast.success("Message du Corbeau publié");
  };

  const broadcastSystem = () => {
    setList((l) => [
      ...l,
      {
        id: `m-sys-${l.length}`,
        senderId: "system",
        content: "🔔 Nouvelle preuve matérielle remise aux mariés.",
        mediaType: "text",
        timestamp: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      },
    ]);
    toast.success("Annonce système diffusée");
  };

  return (
    <div className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
      <header className="mb-5 flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Modération
          </p>
          <h1 className="font-serif text-4xl">Chat & indices</h1>
        </div>
        <Button variant="outline" onClick={broadcastSystem}>
          <ShieldAlert className="h-4 w-4 mr-1.5" />
          Diffuser une annonce
        </Button>
      </header>

      <div className="paper-texture rounded-xl border border-border shadow-paper p-3 max-h-[55vh] overflow-y-auto space-y-2">
        {list.map((m) => {
          if (m.senderId === "system")
            return (
              <p key={m.id} className="font-mono text-[11px] text-center uppercase tracking-widest text-muted-foreground bg-muted/60 rounded-full px-3 py-1 mx-auto w-fit">
                {m.content}
              </p>
            );
          if (m.senderId === "corbeau")
            return (
              <div key={m.id} className="mx-auto max-w-[80%] rounded-md border border-dashed border-primary/60 bg-primary/5 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-0.5">
                  ✉ Le Corbeau · {m.timestamp}
                </p>
                <p className="font-serif italic text-[15px]">{m.content}</p>
              </div>
            );
          const sender = charactersById[m.senderId];
          return (
            <div key={m.id} className="flex gap-2">
              <img
                src={sender.image}
                alt={sender.name}
                width={64}
                height={64}
                loading="lazy"
                className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
              />
              <div className={cn("flex-1 rounded-md border border-border bg-card px-3 py-1.5")}>
                <p className="text-xs flex items-center gap-2">
                  <span className="font-medium">{sender.name}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">{m.timestamp}</span>
                </p>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={sendAsCorbeau} className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
          Envoyer un message du Corbeau
        </p>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="« La marraine cache un sac… »"
            className="bg-background"
          />
          <Button type="submit">
            <Send className="h-4 w-4 mr-1.5" />
            Publier
          </Button>
        </div>
      </form>
    </div>
  );
}
