import {Button} from "./ui/button.tsx";
import {Languages} from "lucide-react";
import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx";
import { setLanguage } from "../i18n.ts";
import { useTranslation } from "react-i18next";

function I18nProvider() {
  const { i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={i18n.language === 'cn'}
          onClick={() => setLanguage(i18n, 'cn')}
        >简体中文</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={i18n.language === 'en'}
          onClick={() => setLanguage(i18n, 'en')}
        >English</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default I18nProvider
