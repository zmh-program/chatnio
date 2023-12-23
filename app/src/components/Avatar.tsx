import { deeptrainApiEndpoint, useDeeptrain } from "@/utils/env.ts";
import { ImgHTMLAttributes, useMemo } from "react";

export interface AvatarProps extends ImgHTMLAttributes<HTMLElement> {
  username: string;
}

function Avatar({ username, ...props }: AvatarProps) {
  const code = useMemo(
    () => (username.length > 0 ? username[0].toUpperCase() : "A"),
    [username],
  );

  const color = useMemo(() => {
    const colors = [
      "bg-red-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
  }, [username]);

  return useDeeptrain ? (
    <img {...props} src={`${deeptrainApiEndpoint}/avatar/${username}`} alt="" />
  ) : (
    <div {...props} className={`avatar ${color}`}>
      <p>{code}</p>
    </div>
  );
}

export default Avatar;
