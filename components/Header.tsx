interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border p-6">
      <h1 className="text-3xl font-bold text-foreground mb-1">{title}</h1>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
  );
}
