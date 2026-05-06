import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlaygroundShell from "@/components/playground/PlaygroundShell";
import { getBugsForPlayground } from "@/lib/bugs";

export default async function ApiServicesLabPage() {
  const session = await getSession();
  if (!session.user || session.user.playground !== "api-services") {
    redirect("/login");
  }

  const bugs = getBugsForPlayground("api-services");

  return (
    <PlaygroundShell playground="api-services">
      <div className="max-w-2xl" data-testid="playground-shell">
        <h1 className="text-2xl font-bold mb-2">API Services Lab</h1>
        <p className="text-zinc-400 mb-8">
          Test API contracts, schema validation, and backend data integrity.
          This lab exposes the same product and order endpoints that power the
          Legacy App Lab — with intentional contract violations built in.
        </p>

        <section className="mb-8">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Available Endpoints
          </h2>
          <div className="space-y-2 font-mono text-sm">
            {[
              "GET    /api/products",
              "GET    /api/products/:id",
              "GET    /api/products?category=electronics",
              "GET    /api/products?search=headphones",
              "POST   /api/cart/items",
              "PUT    /api/cart/items/:id",
              "DELETE /api/cart/items/:id",
              "POST   /api/orders",
              "GET    /api/orders/:id",
              "GET    /api/reports",
            ].map((endpoint) => (
              <p key={endpoint} className="text-zinc-300">
                {endpoint}
              </p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Known Intentional Issues ({bugs.length})
          </h2>
          <div className="space-y-3">
            {bugs.map((bug) => (
              <div
                key={bug.id}
                data-testid="bug-entry"
                data-bug-id={bug.id}
                className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-zinc-500">{bug.id}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      bug.severity === "high"
                        ? "bg-red-900/50 text-red-400"
                        : bug.severity === "medium"
                        ? "bg-yellow-900/50 text-yellow-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {bug.severity}
                  </span>
                </div>
                <p className="text-sm text-white">{bug.description}</p>
                <p className="text-xs text-zinc-500 mt-1 italic">{bug.testHint}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PlaygroundShell>
  );
}
