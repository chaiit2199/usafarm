import { SidebarComponent } from "@/components/sidebar";
import { DashboardChrome } from "@/components/dashboard_chrome";
import { getCurrentUserPermissions, requireCurrentUser } from "@/lib/api/me";
import { buildMenuWithPermissions } from "@/lib/dashboard/navbar";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const [user, access] = await Promise.all([requireCurrentUser(), getCurrentUserPermissions()]);
  const menu = buildMenuWithPermissions(access.permissions);

  return (
    <div className="dashboard-layout">
      <div className="dashboard" id="dashboard">
        <SidebarComponent user={user} menu={menu} />
        <div className="dashboard__container">
          <div className="dashboard__inner">
            <DashboardChrome>{children}</DashboardChrome>
          </div>
        </div>
      </div>
    </div>
  );
}
