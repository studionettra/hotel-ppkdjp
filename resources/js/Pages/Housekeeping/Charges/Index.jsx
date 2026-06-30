import { useState } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function AddChargeModal({ activeRooms, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        room_id: '',
        charge_type: 'other',
        description: '',
        quantity: 1,
        unit_price: '',
        notes: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('housekeeping.charges.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Lapor Tagihan Kamar</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Kamar <span className="text-danger">*</span></label>
                                <select className={`form-select ${errors.room_id ? 'is-invalid' : ''}`}
                                    value={data.room_id} onChange={e => setData('room_id', e.target.value)}>
                                    <option value="">-- Pilih Kamar --</option>
                                    {activeRooms.map(r => (
                                        <option key={r.id} value={r.id}>Kamar {r.room_number}</option>
                                    ))}
                                </select>
                                {errors.room_id && <div className="invalid-feedback">{errors.room_id}</div>}
                                {activeRooms.length === 0 && <small className="text-muted d-block mt-1">Tidak ada kamar yang sedang terisi saat ini.</small>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Jenis Tagihan <span className="text-danger">*</span></label>
                                <select className={`form-select ${errors.charge_type ? 'is-invalid' : ''}`}
                                    value={data.charge_type} onChange={e => setData('charge_type', e.target.value)}>
                                    <option value="other">Kerusakan / Lainnya</option>
                                    <option value="minibar">Konsumsi Minibar</option>
                                </select>
                                {errors.charge_type && <div className="invalid-feedback">{errors.charge_type}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Nama Item / Deskripsi <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    value={data.description} onChange={e => setData('description', e.target.value)} 
                                    placeholder={data.charge_type === 'minibar' ? 'Contoh: Kacang Almond' : 'Contoh: Gelas Pecah'} />
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Jumlah (Qty) <span className="text-danger">*</span></label>
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
                                <label className="form-label">Catatan</label>
                                <textarea className="form-control" rows="2"
                                    value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Tambahan informasi..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={processing || activeRooms.length === 0}>
                                {processing ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                Laporkan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Index({ charges, activeRooms }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);

    function formatTanggal(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return (
        <AppLayout title="Lapor Tagihan Kerusakan & Minibar">
            {showModal && <AddChargeModal activeRooms={activeRooms} onClose={() => setShowModal(false)} />}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Riwayat Laporan Tagihan</h4>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-circle me-1"></i> Tambah Laporan
                </button>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th style={{ width: '12%', minWidth: '110px', paddingLeft: '1.5rem' }}>Tanggal</th>
                                    <th style={{ width: '10%', minWidth: '80px' }}>Kamar</th>
                                    <th style={{ width: '15%', minWidth: '120px' }}>Tamu</th>
                                    <th style={{ width: '12%', minWidth: '100px' }}>Jenis</th>
                                    <th style={{ width: '20%', minWidth: '150px' }}>Deskripsi</th>
                                    <th style={{ width: '8%', minWidth: '60px' }} className="text-center">Qty</th>
                                    <th style={{ width: '13%', minWidth: '110px' }} className="text-end">Total Biaya</th>
                                    <th style={{ width: '10%', minWidth: '100px', paddingRight: '1.5rem' }}>Dilaporkan Oleh</th>
                                </tr>
                            </thead>
                            <tbody>
                                {charges.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted fs-6">Belum ada riwayat pelaporan tagihan.</td>
                                    </tr>
                                ) : (
                                    charges.data.map(charge => (
                                        <tr key={charge.id} className="align-middle">
                                            <td style={{ paddingLeft: '1.5rem' }}>{formatTanggal(charge.charge_date)}</td>
                                            <td>
                                                <span className="fw-bold text-dark">{charge.folio?.check_in?.room?.room_number ?? '-'}</span>
                                            </td>
                                            <td>{charge.folio?.guest?.full_name ?? '-'}</td>
                                            <td>
                                                <span className={`badge ${charge.charge_type === 'minibar' ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'} px-2 py-1`}>
                                                    {charge.charge_type === 'minibar' ? 'Minibar' : 'Kerusakan/Lainnya'}
                                                </span>
                                            </td>
                                            <td>{charge.description}</td>
                                            <td className="text-center">{charge.quantity}</td>
                                            <td className="text-end text-danger fw-bold">Rp {Number(charge.amount).toLocaleString('id-ID')}</td>
                                            <td style={{ paddingRight: '1.5rem' }}>{charge.created_by?.name ?? '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {charges.last_page > 1 && (
                        <div className="card-footer d-flex justify-content-between align-items-center">
                            <small className="text-muted">Menampilkan {charges.from}–{charges.to} dari {charges.total} data</small>
                            <div className="d-flex gap-1">
                                {charges.links.map((link, i) => (
                                    <button key={i} className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
