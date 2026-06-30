import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

const STATUS_COLORS = {
    pending: 'secondary', confirmed: 'primary', checked_in: 'success',
    checked_out: 'dark', cancelled: 'danger', no_show: 'warning',
};

const STATUS_LABELS = {
    pending: 'Pending', confirmed: 'Confirmed', checked_in: 'Check-In',
    checked_out: 'Check-Out', cancelled: 'Cancelled', no_show: 'No Show',
};

export default function Index({ reservations }) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    function cancel(res) {
        if (confirm(`Batalkan reservasi ${res.reservation_code}?`)) {
            router.patch(route('reservations.cancel', res.id));
        }
    }

    const filtered = reservations.filter(r => {
        const matchSearch = r.reservation_code.toLowerCase().includes(search.toLowerCase()) ||
            r.guest?.full_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <AppLayout title="Reservasi" breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Reservasi' }]}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Daftar Reservasi</h4>
                    <Link href={route('availability.index')} className="btn btn-primary btn-sm">
                        <i className="bi bi-plus-lg me-1"></i> Buat Reservasi Baru
                    </Link>
                </div>
                <div className="card-body">
                    <div className="d-flex gap-2 mb-3 flex-wrap">
                        <input type="text" className="form-control" placeholder="Cari kode / tamu..."
                            value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
                        <select className="form-select" style={{ maxWidth: 160 }}
                            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">Semua Status</option>
                            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4" style={{ width: '12%' }}>Kode</th>
                                    <th style={{ width: '18%' }}>Tamu</th>
                                    <th style={{ width: '15%' }}>Tipe Kamar</th>
                                    <th className="text-center" style={{ width: '10%' }}>No. Kamar</th>
                                    <th style={{ width: '12%' }}>Check In</th>
                                    <th style={{ width: '12%' }}>Check Out</th>
                                    <th className="text-center" style={{ width: '5%' }}>Pax</th>
                                    <th style={{ width: '10%' }}>Status</th>
                                    <th className="text-center pe-4" style={{ width: '6%' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={9} className="text-center text-muted py-4">Tidak ada data reservasi.</td></tr>
                                )}
                                {filtered.map(r => {
                                    const badgeClass = {
                                        pending: 'bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle',
                                        confirmed: 'bg-primary bg-opacity-10 text-primary border border-primary-subtle',
                                        checked_in: 'bg-success bg-opacity-10 text-success border border-success-subtle',
                                        checked_out: 'bg-body-secondary text-secondary border border-secondary-subtle',
                                        cancelled: 'bg-danger bg-opacity-10 text-danger border border-danger-subtle',
                                        no_show: 'bg-warning bg-opacity-10 text-warning border border-warning-subtle',
                                    }[r.status] || 'bg-light text-dark';

                                    return (
                                        <tr key={r.id}>
                                            <td className="ps-4">
                                                <Link href={route('reservations.show', r.id)} className="fw-semibold text-primary">{r.reservation_code}</Link>
                                            </td>
                                            <td>
                                                <div className="fw-medium">{r.guest?.full_name}</div>
                                            </td>
                                            <td><span className="text-body" style={{ fontSize: '0.85rem' }}>{r.room_type?.name}</span></td>
                                            <td className="text-center">
                                                {r.room?.room_number ? (
                                                    <span className="badge bg-light text-secondary border px-2 py-1">{r.room.room_number}</span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td><span style={{ fontSize: '0.85rem' }}>{formatTanggal(r.check_in_date)}</span></td>
                                            <td><span style={{ fontSize: '0.85rem' }}>{formatTanggal(r.check_out_date)}</span></td>
                                            <td className="text-center"><span className="fw-semibold text-secondary">{r.adults + r.children}</span></td>
                                            <td>
                                                <span className={`badge ${badgeClass} px-2.5 py-1.5`} style={{ fontSize: '0.725rem' }}>
                                                    {STATUS_LABELS[r.status]}
                                                </span>
                                            </td>
                                            <td className="text-center pe-4">
                                                <div className="d-flex align-items-center justify-content-center gap-1">
                                                    <Link href={route('reservations.show', r.id)} className="btn btn-icon btn-link text-info p-1 mb-0 border-0" title="Detail">
                                                        <i className="bi bi-eye fs-6"></i>
                                                    </Link>
                                                    {['pending', 'confirmed'].includes(r.status) && (
                                                        <>
                                                            <Link href={route('reservations.edit', r.id)} className="btn btn-icon btn-link text-warning p-1 mb-0 border-0" title="Edit">
                                                                <i className="bi bi-pencil fs-6"></i>
                                                            </Link>
                                                            <button className="btn btn-icon btn-link text-danger p-1 mb-0 border-0" onClick={() => cancel(r)} title="Batalkan">
                                                                <i className="bi bi-x-circle fs-6"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
