export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
      <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
    </header>
  );
}
