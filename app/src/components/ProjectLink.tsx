import { Button } from "./ui/button.tsx";
import { useConversationActions, useMessages } from "@/store/chat.ts";
import { MessageSquarePlus } from "lucide-react";
import Github from "@/components/ui/icons/Github.tsx";

function ProjectLink() {
  const messages = useMessages();

  const { toggle } = useConversationActions();

  return messages.length > 0 ? (
    <Button
      variant="outline"
      size="icon"
      onClick={async () => await toggle(-1)}
    >
      <MessageSquarePlus className={`h-4 w-4`} />
    </Button>
  ) : (
    <Button
      variant="outline"
      size="icon"
      onClick={() =>
        window.open("https://github.com/Deeptrain-Community/chatnio")
      }
    >
      <Github className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100" />
    </Button>
  );
}

export default ProjectLink;
