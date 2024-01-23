import { Button } from "./ui/button.tsx";
import { selectMessages } from "@/store/chat.ts";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquarePlus } from "lucide-react";
import { toggleConversation } from "@/api/history.ts";
import Github from "@/components/ui/icons/Github.tsx";

function ProjectLink() {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);

  return messages.length > 0 ? (
    <Button
      variant="outline"
      size="icon"
      onClick={async () => await toggleConversation(dispatch, -1)}
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
