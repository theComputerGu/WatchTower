import type { ReactNode } from "react";
import "./RightPanel.css";

type Props = {
  title: string;
  children: ReactNode;
};

export default function RightPanel({ title, children }: Props) {
  return (
    <aside className="right-panel">
      <div className="right-panel-header">
        <h3>{title}</h3>
      </div>

      <div className="right-panel-content">
        {children}
      </div>
    </aside>
  );
}
