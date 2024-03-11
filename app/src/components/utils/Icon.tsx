import React from "react";

type Icon = {
  icon: React.ReactElement;
  className?: string;
  id?: string;
} & React.SVGProps<SVGSVGElement>;

function Icon({ icon, className, id, ...props }: Icon) {
  return React.cloneElement(icon, {
    className: className,
    id: id,
    ...props,
  });
}

export default Icon;
