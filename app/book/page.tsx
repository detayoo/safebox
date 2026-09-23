import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an appointment",
};

export default function BookPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Book an appointment</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Four short steps: your details, the visit, payment, then review.
        </p>
      </div>
    </div>
  );
}
