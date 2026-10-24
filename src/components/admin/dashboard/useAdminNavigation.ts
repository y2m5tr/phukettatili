import { useState, useEffect, useMemo } from 'react';
import { safeGetRaw, safeSetRaw } from '../../../lib/safeStorage';
import { getRolePermissions, getRoleBadge } from '../../../lib/rbac';
import {
  NAV_ITEMS,
  type AdminTab,
  type NavCategory,
  type NavItem,
} from '../adminNav';

export interface UseAdminNavigationArgs {
  viewerRole?: 'owner' | 'manager' | 'guide' | 'driver' | null;
}

export function useAdminNavigation({ viewerRole = null }: UseAdminNavigationArgs) {
  // Rol Bazlı Yetki Matrisi (RBAC)
  const perms = useMemo(() => getRolePermissions(viewerRole), [viewerRole]);
  const roleBadge = useMemo(() => getRoleBadge(viewerRole), [viewerRole]);

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((i) => perms.allowedTabs.includes(i.id)),
    [perms]
  );
  const canDeleteBookings = perms.canDeleteBookings;

  // Active Tab
  const [activeTab, setActiveTabState] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const isAllowedTab = (t: string | null): t is AdminTab =>
          Boolean(t && perms.allowedTabs.includes(t as AdminTab));
        const urlTab = new URL(window.location.href).searchParams.get('tab');
        if (isAllowedTab(urlTab)) return urlTab;
        const saved = safeGetRaw('ptt_admin_active_tab');
        if (isAllowedTab(saved)) return saved;
      } catch {
        /* gizli mod: sessizce varsayılana düş */
      }
    }
    return perms.defaultTab;
  });

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url);
    } catch {
      /* yok say */
    }
  };

  useEffect(() => {
    safeSetRaw('ptt_admin_active_tab', activeTab);
  }, [activeTab]);

  // Sidebar kontrolü
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return safeGetRaw('ptt_admin_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      safeSetRaw('ptt_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Kategori Filtresi
  const [categoryFilter, setCategoryFilter] = useState<NavCategory>(() => {
    const saved = safeGetRaw('ptt_admin_nav_category');
    if (saved && ['all', 'operations', 'finance', 'content', 'system'].includes(saved)) {
      return saved as NavCategory;
    }
    return 'operations';
  });

  const handleSelectCategory = (cat: NavCategory) => {
    setCategoryFilter(cat);
    safeSetRaw('ptt_admin_nav_category', cat);
  };

  const handleTabSelect = (tabId: AdminTab) => {
    setActiveTab(tabId);
    const item = NAV_ITEMS.find((i) => i.id === tabId);
    if (item && categoryFilter !== 'all' && categoryFilter !== item.category) {
      setCategoryFilter(item.category);
      try {
        localStorage.setItem('ptt_admin_nav_category', item.category);
      } catch {
        /* yok say */
      }
    }
    setIsMobileSidebarOpen(false);
  };

  // Sekme Grupları
  const operationNavItems = useMemo(
    () => visibleNavItems.filter((i) => i.category === 'operations'),
    [visibleNavItems]
  );
  const financeNavItems = useMemo(
    () => visibleNavItems.filter((i) => i.category === 'finance'),
    [visibleNavItems]
  );
  const cmsNavItems = useMemo(
    () => visibleNavItems.filter((i) => i.category === 'content'),
    [visibleNavItems]
  );
  const systemNavItems = useMemo(
    () => visibleNavItems.filter((i) => i.category === 'system'),
    [visibleNavItems]
  );

  const activeNavItem: NavItem | undefined = useMemo(
    () => NAV_ITEMS.find((item) => item.id === activeTab),
    [activeTab]
  );

  return {
    perms,
    roleBadge,
    visibleNavItems,
    canDeleteBookings,
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    categoryFilter,
    setCategoryFilter,
    handleSelectCategory,
    handleTabSelect,
    operationNavItems,
    financeNavItems,
    cmsNavItems,
    systemNavItems,
    activeNavItem,
  };
}
