import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h2 className="font-serif text-2xl font-light">Addresses</h2>
      {addresses.length === 0 ? (
        <p className="mt-6 text-charcoal/60">
          You have no saved addresses. They will be saved with your first order.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="border border-charcoal/10 p-6 text-sm text-charcoal/80">
              <p className="font-serif text-lg text-charcoal">{a.fullName}</p>
              <p className="mt-2">{a.line1}</p>
              {a.line2 && <p>{a.line2}</p>}
              <p>{a.city}, {a.state} {a.postalCode}</p>
              <p>{a.country}</p>
              <p className="mt-2 text-charcoal/60">{a.phone}</p>
              {a.isDefault && <p className="mt-3 text-[11px] uppercase tracking-editorial">Default</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
