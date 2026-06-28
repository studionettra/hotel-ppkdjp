import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DatePicker from '@/Components/DatePicker';

const statusLabel = {
    vc: 'Vacant Clean', vd: 'Vacant Dirty', oc: 'Occupied Clean',
    od: 'Occupied Dirty', ooo: 'Out of Order', oos: 'Out of Service',
};

const statusColor = {
    vc: 'bg-success', vd: 'bg-warning text-dark', oc: 'bg-primary',
    od: 'bg-danger', ooo: 'bg-secondary', oos: 'bg-dark',
};

const methodLabel = {
    cash: 'Tunai', debit_card: 'Debit', credit_card: 'Kredit',
    transfer: 'Transfer', city_ledger: 'City Ledger',
};

const orderTypeLabel = { dine_in: 'Dine In', room_service: 'Room Service', takeaway: 'Takeaway' };

function StatCard({ title, value, sub, color = 'primary' }) {
    return (
        <div className="col-md-3 col-sm-6">
            <div className={`card border-0 bg-${color} text-white`}>
                <div className="card-body">
                    <p className="mb-1 opacity-75">{title}</p>
                    <h3 className="mb-0">{value}</h3>
                    {sub && <small className="opacity-75">{sub}</small>}
                </div>
            </div>
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="card-title mb-0">{title}</h5>
            </div>
            <div className="card-body">{children}</div>
        </div>
    );
}

export default function Index({ filters, occupancy, revenue, housekeeping, fnb }) {
    function applyFilter(e) {
        e.preventDefault();
        const form = e.target;
        router.get(route('reports.index'), {
            from: form.from.value,
            to: form.to.value,
        }, { preserveState: true });
    }

    const fmt = n => `Rp ${Number(n).toLocaleString('id-ID')}`;

    return (
        <AppLayout title="Laporan">
            {/* Date Filter */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={applyFilter} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Dari Tanggal</label>
                            <DatePicker name="from" className="form-control" defaultValue={filters.from} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Sampai Tanggal</label>
                            <DatePicker name="to" className="form-control" defaultValue={filters.to} />
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="bi bi-search me-1" />Tampilkan
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Occupancy */}
            <SectionCard title="Laporan Hunian (Occupancy)">
                <div className="row mb-4">
                    <StatCard title="Total Kamar" value={occupancy.total_rooms} color="secondary" />
                    <StatCard title="Check-In" value={occupancy.check_ins} color="primary" />
                    <StatCard title="Check-Out" value={occupancy.check_outs} color="info" />
                    <StatCard
                        title="Occupancy Rate"
                        value={`${occupancy.occupancy_rate}%`}
                        color={occupancy.occupancy_rate >= 70 ? 'success' : occupancy.occupancy_rate >= 40 ? 'warning' : 'danger'}
                    />
                </div>
                <h6 className="mb-3">Status Kamar Saat Ini</h6>
                <div className="d-flex flex-wrap gap-2">
                    {Object.entries(occupancy.by_status ?? {}).map(([status, count]) => (
                        <span key={status} className={`badge fs-6 ${statusColor[status] ?? 'bg-secondary'}`}>
                            {statusLabel[status] ?? status}: {count}
                        </span>
                    ))}
                </div>
            </SectionCard>

            {/* Revenue */}
            <SectionCard title="Laporan Pendapatan">
                <div className="row mb-4">
                    <StatCard title="Total Pendapatan" value={fmt(revenue.total)} color="success" />
                    <StatCard title="Pendapatan F&B" value={fmt(revenue.fnb_revenue)} color="info" />
                    <StatCard title="Pendapatan Laundry" value={fmt(revenue.laundry_revenue)} color="primary" />
                    <StatCard title="Refund" value={fmt(revenue.refunds)} color="danger" />
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <h6 className="mb-3">Pendapatan per Metode Pembayaran</h6>
                        <table className="table table-sm table-bordered">
                            <thead className="table-light">
                                <tr><th>Metode</th><th className="text-end">Jumlah</th></tr>
                            </thead>
                            <tbody>
                                {Object.entries(revenue.by_method ?? {}).length === 0 && (
                                    <tr><td colSpan="2" className="text-center text-muted">Tidak ada data</td></tr>
                                )}
                                {Object.entries(revenue.by_method ?? {}).map(([method, amount]) => (
                                    <tr key={method}>
                                        <td>{methodLabel[method] ?? method}</td>
                                        <td className="text-end">{fmt(amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-6">
                        <h6 className="mb-3">Ringkasan</h6>
                        <table className="table table-sm table-bordered">
                            <tbody>
                                <tr>
                                    <td>Deposit Diterima</td>
                                    <td className="text-end">{fmt(revenue.deposits)}</td>
                                </tr>
                                <tr>
                                    <td>Refund Dikeluarkan</td>
                                    <td className="text-end text-danger">{fmt(revenue.refunds)}</td>
                                </tr>
                                <tr>
                                    <td>Pendapatan F&B</td>
                                    <td className="text-end">{fmt(revenue.fnb_revenue)}</td>
                                </tr>
                                <tr>
                                    <td>Pendapatan Laundry</td>
                                    <td className="text-end">{fmt(revenue.laundry_revenue)}</td>
                                </tr>
                                <tr className="table-success fw-bold">
                                    <td>Total Bersih</td>
                                    <td className="text-end">{fmt(revenue.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </SectionCard>

            {/* Housekeeping */}
            <SectionCard title="Laporan Housekeeping">
                <div className="row mb-4">
                    <StatCard title="Total Tugas" value={housekeeping.tasks_total} color="secondary" />
                    <StatCard title="Selesai" value={housekeeping.tasks_completed} color="success" />
                    <StatCard
                        title="Tingkat Penyelesaian"
                        value={`${housekeeping.completion_rate}%`}
                        color={housekeeping.completion_rate >= 80 ? 'success' : 'warning'}
                    />
                    <StatCard
                        title="Item Laundry"
                        value={Object.values(housekeeping.laundry_by_status ?? {}).reduce((a, b) => a + b, 0)}
                        color="info"
                    />
                </div>

                <div className="row">
                    <div className="col-md-4">
                        <h6 className="mb-3">Tugas per Status</h6>
                        <table className="table table-sm table-bordered">
                            <thead className="table-light"><tr><th>Status</th><th className="text-center">Jumlah</th></tr></thead>
                            <tbody>
                                {Object.entries(housekeeping.by_status ?? {}).map(([s, c]) => (
                                    <tr key={s}><td className="text-capitalize">{s.replace('_', ' ')}</td><td className="text-center">{c}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-4">
                        <h6 className="mb-3">Tugas per Jenis</h6>
                        <table className="table table-sm table-bordered">
                            <thead className="table-light"><tr><th>Jenis</th><th className="text-center">Jumlah</th></tr></thead>
                            <tbody>
                                {Object.entries(housekeeping.by_type ?? {}).map(([t, c]) => (
                                    <tr key={t}><td className="text-capitalize">{t.replace('_', ' ')}</td><td className="text-center">{c}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-4">
                        <h6 className="mb-3">Laundry per Status</h6>
                        <table className="table table-sm table-bordered">
                            <thead className="table-light"><tr><th>Status</th><th className="text-center">Jumlah</th></tr></thead>
                            <tbody>
                                {Object.entries(housekeeping.laundry_by_status ?? {}).map(([s, c]) => (
                                    <tr key={s}><td className="text-capitalize">{s}</td><td className="text-center">{c}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SectionCard>

            {/* F&B */}
            <SectionCard title="Laporan F&B">
                <div className="row mb-4">
                    <StatCard title="Total Pesanan" value={fnb.total_orders} color="secondary" />
                    <StatCard title="Pendapatan F&B" value={fmt(fnb.total_revenue)} color="success" />
                    <StatCard
                        title="Rata-rata per Pesanan"
                        value={fmt(fnb.total_orders > 0 ? fnb.total_revenue / fnb.total_orders : 0)}
                        color="info"
                    />
                </div>

                <div className="row">
                    <div className="col-md-4">
                        <h6 className="mb-3">Pesanan per Tipe</h6>
                        <table className="table table-sm table-bordered">
                            <thead className="table-light"><tr><th>Tipe</th><th className="text-center">Pesanan</th><th className="text-end">Revenue</th></tr></thead>
                            <tbody>
                                {Object.entries(fnb.by_type ?? {}).map(([type, data]) => (
                                    <tr key={type}>
                                        <td>{orderTypeLabel[type] ?? type}</td>
                                        <td className="text-center">{data.count}</td>
                                        <td className="text-end">{fmt(data.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-4">
                        <h6 className="mb-3">Pesanan per Status</h6>
                        <table className="table table-sm table-bordered">
                            <thead className="table-light"><tr><th>Status</th><th className="text-center">Jumlah</th></tr></thead>
                            <tbody>
                                {Object.entries(fnb.by_status ?? {}).map(([s, c]) => (
                                    <tr key={s}><td className="text-capitalize">{s}</td><td className="text-center">{c}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-4">
                        <h6 className="mb-3">Top 10 Menu</h6>
                        <table className="table table-sm table-bordered">
                            <thead className="table-light"><tr><th>Menu</th><th className="text-center">Qty</th><th className="text-end">Revenue</th></tr></thead>
                            <tbody>
                                {(fnb.top_items ?? []).length === 0 && (
                                    <tr><td colSpan="3" className="text-center text-muted">Tidak ada data</td></tr>
                                )}
                                {(fnb.top_items ?? []).map((item, i) => (
                                    <tr key={i}>
                                        <td>{item.name}</td>
                                        <td className="text-center">{item.total_qty}</td>
                                        <td className="text-end">{fmt(item.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SectionCard>
        </AppLayout>
    );
}
