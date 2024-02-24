import { deeptrainApiEndpoint, useDeeptrain } from "@/conf/env.ts";
import { ImgHTMLAttributes, useMemo } from "react";
import { cn } from "@/components/ui/lib/utils.ts";

export interface AvatarProps extends ImgHTMLAttributes<HTMLElement> {
  username: string;
}

function Avatar({ username, ...props }: AvatarProps) {
  const code = useMemo(
    () => (username.length > 0 ? username[0].toUpperCase() : "A"),
    [username],
  );

  const background = useMemo(() => {
    const colors = [
      "bg-red-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-sky-500",
      "bg-pink-500",
    ];
    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
  }, [username]);

  return useDeeptrain ? (
    <img {...props} src={`${deeptrainApiEndpoint}/avatar/${username}`} alt="" />
  ) : (
    <div {...props} className={cn("avatar", background, props.className)}>
      <p className={`text-white`}>{code}</p>
    </div>
  );
}

export default Avatar;
