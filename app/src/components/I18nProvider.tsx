import { Button } from "./ui/button.tsx";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx";
import { langsProps, setLanguage } from "@/i18n.ts";
import { useTranslation } from "react-i18next";

function I18nProvider() {
  const { i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(langsProps).map(([key, value]) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={i18n.language === key}
            onClick={() => setLanguage(i18n, key)}
          >
            {value}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default I18nProvider;
