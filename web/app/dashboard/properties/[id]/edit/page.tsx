import { Navbar } from "@/components/navbar";
import { Protected } from "@/components/protected";
import { PropertyEditForm } from "@/components/property-edit-form";

type Props = { params: Promise<{ id: string }> };
export default async function EditPropertyPage({ params }: Props) {
  return (
    <Protected>
      <Navbar />
      <main className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink">Edit property</h1>
        <p className="mt-2 text-muted">
          Update details and manage listing images.
        </p>
        <section className="mt-8 rounded-md border border-line bg-surface p-5 sm:p-8">
          <PropertyEditForm propertyId={(await params).id} />
        </section>
      </main>
    </Protected>
  );
}
