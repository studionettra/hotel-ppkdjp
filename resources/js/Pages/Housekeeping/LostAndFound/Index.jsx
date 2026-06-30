import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DatePicker from '@/Components/DatePicker';

export default function Index({ items, rooms, filters }) {
    const [showCreate, setShowCreate] = useState(false);

    const storeForm = useForm({
        room_id: '', found_date: new Date().toISOString().split('T')[0],
        found_time: new Date().toTimeString().substring(0, 5),
        item_description: '', location_found: '', attendant_name: '', status: 'stored'
    });

    function submitStore(e) {
        e.preventDefault();
        storeForm.post(route('housekeeping.lost-and-found.store'), {
            onSuccess: () => { storeForm.reset(); setShowCreate(false); }
        });
    }

    function changeStatus(item, newStatus) {
        if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;
        router.put(route('housekeeping.lost-and-found.update', item.id), { status: newStatus });
    }

    return (
        <AppLayout title="Lost & Found" breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Lost & Found' }]}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Daftar Barang Temuan</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                        <i className="bi bi-plus-lg me-1"></i> Lapor Barang Ditemukan
                    </button>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.status ?? ''} 
                                onChange={e => router.get(route('housekeeping.lost-and-found.index'), { status: e.target.value }, { preserveState: true })}>
                                <option value="">Semua Status</option>
                                <option value="stored">Disimpan (Stored)</option>
                                <option value="claimed">Sudah Diambil (Claimed)</option>
                                <option value="disposed">Dibuang (Disposed)</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th style={{ width: '15%', minWidth: '130px', paddingLeft: '1.5rem' }}>Waktu Ditemukan</th>
                                    <th style={{ width: '15%', minWidth: '120px' }}>Lokasi / Kamar</th>
                                    <th style={{ width: '30%', minWidth: '200px' }}>Deskripsi Barang</th>
                                    <th style={{ width: '18%', minWidth: '130px' }}>Dilaporkan Oleh</th>
                                    <th style={{ width: '12%', minWidth: '100px' }}>Status</th>
                                    <th style={{ width: '10%', minWidth: '90px', paddingRight: '1.5rem' }} className="text-end">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-5 fs-6">Belum ada laporan barang temuan.</td></tr>}
                                {items.data.map(item => (
                                    <tr key={item.id} className="align-middle">
                                        <td style={{ paddingLeft: '1.5rem' }}>
                                            <span className="text-dark fw-medium">{new Date(item.found_date).toLocaleDateString('id-ID')}</span>
                                            <br/>
                                            <small className="text-muted">{item.found_time}</small>
                                        </td>
                                        <td>
                                            <span className="fw-semibold text-dark-emphasis">{item.room ? `Kamar ${item.room.room_number}` : (item.location_found || 'Area Umum')}</span>
                                        </td>
                                        <td>{item.item_description}</td>
                                        <td>{item.attendant_name || item.reporter?.name || '-'}</td>
                                        <td>
                                            <span className={`badge ${item.status === 'stored' ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : item.status === 'claimed' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'} px-2 py-1`}>
                                                {item.status === 'stored' ? 'Disimpan' : item.status === 'claimed' ? 'Klaim' : 'Dibuang'}
                                            </span>
                                        </td>
                                        <td className="text-end" style={{ paddingRight: '1.5rem' }}>
                                            {item.status === 'stored' && (
                                                <div className="d-inline-flex gap-1">
                                                    <button className="btn btn-sm btn-light border-0 text-success" onClick={() => changeStatus(item, 'claimed')} title="Tandai Diambil">
                                                        <i className="bi bi-check2-circle"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-light border-0 text-secondary" onClick={() => changeStatus(item, 'disposed')} title="Buang">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
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
                                    <h5 className="modal-title">Form Lapor Lost & Found</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowCreate(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3 row">
                                        <div className="col">
                                            <label className="form-label">Tanggal</label>
                                            <DatePicker className="form-control" required
                                                value={storeForm.data.found_date} onChange={e => storeForm.setData('found_date', e.target.value)} />
                                        </div>
                                        <div className="col">
                                            <label className="form-label">Waktu (AM/PM)</label>
                                            <input type="time" className="form-control" required
                                                value={storeForm.data.found_time} onChange={e => storeForm.setData('found_time', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Kamar (Opsional)</label>
                                        <select className="form-select" value={storeForm.data.room_id} onChange={e => storeForm.setData('room_id', e.target.value)}>
                                            <option value="">-- Bukan di Kamar --</option>
                                            {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Lokasi Penemuan (jika bukan kamar)</label>
                                        <input type="text" className="form-control" placeholder="Contoh: Lobi Utama"
                                            value={storeForm.data.location_found} onChange={e => storeForm.setData('location_found', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Nama Attendant / Penemu</label>
                                        <input type="text" className="form-control"
                                            value={storeForm.data.attendant_name} onChange={e => storeForm.setData('attendant_name', e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Deskripsi Barang <span className="text-danger">*</span></label>
                                        <textarea className="form-control" rows="3" required
                                            value={storeForm.data.item_description} onChange={e => storeForm.setData('item_description', e.target.value)} />
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
