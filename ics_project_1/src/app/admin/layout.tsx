import { Sidebar } from "~/app/_components/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center min-h-screen">
      <Sidebar />
      <div className="flex w-full flex-col items p-8">{children}</div>
    </div>
  );
}
