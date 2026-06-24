import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Index({ floors }) {
    const [editing, setEditing] = useState(null);

    const storeForm = useForm({ floor_number: '', floor_name: '', description: '' });
    const editForm  = useForm({ floor_number: '', floor_name: '', description: '' });

    function startEdit(floor) {
        setEditing(floor.id);
        editForm.setData({ floor_number: floor.floor_number, floor_name: floor.floor_name ?? '', description: floor.description ?? '' });
    }

    function submitStore(e) {
        e.preventDefault();
        storeForm.post(route('floors.store'), { onSuccess: () => storeForm.reset() });
    }

    function submitEdit(e, floor) {
        e.preventDefault();
        editForm.put(route('floors.update', floor.id), { onSuccess: () => setEditing(null) });
    }

    function destroy(floor) {
        if (confirm(`Hapus lantai "${floor.floor_name || floor.floor_number}"?`)) {
            router.delete(route('floors.destroy', floor.id));
        }
    }

    return (
        <AppLayout title="Floor Management" breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Lantai' }]}>
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Tambah Lantai</h4></div>
                        <div className="card-body">
                            <form onSubmit={submitStore}>
                                <div className="mb-3">
                                    <label className="form-label">Nomor Lantai <span className="text-danger">*</span></label>
                                    <input type="number" className={`form-control${storeForm.errors.floor_number ? ' is-invalid' : ''}`}
                                        value={storeForm.data.floor_number} onChange={e => storeForm.setData('floor_number', e.target.value)} />
                                    {storeForm.errors.floor_number && <div className="invalid-feedback">{storeForm.errors.floor_number}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nama Lantai</label>
                                    <input type="text" className="form-control" placeholder="cth. Lantai Dasar"
                                        value={storeForm.data.floor_name} onChange={e => storeForm.setData('floor_name', e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Keterangan</label>
                                    <textarea className="form-control" rows="2"
                                        value={storeForm.data.description} onChange={e => storeForm.setData('description', e.target.value)} />
                                </div>
                                <button className="btn btn-primary" disabled={storeForm.processing}>Simpan</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Daftar Lantai</h4></div>
                        <div className="card-body">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr><th>#</th><th>Nomor</th><th>Nama</th><th>Keterangan</th><th>Aksi</th></tr>
                                </thead>
                                <tbody>
                                    {floors.length === 0 && (
                                        <tr><td colSpan={5} className="text-center text-muted">Belum ada data lantai.</td></tr>
                                    )}
                                    {floors.map((floor, i) => (
                                        <tr key={floor.id}>
                                            {editing === floor.id ? (
                                                <td colSpan={4}>
                                                    <form onSubmit={e => submitEdit(e, floor)} className="d-flex gap-2 align-items-center flex-wrap">
                                                        <input type="number" className="form-control form-control-sm" style={{ width: 80 }}
                                                            value={editForm.data.floor_number} onChange={e => editForm.setData('floor_number', e.target.value)} />
                                                        <input type="text" className="form-control form-control-sm" placeholder="Nama lantai"
                                                            style={{ width: 150 }} value={editForm.data.floor_name}
                                                            onChange={e => editForm.setData('floor_name', e.target.value)} />
                                                        <input type="text" className="form-control form-control-sm" placeholder="Keterangan"
                                                            value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)} />
                                                        <button className="btn btn-sm btn-success" disabled={editForm.processing}>Simpan</button>
                                                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => setEditing(null)}>Batal</button>
                                                    </form>
                                                </td>
                                            ) : (
                                                <>
                                                    <td>{i + 1}</td>
                                                    <td>{floor.floor_number}</td>
                                                    <td>{floor.floor_name || '-'}</td>
                                                    <td>{floor.description || '-'}</td>
                                                </>
                                            )}
                                            {editing !== floor.id && (
                                                <td>
                                                    <button className="btn btn-sm btn-warning me-1" onClick={() => startEdit(floor)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => destroy(floor)}>
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
                </div>
            </div>
        </AppLayout>
    );
}
