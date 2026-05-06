"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PermissionKey, UserRole } from "@prisma/client";

const ROLES: UserRole[] = ["CONTENT_EDITOR", "MANAGER", "ADMIN", "SUPER_ADMIN"];

type Member = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: PermissionKey[];
  isActive: boolean;
};

export function StaffManager({
  staff,
  permissions,
}: {
  staff: Member[];
  permissions: { key: PermissionKey; label: string }[];
}) {
  const [list, setList] = useState(staff);
  const [, start] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CONTENT_EDITOR" as UserRole });
  const [perms, setPerms] = useState<PermissionKey[]>([]);

  function togglePerm(k: PermissionKey, set: (next: PermissionKey[]) => void, current: PermissionKey[]) {
    set(current.includes(k) ? current.filter((p) => p !== k) : [...current, k]);
  }

  async function create() {
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, permissions: perms }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not create");
      return;
    }
    toast.success("Staff added");
    setList((p) => [...p, data]);
    setForm({ name: "", email: "", password: "", role: "CONTENT_EDITOR" });
    setPerms([]);
  }

  function update(id: string, body: Partial<Member>) {
    start(async () => {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) toast.error("Could not save");
      else toast.success("Saved");
    });
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        {list.map((m) => (
          <div key={m.id} className="border border-bone/10 p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-serif text-xl text-bone">{m.name || m.email}</p>
                <p className="text-[11px] uppercase tracking-editorial text-bone/60">{m.email}</p>
              </div>
              <select
                defaultValue={m.role}
                onChange={(e) => update(m.id, { role: e.target.value as UserRole })}
                className="border-b border-bone/30 bg-transparent text-[11px] uppercase tracking-editorial text-bone focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-charcoal text-bone">{r.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-editorial text-bone/50">Permissions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {permissions.map((p) => {
                  const on = m.permissions.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      onClick={() => {
                        const next = on ? m.permissions.filter((k) => k !== p.key) : [...m.permissions, p.key];
                        setList((prev) => prev.map((x) => (x.id === m.id ? { ...x, permissions: next } : x)));
                        update(m.id, { permissions: next });
                      }}
                      className={`px-3 py-1.5 text-[11px] uppercase tracking-editorial transition ${
                        on
                          ? "bg-bone text-charcoal"
                          : "border border-bone/30 text-bone/70 hover:bg-bone/5"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="lg:col-span-5">
        <div className="sticky top-24 border border-bone/10 p-6">
          <p className="text-[10px] uppercase tracking-editorial text-bone/50">Add staff</p>
          <h3 className="mt-2 font-serif text-2xl font-light">A new pair of hands.</h3>
          <div className="mt-5 space-y-4">
            <div>
              <Label className="mb-1 block text-bone/60">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-bone" />
            </div>
            <div>
              <Label className="mb-1 block text-bone/60">Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="text-bone" />
            </div>
            <div>
              <Label className="mb-1 block text-bone/60">Temporary password</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="text-bone" />
            </div>
            <div>
              <Label className="mb-1 block text-bone/60">Role</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                className="h-11 w-full border-b border-bone/30 bg-transparent text-sm text-bone focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-charcoal">{r.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1 block text-bone/60">Permissions</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {permissions.map((p) => {
                  const on = perms.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => togglePerm(p.key, setPerms, perms)}
                      className={`px-3 py-1.5 text-[11px] uppercase tracking-editorial transition ${
                        on ? "bg-bone text-charcoal" : "border border-bone/30 text-bone/70 hover:bg-bone/5"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button onClick={create} className="w-full bg-bone text-charcoal hover:bg-sand">
              Create staff member
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
