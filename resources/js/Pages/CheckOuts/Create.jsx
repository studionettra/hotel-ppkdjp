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

const formatRp = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function Create({ checkin, folio }) {
    const { data, setData, post, processing, errors } = useForm({
        check_in_id: checkin.id,
        payment_amount: '',
        payment_method: 'cash',
        feedback_rating: '',
        feedback_notes: '',
        notes: '',
    });

    const nights = hitungMalam(
        checkin.reservation?.check_in_date,
        checkin.reservation?.check_out_date
    );

    function submit(e) {
        e.preventDefault();
        post(route('checkouts.store'));
    }

    return (
        <AppLayout title="Proses Check-Out" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Reservasi', href: route('reservations.index') },
            { label: checkin.reservation?.reservation_code },
            { label: 'Check-Out' },
        ]}>
            <div className="row">
                {/* Check-In Summary */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Ringkasan Check-In</h4></div>
                        <div className="card-body">
                            <table className="table table-borderless table-sm">
                                <tbody>
                                    <tr><td className="text-muted">No. Reservasi</td><td><strong>{checkin.reservation?.reservation_code}</strong></td></tr>
                                    <tr><td className="text-muted">Tamu</td><td><strong>{checkin.reservation?.guest?.full_name}</strong></td></tr>
                                    <tr><td className="text-muted">Kamar</td><td>{checkin.room?.room_number}</td></tr>
                                    <tr><td className="text-muted">Check-In</td><td>{formatTanggal(checkin.reservation?.check_in_date)}</td></tr>
                                    <tr><td className="text-muted">Check-Out</td><td>{formatTanggal(checkin.reservation?.check_out_date)}</td></tr>
                                    <tr><td className="text-muted">Durasi</td><td>{nights} malam</td></tr>
                                    <tr>
                                        <td className="text-muted">Deposit</td>
                                        <td>{formatRp(checkin.deposit_amount ?? 0)}{checkin.deposit_method ? ` (${checkin.deposit_method})` : ''}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Folio Summary */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Ringkasan Folio</h4></div>
                        <div className="card-body">
                            <table className="table table-borderless table-sm">
                                <tbody>
                                    <tr><td className="text-muted">Folio No.</td><td><strong>{folio?.folio_number}</strong></td></tr>
                                    <tr><td className="text-muted">Total Tagihan</td><td>{formatRp(folio?.total_charges ?? 0)}</td></tr>
                                    <tr><td className="text-muted">Total Pembayaran</td><td className="text-success">{formatRp(folio?.total_payments ?? 0)}</td></tr>
                                    <tr>
                                        <td className="text-muted">Sisa Tagihan</td>
                                        <td className={Number(folio?.balance) > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                            {formatRp(folio?.balance ?? 0)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Status</td>
                                        <td>
                                            <span className={`badge ${folio?.status === 'open' ? 'bg-primary' : 'bg-success'}`}>
                                                {folio?.status?.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Check-Out Form */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Form Check-Out</h4></div>
                        <div className="card-body">
                            <form onSubmit={submit}>
                                <h6 className="mb-3">Pembayaran Tambahan (Opsional)</h6>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Jumlah</label>
                                        <div className="input-group">
                                            <span className="input-group-text">Rp</span>
                                            <input type="number"
                                                className={`form-control ${errors.payment_amount ? 'is-invalid' : ''}`}
                                                value={data.payment_amount} onChange={e => setData('payment_amount', e.target.value)}
                                                min="0" step="1000" placeholder="0" />
                                            {errors.payment_amount && <div className="invalid-feedback">{errors.payment_amount}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Metode</label>
                                        <select className={`form-select ${errors.payment_method ? 'is-invalid' : ''}`}
                                            value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}>
                                            <option value="cash">Tunai</option>
                                            <option value="debit_card">Debit</option>
                                            <option value="credit_card">Kredit</option>
                                            <option value="transfer">Transfer</option>
                                            <option value="city_ledger">City Ledger</option>
                                        </select>
                                        {errors.payment_method && <div className="invalid-feedback">{errors.payment_method}</div>}
                                    </div>
                                </div>

                                <hr />
                                <h6 className="mb-3">Umpan Balik Tamu</h6>
                                <div className="mb-3">
                                    <label className="form-label">Rating</label>
                                    <div className="d-flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button key={star} type="button"
                                                className={`btn btn-sm ${star <= Number(data.feedback_rating) ? 'btn-warning' : 'btn-outline-warning'}`}
                                                onClick={() => setData('feedback_rating', star)}>
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Catatan Tamu</label>
                                    <textarea className={`form-control ${errors.feedback_notes ? 'is-invalid' : ''}`}
                                        rows="2" value={data.feedback_notes} onChange={e => setData('feedback_notes', e.target.value)}
                                        placeholder="Pengalaman tamu, saran perbaikan, dll." />
                                    {errors.feedback_notes && <div className="invalid-feedback">{errors.feedback_notes}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Catatan Internal</label>
                                    <textarea className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
                                        rows="2" value={data.notes} onChange={e => setData('notes', e.target.value)}
                                        placeholder="Catatan untuk housekeeping / front office" />
                                    {errors.notes && <div className="invalid-feedback">{errors.notes}</div>}
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing
                                            ? <><span className="spinner-border spinner-border-sm me-1" />Memproses...</>
                                            : <><i className="bi bi-box-arrow-in-left me-1" />Proses Check-Out</>}
                                    </button>
                                    {folio && (
                                        <a href={route('folios.show', folio.id)} className="btn btn-light">Lihat Folio</a>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
