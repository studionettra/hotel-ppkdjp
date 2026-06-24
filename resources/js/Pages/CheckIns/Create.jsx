import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function hitungMalam(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const ci = String(checkIn).substring(0, 10);
    const co = String(checkOut).substring(0, 10);
    const [y1, m1, d1] = ci.split('-').map(Number);
    const [y2, m2, d2] = co.split('-').map(Number);
    if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
    return Math.max(0, Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000));
}

function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const s = String(dateStr).substring(0, 10);
    const [y, m, d] = s.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export default function Create({ reservation, availableRooms }) {
    const { data, setData, post, processing, errors } = useForm({
        reservation_id: reservation.id,
        room_id: '',
        deposit_amount: '',
        deposit_method: 'cash',
        notes: '',
    });

    const nights = hitungMalam(reservation.check_in_date, reservation.check_out_date);
    const formatRp = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    function submit(e) {
        e.preventDefault();
        post(route('checkins.store'));
    }

    return (
        <AppLayout title="Proses Check-In" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Reservasi', href: route('reservations.index') },
            { label: reservation.reservation_code, href: route('reservations.show', reservation.id) },
            { label: 'Check-In' },
        ]}>
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Ringkasan Reservasi</h4></div>
                        <div className="card-body">
                            <table className="table table-borderless table-sm">
                                <tbody>
                                    <tr><td className="text-muted">No. Reservasi</td><td><strong>{reservation.reservation_code}</strong></td></tr>
                                    <tr><td className="text-muted">Tamu</td><td><strong>{reservation.guest?.full_name}</strong></td></tr>
                                    <tr><td className="text-muted">Tipe Kamar</td><td>{reservation.room_type?.name}</td></tr>
                                    <tr><td className="text-muted">Check-In</td><td>{formatTanggal(reservation.check_in_date)}</td></tr>
                                    <tr><td className="text-muted">Check-Out</td><td>{formatTanggal(reservation.check_out_date)}</td></tr>
                                    <tr><td className="text-muted">Durasi</td><td>{nights} malam</td></tr>
                                    <tr><td className="text-muted">Tamu</td><td>{reservation.adults} dewasa{reservation.children > 0 ? `, ${reservation.children} anak` : ''}</td></tr>
                                    <tr><td className="text-muted">Total</td><td><strong className="text-success">{formatRp(reservation.total_amount)}</strong></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Form Check-In</h4></div>
                        <div className="card-body">
                            <form onSubmit={submit}>
                                <div className="mb-3">
                                    <label className="form-label">Nomor Kamar <span className="text-danger">*</span></label>
                                    <select className={`form-select ${errors.room_id ? 'is-invalid' : ''}`}
                                        value={data.room_id} onChange={e => setData('room_id', e.target.value)} required>
                                        <option value="">-- Pilih Kamar --</option>
                                        {availableRooms.map(room => (
                                            <option key={room.id} value={room.id}>
                                                {room.room_number} — Lantai {room.floor?.floor_number} ({room.room_type?.name})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.room_id && <div className="invalid-feedback">{errors.room_id}</div>}
                                    {availableRooms.length === 0 && (
                                        <div className="form-text text-warning">
                                            Tidak ada kamar tersedia untuk tipe ini. Harap periksa status kamar.
                                        </div>
                                    )}
                                </div>

                                <hr />
                                <h6 className="mb-3">Deposit (Opsional)</h6>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Jumlah Deposit</label>
                                        <div className="input-group">
                                            <span className="input-group-text">Rp</span>
                                            <input type="number"
                                                className={`form-control ${errors.deposit_amount ? 'is-invalid' : ''}`}
                                                value={data.deposit_amount} onChange={e => setData('deposit_amount', e.target.value)}
                                                min="0" step="1000" placeholder="0" />
                                            {errors.deposit_amount && <div className="invalid-feedback">{errors.deposit_amount}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Metode Deposit</label>
                                        <select className={`form-select ${errors.deposit_method ? 'is-invalid' : ''}`}
                                            value={data.deposit_method} onChange={e => setData('deposit_method', e.target.value)}>
                                            <option value="cash">Tunai</option>
                                            <option value="debit">Debit</option>
                                            <option value="credit_card">Kartu Kredit</option>
                                            <option value="transfer">Transfer</option>
                                        </select>
                                        {errors.deposit_method && <div className="invalid-feedback">{errors.deposit_method}</div>}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Catatan</label>
                                    <textarea className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
                                        rows="3" value={data.notes} onChange={e => setData('notes', e.target.value)}
                                        placeholder="Permintaan khusus, catatan check-in, dll." />
                                    {errors.notes && <div className="invalid-feedback">{errors.notes}</div>}
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={processing || !data.room_id}>
                                        {processing
                                            ? <><span className="spinner-border spinner-border-sm me-1" />Memproses...</>
                                            : <><i className="bi bi-box-arrow-in-right me-1" />Proses Check-In</>}
                                    </button>
                                    <a href={route('reservations.show', reservation.id)} className="btn btn-light">Batal</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
