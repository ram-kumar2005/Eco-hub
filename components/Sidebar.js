"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Leaf, LayoutDashboard, Zap, BarChart3, FileText,
  MessageSquare, LogOut, Droplets, Trash2, Bus,
  Trophy, Map, TrendingUp, Calendar, User
} from "lucide-react";
import Link from "next/link";

const MAIN_NAV = [
  { href: "/dashboard",    label: "Home",           icon: LayoutDashboard },
  { href: "/carbonemission",label: "Carbon Emission", icon: Zap },
  { href: "/analytics",    label: "Analytics",      icon: BarChart3 },
  { href: "/report",       label: "AI Report",      icon: FileText },
  { href: "/complaints",   label: "Idea Board",     icon: MessageSquare },
];

const HUB_NAV = [
  { href: "/tracking",     label: "Tracking Hub",   icon: Droplets },
  { href: "/leaderboard",  label: "Leaderboard",    icon: Trophy },
  { href: "/campusmap",    label: "Campus Map",     icon: Map },
  { href: "/forecast",     label: "Forecast",       icon: TrendingUp },
  { href: "/events",       label: "Events",         icon: Calendar },
  { href: "/footprint",    label: "My Footprint",   icon: User },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Leaf size={20} />
        </div>
        <div className="brand-text">
          <span className="brand-name">Eco-Hub</span>
          <span className="brand-sub">Mepco Schlenk</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-label">Main Menu</p>
        {MAIN_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`nav-item ${pathname === href ? "active" : ""}`}>
            <Icon className="nav-icon" />
            {label}
          </Link>
        ))}

        <p className="sidebar-label" style={{ marginTop: "0.8rem" }}>Sustainability Hub</p>
        {HUB_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`nav-item ${pathname === href ? "active" : ""}`}>
            <Icon className="nav-icon" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="sidebar-user">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="user-meta">
            <div className="u-name">{user?.name || "Student"}</div>
            <span className={`u-role ${user?.role?.toLowerCase() || "student"}`}>
              {user?.role || "STUDENT"}
            </span>
          </div>
          <button
            className="logout-btn-sidebar"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
