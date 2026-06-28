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
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>Kode</th><th>Tamu</th><th>Tipe Kamar</th><th>No. Kamar</th><th>Check In</th><th>Check Out</th><th>Tamu</th><th>Status</th><th>Aksi</th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={9} className="text-center text-muted">Tidak ada data reservasi.</td></tr>
                            )}
                            {filtered.map(r => (
                                <tr key={r.id}>
                                    <td><Link href={route('reservations.show', r.id)} className="fw-semibold">{r.reservation_code}</Link></td>
                                    <td>{r.guest?.full_name}</td>
                                    <td>{r.room_type?.name}</td>
                                    <td>{r.room?.room_number ?? '-'}</td>
                                    <td>{formatTanggal(r.check_in_date)}</td>
                                    <td>{formatTanggal(r.check_out_date)}</td>
                                    <td>{r.adults + r.children}</td>
                                    <td><span className={`badge bg-${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span></td>
                                    <td className="d-flex gap-1">
                                        <Link href={route('reservations.show', r.id)} className="btn btn-sm btn-info">
                                            <i className="bi bi-eye"></i>
                                        </Link>
                                        {['pending', 'confirmed'].includes(r.status) && (
                                            <>
                                                <Link href={route('reservations.edit', r.id)} className="btn btn-sm btn-warning">
                                                    <i className="bi bi-pencil"></i>
                                                </Link>
                                                <button className="btn btn-sm btn-danger" onClick={() => cancel(r)}>
                                                    <i className="bi bi-x-circle"></i>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
