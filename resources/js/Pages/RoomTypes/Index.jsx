import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const FACILITY_PRESETS = [
    'AC', 'TV', 'WiFi', 'Kamar Mandi Dalam', 'Hot Water', 'Bathtub', 'Shower',
    'Mini Bar', 'Kulkas', 'Safe Box', 'Balkon', 'View Kota', 'View Taman',
    'King Bed', 'Twin Bed', 'Sofa', 'Meja Kerja', 'Lemari Pakaian',
    'Sarapan', 'Parkir', 'Kolam Renang', 'Gym',
];

function FacilityInput({ value, onChange }) {
    const [input, setInput] = useState('');
    const facilities = value ?? [];

    function add(item) {
        const trimmed = item.trim();
        if (trimmed && !facilities.includes(trimmed)) {
            onChange([...facilities, trimmed]);
        }
        setInput('');
    }

    function remove(item) {
        onChange(facilities.filter(f => f !== item));
    }

    function handleKey(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(input);
        }
    }

    return (
        <div>
            {/* Selected tags */}
            {facilities.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-2">
                    {facilities.map(f => (
                        <span key={f} className="badge bg-primary d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                            {f}
                            <button type="button" className="btn-close btn-close-white"
                                style={{ fontSize: '0.5rem' }} onClick={() => remove(f)} />
                        </span>
                    ))}
                </div>
            )}
            {/* Text input */}
            <div className="input-group input-group-sm mb-2">
                <input type="text" className="form-control" placeholder="Ketik fasilitas + Enter"
                    value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} />
                <button type="button" className="btn btn-outline-primary" onClick={() => add(input)} disabled={!input.trim()}>
                    <i className="bi bi-plus" />
                </button>
            </div>
            {/* Preset chips */}
            <div className="d-flex flex-wrap gap-1">
                {FACILITY_PRESETS.filter(p => !facilities.includes(p)).map(p => (
                    <button key={p} type="button"
                        className="btn btn-outline-secondary btn-sm py-0"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => add(p)}>
                        + {p}
                    </button>
                ))}
            </div>
        </div>
    );
}

function FacilityBadges({ facilities }) {
    if (!facilities?.length) return <span className="text-muted">—</span>;
    return (
        <div className="d-flex flex-wrap gap-1">
            {facilities.map(f => (
                <span key={f} className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-check-circle-fill text-success me-1" style={{ fontSize: '0.6rem' }} />
                    {f}
                </span>
            ))}
        </div>
    );
}

function EditModal({ rt, onClose }) {
    const form = useForm({
        code:         rt.code,
        name:         rt.name,
        description:  rt.description ?? '',
        facilities:   rt.facilities ?? [],
        max_capacity: rt.max_capacity,
        base_price:   rt.base_price,
    });

    function submit(e) {
        e.preventDefault();
        form.put(route('room-types.update', rt.id), { onSuccess: onClose });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Tipe Kamar — {rt.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <label className="form-label">Kode *</label>
                                    <input type="text" className={`form-control ${form.errors.code ? 'is-invalid' : ''}`}
                                        value={form.data.code} onChange={e => form.setData('code', e.target.value)} required />
                                    {form.errors.code && <div className="invalid-feedback">{form.errors.code}</div>}
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label">Nama *</label>
                                    <input type="text" className={`form-control ${form.errors.name ? 'is-invalid' : ''}`}
                                        value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                                    {form.errors.name && <div className="invalid-feedback">{form.errors.name}</div>}
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Kapasitas *</label>
                                    <input type="number" className={`form-control ${form.errors.max_capacity ? 'is-invalid' : ''}`}
                                        value={form.data.max_capacity} onChange={e => form.setData('max_capacity', e.target.value)} min="1" required />
                                    {form.errors.max_capacity && <div className="invalid-feedback">{form.errors.max_capacity}</div>}
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Harga (Rp) *</label>
                                    <input type="number" className={`form-control ${form.errors.base_price ? 'is-invalid' : ''}`}
                                        value={form.data.base_price} onChange={e => form.setData('base_price', e.target.value)} min="0" required />
                                    {form.errors.base_price && <div className="invalid-feedback">{form.errors.base_price}</div>}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Deskripsi</label>
                                <textarea className="form-control" rows="2"
                                    value={form.data.description} onChange={e => form.setData('description', e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Fasilitas</label>
                                <FacilityInput value={form.data.facilities} onChange={v => form.setData('facilities', v)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={form.processing}>
                                {form.processing ? <span className="spinner-border spinner-border-sm me-1" /> : null} Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Index({ roomTypes }) {
    const [editTarget, setEditTarget] = useState(null);

    const form = useForm({
        code: '', name: '', description: '', facilities: [],
        max_capacity: '', base_price: '',
    });

    function submitStore(e) {
        e.preventDefault();
        form.post(route('room-types.store'), { onSuccess: () => form.reset() });
    }

    function destroy(rt) {
        if (confirm(`Hapus tipe kamar "${rt.name}"?`)) {
            router.delete(route('room-types.destroy', rt.id));
        }
    }

    const fmt = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    return (
        <AppLayout title="Tipe Kamar">
            {editTarget && <EditModal rt={editTarget} onClose={() => setEditTarget(null)} />}

            <div className="row">
                {/* Add Form */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Tambah Tipe Kamar</h4></div>
                        <div className="card-body">
                            <form onSubmit={submitStore}>
                                <div className="row mb-3">
                                    <div className="col-5">
                                        <label className="form-label">Kode <span className="text-danger">*</span></label>
                                        <input type="text" className={`form-control ${form.errors.code ? 'is-invalid' : ''}`}
                                            placeholder="STD" value={form.data.code}
                                            onChange={e => form.setData('code', e.target.value)} />
                                        {form.errors.code && <div className="invalid-feedback">{form.errors.code}</div>}
                                    </div>
                                    <div className="col-7">
                                        <label className="form-label">Nama <span className="text-danger">*</span></label>
                                        <input type="text" className={`form-control ${form.errors.name ? 'is-invalid' : ''}`}
                                            placeholder="Standard Room" value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)} />
                                        {form.errors.name && <div className="invalid-feedback">{form.errors.name}</div>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label">Kapasitas <span className="text-danger">*</span></label>
                                        <input type="number" className={`form-control ${form.errors.max_capacity ? 'is-invalid' : ''}`}
                                            placeholder="2" value={form.data.max_capacity} min="1"
                                            onChange={e => form.setData('max_capacity', e.target.value)} />
                                        {form.errors.max_capacity && <div className="invalid-feedback">{form.errors.max_capacity}</div>}
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">Harga/Malam <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <span className="input-group-text">Rp</span>
                                            <input type="number" className={`form-control ${form.errors.base_price ? 'is-invalid' : ''}`}
                                                placeholder="500000" value={form.data.base_price} min="0"
                                                onChange={e => form.setData('base_price', e.target.value)} />
                                            {form.errors.base_price && <div className="invalid-feedback">{form.errors.base_price}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Deskripsi</label>
                                    <textarea className="form-control" rows="2"
                                        value={form.data.description}
                                        onChange={e => form.setData('description', e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fasilitas</label>
                                    <FacilityInput value={form.data.facilities} onChange={v => form.setData('facilities', v)} />
                                    {form.errors.facilities && <div className="text-danger small mt-1">{form.errors.facilities}</div>}
                                </div>
                                <button className="btn btn-primary w-100" disabled={form.processing}>
                                    {form.processing ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                    Simpan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Daftar Tipe Kamar</h4></div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Kode</th>
                                        <th>Nama</th>
                                        <th className="text-center">Kap.</th>
                                        <th className="text-end">Harga/Malam</th>
                                        <th>Fasilitas</th>
                                        <th className="text-center">Kamar</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roomTypes.length === 0 && (
                                        <tr><td colSpan="8" className="text-center text-muted py-4">Belum ada tipe kamar.</td></tr>
                                    )}
                                    {roomTypes.map((rt, i) => (
                                        <tr key={rt.id}>
                                            <td>{i + 1}</td>
                                            <td><span className="badge bg-primary">{rt.code}</span></td>
                                            <td>
                                                <div className="fw-semibold">{rt.name}</div>
                                                {rt.description && <small className="text-muted">{rt.description}</small>}
                                            </td>
                                            <td className="text-center">
                                                <i className="bi bi-person-fill text-muted me-1" />
                                                {rt.max_capacity}
                                            </td>
                                            <td className="text-end fw-semibold">{fmt(rt.base_price)}</td>
                                            <td style={{ maxWidth: '220px' }}>
                                                <FacilityBadges facilities={rt.facilities} />
                                            </td>
                                            <td className="text-center">{rt.rooms_count ?? 0}</td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => setEditTarget(rt)}>
                                                        <i className="bi bi-pencil" />
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => destroy(rt)}>
                                                        <i className="bi bi-trash" />
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
            </div>
        </AppLayout>
    );
}
