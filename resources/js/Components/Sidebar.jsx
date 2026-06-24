import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';

const MENU = [
    {
        label: 'Dashboard',
        icon: 'bi-grid-fill',
        route: 'dashboard',
        permission: 'dashboard.view',
    },
    {
        label: 'Master Data',
        icon: 'bi-database-fill',
        permission: ['room.view', 'room-type.view'],
        children: [
            { label: 'Lantai', icon: 'bi-layers-fill', route: 'floors.index', permission: 'room.view' },
            { label: 'Tipe Kamar', icon: 'bi-building', route: 'room-types.index', permission: 'room-type.view' },
            { label: 'Kamar', icon: 'bi-door-open-fill', route: 'rooms.index', permission: 'room.view' },
        ],
    },
    {
        label: 'Front Office',
        icon: 'bi-person-lines-fill',
        permission: ['reservation.view', 'guest.view', 'checkin.create', 'checkout.create', 'folio.view'],
        children: [
            { label: 'Ketersediaan Kamar', icon: 'bi-grid-3x3-gap-fill', route: 'availability.index', permission: 'reservation.view' },
            { label: 'Tamu', icon: 'bi-people-fill', route: 'guests.index', permission: 'guest.view' },
            { label: 'Reservasi', icon: 'bi-calendar-check-fill', route: 'reservations.index', permission: 'reservation.view' },
        ],
    },
    {
        label: 'Housekeeping',
        icon: 'bi-stars',
        permission: ['housekeeping.view', 'laundry.view', 'pool.view'],
        children: [
            { label: 'Cleaning Tasks', icon: 'bi-clipboard-check-fill', route: 'housekeeping.tasks.index', permission: 'housekeeping.view' },
            { label: 'Laundry', icon: 'bi-basket-fill', route: 'laundry.index', permission: 'laundry.view' },
            { label: 'Pool Maintenance', icon: 'bi-droplet-fill', route: 'pool.index', permission: 'pool.view' },
        ],
    },
    {
        label: 'F&B',
        icon: 'bi-cup-hot-fill',
        permission: ['fnb.view', 'menu.view'],
        children: [
            { label: 'Pesanan', icon: 'bi-receipt-cutoff', route: 'fnb.orders.index', permission: 'fnb.view' },
            { label: 'Menu', icon: 'bi-journal-text', route: 'menu.index', permission: 'menu.view' },
        ],
    },
    {
        label: 'Laporan',
        icon: 'bi-bar-chart-fill',
        route: 'reports.index',
        permission: 'report.view',
    },
    {
        label: 'Administrasi',
        icon: 'bi-shield-lock-fill',
        permission: ['user.view', 'settings.view'],
        children: [
            { label: 'Pengguna', icon: 'bi-person-badge-fill', route: 'users.index', permission: 'user.view' },
            { label: 'Audit Log', icon: 'bi-journal-code', route: 'activity-log.index', permission: 'user.view' },
            { label: 'Pengaturan', icon: 'bi-gear-fill', route: 'settings.index', permission: 'settings.view' },
        ],
    },
];

export default function Sidebar() {
    const { auth, ziggy } = usePage().props;
    const permissions = auth?.permissions ?? [];
    const currentPath = ziggy?.location ?? '';

    const hasPermission = (permission) => {
        if (!permission) return true;
        if (Array.isArray(permission)) return permission.some(p => permissions.includes(p));
        return permissions.includes(permission);
    };

    const isActiveRoute = (routeName) => {
        try {
            const url = route(routeName);
            return currentPath === url || currentPath.startsWith(url + '/');
        } catch {
            return false;
        }
    };

    const isParentActive = (children) =>
        children?.some(c => { try { return isActiveRoute(c.route); } catch { return false; } }) ?? false;

    // Track which parent menus are open
    const [openMenus, setOpenMenus] = useState(() => {
        const open = {};
        MENU.forEach(item => {
            if (item.children && isParentActive(item.children)) {
                open[item.label] = true;
            }
        });
        return open;
    });

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <div id="sidebar" className="active">
            <div className="sidebar-wrapper active">
                <div className="sidebar-header">
                    <div className="d-flex justify-content-between">
                        <div className="logo">
                            <a href="/dashboard">
                                <img src="/mazer/images/logo/logo-ppkd-hotel.png" alt="PPKD Hotel" style={{ height: '56px', width: 'auto' }} />
                            </a>
                        </div>
                        <div className="toggler">
                            <a href="#" className="sidebar-hide d-xl-none d-block">
                                <i className="bi bi-x bi-middle"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="sidebar-menu">
                    <ul className="menu">
                        {MENU.map((item) => {
                            if (!hasPermission(item.permission)) return null;

                            // Simple link (no children)
                            if (!item.children) {
                                const active = isActiveRoute(item.route);
                                return (
                                    <li key={item.label} className={`sidebar-item${active ? ' active' : ''}`}>
                                        <Link href={route(item.route)} className="sidebar-link">
                                            <i className={`bi ${item.icon}`}></i>
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            }

                            // Parent with children
                            const visibleChildren = item.children.filter(c => hasPermission(c.permission));
                            if (visibleChildren.length === 0) return null;

                            const parentActive = isParentActive(visibleChildren);
                            const isOpen = openMenus[item.label] ?? parentActive;

                            return (
                                <li key={item.label} className={`sidebar-item has-sub${parentActive ? ' active' : ''}${isOpen ? ' open' : ''}`}>
                                    <a href="#" className="sidebar-link"
                                        onClick={(e) => { e.preventDefault(); toggleMenu(item.label); }}>
                                        <i className={`bi ${item.icon}`}></i>
                                        <span>{item.label}</span>
                                    </a>
                                    <ul className="submenu" style={{ display: isOpen ? 'block' : 'none' }}>
                                        {visibleChildren.map(child => {
                                            const childActive = isActiveRoute(child.route);
                                            return (
                                                <li key={child.route} className={`submenu-item${childActive ? ' active' : ''}`}>
                                                    <Link href={route(child.route)} className="submenu-link">
                                                        <i className={`bi ${child.icon} me-2`}></i>
                                                        {child.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <button className="sidebar-toggler btn x">
                    <i className="bi bi-x"></i>
                </button>
            </div>
        </div>
    );
}
