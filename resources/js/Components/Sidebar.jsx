import { useState, useEffect } from 'react';
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
        icon: 'bi-stack',
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
            { label: 'Ketersediaan Kamar', icon: 'bi-grid-3x3-gap-fill', route: 'availability.index', activeRoutes: ['availability.*', 'bookings.checkin'], permission: 'reservation.view' },
            { label: 'Reservasi', icon: 'bi-calendar-check-fill', route: 'reservations.index', activeRoutes: ['reservations.*', 'check-ins.*', 'check-outs.*', 'folios.*'], permission: 'reservation.view' },
            { label: 'Tamu', icon: 'bi-people-fill', route: 'guests.index', permission: 'guest.view' },
        ],
    },
    {
        label: 'Housekeeping',
        icon: 'bi-brush-fill',
        permission: ['housekeeping.view', 'laundry.view', 'pool.view'],
        children: [
            { label: 'Cleaning Tasks', icon: 'bi-card-checklist', route: 'housekeeping.tasks.index', permission: 'housekeeping.view' },
            { label: 'Lost & Found', icon: 'bi-search', route: 'housekeeping.lost-and-found.index', permission: 'housekeeping.view' },
            { label: 'Guest Loans', icon: 'bi-box-seam', route: 'housekeeping.guest-loans.index', permission: 'housekeeping.view' },
            { label: 'Control Sheet', icon: 'bi-file-earmark-check', route: 'housekeeping.control-sheets.index', permission: 'housekeeping.view' },
            { label: 'Lapor Tagihan', icon: 'bi-wallet2', route: 'housekeeping.charges.index', permission: 'housekeeping.view' },
            { label: 'Laundry', icon: 'bi-basket-fill', route: 'laundry.index', permission: 'laundry.view' },
            { label: 'Pool Maintenance', icon: 'bi-droplet-fill', route: 'pool.index', permission: 'pool.view' },
        ],
    },
    {
        label: 'F&B',
        icon: 'bi-cup-fill',
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

export default function Sidebar({ isActive = true, onToggle }) {
    const { auth, ziggy } = usePage().props;
    const permissions = auth?.permissions ?? [];
    const currentPath = ziggy?.location ?? '';

    // Theme toggle logic
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-bs-theme', storedTheme);
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(storedTheme);
    }, []);

    const toggleTheme = (e) => {
        const newTheme = e.target.checked ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(newTheme);
    };
    const hasPermission = (permission) => {
        if (!permission) return true;
        if (Array.isArray(permission)) return permission.some(p => permissions.includes(p));
        return permissions.includes(permission);
    };

    const isActiveRoute = (item) => {
        try {
            if (item.activeRoutes && item.activeRoutes.some(r => route().current(r))) {
                return true;
            }
            const url = route(item.route);
            return currentPath === url || currentPath.startsWith(url + '/');
        } catch {
            return false;
        }
    };

    const isParentActive = (children) =>
        children?.some(c => isActiveRoute(c)) ?? false;

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
        <div id="sidebar" className={isActive ? 'active' : ''}>
            <div className={`sidebar-wrapper ${isActive ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="logo">
                            <a href="/dashboard">
                                <img src="/mazer/images/logo/logo-ppkd-hotel.png" alt="PPKD Hotel" style={{ height: '56px', width: 'auto' }} />
                            </a>
                        </div>
                        <div className="theme-toggle d-flex gap-2 align-items-center mt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" className="iconify iconify--system-uicons" width="20" height="20" preserveAspectRatio="xMidYMid meet" viewBox="0 0 21 21">
                                <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.5 14.5c2.219 0 4-1.763 4-3.982a4.003 4.003 0 0 0-4-4.018c-2.219 0-4 1.781-4 4c0 2.219 1.781 4 4 4zM4.136 4.136L5.55 5.55m9.9 9.9l1.414 1.414M1.5 10.5h2m14 0h2M4.135 16.863L5.55 15.45m9.899-9.9l1.414-1.415M10.5 19.5v-2m0-14v-2" opacity=".3"></path>
                                    <g transform="translate(-210 -1)"><path d="M220.5 2.5v2m6.5.5l-1.5 1.5"></path><circle cx="220.5" cy="11.5" r="4"></circle><path d="m214 5l1.5 1.5m5 14v-2m6.5-.5l-1.5-1.5M214 18l1.5-1.5m-4-5h2m14 0h2"></path></g>
                                </g>
                            </svg>
                            <div className="form-check form-switch fs-6 m-0">
                                <input className="form-check-input me-0" type="checkbox" id="toggle-dark" style={{ cursor: 'pointer' }} checked={theme === 'dark'} onChange={toggleTheme} />
                                <label className="form-check-label"></label>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" className="iconify iconify--mdi" width="20" height="20" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                                <path fill="currentColor" d="m17.75 4.09l-2.53 1.94l.91 3.06l-2.63-1.81l-2.63 1.81l.91-3.06l-2.53-1.94L12.44 4l1.06-3l1.06 3l3.19.09m3.5 6.91l-1.64 1.25l.59 1.98l-1.7-1.17l-1.7 1.17l.59-1.98L15.75 11l2.06-.05L18.5 9l.69 1.95l2.06.05m-2.28 4.95c.83-.08 1.72 1.1 1.19 1.85c-.32.45-.66.87-1.08 1.27C15.17 23 8.84 23 4.94 19.07c-3.91-3.9-3.91-10.24 0-14.14c.4-.4.82-.76 1.27-1.08c.75-.53 1.93.36 1.85 1.19c-.27 2.86.69 5.83 2.89 8.02a9.96 9.96 0 0 0 8.02 2.89m-1.64 2.02a12.08 12.08 0 0 1-7.8-3.47c-2.17-2.19-3.33-5-3.49-7.82c-2.81 3.14-2.7 7.96.31 10.98c3.02 3.01 7.84 3.12 10.98.31Z"></path>
                            </svg>
                        </div>
                        <div className="toggler">
                            <a href="#" className="sidebar-hide d-xl-none d-block" onClick={(e) => { e.preventDefault(); if(onToggle) onToggle(); }}>
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
                                const active = isActiveRoute(item);
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
                                    <ul className={`submenu ${isOpen ? 'submenu-open' : 'submenu-closed'}`} style={{ display: isOpen ? 'block' : 'none', height: isOpen ? 'auto' : 0 }}>
                                        {visibleChildren.map(child => {
                                            const childActive = isActiveRoute(child);
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

            </div>
        </div>
    );
}
