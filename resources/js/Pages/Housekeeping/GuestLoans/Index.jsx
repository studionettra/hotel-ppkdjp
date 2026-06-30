import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Index({ loans, rooms, filters }) {
    const [showCreate, setShowCreate] = useState(false);

    const storeForm = useForm({
        room_id: '', item_type: '', price: '0', notes: ''
    });

    function submitStore(e) {
        e.preventDefault();
        storeForm.post(route('housekeeping.guest-loans.store'), {
            onSuccess: () => { storeForm.reset(); setShowCreate(false); }
        });
    }

    function returnItem(loan) {
        if (!confirm(`Tandai barang ${loan.item_type} telah dikembalikan?`)) return;
        router.put(route('housekeeping.guest-loans.update', loan.id), { status: 'returned' });
    }

    return (
        <AppLayout title="Peminjaman Barang" breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Guest Loans' }]}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Daftar Peminjaman Barang</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                        <i className="bi bi-plus-lg me-1"></i> Input Peminjaman
                    </button>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.status ?? ''} 
                                onChange={e => router.get(route('housekeeping.guest-loans.index'), { status: e.target.value }, { preserveState: true })}>
                                <option value="">Semua Status</option>
                                <option value="borrowed">Sedang Dipinjam</option>
                                <option value="returned">Sudah Dikembalikan</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%', minWidth: '80px', paddingLeft: '1.5rem' }}>Kamar</th>
                                    <th style={{ width: '15%', minWidth: '120px' }}>Barang</th>
                                    <th style={{ width: '15%', minWidth: '130px' }}>Tgl Pinjam</th>
                                    <th style={{ width: '15%', minWidth: '130px' }}>Tgl Kembali</th>
                                    <th style={{ width: '12%', minWidth: '110px' }}>Harga</th>
                                    <th style={{ width: '12%', minWidth: '110px' }}>Status</th>
                                    <th style={{ width: '16%', minWidth: '130px' }}>Catatan</th>
                                    <th style={{ width: '10%', minWidth: '90px', paddingRight: '1.5rem' }} className="text-end">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.data.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-5 fs-6">Belum ada peminjaman barang.</td></tr>}
                                {loans.data.map(loan => (
                                    <tr key={loan.id} className="align-middle">
                                        <td style={{ paddingLeft: '1.5rem' }}><span className="fw-bold text-dark">{loan.room?.room_number}</span></td>
                                        <td>{loan.item_type}</td>
                                        <td className="text-muted small">{new Date(loan.loan_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                        <td className="text-muted small">{loan.return_date ? new Date(loan.return_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                                        <td className="fw-medium">Rp {Number(loan.price).toLocaleString('id-ID')}</td>
                                        <td>
                                            <span className={`badge ${loan.status === 'borrowed' ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : 'bg-success-subtle text-success border border-success-subtle'} px-2 py-1`}>
                                                {loan.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan'}
                                            </span>
                                        </td>
                                        <td>{loan.notes || '-'}</td>
                                        <td className="text-end" style={{ paddingRight: '1.5rem' }}>
                                            {loan.status === 'borrowed' && (
                                                <button className="btn btn-sm btn-light border-0 text-success" onClick={() => returnItem(loan)} title="Tandai Dikembalikan">
                                                    <i className="bi bi-check2-circle me-1"></i> Selesai
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={submitStore}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Form Peminjaman Barang (Guest Loan)</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowCreate(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Kamar <span className="text-danger">*</span></label>
                                        <select className="form-select" required value={storeForm.data.room_id} onChange={e => storeForm.setData('room_id', e.target.value)}>
                                            <option value="">-- Pilih Kamar --</option>
                                            {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Jenis Barang <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" required placeholder="Contoh: Charger, Setrika, Sajadah"
                                            value={storeForm.data.item_type} onChange={e => storeForm.setData('item_type', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Biaya / Harga (Rp)</label>
                                        <input type="number" className="form-control" min="0"
                                            value={storeForm.data.price} onChange={e => storeForm.setData('price', e.target.value)} />
                                        <small className="text-muted">Biarkan 0 jika barang ini gratis dipinjamkan.</small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Catatan</label>
                                        <textarea className="form-control" rows="2"
                                            value={storeForm.data.notes} onChange={e => storeForm.setData('notes', e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Batal</button>
                                    <button type="submit" className="btn btn-primary" disabled={storeForm.processing}>Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
