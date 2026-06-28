import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DatePicker from '@/Components/DatePicker';

export default function Index({ logs, users, filters }) {
    function applyFilter(key, value) {
        router.get(route('activity-log.index'), { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function formatProperties(props) {
        if (!props) return '—';
        const attributes = props.attributes ?? props;
        const keys = Object.keys(attributes).slice(0, 4);
        return keys.map(k => `${k}: ${attributes[k]}`).join(', ') + (Object.keys(attributes).length > 4 ? '...' : '');
    }

    return (
        <AppLayout title="Audit Log Aktivitas">
            <div className="card">
                <div className="card-header">
                    <h4 className="card-title mb-0">Log Aktivitas Sistem</h4>
                </div>
                <div className="card-body border-bottom pb-3">
                    <div className="row g-2">
                        <div className="col-md-2">
                            <select className="form-select form-select-sm" value={filters.causer_id ?? ''} onChange={e => applyFilter('causer_id', e.target.value)}>
                                <option value="">Semua Pengguna</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select form-select-sm" value={filters.event ?? ''} onChange={e => applyFilter('event', e.target.value)}>
                                <option value="">Semua Event</option>
                                <option value="created">Created</option>
                                <option value="updated">Updated</option>
                                <option value="deleted">Deleted</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <DatePicker className="form-control form-control-sm"
                                value={filters.date_from ?? ''} onChange={e => applyFilter('date_from', e.target.value)}
                                placeholder="Dari tanggal" />
                        </div>
                        <div className="col-md-2">
                            <DatePicker className="form-control form-control-sm"
                                value={filters.date_to ?? ''} onChange={e => applyFilter('date_to', e.target.value)}
                                placeholder="Sampai tanggal" />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-sm btn-outline-secondary"
                                onClick={() => router.get(route('activity-log.index'))}>
                                <i className="bi bi-x-circle me-1" />Reset
                            </button>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-sm mb-0">
                        <thead>
                            <tr>
                                <th>Waktu</th>
                                <th>Pengguna</th>
                                <th>Event</th>
                                <th>Model</th>
                                <th>ID</th>
                                <th>Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length === 0 && (
                                <tr><td colSpan="6" className="text-center text-muted py-4">Tidak ada log aktivitas</td></tr>
                            )}
                            {logs.data.map(log => (
                                <tr key={log.id}>
                                    <td><small>{new Date(log.created_at).toLocaleString('id-ID')}</small></td>
                                    <td>
                                        {log.causer
                                            ? <span className="badge bg-light text-dark">{log.causer.name}</span>
                                            : <span className="text-muted">System</span>
                                        }
                                    </td>
                                    <td>
                                        <span className={`badge ${
                                            log.event === 'created' ? 'bg-success' :
                                            log.event === 'updated' ? 'bg-primary' :
                                            log.event === 'deleted' ? 'bg-danger' : 'bg-secondary'
                                        }`}>
                                            {log.event ?? log.description}
                                        </span>
                                    </td>
                                    <td>
                                        <small className="text-muted">
                                            {log.subject_type ? log.subject_type.split('\\').pop() : '—'}
                                        </small>
                                    </td>
                                    <td><small>{log.subject_id ?? '—'}</small></td>
                                    <td>
                                        <small className="text-muted" style={{ maxWidth: '300px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {log.properties ? formatProperties(log.properties) : '—'}
                                        </small>
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
