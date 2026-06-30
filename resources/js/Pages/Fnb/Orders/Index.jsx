import { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const statusBadge = {
    pending:   'bg-warning text-dark',
    preparing: 'bg-primary',
    served:    'bg-info text-dark',
    completed: 'bg-success',
    cancelled: 'bg-secondary',
};

const statusLabel = {
    pending: 'Pending', preparing: 'Diproses',
    served: 'Disajikan', completed: 'Selesai', cancelled: 'Dibatalkan',
};

const orderTypeLabel = { dine_in: 'Dine In', room_service: 'Room Service', takeaway: 'Takeaway' };

function UpdateStatusModal({ order, onClose }) {
    const { data, setData, put, processing } = useForm({
        status:         order.status,
        payment_method: order.payment_method ?? 'cash',
    });

    function submit(e) {
        e.preventDefault();
        put(route('fnb.orders.update', order.id), { onSuccess: onClose });
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Pesanan #{order.order_number}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Status *</label>
                                <select className="form-select" value={data.status} onChange={e => setData('status', e.target.value)}>
                                    <option value="pending">Pending</option>
                                    <option value="preparing">Diproses</option>
                                    <option value="served">Disajikan</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                            {data.status === 'completed' && (
                                <div className="mb-3">
                                    <label className="form-label">Metode Pembayaran</label>
                                    <select className="form-select" value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}>
                                        <option value="cash">Tunai</option>
                                        <option value="debit_card">Kartu Debit</option>
                                        <option value="credit_card">Kartu Kredit</option>
                                        <option value="transfer">Transfer</option>
                                        <option value="room_charge">Tagih ke Kamar</option>
                                    </select>
                                </div>
                            )}
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

export default function Index({ orders, filters }) {
    const { auth } = usePage().props;
    const [editOrder, setEditOrder] = useState(null);

    const canCreate = auth.permissions.includes('fnb.create');
    const canUpdate = auth.permissions.includes('fnb.update');
    const canClose  = auth.permissions.includes('fnb.close');

    function applyFilter(key, value) {
        router.get(route('fnb.orders.index'), { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function deleteOrder(id) {
        if (!confirm('Hapus pesanan ini?')) return;
        router.delete(route('fnb.orders.destroy', id));
    }

    return (
        <AppLayout title="Pesanan F&B">
            {editOrder && <UpdateStatusModal order={editOrder} onClose={() => setEditOrder(null)} />}

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h4 className="card-title mb-0">Daftar Pesanan F&B</h4>
                    {canCreate && (
                        <a href={route('fnb.orders.create')} className="btn btn-primary btn-sm">
                            <i className="bi bi-plus-circle me-1" />Pesanan Baru
                        </a>
                    )}
                </div>
                <div className="card-body border-bottom pb-3">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.status ?? ''} onChange={e => applyFilter('status', e.target.value)}>
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="preparing">Diproses</option>
                                <option value="served">Disajikan</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filters.order_type ?? ''} onChange={e => applyFilter('order_type', e.target.value)}>
                                <option value="">Semua Tipe</option>
                                <option value="dine_in">Dine In</option>
                                <option value="room_service">Room Service</option>
                                <option value="takeaway">Takeaway</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4" style={{ width: '12%' }}>No. Pesanan</th>
                                <th style={{ width: '12%' }}>Tipe</th>
                                <th style={{ width: '23%' }}>Tamu / Meja</th>
                                <th style={{ width: '12%' }}>Status</th>
                                <th className="text-end" style={{ width: '12%' }}>Total</th>
                                <th style={{ width: '12%' }}>Kasir</th>
                                <th style={{ width: '12%' }}>Waktu</th>
                                <th className="text-center pe-4" style={{ width: '5%' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 && (
                                <tr><td colSpan="8" className="text-center text-muted py-4">Belum ada pesanan</td></tr>
                            )}
                            {orders.data.map(order => {
                                const badgeClass = {
                                    pending:   'bg-warning bg-opacity-10 text-warning border border-warning-subtle',
                                    preparing: 'bg-primary bg-opacity-10 text-primary border border-primary-subtle',
                                    served:    'bg-info bg-opacity-10 text-info border border-info-subtle',
                                    completed: 'bg-success bg-opacity-10 text-success border border-success-subtle',
                                    cancelled: 'bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle',
                                }[order.status] || 'bg-light text-dark';

                                const typeBadgeClass = {
                                    dine_in:      'bg-primary bg-opacity-10 text-primary border border-primary-subtle',
                                    room_service: 'bg-success bg-opacity-10 text-success border border-success-subtle',
                                    takeaway:     'bg-warning bg-opacity-10 text-warning border border-warning-subtle',
                                }[order.order_type] || 'bg-light text-dark';

                                return (
                                    <tr key={order.id}>
                                        <td className="ps-4">
                                            <a href={route('fnb.orders.show', order.id)} className="fw-semibold text-primary">{order.order_number}</a>
                                        </td>
                                        <td>
                                            <span className={`badge ${typeBadgeClass} px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                                                {orderTypeLabel[order.order_type]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="fw-medium text-body">{order.guest ? order.guest.full_name : '—'}</div>
                                            {order.room && <div className="text-muted small mt-0.5"><i className="bi bi-door-open me-1" />Kamar {order.room.room_number}</div>}
                                            {order.table_number && <div className="text-muted small mt-0.5"><i className="bi bi-grid me-1" />Meja {order.table_number}</div>}
                                        </td>
                                        <td>
                                            <span className={`badge ${badgeClass} px-2.5 py-1.5`} style={{ fontSize: '0.725rem' }}>
                                                {statusLabel[order.status]}
                                            </span>
                                        </td>
                                        <td className="text-end fw-semibold">Rp {Number(order.total).toLocaleString('id-ID')}</td>
                                        <td><span className="text-body" style={{ fontSize: '0.85rem' }}>{order.created_by?.name}</span></td>
                                        <td><span className="text-body-secondary" style={{ fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString('id-ID')}</span></td>
                                        <td className="text-center pe-4">
                                            <div className="d-flex align-items-center justify-content-center gap-1">
                                                <a href={route('fnb.orders.show', order.id)} className="btn btn-icon btn-link text-info p-1 mb-0 border-0" title="Detail">
                                                    <i className="bi bi-eye fs-6" />
                                                </a>
                                                {canUpdate && order.status !== 'completed' && order.status !== 'cancelled' && (
                                                    <button className="btn btn-icon btn-link text-warning p-1 mb-0 border-0" onClick={() => setEditOrder(order)} title="Update Status">
                                                        <i className="bi bi-pencil fs-6" />
                                                    </button>
                                                )}
                                                {canClose && order.status === 'cancelled' && (
                                                    <button className="btn btn-icon btn-link text-danger p-1 mb-0 border-0" onClick={() => deleteOrder(order.id)} title="Hapus">
                                                        <i className="bi bi-trash fs-6" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {orders.last_page > 1 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <small className="text-muted">Menampilkan {orders.from}–{orders.to} dari {orders.total} pesanan</small>
                        <div className="d-flex gap-1">
                            {orders.links.map((link, i) => (
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
