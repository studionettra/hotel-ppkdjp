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
                                    <div className="dropdown">
                                        <a
                                            href="#"
                                            className="dropdown-toggle d-flex align-items-center text-dark text-decoration-none"
                                            data-bs-toggle="dropdown"
                                        >
                                            <i className="bi bi-person-circle fs-5 me-2"></i>
                                            <span className="fw-semibold">{auth?.user?.name}</span>
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end shadow">
                                            <li>
                                                <span className="dropdown-item-text text-muted small">
                                                    {auth?.user?.username}
                                                </span>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <a className="dropdown-item text-danger" href="#" onClick={logout}>
                                                    <i className="bi bi-box-arrow-right me-2"></i>
                                                    Logout
                                                </a>
                                            </li>
                                        </ul>
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
