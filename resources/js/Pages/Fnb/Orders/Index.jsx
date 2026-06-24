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
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>No. Pesanan</th>
                                <th>Tipe</th>
                                <th>Tamu / Meja</th>
                                <th>Status</th>
                                <th className="text-end">Total</th>
                                <th>Kasir</th>
                                <th>Waktu</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 && (
                                <tr><td colSpan="8" className="text-center text-muted py-4">Belum ada pesanan</td></tr>
                            )}
                            {orders.data.map(order => (
                                <tr key={order.id}>
                                    <td><code>{order.order_number}</code></td>
                                    <td><span className="badge bg-light text-dark">{orderTypeLabel[order.order_type]}</span></td>
                                    <td>
                                        {order.guest ? order.guest.full_name : '—'}
                                        {order.room && <><br /><small className="text-muted">Kamar {order.room.room_number}</small></>}
                                        {order.table_number && <><br /><small className="text-muted">Meja {order.table_number}</small></>}
                                    </td>
                                    <td><span className={`badge ${statusBadge[order.status]}`}>{statusLabel[order.status]}</span></td>
                                    <td className="text-end">Rp {Number(order.total).toLocaleString('id-ID')}</td>
                                    <td>{order.created_by?.name}</td>
                                    <td><small>{new Date(order.created_at).toLocaleDateString('id-ID')}</small></td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <a href={route('fnb.orders.show', order.id)} className="btn btn-sm btn-outline-info">
                                                <i className="bi bi-eye" />
                                            </a>
                                            {canUpdate && order.status !== 'completed' && order.status !== 'cancelled' && (
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditOrder(order)}>
                                                    <i className="bi bi-pencil" />
                                                </button>
                                            )}
                                            {canClose && order.status === 'cancelled' && (
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteOrder(order.id)}>
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
