declare module "@radix-ui/react-select-area";

declare module "sonner" {
  export interface ToastProps {
    description: string;
  }

  export const Toaster: React.FC;

  export function toast(title: string, content?: ToastProps): void;
}
