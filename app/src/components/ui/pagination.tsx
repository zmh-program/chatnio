import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/components/ui/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("cursor-pointer select-none", className)}
    {...props}
  />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="icon"
    className={cn("gap-1", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="icon"
    className={cn("gap-1", className)}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

type PaginationActionProps = React.ComponentProps<"div"> & {
  current: number;
  total: number;
  offset?: boolean;
  onPageChange: (page: number) => void;
};

const PaginationAction = ({
  current,
  total,
  offset = false,
  className,
  onPageChange,
  children,
  ...props
}: PaginationActionProps) => {
  const real = current + (offset ? 1 : 0);
  const diff = total - real;

  const hasPrev = current > 0;
  const hasNext = diff >= 1;

  const hasStepPrev = current > 1 && !hasNext;
  const hasStepNext = diff >= 2 && !hasPrev;

  const showRightEllipsis = diff > 2;
  const showLeftEllipsis = real > 2 && !showRightEllipsis;

  return (
    <Pagination className={cn("py-4", className)} {...props}>
      <PaginationContent>
        <PaginationItem onClick={() => hasPrev && onPageChange(current - 1)}>
          <PaginationPrevious />
        </PaginationItem>

        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {hasStepPrev && (
          <PaginationItem onClick={() => onPageChange(current - 2)}>
            <PaginationLink>{real - 2}</PaginationLink>
          </PaginationItem>
        )}

        {hasPrev && (
          <PaginationItem onClick={() => onPageChange(current - 1)}>
            <PaginationLink>{real - 1}</PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationLink isActive>{real}</PaginationLink>
        </PaginationItem>

        {hasNext && (
          <PaginationItem onClick={() => onPageChange(current + 1)}>
            <PaginationLink>{real + 1}</PaginationLink>
          </PaginationItem>
        )}

        {hasStepNext && (
          <PaginationItem onClick={() => onPageChange(current + 2)}>
            <PaginationLink>{real + 2}</PaginationLink>
          </PaginationItem>
        )}

        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem onClick={() => hasNext && onPageChange(current + 1)}>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
PaginationAction.displayName = "PaginationAction";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationAction,
};
