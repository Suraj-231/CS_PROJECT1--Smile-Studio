import { Sidebar } from "~/app/_components/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center min-h-screen">
      <Sidebar />
      <div className="w-full min-h-screen p-8">{children}</div>
    </div>
  );
}
