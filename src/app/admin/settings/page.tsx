import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
  return (
    <div>
      <p className="text-[10px] uppercase tracking-editorial text-bone/50">Settings</p>
      <h2 className="mt-2 font-serif text-4xl font-light">House configuration.</h2>
      <div className="mt-10 max-w-3xl">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
