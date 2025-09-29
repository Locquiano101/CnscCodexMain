import { useOutletContext } from "react-router-dom";
import { SduMainNavigation } from "./sdu-main-navigation";
import { SduMainComponents } from "./sdu-route-components";

export function SduMainPage() {
  const { user } = useOutletContext();

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="min-w-72 bg-cnsc-primary-color flex flex-col">
        <SduMainNavigation />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <SduMainComponents user={user} />
      </main>
    </div>
  );
}
