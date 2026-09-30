import {
  useState,
} from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      {/* SIDEBAR */}

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* MAIN AREA */}

      <div className="min-h-screen lg:pl-[260px]">
        {/* TOPBAR */}

        <Topbar
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        {/* PAGE */}

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}