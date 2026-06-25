import { Head, router, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

export default function AppLayout({ children, title, breadcrumbs = [] }) {
    const { auth, flash } = usePage().props;

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <>
            <Head title={title} />
            <div id="app">
                <Sidebar />

                <div id="main">
                    <header className="mb-3">
                        <a href="#" className="burger-btn d-block d-xl-none">
                            <i className="bi bi-justify fs-3"></i>
                        </a>
                        <nav className="navbar navbar-expand-lg navbar-light d-none d-xl-flex">
                            <div className="container-fluid">
                                <div className="ms-auto d-flex align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center bg-white rounded-pill p-1 pe-3 border shadow-sm">
                                            <span className="badge bg-primary d-flex align-items-center justify-content-center rounded-circle me-2 shadow-sm" style={{ width: '35px', height: '35px' }}>
                                                <i className="bi bi-person-fill fs-5"></i>
                                            </span>
                                            <div className="d-flex flex-column justify-content-center">
                                                <span className="fw-bold text-dark lh-1" style={{ fontSize: '0.85rem' }}>{auth?.user?.name}</span>
                                                <span className="badge bg-secondary text-white mt-1 rounded-pill" style={{ fontSize: '0.65rem', width: 'fit-content' }}>
                                                    {auth?.roles?.[0] ? auth.roles[0].replace(/_/g, ' ').toUpperCase() : 'USER'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={logout}
                                            className="btn btn-danger btn-sm d-flex align-items-center rounded-pill shadow-sm px-3"
                                            style={{ height: '40px' }}
                                        >
                                            <i className="bi bi-box-arrow-right me-2 fs-6"></i>
                                            <span className="fw-semibold">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </header>

                    {flash?.success && (
                        <div className="alert alert-success alert-dismissible fade show mx-3" role="alert">
                            {flash.success}
                            <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="alert alert-danger alert-dismissible fade show mx-3" role="alert">
                            {flash.error}
                            <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    )}

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
        </>
    );
}
