import { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const statusBadge = {
    scheduled:   'bg-info-subtle text-info border border-info-subtle',
    in_progress: 'bg-primary-subtle text-primary border border-primary-subtle',
    completed:   'bg-success-subtle text-success border border-success-subtle',
    cancelled:   'bg-secondary-subtle text-secondary border border-secondary-subtle',
};

const statusLabel = {
    scheduled: 'Terjadwal', in_progress: 'Berlangsung',
    completed: 'Selesai', cancelled: 'Dibatalkan',
};

const maintenanceTypeLabel = {
    cleaning: 'Pembersihan', chemical_check: 'Cek Kimia',
    equipment_check: 'Cek Peralatan', repair: 'Perbaikan', inspection: 'Inspeksi',
};

const poolAreaLabel = { main: 'Utama', kids: 'Anak-anak', indoor: 'Indoor', jacuzzi: 'Jacuzzi' };

function CreateModal({ staffList, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        pool_area: 'main', maintenance_type: 'cleaning', scheduled_at: '',
        ph_level: '', chlorine_level: '', temperature: '',
        assigned_to: '', findings: '', action_taken: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('pool.store'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Tambah Log Maintenance Kolam</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">Area Kolam *</label>
                                    <select className="form-select" value={data.pool_area} onChange={e => setData('pool_area', e.target.value)}>
                                        <option value="main">Utama</option>
                                        <option value="kids">Anak-anak</option>
                                        <option value="indoor">Indoor</option>
                                        <option value="jacuzzi">Jacuzzi</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Jenis Maintenance *</label>
                                    <select className={`form-select ${errors.maintenance_type ? 'is-invalid' : ''}`}
                                        value={data.maintenance_type} onChange={e => setData('maintenance_type', e.target.value)}>
                                        <option value="cleaning">Pembersihan</option>
                                        <option value="chemical_check">Cek Kimia</option>
                                        <option value="equipment_check">Cek Peralatan</option>
                                        <option value="repair">Perbaikan</option>
                                        <option value="inspection">Inspeksi</option>
                                    </select>
                                    {errors.maintenance_type && <div className="invalid-feedback">{errors.maintenance_type}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Jadwal</label>
                                    <input type="datetime-local" className="form-control"
                                        value={data.scheduled_at} onChange={e => setData('scheduled_at', e.target.value)} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">pH Level</label>
                                    <input type="number" className={`form-control ${errors.ph_level ? 'is-invalid' : ''}`}
                                        value={data.ph_level} onChange={e => setData('ph_level', e.target.value)}
                                        min="0" max="14" step="0.01" placeholder="7.00" />
                                    {errors.ph_level && <div className="invalid-feedback">{errors.ph_level}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Klorin (ppm)</label>
                                    <input type="number" className={`form-control ${errors.chlorine_level ? 'is-invalid' : ''}`}
                                        value={data.chlorine_level} onChange={e => setData('chlorine_level', e.target.value)}
                                        min="0" step="0.01" placeholder="1.50" />
                                    {errors.chlorine_level && <div className="invalid-feedback">{errors.chlorine_level}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Suhu (°C)</label>
                                    <input type="number" className="form-control"
                                        value={data.temperature} onChange={e => setData('temperature', e.target.value)}
                                        step="0.1" placeholder="28.0" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Ditugaskan ke</label>
                                <select className="form-select" value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}>
                                    <option value="">-- Tidak Ditugaskan --</option>
                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Temuan</label>
                                    <textarea className="form-control" rows="3"
                                        value={data.findings} onChange={e => setData('findings', e.target.value)}
                                        placeholder="Kondisi kolam, masalah yang ditemukan..." />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Tindakan</label>
                                    <textarea className="form-control" rows="3"
                                        value={data.action_taken} onChange={e => setData('action_taken', e.target.value)}
                                        placeholder="Tindakan yang diambil..." />
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

function UpdateModal({ log, staffList, onClose }) {
    const { data, setData, put, processing } = useForm({
        status:          log.status,
        ph_level:        log.ph_level ?? '',
        chlorine_level:  log.chlorine_level ?? '',
        temperature:     log.temperature ?? '',
        assigned_to:     log.assigned_to ?? '',
        findings:        log.findings ?? '',
        action_taken:    log.action_taken ?? '',
    });

    function submit(e) {
        e.preventDefault();
        put(route('pool.update', log.id), { onSuccess: onClose });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Log — Kolam {poolAreaLabel[log.pool_area]}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">Status *</label>
                                    <select className="form-select" value={data.status} onChange={e => setData('status', e.target.value)}>
                                        <option value="scheduled">Terjadwal</option>
                                        <option value="in_progress">Berlangsung</option>
                                        <option value="completed">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">pH Level</label>
                                    <input type="number" className="form-control"
                                        value={data.ph_level} onChange={e => setData('ph_level', e.target.value)}
                                        min="0" max="14" step="0.01" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Klorin (ppm)</label>
                                    <input type="number" className="form-control"
                                        value={data.chlorine_level} onChange={e => setData('chlorine_level', e.target.value)}
                                        min="0" step="0.01" />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">Suhu (°C)</label>
                                    <input type="number" className="form-control"
                                        value={data.temperature} onChange={e => setData('temperature', e.target.value)} step="0.1" />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label">Ditugaskan ke</label>
                                    <select className="form-select" value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}>
                                        <option value="">-- Tidak Ditugaskan --</option>
                                        {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Temuan</label>
                                    <textarea className="form-control" rows="3"
                                        value={data.findings} onChange={e => setData('findings', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Tindakan</label>
                                    <textarea className="form-control" rows="3"
                                        value={data.action_taken} onChange={e => setData('action_taken', e.target.value)} />
                                </div>
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

export default function Index({ logs, staffList, filters }) {
    const { auth } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);
    const [editLog, setEditLog] = useState(null);

    const canCreate = auth.permissions.includes('pool.create');
    const canUpdate = auth.permissions.includes('pool.update');
    const canDelete = auth.permissions.includes('pool.delete');

    function applyFilter(key, value) {
        router.get(route('pool.index'), { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function deleteLog(id) {
        if (!confirm('Hapus log maintenance ini?')) return;
        router.delete(route('pool.destroy', id));
    }

    return (
        <AppLayout title="Maintenance Kolam">
            {showCreate && <CreateModal staffList={staffList} onClose={() => setShowCreate(false)} />}
            {editLog && <UpdateModal log={editLog} staffList={staffList} onClose={() => setEditLog(null)} />}

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h4 className="card-title mb-0">Log Maintenance Kolam Renang</h4>
                    {canCreate && (
                        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                            <i className="bi bi-plus-circle me-1" />Tambah Log
                        </button>
                    )}
                </div>
                <div className="card-body border-bottom pb-3">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.status ?? ''} onChange={e => applyFilter('status', e.target.value)}>
                                <option value="">Semua Status</option>
                                <option value="scheduled">Terjadwal</option>
                                <option value="in_progress">Berlangsung</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.pool_area ?? ''} onChange={e => applyFilter('pool_area', e.target.value)}>
                                <option value="">Semua Area</option>
                                <option value="main">Utama</option>
                                <option value="kids">Anak-anak</option>
                                <option value="indoor">Indoor</option>
                                <option value="jacuzzi">Jacuzzi</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.maintenance_type ?? ''} onChange={e => applyFilter('maintenance_type', e.target.value)}>
                                <option value="">Semua Jenis</option>
                                <option value="cleaning">Pembersihan</option>
                                <option value="chemical_check">Cek Kimia</option>
                                <option value="equipment_check">Cek Peralatan</option>
                                <option value="repair">Perbaikan</option>
                                <option value="inspection">Inspeksi</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th style={{ width: '10%', minWidth: '80px', paddingLeft: '1.5rem' }}>Area</th>
                                <th style={{ width: '15%', minWidth: '120px' }}>Jenis</th>
                                <th style={{ width: '12%', minWidth: '110px' }}>Status</th>
                                <th style={{ width: '8%', minWidth: '60px' }} className="text-center">pH</th>
                                <th style={{ width: '8%', minWidth: '65px' }} className="text-center">Klorin</th>
                                <th style={{ width: '8%', minWidth: '65px' }} className="text-center">Suhu</th>
                                <th style={{ width: '15%', minWidth: '120px' }}>Jadwal</th>
                                <th style={{ width: '14%', minWidth: '110px' }}>Petugas</th>
                                <th style={{ width: '10%', minWidth: '90px', paddingRight: '1.5rem' }} className="text-end">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length === 0 && (
                                <tr><td colSpan="9" className="text-center text-muted py-5 fs-6">Tidak ada log maintenance</td></tr>
                            )}
                            {logs.data.map(log => (
                                <tr key={log.id} className="align-middle">
                                    <td style={{ paddingLeft: '1.5rem' }}><span className="badge bg-light text-dark border">{poolAreaLabel[log.pool_area]}</span></td>
                                    <td>{maintenanceTypeLabel[log.maintenance_type]}</td>
                                    <td><span className={`badge ${statusBadge[log.status]} px-2 py-1`}>{statusLabel[log.status]}</span></td>
                                    <td className="text-center font-monospace">{log.ph_level ?? '—'}</td>
                                    <td className="text-center font-monospace">{log.chlorine_level ?? '—'}</td>
                                    <td className="text-center font-monospace">{log.temperature ? `${log.temperature}°C` : '—'}</td>
                                    <td className="text-muted small">{log.scheduled_at ? new Date(log.scheduled_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                                    <td>{log.assigned_to?.name ?? <span className="text-muted">—</span>}</td>
                                    <td className="text-end" style={{ paddingRight: '1.5rem' }}>
                                        <div className="d-inline-flex gap-1">
                                            {canUpdate && (
                                                <button className="btn btn-sm btn-light border-0 text-primary" onClick={() => setEditLog(log)}>
                                                    <i className="bi bi-pencil" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button className="btn btn-sm btn-light border-0 text-danger" onClick={() => deleteLog(log.id)}>
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
                {logs.last_page > 1 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <small className="text-muted">Menampilkan {logs.from}–{logs.to} dari {logs.total} log</small>
                        <div className="d-flex gap-1">
                            {logs.links.map((link, i) => (
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
