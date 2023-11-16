import { openDialog } from "@/store/settings.ts";
import { version } from "@/conf.ts";
import { useDispatch } from "react-redux";
import {Settings} from "lucide-react";

function ChatFooter() {
  const dispatch = useDispatch();

  return (
    <div className={`version`}>
      <Settings
        className={`app w-4 h-4`}
        onClick={() => dispatch(openDialog())}
      />
      chatnio v{version}
    </div>
  );
}

export default ChatFooter;
