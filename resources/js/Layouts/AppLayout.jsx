import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Swal from 'sweetalert2';

export default function AppLayout({ children, title, breadcrumbs = [] }) {
    const { auth, flash } = usePage().props;
    const [isSidebarActive, setIsSidebarActive] = useState(true);

    useEffect(() => {
        const checkWidth = () => {
            setIsSidebarActive(window.innerWidth >= 1200);
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    useEffect(() => {
        return router.on('navigate', () => {
            if (window.innerWidth < 1200) {
                setIsSidebarActive(false);
            }
        });
    }, []);

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.success,
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: flash.error,
                toast: true,
                position: 'top-end'
            });
        }
    }, [flash]);

    return (
        <>
            <Head title={title} />
            <div id="app">
                <Sidebar isActive={isSidebarActive} onToggle={() => setIsSidebarActive(!isSidebarActive)} />

                <div id="main" className="layout-navbar navbar-fixed">
                    <header>
                        <nav className="navbar navbar-expand navbar-light navbar-top">
                            <div className="container-fluid">
                                <a href="#" className="burger-btn d-block d-xl-none" onClick={(e) => { e.preventDefault(); setIsSidebarActive(!isSidebarActive); }}>
                                    <i className="bi bi-justify fs-3"></i>
                                </a>

                                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                    aria-expanded="false" aria-label="Toggle navigation">
                                    <span className="navbar-toggler-icon"></span>
                                </button>
                                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                    <ul className="navbar-nav ms-auto mb-lg-0">
                                        <li className="nav-item dropdown me-3">
                                            <a className="nav-link active dropdown-toggle text-gray-600" href="#" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
                                                <i className='bi bi-bell bi-sub fs-4'></i>
                                                {auth?.notifications?.length > 0 && (
                                                    <span className="badge badge-notification bg-danger">{auth.notifications.length}</span>
                                                )}
                                            </a>
                                            <ul className="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="dropdownMenuButton">
                                                <li className="dropdown-header">
                                                    <h6>Notifications</h6>
                                                </li>
                                                {auth?.notifications?.length === 0 ? (
                                                    <li className="dropdown-item notification-item">
                                                        <a className="d-flex align-items-center" href="#">
                                                            <div className="notification-text ms-4">
                                                                <p className="notification-subtitle font-thin text-sm">Tidak ada notifikasi</p>
                                                            </div>
                                                        </a>
                                                    </li>
                                                ) : (
                                                    auth?.notifications?.map(n => {
                                                        const getTypeInfo = (type) => {
                                                            switch (type) {
                                                                case 'fnb_order': return { title: 'F&B Order', icon: 'bi-cup-hot', color: 'bg-primary' };
                                                                case 'fnb_order_completed': return { title: 'F&B Selesai', icon: 'bi-check-circle', color: 'bg-success' };
                                                                case 'extra_bed': return { title: 'Extra Bed', icon: 'bi-bed', color: 'bg-success' };
                                                                case 'housekeeping_task': return { title: 'Tugas HK', icon: 'bi-broom', color: 'bg-info' };
                                                                case 'housekeeping_task_started': return { title: 'HK Diproses', icon: 'bi-hourglass-split', color: 'bg-primary' };
                                                                case 'housekeeping_task_completed': return { title: 'HK Selesai', icon: 'bi-check-all', color: 'bg-success' };
                                                                case 'laundry_order': return { title: 'Laundry', icon: 'bi-basket', color: 'bg-warning' };
                                                                case 'laundry_order_completed': return { title: 'Laundry Selesai', icon: 'bi-box-seam', color: 'bg-success' };
                                                                default: return { title: 'Notification', icon: 'bi-bell', color: 'bg-secondary' };
                                                            }
                                                        };
                                                        const info = getTypeInfo(n.data.type);
                                                        return (
                                                            <li className="dropdown-item notification-item" key={n.id}>
                                                                <a className="d-flex align-items-center" href={route('notifications.read', n.id)}>
                                                                    <div className={`notification-icon ${info.color}`}>
                                                                        <i className={`bi ${info.icon}`}></i>
                                                                    </div>
                                                                    <div className="notification-text ms-4">
                                                                        <p className="notification-title font-bold">{info.title}</p>
                                                                        <p className="notification-subtitle font-thin text-sm">{n.data.message}</p>
                                                                    </div>
                                                                </a>
                                                            </li>
                                                        );
                                                    })
                                                )}
                                            </ul>
                                        </li>
                                    </ul>
                                    <div className="dropdown">
                                        <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                                            <div className="user-menu d-flex">
                                                <div className="user-name text-end me-3">
                                                    <h6 className="mb-0 text-gray-600">{auth?.user?.name}</h6>
                                                    <p className="mb-0 text-sm text-gray-600">{auth?.roles?.[0] ? auth.roles[0].replace(/_/g, ' ').toUpperCase() : 'USER'}</p>
                                                </div>
                                                <div className="user-img d-flex align-items-center">
                                                    <div className="avatar avatar-md">
                                                        <img src="/dist/assets/compiled/jpg/1.jpg" alt="User Avatar" />
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton" style={{ minWidth: '11rem' }}>
                                            <li>
                                                <h6 className="dropdown-header">Halo, {auth?.user?.name.split(' ')[0]}!</h6>
                                            </li>
                                            <li><a className="dropdown-item" href="#"><i className="icon-mid bi bi-person me-2"></i> Profil</a></li>
                                            <li>
                                                <hr className="dropdown-divider" />
                                            </li>
                                            <li><button className="dropdown-item" onClick={logout}><i className="icon-mid bi bi-box-arrow-left me-2"></i> Logout</button></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </header>

                    <div id="main-content">
                        <div className="page-heading">
                            {(title || breadcrumbs.length > 0) && (
                                <div className="page-title">
                                    <div className="row">
                                        <div className="col-12 col-md-6 order-md-1 order-last">
                                            {title && <h3>{title}</h3>}
                                        </div>
                                        {breadcrumbs.length > 0 && (
                                            <div className="col-12 col-md-6 order-md-2 order-first">
                                                <nav aria-label="breadcrumb" className="breadcrumb-header float-start float-lg-end">
                                                    <ol className="breadcrumb">
                                                        {breadcrumbs.map((crumb, i) => (
                                                            <li
                                                                key={i}
                                                                className={`breadcrumb-item${i === breadcrumbs.length - 1 ? ' active' : ''}`}
                                                                aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                                                            >
                                                                {crumb.href && i < breadcrumbs.length - 1
                                                                    ? <a href={crumb.href}>{crumb.label}</a>
                                                                    : crumb.label
                                                                }
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <section className="section">
                                {children}
                            </section>
                        </div>

                        <footer>
                            <div className="footer clearfix mb-0 text-muted">
                                <div className="float-start">
                                    <p>2026 &copy; PPKD Hotel Management System</p>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
