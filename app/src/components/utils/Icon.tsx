import React from "react";

type Icon = {
  icon: React.ReactElement;
  className?: string;
  id?: string;
};

function Icon({ icon, className, id }: Icon) {
  return React.cloneElement(icon, {
    className: className,
    id: id,
  });
}

export default Icon;
