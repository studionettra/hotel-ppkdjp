import { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const s = String(dateStr).substring(0, 10);
    const [y, m, d] = s.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function AddChargeModal({ folio, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        charge_type: 'room',
        description: '',
        quantity: 1,
        unit_price: '',
        charge_date: new Date().toISOString().slice(0, 10),
    });

    function submit(e) {
        e.preventDefault();
        post(route('folios.addCharge', folio.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Tambah Tagihan</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Jenis Tagihan <span className="text-danger">*</span></label>
                                <select className={`form-select ${errors.charge_type ? 'is-invalid' : ''}`}
                                    value={data.charge_type} onChange={e => setData('charge_type', e.target.value)}>
                                    <option value="room">Kamar</option>
                                    <option value="fnb">F&B</option>
                                    <option value="laundry">Laundry</option>
                                    <option value="extra_bed">Extra Bed</option>
                                    <option value="minibar">Minibar</option>
                                    <option value="other">Lainnya</option>
                                </select>
                                {errors.charge_type && <div className="invalid-feedback">{errors.charge_type}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Deskripsi <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    value={data.description} onChange={e => setData('description', e.target.value)} />
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Qty <span className="text-danger">*</span></label>
                                    <input type="number" className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                                        value={data.quantity} onChange={e => setData('quantity', e.target.value)} min="1" />
                                    {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Harga Satuan <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text">Rp</span>
                                        <input type="number" className={`form-control ${errors.unit_price ? 'is-invalid' : ''}`}
                                            value={data.unit_price} onChange={e => setData('unit_price', e.target.value)} min="0" />
                                        {errors.unit_price && <div className="invalid-feedback">{errors.unit_price}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Tanggal</label>
                                <input type="date" className="form-control"
                                    value={data.charge_date} onChange={e => setData('charge_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                Tambah
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function AddPaymentModal({ folio, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        payment_type: 'payment',
        payment_method: 'cash',
        amount: '',
        notes: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('folios.addPayment', folio.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Tambah Pembayaran</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Jenis <span className="text-danger">*</span></label>
                                <select className={`form-select ${errors.payment_type ? 'is-invalid' : ''}`}
                                    value={data.payment_type} onChange={e => setData('payment_type', e.target.value)}>
                                    <option value="payment">Pembayaran</option>
                                    <option value="refund">Refund</option>
                                </select>
                                {errors.payment_type && <div className="invalid-feedback">{errors.payment_type}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Metode <span className="text-danger">*</span></label>
                                <select className={`form-select ${errors.payment_method ? 'is-invalid' : ''}`}
                                    value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}>
                                    <option value="cash">Tunai</option>
                                    <option value="debit_card">Kartu Debit</option>
                                    <option value="credit_card">Kartu Kredit</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="city_ledger">City Ledger</option>
                                </select>
                                {errors.payment_method && <div className="invalid-feedback">{errors.payment_method}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Jumlah <span className="text-danger">*</span></label>
                                <div className="input-group">
                                    <span className="input-group-text">Rp</span>
                                    <input type="number" className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                                        value={data.amount} onChange={e => setData('amount', e.target.value)} min="0.01" step="1000" />
                                    {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Catatan</label>
                                <textarea className="form-control" rows="2"
                                    value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-success" disabled={processing}>
                                {processing ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const chargeTypeLabel = {
    room: 'Kamar', fnb: 'F&B', laundry: 'Laundry',
    extra_bed: 'Extra Bed', minibar: 'Minibar', other: 'Lainnya',
};

const paymentTypeLabel = { deposit: 'Deposit', payment: 'Pembayaran', refund: 'Refund' };
const methodLabel = {
    cash: 'Tunai', debit_card: 'Debit', credit_card: 'Kredit',
    transfer: 'Transfer', city_ledger: 'City Ledger',
};

export default function Show({ folio }) {
    const { auth } = usePage().props;
    const [showCharge, setShowCharge] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const canCharge = auth.permissions.includes('folio.charge');
    const canPayment = auth.permissions.includes('folio.payment');
    const canSettle = auth.permissions.includes('folio.settle');

    const statusBadge = {
        open: 'badge bg-primary',
        settled: 'badge bg-success',
        void: 'badge bg-secondary',
    };

    function settle() {
        if (!confirm('Tandai folio ini sebagai settled?')) return;
        router.post(route('folios.settle', folio.id));
    }

    return (
        <AppLayout title={`Folio ${folio.folio_number}`}>
            {showCharge && <AddChargeModal folio={folio} onClose={() => setShowCharge(false)} />}
            {showPayment && <AddPaymentModal folio={folio} onClose={() => setShowPayment(false)} />}

            <div className="row">
                {/* Folio Header */}
                <div className="col-12 mb-3">
                    <div className="card">
                        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <h5 className="mb-1">
                                    Folio #{folio.folio_number}
                                    <span className={`ms-2 ${statusBadge[folio.status] ?? 'badge bg-secondary'}`}>
                                        {folio.status?.toUpperCase()}
                                    </span>
                                </h5>
                                <small className="text-muted">
                                    Tamu: <strong>{folio.guest?.full_name}</strong>
                                    {folio.check_in && (
                                        <> &mdash; Kamar: <strong>{folio.check_in?.room?.room_number}</strong></>
                                    )}
                                </small>
                            </div>
                            {folio.status === 'open' && (
                                <div className="d-flex gap-2">
                                    {canCharge && (
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => setShowCharge(true)}>
                                            <i className="bi bi-plus-circle me-1" />Tagihan
                                        </button>
                                    )}
                                    {canPayment && (
                                        <button className="btn btn-sm btn-outline-success" onClick={() => setShowPayment(true)}>
                                            <i className="bi bi-cash me-1" />Pembayaran
                                        </button>
                                    )}
                                    {canSettle && (
                                        <button className="btn btn-sm btn-success" onClick={settle}>
                                            <i className="bi bi-check-circle me-1" />Settle
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charges */}
                <div className="col-md-8">
                    <div className="card mb-3">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Daftar Tagihan</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Jenis</th>
                                        <th>Deskripsi</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-end">Harga</th>
                                        <th className="text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {folio.charges?.length === 0 && (
                                        <tr><td colSpan="6" className="text-center text-muted py-3">Belum ada tagihan</td></tr>
                                    )}
                                    {folio.charges?.map(c => (
                                        <tr key={c.id}>
                                            <td>{formatTanggal(c.charge_date)}</td>
                                            <td><span className="badge bg-light text-dark">{chargeTypeLabel[c.charge_type]}</span></td>
                                            <td>{c.description}</td>
                                            <td className="text-center">{c.quantity}</td>
                                            <td className="text-end">Rp {Number(c.unit_price).toLocaleString('id-ID')}</td>
                                            <td className="text-end">Rp {Number(c.amount).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Riwayat Pembayaran</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>No. Pembayaran</th>
                                        <th>Jenis</th>
                                        <th>Metode</th>
                                        <th className="text-end">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {folio.payments?.length === 0 && (
                                        <tr><td colSpan="5" className="text-center text-muted py-3">Belum ada pembayaran</td></tr>
                                    )}
                                    {folio.payments?.map(p => (
                                        <tr key={p.id}>
                                            <td>{formatTanggal(p.payment_date)}</td>
                                            <td><code>{p.payment_number}</code></td>
                                            <td>
                                                <span className={`badge ${p.payment_type === 'refund' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                    {paymentTypeLabel[p.payment_type]}
                                                </span>
                                            </td>
                                            <td>{methodLabel[p.payment_method]}</td>
                                            <td className={`text-end ${p.payment_type === 'refund' ? 'text-danger' : 'text-success'}`}>
                                                {p.payment_type === 'refund' ? '-' : ''}Rp {Number(p.amount).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Ringkasan</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Total Tagihan</span>
                                <strong>Rp {Number(folio.total_charges).toLocaleString('id-ID')}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Total Pembayaran</span>
                                <strong className="text-success">Rp {Number(folio.total_payments).toLocaleString('id-ID')}</strong>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <span className="fw-bold">Sisa Tagihan</span>
                                <strong className={Number(folio.balance) > 0 ? 'text-danger fs-5' : 'text-success fs-5'}>
                                    Rp {Number(folio.balance).toLocaleString('id-ID')}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
