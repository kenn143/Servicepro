import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import QuoteIcon from "../icons/quote";
import FlyerTracker from "../icons/flyertracker";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  appKey: string; 
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    appKey: "Dashboard",
    path: "/home",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    appKey: "Calendar",
    path: "/calendar",
  },
  {
    icon: <FlyerTracker />,
    name: "Flyer Tracker",
    appKey: "Flyer Tracker",
    path: "/file-tracker",
  },
  {
    icon: <QuoteIcon />,
    name: "Light Installers Quote",
    appKey: "Light Installers Quote",
    path: "/quotation-list",
  },
  {
    icon: <GridIcon />,
    name: "Invoice",
    appKey: "Invoice",
    subItems: [
      { name: "Create Invoice", path: "/create-invoice" },
      { name: "Invoice List", path: "/invoice-list" },
    ],
  },
];

// const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [accessibleApps, setAccessibleApps] = useState<string[]>([]);

  useEffect(() => {
    const apps = localStorage.getItem("accessibleApps");
    if (apps) {
      setAccessibleApps(JSON.parse(apps));
    }
  }, []);

  const filteredNavItems = navItems.filter((item) => {
    if (item.appKey === "Dashboard") return true; 
    return accessibleApps.includes(item.appKey);
  });

 const isActive = useCallback(
  (path: string) => location.pathname === path,
  [location.pathname]
);


const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
  setOpenSubmenu((prev) => {
    if (prev && prev.type === menuType && prev.index === index) {
      return null; 
    }
    return { type: menuType, index }; 
  });
};
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
         {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
    <div
      className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
        openSubmenu?.type === menuType && openSubmenu?.index === index
          ? "max-h-40"
          : "max-h-0"
      }`}
    >
        <ul className="mt-2 space-y-1 ml-9">
          {nav.subItems.map((subItem) => (
            <li key={subItem.name}>
          <Link
            to={subItem.path}
            className={`menu-dropdown-item ${
              isActive(subItem.path)
                ? "menu-dropdown-item-active"
                : "menu-dropdown-item-inactive"
            }`}
          >
            {subItem.name}
          </Link>
            </li>
          ))}
        </ul>
  </div>
)}

        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ServicePros
            </span>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
