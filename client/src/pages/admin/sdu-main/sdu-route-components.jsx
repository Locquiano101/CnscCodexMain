import { Routes, Route } from "react-router-dom";
import { UnderDevelopment } from "../../../components/components";
import { SduMainAccreditationNavigation } from "./sdu-main-navigation";

export function SduMainComponents({ selectedOrg, onSelectOrg }) {
  //   const renderRoute = (orgComponent, overviewComponent) =>
  //     selectedOrg ? orgComponent : overviewComponent;
  const renderRoute = () => <UnderDevelopment />;

  return (
    <Routes>
      {/* Dashboard/Home */}
      <Route path="/" element={renderRoute()} />

      {/* Proposals */}
      <Route path="/proposal" element={renderRoute()} />

      {/* Accreditation */}
      <Route path="/accreditation" element={<SduMainAccreditationNavigation />}>
        <Route index element={renderRoute()} />
        <Route path="financial-report" element={renderRoute()} />
        <Route path="roster-of-members" element={renderRoute()} />
        <Route path="document" element={renderRoute()} />
        <Route path="proposed-action-plan" element={renderRoute()} />
        <Route path="president-information" element={renderRoute()} />
        <Route path="settings" element={renderRoute()} />
      </Route>

      {/* Accomplishments */}
      <Route path="/accomplishment" element={renderRoute()} />

      {/* Posts */}
      <Route path="/post" element={renderRoute()} />

      {/* User Management */}
      <Route path="/user-management" element={renderRoute()} />
    </Routes>
  );
}
