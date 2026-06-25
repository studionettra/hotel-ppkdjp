import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import AdminDashboard from './Partials/AdminDashboard';
import FODashboard from './Partials/FODashboard';
import HKDashboard from './Partials/HKDashboard';
import FnBDashboard from './Partials/FnBDashboard';

export default function Index({ dashboardData }) {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="page-heading">
                {/* <h3>Dashboard</h3> */}
            </div>

            <div className="page-content">
                {dashboardData.admin && (
                    <section className="mb-5">
                        <h5 className="mb-3">Ringkasan Administrator</h5>
                        <AdminDashboard data={dashboardData.admin} />
                    </section>
                )}

                {dashboardData.fo && (
                    <section className="mb-5">
                        <h5 className="mb-3">Ringkasan Front Office</h5>
                        <FODashboard data={dashboardData.fo} />
                    </section>
                )}

                {dashboardData.hk && (
                    <section className="mb-5">
                        <h5 className="mb-3">Ringkasan Housekeeping</h5>
                        <HKDashboard data={dashboardData.hk} />
                    </section>
                )}

                {dashboardData.fnb && (
                    <section className="mb-5">
                        <h5 className="mb-3">Ringkasan F&B</h5>
                        <FnBDashboard data={dashboardData.fnb} />
                    </section>
                )}

                {Object.keys(dashboardData).length === 0 && (
                    <div className="alert alert-info">
                        Anda tidak memiliki akses ke data dashboard departemen manapun.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
