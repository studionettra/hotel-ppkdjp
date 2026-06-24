import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_COLORS = {
    pending: 'secondary', confirmed: 'primary', checked_in: 'success',
    checked_out: 'dark', cancelled: 'danger', no_show: 'warning',
};

const STATUS_LABELS = {
    pending: 'Pending', confirmed: 'Confirmed', checked_in: 'Check-In',
    checked_out: 'Check-Out', cancelled: 'Cancelled', no_show: 'No Show',
};

function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const s = String(dateStr).substring(0, 10);
    const [y, m, d] = s.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function hitungMalam(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const ci = String(checkIn).substring(0, 10);
    const co = String(checkOut).substring(0, 10);
    const [y1, m1, d1] = ci.split('-').map(Number);
    const [y2, m2, d2] = co.split('-').map(Number);
    if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
    const a = new Date(y1, m1 - 1, d1);
    const b = new Date(y2, m2 - 1, d2);
    return Math.max(0, Math.round((b - a) / 86400000));
}

export default function Show({ reservation }) {
    const formatRp = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    const nights = hitungMalam(reservation.check_in_date, reservation.check_out_date);

    return (
        <AppLayout title="Detail Reservasi" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Reservasi', href: route('reservations.index') },
            { label: reservation.reservation_code },
        ]}>
            <div className="row">
                <div className="col-md-7">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title mb-0">{reservation.reservation_code}</h4>
                            <span className={`badge bg-${STATUS_COLORS[reservation.status]}`}>
                                {STATUS_LABELS[reservation.status] ?? reservation.status}
                            </span>
                        </div>
                        <div className="card-body">
                            <table className="table table-sm">
                                <tbody>
                                    <tr><th style={{width:'40%'}}>Tamu</th><td>{reservation.guest?.full_name}</td></tr>
                                    <tr><th>Tipe Kamar</th><td>{reservation.room_type?.name}</td></tr>
                                    <tr><th>Kamar</th><td>{reservation.room?.room_number ?? <em className="text-muted">Belum ditentukan</em>}</td></tr>
                                    <tr><th>Check-In</th><td>{formatTanggal(reservation.check_in_date)}</td></tr>
                                    <tr><th>Check-Out</th><td>{formatTanggal(reservation.check_out_date)}</td></tr>
                                    <tr><th>Durasi</th><td>{nights} malam</td></tr>
                                    <tr><th>Dewasa</th><td>{reservation.adults}</td></tr>
                                    <tr><th>Anak-anak</th><td>{reservation.children}</td></tr>
                                    <tr><th>Channel</th><td>{reservation.channel}</td></tr>
                                    <tr><th>Total</th><td><strong>{formatRp(reservation.total_amount)}</strong></td></tr>
                                    <tr><th>Dibuat oleh</th><td>{reservation.created_by?.name ?? '-'}</td></tr>
                                    <tr><th>Permintaan Khusus</th><td>{reservation.special_request || '-'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-md-5">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Aksi</h4></div>
                        <div className="card-body d-flex flex-column gap-2">
                            {['pending', 'confirmed'].includes(reservation.status) && (
                                <Link href={route('reservations.edit', reservation.id)} className="btn btn-warning">
                                    <i className="bi bi-pencil me-2"></i>Edit Reservasi
                                </Link>
                            )}
                            {reservation.status === 'confirmed' && (
                                <Link href={route('checkins.create', reservation.id)} className="btn btn-success">
                                    <i className="bi bi-box-arrow-in-right me-2"></i>Proses Check-In
                                </Link>
                            )}
                            <Link href={route('guests.show', reservation.guest_id)} className="btn btn-info">
                                <i className="bi bi-person me-2"></i>Lihat Profil Tamu
                            </Link>
                            <Link href={route('reservations.index')} className="btn btn-secondary">
                                <i className="bi bi-arrow-left me-2"></i>Kembali
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
