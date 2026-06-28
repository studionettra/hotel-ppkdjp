import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_COLORS = {
    pending: 'secondary', confirmed: 'primary', checked_in: 'success',
    checked_out: 'dark', cancelled: 'danger', no_show: 'warning',
};

export default function Show({ guest }) {
    return (
        <AppLayout title="Profil Tamu" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Tamu', href: route('guests.index') },
            { label: guest.full_name },
        ]}>
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">{guest.full_name}</h5>
                            <table className="table table-sm">
                                <tbody>
                                    <tr><th>Jenis ID</th><td>{guest.id_type?.toUpperCase()}</td></tr>
                                    <tr><th>No. ID</th><td>{guest.id_number}</td></tr>
                                    <tr><th>No. HP</th><td>{guest.phone || '-'}</td></tr>
                                    <tr><th>Email</th><td>{guest.email || '-'}</td></tr>
                                    <tr><th>Kebangsaan</th><td>{guest.nationality || '-'}</td></tr>
                                    <tr><th>Tgl Lahir</th><td>{guest.date_of_birth || '-'}</td></tr>
                                    <tr><th>Jenis Kelamin</th><td>{guest.gender === 'male' ? 'Laki-laki' : guest.gender === 'female' ? 'Perempuan' : '-'}</td></tr>
                                    <tr><th>Pekerjaan</th><td>{guest.profession || '-'}</td></tr>
                                    <tr><th>Perusahaan</th><td>{guest.company || '-'}</td></tr>
                                    <tr><th>No. Member</th><td>{guest.member_card_no || '-'}</td></tr>
                                    <tr><th>Alamat</th><td>{guest.address || '-'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Riwayat Menginap</h4></div>
                        <div className="card-body">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr><th>Kode</th><th>Tipe Kamar</th><th>Check In</th><th>Check Out</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {guest.reservations?.length === 0 && (
                                        <tr><td colSpan={5} className="text-center text-muted">Belum ada riwayat menginap.</td></tr>
                                    )}
                                    {guest.reservations?.map(r => (
                                        <tr key={r.id}>
                                            <td><Link href={route('reservations.show', r.id)}>{r.reservation_code}</Link></td>
                                            <td>{r.room_type?.name}</td>
                                            <td>{r.check_in_date}</td>
                                            <td>{r.check_out_date}</td>
                                            <td><span className={`badge bg-${STATUS_COLORS[r.status] ?? 'secondary'}`}>{r.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
