import {
  Check,
  ChevronDown,
  ChevronRight,
  LogOut,
  Package,
  Plus,
  Settings,
  SquareUserRound,
  Store,
  UserRound,
} from "lucide-react";
import { Popover } from "@/components/ui/popover";

const companies = ["cramly.ai", "SpeedSEO"] as const;
export type Workspace = {
  company: (typeof companies)[number];
  sandbox: boolean;
};
export type WorkspaceProps = {
  workspace: Workspace;
  onSwitch: (workspace: Workspace) => void;
};

function Avatar({ company }: Pick<Workspace, "company">) {
  if (company === "SpeedSEO")
    return (
      <span aria-hidden="true" className="account-initials">
        SS
      </span>
    );
  // biome-ignore lint/performance/noImgElement: small local workspace avatar.
  return <img src="/workspace.png" alt="" width={26} height={26} />;
}

export function WorkspaceSwitcher({ workspace, onSwitch }: WorkspaceProps) {
  const { company, sandbox } = workspace;
  return (
    <Popover
      label={`Switch company, ${company}`}
      triggerClassName="account"
      panelClassName="workspace-panel"
      trigger={
        <>
          {company === "SpeedSEO" ? (
            <span className="account-mark" aria-hidden="true">
              S
            </span>
          ) : (
            <Avatar company={company} />
          )}
          <span className="account-label">
            <strong>
              {company}
              {sandbox && " sandbox"}
            </strong>
            {sandbox && <span>{company}</span>}
          </span>
          <ChevronDown size={14} />
        </>
      }
    >
      {(close) => {
        function select(next: Workspace) {
          onSwitch(next);
          close();
        }
        return (
          <>
            <div className="workspace-identity">
              <Avatar company={company} />
              <div>
                <strong>
                  {company}
                  {sandbox && " sandbox"}
                </strong>
                <small>{company}</small>
              </div>
              {sandbox && (
                <button
                  type="button"
                  onClick={() => select({ company, sandbox: false })}
                >
                  Exit sandbox
                </button>
              )}
            </div>
            <div className="workspace-group">
              <button type="button" disabled>
                <Settings />
                Settings
              </button>
              <details>
                <summary>
                  <Package />
                  Switch sandbox
                  <ChevronRight />
                </summary>
                <button
                  type="button"
                  onClick={() => select({ company, sandbox: true })}
                >
                  {company} sandbox{sandbox && <Check />}
                </button>
              </details>
            </div>
            <div className="workspace-group">
              <details>
                <summary>
                  <Store />
                  Other accounts
                  <ChevronRight />
                </summary>
                {companies.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => select({ company: name, sandbox: true })}
                  >
                    {name}
                    {company === name && <Check />}
                  </button>
                ))}
              </details>
              <details>
                <summary>
                  <Plus />
                  Create
                  <ChevronRight />
                </summary>
                <button type="button" disabled>
                  Create account
                </button>
                <button type="button" disabled>
                  Create sandbox
                </button>
              </details>
            </div>
            <div className="workspace-group">
              <button type="button" disabled>
                <UserRound />
                Johan Guse
                <SquareUserRound size={12} />
              </button>
              <button type="button" disabled>
                <LogOut />
                Sign out
              </button>
            </div>
          </>
        );
      }}
    </Popover>
  );
}
