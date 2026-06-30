import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DatePicker from '@/Components/DatePicker';

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
        address: guest?.address ?? '',
        nationality: guest?.nationality ?? '',
        date_of_birth: guest?.date_of_birth ? guest.date_of_birth.substring(0, 10) : '',
        gender: guest?.gender ?? '',
        profession: guest?.profession ?? '',
        company: guest?.company ?? '',
        member_card_no: guest?.member_card_no ?? '',
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
                                <div className="col-md-6">
                                    <label className="form-label">Tanggal Lahir</label>
                                    <DatePicker className="form-control" value={data.date_of_birth}
                                        onChange={e => setData('date_of_birth', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Pekerjaan</label>
                                    <input type="text" className="form-control" value={data.profession}
                                        onChange={e => setData('profession', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Perusahaan</label>
                                    <input type="text" className="form-control" value={data.company}
                                        onChange={e => setData('company', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">No. Member Card</label>
                                    <input type="text" className="form-control" value={data.member_card_no}
                                        onChange={e => setData('member_card_no', e.target.value)} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Alamat</label>
                                    <textarea className="form-control" rows="2" value={data.address}
                                        onChange={e => setData('address', e.target.value)} />
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
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4" style={{ width: '5%' }}>#</th>
                                    <th style={{ width: '22%' }}>Nama</th>
                                    <th style={{ width: '18%' }}>ID</th>
                                    <th style={{ width: '15%' }}>Perusahaan</th>
                                    <th style={{ width: '15%' }}>Pekerjaan</th>
                                    <th style={{ width: '12%' }}>No. HP</th>
                                    <th className="text-center" style={{ width: '7%' }}>Reservasi</th>
                                    <th className="text-center pe-4" style={{ width: '6%' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={8} className="text-center text-muted py-4">Tidak ada data tamu.</td></tr>
                                )}
                                {filtered.map((g, i) => (
                                    <tr key={g.id}>
                                        <td className="ps-4 text-secondary">{i + 1}</td>
                                        <td>
                                            <Link href={route('guests.show', g.id)} className="fw-semibold text-primary">{g.full_name}</Link>
                                        </td>
                                        <td><span className="text-body" style={{ fontSize: '0.85rem' }}>{ID_TYPES[g.id_type]}: {g.id_number}</span></td>
                                        <td><span className="text-body" style={{ fontSize: '0.85rem' }}>{g.company || '-'}</span></td>
                                        <td><span className="text-body" style={{ fontSize: '0.85rem' }}>{g.profession || '-'}</span></td>
                                        <td><span className="text-body-secondary" style={{ fontSize: '0.85rem' }}>{g.phone || '-'}</span></td>
                                        <td className="text-center">
                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle rounded-pill px-2 py-1">
                                                {g.reservations_count}
                                            </span>
                                        </td>
                                        <td className="text-center pe-4">
                                            <div className="d-flex align-items-center justify-content-center gap-1">
                                                <button className="btn btn-icon btn-link text-warning p-1 mb-0 border-0" onClick={() => setModal(g)} title="Edit">
                                                    <i className="bi bi-pencil fs-6"></i>
                                                </button>
                                                <button className="btn btn-icon btn-link text-danger p-1 mb-0 border-0" onClick={() => destroy(g)} title="Hapus">
                                                    <i className="bi bi-trash fs-6"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
