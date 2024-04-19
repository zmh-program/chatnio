import { Button } from '@/components/ui/button.tsx';
import { PauseCircle } from 'lucide-react';

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
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M17 11L12 6L7 11M12 6L12 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    ></path>
                </svg>
            )}
        </Button>
    );
}

export default ActionButton;
