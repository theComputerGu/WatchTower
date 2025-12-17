type Props = {
  title: string;
  children: React.ReactNode;
};

export default function RightPanel({ title, children }: Props) {
  return (
    <aside className="right-panel">
      <h3>{title}</h3>
      {children}
    </aside>
  );
}
