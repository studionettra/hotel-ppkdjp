import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const ID_TYPES = { ktp: 'KTP', passport: 'Passport', sim: 'SIM' };
const GENDERS  = { male: 'Laki-laki', female: 'Perempuan' };

function GuestModal({ guest, onClose }) {
    const isEdit = !!guest;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        full_name: guest?.full_name ?? '',
        id_type: guest?.id_type ?? 'ktp',
        id_number: guest?.id_number ?? '',
        phone: guest?.phone ?? '',
        email: guest?.email ?? '',
        nationality: guest?.nationality ?? '',
        gender: guest?.gender ?? '',
    });

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        isEdit ? put(route('guests.update', guest.id), opts) : post(route('guests.store'), opts);
    }

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEdit ? 'Edit' : 'Tambah'} Tamu</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nama Lengkap <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control${errors.full_name ? ' is-invalid' : ''}`}
                                        value={data.full_name} onChange={e => setData('full_name', e.target.value)} />
                                    {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Jenis ID <span className="text-danger">*</span></label>
                                    <select className="form-select" value={data.id_type} onChange={e => setData('id_type', e.target.value)}>
                                        {Object.entries(ID_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">No. ID <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control${errors.id_number ? ' is-invalid' : ''}`}
                                        value={data.id_number} onChange={e => setData('id_number', e.target.value)} />
                                    {errors.id_number && <div className="invalid-feedback">{errors.id_number}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">No. HP</label>
                                    <input type="text" className="form-control" value={data.phone}
                                        onChange={e => setData('phone', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control" value={data.email}
                                        onChange={e => setData('email', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Jenis Kelamin</label>
                                    <select className="form-select" value={data.gender} onChange={e => setData('gender', e.target.value)}>
                                        <option value="">-- Pilih --</option>
                                        {Object.entries(GENDERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Kewarganegaraan</label>
                                    <input type="text" className="form-control" value={data.nationality}
                                        onChange={e => setData('nationality', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={processing}>Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Index({ guests }) {
    const [modal, setModal] = useState(null); // null | 'create' | guest object
    const [search, setSearch] = useState('');

    function destroy(guest) {
        if (confirm(`Hapus tamu "${guest.full_name}"?`)) {
            router.delete(route('guests.destroy', guest.id));
        }
    }

    const filtered = guests.filter(g =>
        g.full_name.toLowerCase().includes(search.toLowerCase()) ||
        g.id_number.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout title="Data Tamu" breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Tamu' }]}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Daftar Tamu</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
                        <i className="bi bi-plus-lg me-1"></i> Tambah Tamu
                    </button>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder="Cari nama atau nomor ID..."
                            value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
                    </div>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>#</th><th>Nama</th><th>ID</th><th>No. HP</th><th>Kelamin</th><th>Kewarganegaraan</th><th>Reservasi</th><th>Aksi</th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="text-center text-muted">Tidak ada data tamu.</td></tr>
                            )}
                            {filtered.map((g, i) => (
                                <tr key={g.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                        <Link href={route('guests.show', g.id)} className="fw-semibold">{g.full_name}</Link>
                                    </td>
                                    <td><small>{ID_TYPES[g.id_type]}: {g.id_number}</small></td>
                                    <td>{g.phone || '-'}</td>
                                    <td>{GENDERS[g.gender] || '-'}</td>
                                    <td>{g.nationality || '-'}</td>
                                    <td><span className="badge bg-light text-dark">{g.reservations_count}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-1" onClick={() => setModal(g)}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => destroy(g)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <GuestModal
                    guest={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}
        </AppLayout>
    );
}
