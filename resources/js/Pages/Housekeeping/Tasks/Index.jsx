import { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const statusBadge = {
    pending:     'bg-secondary-subtle text-secondary border border-secondary-subtle',
    in_progress: 'bg-primary-subtle text-primary border border-primary-subtle',
    completed:   'bg-success-subtle text-success border border-success-subtle',
    cancelled:   'bg-danger-subtle text-danger border border-danger-subtle',
};

const statusLabel = {
    pending: 'Pending',
    in_progress: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const priorityBadge = {
    low:     'bg-light text-secondary border border-secondary-subtle',
    normal:  'bg-info-subtle text-info-emphasis border border-info-subtle',
    high:    'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
    urgent:  'bg-danger-subtle text-danger-emphasis border border-danger-subtle',
};

const priorityLabel = {
    low: 'Rendah',
    normal: 'Normal',
    high: 'Tinggi',
    urgent: 'Urgent',
};

const taskTypeLabel = {
    cleaning: 'Pembersihan', inspection: 'Inspeksi',
    maintenance: 'Pemeliharaan', deep_clean: 'Deep Clean',
    extrabed: 'Ekstrabed'
};

const ROOM_STATUSES = {
    vc: 'Vacant Clean', vd: 'Vacant Dirty', vi: 'Vacant Inspected', oc: 'Occupied Clean', od: 'Occupied Dirty',
    o_dnd: 'Occupied DND', oso: 'Occupied Sleep Out', ocg: 'On Change', ooo: 'Out of Order', oos: 'Out of Service',
    blk: 'Blocked', pu: 'Pick Up'
};

function CreateModal({ rooms, staffList, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        room_id: '', task_type: 'cleaning', priority: 'normal',
        due_at: '', assigned_to: '', notes: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('housekeeping.tasks.store'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Tambah Tugas Housekeeping</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Kamar *</label>
                                    <select className={`form-select ${errors.room_id ? 'is-invalid' : ''}`}
                                        value={data.room_id} onChange={e => setData('room_id', e.target.value)} required>
                                        <option value="">-- Pilih --</option>
                                        {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                                    </select>
                                    {errors.room_id && <div className="invalid-feedback">{errors.room_id}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Jenis Tugas *</label>
                                    <select className="form-select" value={data.task_type} onChange={e => setData('task_type', e.target.value)}>
                                        <option value="cleaning">Pembersihan</option>
                                        <option value="inspection">Inspeksi</option>
                                        <option value="maintenance">Pemeliharaan</option>
                                        <option value="deep_clean">Deep Clean</option>
                                        <option value="extrabed">Ekstrabed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Prioritas *</label>
                                    <select className="form-select" value={data.priority} onChange={e => setData('priority', e.target.value)}>
                                        <option value="low">Rendah</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">Tinggi</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Tenggat Waktu</label>
                                    <input type="datetime-local" className="form-control"
                                        value={data.due_at} onChange={e => setData('due_at', e.target.value)} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Ditugaskan ke</label>
                                <select className="form-select" value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}>
                                    <option value="">-- Tidak Ditugaskan --</option>
                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Catatan</label>
                                <textarea className="form-control" rows="3"
                                    value={data.notes} onChange={e => setData('notes', e.target.value)} />
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

function UpdateModal({ task, staffList, onClose }) {
    const { auth } = usePage().props;

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const pad = (num) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Otomatis memilih staf housekeeping yang sedang login jika belum ditugaskan
    const loggedInUser = auth.user;
    const isHousekeepingStaff = staffList.some(s => s.id === loggedInUser.id);
    const defaultAssignedTo = task.assigned_to?.id ?? (isHousekeepingStaff ? loggedInUser.id : '');

    const { data, setData, put, processing, errors } = useForm({
        status:      task.status,
        priority:    task.priority,
        assigned_to: defaultAssignedTo,
        notes:       task.notes ?? '',
        due_at:      formatDateTimeLocal(task.due_at),
        completed_at: formatDateTimeLocal(task.completed_at),
    });

    function submit(e) {
        e.preventDefault();
        put(route('housekeeping.tasks.update', task.id), { onSuccess: onClose });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Tugas — Kamar {task.room?.room_number}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Status *</label>
                                    <select className="form-select" value={data.status} onChange={e => setData('status', e.target.value)}>
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">Berlangsung</option>
                                        <option value="completed">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Prioritas</label>
                                    <select className="form-select" value={data.priority} onChange={e => setData('priority', e.target.value)}>
                                        <option value="low">Rendah</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">Tinggi</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Ditugaskan ke</label>
                                <select className="form-select" value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}>
                                    <option value="">-- Tidak Ditugaskan --</option>
                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Tenggat Waktu</label>
                                <input type="datetime-local" className={`form-control ${errors.due_at ? 'is-invalid' : ''}`}
                                    value={data.due_at} onChange={e => setData('due_at', e.target.value)} />
                                {errors.due_at && <div className="invalid-feedback">{errors.due_at}</div>}
                            </div>
                            {data.status === 'completed' && (
                                <div className="mb-3">
                                    <label className="form-label">Waktu Selesai</label>
                                    <input type="datetime-local" className={`form-control ${errors.completed_at ? 'is-invalid' : ''}`}
                                        value={data.completed_at} onChange={e => setData('completed_at', e.target.value)} />
                                    {errors.completed_at && <div className="invalid-feedback">{errors.completed_at}</div>}
                                </div>
                            )}
                            <div className="mb-3">
                                <label className="form-label">Catatan</label>
                                <textarea className="form-control" rows="3"
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

export default function Index({ tasks, rooms, staffList, filters }) {
    const { auth } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const statusForm = useForm({
        room_id: '',
        status: 'vc'
    });

    const canCreate = auth.permissions.includes('housekeeping.create');
    const canUpdate = auth.permissions.includes('housekeeping.update');
    const canDelete = auth.permissions.includes('housekeeping.delete');

    function applyFilter(key, value) {
        router.get(route('housekeeping.tasks.index'), { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function deleteTask(id) {
        if (!confirm('Hapus tugas ini?')) return;
        router.delete(route('housekeeping.tasks.destroy', id));
    }

    const submitStatus = (e) => {
        e.preventDefault();
        statusForm.put(route('rooms.status.update', statusForm.data.room_id), {
            onSuccess: () => { setShowStatusModal(false); statusForm.reset(); }
        });
    };

    return (
        <AppLayout title="Tugas Housekeeping">
            {showCreate && <CreateModal rooms={rooms} staffList={staffList} onClose={() => setShowCreate(false)} />}
            {editTask && <UpdateModal task={editTask} staffList={staffList} onClose={() => setEditTask(null)} />}

            {showStatusModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={submitStatus}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Update Status Kamar Cepat</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Kamar <span className="text-danger">*</span></label>
                                        <select className="form-select" required value={statusForm.data.room_id} onChange={e => {
                                            const roomId = e.target.value;
                                            statusForm.setData('room_id', roomId);
                                            const room = rooms.find(r => r.id == roomId);
                                            if (room) statusForm.setData('status', room.status || 'vc');
                                        }}>
                                            <option value="">-- Pilih Kamar --</option>
                                            {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status Kamar <span className="text-danger">*</span></label>
                                        <select className="form-select" required value={statusForm.data.status} onChange={e => statusForm.setData('status', e.target.value)}>
                                            {Object.entries(ROOM_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Batal</button>
                                    <button type="submit" className="btn btn-primary" disabled={statusForm.processing}>Simpan Status</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h4 className="card-title mb-0">Daftar Tugas Housekeeping</h4>
                    <div className="d-flex gap-2">
                        <button className="btn btn-warning btn-sm text-dark" onClick={() => setShowStatusModal(true)}>
                            <i className="bi bi-door-open me-1"></i> Update Status Kamar
                        </button>
                        {canCreate && (
                            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                                <i className="bi bi-plus-circle me-1" />Tambah Tugas
                            </button>
                        )}
                    </div>
                </div>
                <div className="card-body border-bottom pb-3">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.status ?? ''} onChange={e => applyFilter('status', e.target.value)}>
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">Berlangsung</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.priority ?? ''} onChange={e => applyFilter('priority', e.target.value)}>
                                <option value="">Semua Prioritas</option>
                                <option value="low">Rendah</option>
                                <option value="normal">Normal</option>
                                <option value="high">Tinggi</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.task_type ?? ''} onChange={e => applyFilter('task_type', e.target.value)}>
                                <option value="">Semua Jenis</option>
                                <option value="cleaning">Pembersihan</option>
                                <option value="inspection">Inspeksi</option>
                                <option value="maintenance">Pemeliharaan</option>
                                <option value="deep_clean">Deep Clean</option>
                                <option value="extrabed">Ekstrabed</option>
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
                                <th style={{ width: '10%', minWidth: '90px', paddingLeft: '1.5rem' }}>Kamar</th>
                                <th style={{ width: '15%', minWidth: '120px' }}>Jenis</th>
                                <th style={{ width: '10%', minWidth: '100px' }}>Prioritas</th>
                                <th style={{ width: '12%', minWidth: '110px' }}>Status</th>
                                <th style={{ width: '18%', minWidth: '150px' }}>Ditugaskan ke</th>
                                <th style={{ width: '15%', minWidth: '130px' }}>Tenggat</th>
                                <th style={{ width: '15%', minWidth: '130px' }}>Selesai</th>
                                <th style={{ width: '10%', minWidth: '90px', paddingRight: '1.5rem' }} className="text-end">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.data.length === 0 && (
                                <tr><td colSpan="8" className="text-center text-muted py-5 fs-6">Tidak ada tugas yang terdaftar</td></tr>
                            )}
                            {tasks.data.map(task => (
                                <tr key={task.id} className="align-middle">
                                    <td style={{ paddingLeft: '1.5rem' }}>
                                        <span className="fw-bold text-dark">{task.room?.room_number}</span>
                                        <br />
                                        <small className="text-muted">Lt. {task.room?.floor?.floor_number}</small>
                                    </td>
                                    <td>
                                        {task.task_type === 'extrabed' ? (
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">{taskTypeLabel[task.task_type]}</span>
                                        ) : (
                                            <span className="text-dark-emphasis">{taskTypeLabel[task.task_type]}</span>
                                        )}
                                    </td>
                                    <td><span className={`badge ${priorityBadge[task.priority]} px-2 py-1`}>{priorityLabel[task.priority] ?? task.priority}</span></td>
                                    <td><span className={`badge ${statusBadge[task.status]} px-2 py-1`}>{statusLabel[task.status] ?? task.status}</span></td>
                                    <td className="text-truncate" style={{ maxWidth: '160px' }}>
                                        {task.assigned_to ? (
                                            <span className="text-dark fw-medium">{task.assigned_to?.name}</span>
                                        ) : (
                                            <span className="text-muted font-monospace">—</span>
                                        )}
                                    </td>
                                    <td className="text-muted small">{task.due_at ? new Date(task.due_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                                    <td className="text-muted small">{task.completed_at ? new Date(task.completed_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                                    <td className="text-end" style={{ paddingRight: '1.5rem' }}>
                                        <div className="d-inline-flex gap-1">
                                            {canUpdate && (
                                                <button className="btn btn-sm btn-light border-0 text-primary" onClick={() => setEditTask(task)}>
                                                    <i className="bi bi-pencil" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button className="btn btn-sm btn-light border-0 text-danger" onClick={() => deleteTask(task.id)}>
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
                {tasks.last_page > 1 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <small className="text-muted">Menampilkan {tasks.from}–{tasks.to} dari {tasks.total} tugas</small>
                        <div className="d-flex gap-1">
                            {tasks.links.map((link, i) => (
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
