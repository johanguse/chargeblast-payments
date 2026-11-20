import * as Tooltip from "@radix-ui/react-tooltip";
import Link from "next/link";
import { formatRelativeTime } from "../../../domain/format";

export function DateCell({
  time,
  now,
  href,
  formatter,
}: {
  time: number;
  now: number;
  href: string;
  formatter: Intl.DateTimeFormat;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Link className="cell-link" href={href}>
          <time dateTime={new Date(time).toISOString()}>
            {formatter.format(time)}
          </time>
        </Link>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={6}
          collisionPadding={8}
          hideWhenDetached
          className="date-tooltip"
        >
          {formatRelativeTime(time, now)}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
