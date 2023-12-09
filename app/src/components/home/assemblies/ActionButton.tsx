import { Button } from "@/components/ui/button.tsx";
import { PauseCircle } from "lucide-react";

type SendButtonProps = {
  working: boolean;
  onClick: () => any;
};

function ActionButton({ onClick, working }: SendButtonProps) {
  return (
    <Button
      size={`icon`}
      variant="outline"
      className={`action-button`}
      onClick={onClick}
    >
      {working ? (
        <PauseCircle className={`h-4 w-4`} />
      ) : (
        <svg
          className="h-4 w-4 send-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="m21.426 11.095-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"></path>
        </svg>
      )}
    </Button>
  );
}

export default ActionButton;
