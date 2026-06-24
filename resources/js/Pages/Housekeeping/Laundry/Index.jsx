import { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const statusBadge = {
    received:   'bg-info text-dark',
    processing: 'bg-primary',
    ready:      'bg-warning text-dark',
    delivered:  'bg-success',
    cancelled:  'bg-secondary',
};

const statusLabel = {
    received: 'Diterima', processing: 'Diproses',
    ready: 'Siap', delivered: 'Dikirim', cancelled: 'Dibatalkan',
};

const serviceLabel = { regular: 'Regular', express: 'Express', dry_clean: 'Dry Clean' };
const itemTypeLabel = { clothes: 'Pakaian', linen: 'Linen', towel: 'Handuk', uniform: 'Seragam', other: 'Lainnya' };

function CreateModal({ rooms, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        guest_id: '', room_id: '', item_name: '', item_type: 'clothes',
        quantity: 1, service_type: 'regular', unit_price: '',
        estimated_ready_at: '', notes: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('laundry.store'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Tambah Item Laundry</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">ID Tamu *</label>
                                    <input type="number" className={`form-control ${errors.guest_id ? 'is-invalid' : ''}`}
                                        value={data.guest_id} onChange={e => setData('guest_id', e.target.value)}
                                        placeholder="ID tamu" required />
                                    {errors.guest_id && <div className="invalid-feedback">{errors.guest_id}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Kamar *</label>
                                    <select className={`form-select ${errors.room_id ? 'is-invalid' : ''}`}
                                        value={data.room_id} onChange={e => setData('room_id', e.target.value)} required>
                                        <option value="">-- Pilih Kamar --</option>
                                        {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                                    </select>
                                    {errors.room_id && <div className="invalid-feedback">{errors.room_id}</div>}
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nama Item *</label>
                                    <input type="text" className={`form-control ${errors.item_name ? 'is-invalid' : ''}`}
                                        value={data.item_name} onChange={e => setData('item_name', e.target.value)} required />
                                    {errors.item_name && <div className="invalid-feedback">{errors.item_name}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Jenis Item *</label>
                                    <select className="form-select" value={data.item_type} onChange={e => setData('item_type', e.target.value)}>
                                        <option value="clothes">Pakaian</option>
                                        <option value="linen">Linen</option>
                                        <option value="towel">Handuk</option>
                                        <option value="uniform">Seragam</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">Qty *</label>
                                    <input type="number" className="form-control"
                                        value={data.quantity} onChange={e => setData('quantity', e.target.value)} min="1" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Layanan *</label>
                                    <select className="form-select" value={data.service_type} onChange={e => setData('service_type', e.target.value)}>
                                        <option value="regular">Regular</option>
                                        <option value="express">Express</option>
                                        <option value="dry_clean">Dry Clean</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Harga Satuan *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">Rp</span>
                                        <input type="number" className={`form-control ${errors.unit_price ? 'is-invalid' : ''}`}
                                            value={data.unit_price} onChange={e => setData('unit_price', e.target.value)} min="0" />
                                        {errors.unit_price && <div className="invalid-feedback">{errors.unit_price}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Estimasi Selesai</label>
                                    <input type="datetime-local" className="form-control"
                                        value={data.estimated_ready_at} onChange={e => setData('estimated_ready_at', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Catatan</label>
                                    <input type="text" className="form-control"
                                        value={data.notes} onChange={e => setData('notes', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? <span className="spinner-border spinner-border-sm me-1" /> : null} Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function UpdateStatusModal({ item, onClose }) {
    const { data, setData, put, processing } = useForm({
        status: item.status,
        notes:  item.notes ?? '',
    });

    function submit(e) {
        e.preventDefault();
        put(route('laundry.update', item.id), { onSuccess: onClose });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Status — {item.item_name}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Status *</label>
                                <select className="form-select" value={data.status} onChange={e => setData('status', e.target.value)}>
                                    <option value="received">Diterima</option>
                                    <option value="processing">Diproses</option>
                                    <option value="ready">Siap</option>
                                    <option value="delivered">Dikirim</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Catatan</label>
                                <textarea className="form-control" rows="2"
                                    value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? <span className="spinner-border spinner-border-sm me-1" /> : null} Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Index({ items, rooms, filters }) {
    const { auth } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const canCreate = auth.permissions.includes('laundry.create');
    const canUpdate = auth.permissions.includes('laundry.update');
    const canDelete = auth.permissions.includes('laundry.delete');

    function applyFilter(key, value) {
        router.get(route('laundry.index'), { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function deleteItem(id) {
        if (!confirm('Hapus item laundry ini?')) return;
        router.delete(route('laundry.destroy', id));
    }

    return (
        <AppLayout title="Laundry">
            {showCreate && <CreateModal rooms={rooms} onClose={() => setShowCreate(false)} />}
            {editItem && <UpdateStatusModal item={editItem} onClose={() => setEditItem(null)} />}

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h4 className="card-title mb-0">Manajemen Laundry</h4>
                    {canCreate && (
                        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                            <i className="bi bi-plus-circle me-1" />Tambah Item
                        </button>
                    )}
                </div>
                <div className="card-body border-bottom pb-3">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.status ?? ''} onChange={e => applyFilter('status', e.target.value)}>
                                <option value="">Semua Status</option>
                                <option value="received">Diterima</option>
                                <option value="processing">Diproses</option>
                                <option value="ready">Siap</option>
                                <option value="delivered">Dikirim</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.service_type ?? ''} onChange={e => applyFilter('service_type', e.target.value)}>
                                <option value="">Semua Layanan</option>
                                <option value="regular">Regular</option>
                                <option value="express">Express</option>
                                <option value="dry_clean">Dry Clean</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.room_id ?? ''} onChange={e => applyFilter('room_id', e.target.value)}>
                                <option value="">Semua Kamar</option>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Tamu / Kamar</th>
                                <th>Item</th>
                                <th>Jenis</th>
                                <th>Layanan</th>
                                <th className="text-center">Qty</th>
                                <th className="text-end">Total</th>
                                <th>Status</th>
                                <th>Estimasi Siap</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.data.length === 0 && (
                                <tr><td colSpan="9" className="text-center text-muted py-4">Tidak ada item laundry</td></tr>
                            )}
                            {items.data.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.guest?.full_name}</strong><br />
                                        <small className="text-muted">Kamar {item.room?.room_number}</small>
                                    </td>
                                    <td>{item.item_name}</td>
                                    <td>{itemTypeLabel[item.item_type]}</td>
                                    <td><span className="badge bg-light text-dark">{serviceLabel[item.service_type]}</span></td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-end">Rp {Number(item.total_price).toLocaleString('id-ID')}</td>
                                    <td><span className={`badge ${statusBadge[item.status]}`}>{statusLabel[item.status]}</span></td>
                                    <td>{item.estimated_ready_at ? new Date(item.estimated_ready_at).toLocaleDateString('id-ID') : '—'}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            {canUpdate && (
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditItem(item)}>
                                                    <i className="bi bi-pencil" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item.id)}>
                                                    <i className="bi bi-trash" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {items.last_page > 1 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <small className="text-muted">Menampilkan {items.from}–{items.to} dari {items.total} item</small>
                        <div className="d-flex gap-1">
                            {items.links.map((link, i) => (
                                <button key={i} className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
