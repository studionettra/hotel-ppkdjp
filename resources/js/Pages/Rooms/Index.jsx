import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_LABELS = {
    vc: { label: 'Vacant Clean', color: 'success' },
    vd: { label: 'Vacant Dirty', color: 'warning' },
    oc: { label: 'Occupied Clean', color: 'primary' },
    od: { label: 'Occupied Dirty', color: 'danger' },
    ooo: { label: 'Out of Order', color: 'danger' },
    oos: { label: 'Out of Service', color: 'secondary' },
};

export default function Index({ rooms, floors, roomTypes }) {
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const storeForm = useForm({ room_number: '', floor_id: '', room_type_id: '', status: 'vc', notes: '' });
    const editForm  = useForm({ room_number: '', floor_id: '', room_type_id: '', status: 'vc', notes: '' });

    function startEdit(room) {
        setEditing(room.id);
        editForm.setData({
            room_number: room.room_number, floor_id: room.floor_id,
            room_type_id: room.room_type_id, status: room.status, notes: room.notes ?? '',
        });
    }

    function submitStore(e) {
        e.preventDefault();
        storeForm.post(route('rooms.store'), { onSuccess: () => { storeForm.reset(); setShowModal(false); } });
    }

    function submitEdit(e, room) {
        e.preventDefault();
        editForm.put(route('rooms.update', room.id), { onSuccess: () => setEditing(null) });
    }

    function destroy(room) {
        if (confirm(`Hapus kamar "${room.room_number}"?`)) {
            router.delete(route('rooms.destroy', room.id));
        }
    }

    return (
        <AppLayout title="Manajemen Kamar" breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Kamar' }]}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Daftar Kamar</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg me-1"></i> Tambah Kamar
                    </button>
                </div>
                <div className="card-body">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>#</th><th>No. Kamar</th><th>Lantai</th><th>Tipe</th><th>Status</th><th>Aksi</th></tr>
                        </thead>
                        <tbody>
                            {rooms.length === 0 && (
                                <tr><td colSpan={6} className="text-center text-muted">Belum ada data kamar.</td></tr>
                            )}
                            {rooms.map((room, i) => (
                                <tr key={room.id}>
                                    {editing === room.id ? (
                                        <td colSpan={5}>
                                            <form onSubmit={e => submitEdit(e, room)} className="d-flex gap-2 flex-wrap align-items-center">
                                                <input type="text" className="form-control form-control-sm" style={{ width: 90 }} placeholder="No. Kamar"
                                                    value={editForm.data.room_number} onChange={e => editForm.setData('room_number', e.target.value)} />
                                                <select className="form-select form-select-sm" style={{ width: 120 }}
                                                    value={editForm.data.floor_id} onChange={e => editForm.setData('floor_id', e.target.value)}>
                                                    <option value="">Lantai</option>
                                                    {floors.map(f => <option key={f.id} value={f.id}>{f.floor_name || `Lantai ${f.floor_number}`}</option>)}
                                                </select>
                                                <select className="form-select form-select-sm" style={{ width: 140 }}
                                                    value={editForm.data.room_type_id} onChange={e => editForm.setData('room_type_id', e.target.value)}>
                                                    <option value="">Tipe</option>
                                                    {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                                </select>
                                                <select className="form-select form-select-sm" style={{ width: 140 }}
                                                    value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value)}>
                                                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                                </select>
                                                <button className="btn btn-sm btn-success" disabled={editForm.processing}>Simpan</button>
                                                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setEditing(null)}>Batal</button>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td>{i + 1}</td>
                                            <td><strong>{room.room_number}</strong></td>
                                            <td>{room.floor?.floor_name || `Lantai ${room.floor?.floor_number}`}</td>
                                            <td>
                                                <div className="fw-semibold">{room.room_type?.name}</div>
                                                {Array.isArray(room.room_type?.facilities) && (
                                                    <div className="d-flex flex-wrap gap-1 mt-1" style={{ maxWidth: '250px' }}>
                                                        {room.room_type.facilities.map((f, idx) => (
                                                            <span key={idx} className="badge bg-light text-dark border" style={{ fontSize: '0.7em' }}>{f}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge bg-${STATUS_LABELS[room.status]?.color ?? 'secondary'}`}>
                                                    {STATUS_LABELS[room.status]?.label ?? room.status}
                                                </span>
                                            </td>
                                        </>
                                    )}
                                    {editing !== room.id && (
                                        <td>
                                            <button className="btn btn-sm btn-warning me-1" onClick={() => startEdit(room)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => destroy(room)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Tambah Kamar</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={submitStore}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">No. Kamar <span className="text-danger">*</span></label>
                                        <input type="text" className={`form-control${storeForm.errors.room_number ? ' is-invalid' : ''}`}
                                            value={storeForm.data.room_number} onChange={e => storeForm.setData('room_number', e.target.value)} />
                                        {storeForm.errors.room_number && <div className="invalid-feedback">{storeForm.errors.room_number}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Lantai <span className="text-danger">*</span></label>
                                        <select className={`form-select${storeForm.errors.floor_id ? ' is-invalid' : ''}`}
                                            value={storeForm.data.floor_id} onChange={e => storeForm.setData('floor_id', e.target.value)}>
                                            <option value="">-- Pilih Lantai --</option>
                                            {floors.map(f => <option key={f.id} value={f.id}>{f.floor_name || `Lantai ${f.floor_number}`}</option>)}
                                        </select>
                                        {storeForm.errors.floor_id && <div className="invalid-feedback">{storeForm.errors.floor_id}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Tipe Kamar <span className="text-danger">*</span></label>
                                        <select className={`form-select${storeForm.errors.room_type_id ? ' is-invalid' : ''}`}
                                            value={storeForm.data.room_type_id} onChange={e => storeForm.setData('room_type_id', e.target.value)}>
                                            <option value="">-- Pilih Tipe --</option>
                                            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name} (maks. {rt.max_capacity} org)</option>)}
                                        </select>
                                        {storeForm.errors.room_type_id && <div className="invalid-feedback">{storeForm.errors.room_type_id}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={storeForm.data.status}
                                            onChange={e => storeForm.setData('status', e.target.value)}>
                                            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Catatan</label>
                                        <textarea className="form-control" rows="2" value={storeForm.data.notes}
                                            onChange={e => storeForm.setData('notes', e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
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
