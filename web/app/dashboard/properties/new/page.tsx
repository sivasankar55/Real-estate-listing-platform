import { Navbar } from "@/components/navbar";
import { Protected } from "@/components/protected";
import { PropertyForm } from "@/components/property-form";

export default function NewPropertyPage() {
  return (
    <Protected>
      <Navbar />
      <main className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink">Post a property</h1>
        <p className="mt-2 text-muted">
          Share the details buyers and tenants need to decide.
        </p>
        <section className="mt-8 rounded-md border border-line bg-surface p-5 sm:p-8">
          <PropertyForm />
        </section>
      </main>
    </Protected>
  );
}
