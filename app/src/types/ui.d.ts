declare module "@radix-ui/react-select-area";

declare module "sonner" {
  export interface ToastProps {
    description: string;
  }

  export function toast(title: string, content?: ToastProps): void;
}
