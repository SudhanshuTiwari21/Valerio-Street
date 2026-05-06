import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) return null;
  return (
    <div>
      <h2 className="font-serif text-2xl font-light">Account settings</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Field label="Name" value={session.user.name ?? "-"} />
        <Field label="Email" value={session.user.email ?? "-"} />
        <Field label="Role" value={session.user.role ?? "CUSTOMER"} />
      </div>
      <p className="mt-10 max-w-md text-sm text-charcoal/60">
        For changes to your private account, please write to atelier@valeriostreet.com.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-charcoal/10 py-4">
      <p className="editorial-eyebrow">{label}</p>
      <p className="mt-2 font-serif text-xl">{value}</p>
    </div>
  );
}
