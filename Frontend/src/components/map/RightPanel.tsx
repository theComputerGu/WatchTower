import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export default function RightPanel({ title, children }: Props) {
  return (
    <div className="right-panel">
      <h3>{title}</h3>
      <div className="right-panel-content">
        {children}
      </div>
    </div>
  );
}
