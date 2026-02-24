import { useLocation } from "react-router-dom";

export default function Placeholder() {
  const { pathname } = useLocation();
  const title = pathname
    .replace(/^\//, "")
    .split("/")[0]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Home";

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-muted-foreground">
          This section is a placeholder. Ask to generate this page next and we will fill it with the right functionality and UI.
        </p>
      </div>
    </section>
  );
}
