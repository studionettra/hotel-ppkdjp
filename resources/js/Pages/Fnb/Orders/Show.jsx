import { usePage, router } from '@inertiajs/react';
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
const paymentLabel = {
    cash: 'Tunai', debit_card: 'Debit', credit_card: 'Kredit',
    transfer: 'Transfer', room_charge: 'Tagih ke Kamar',
};

export default function Show({ order }) {
    const { auth } = usePage().props;
    const canUpdate = auth.permissions.includes('fnb.update');

    function updateStatus(status, paymentMethod = null) {
        router.put(route('fnb.orders.update', order.id), {
            status,
            payment_method: paymentMethod ?? order.payment_method,
        });
    }

    return (
        <AppLayout title={`Pesanan ${order.order_number}`}>
            <div className="row">
                {/* Order Info */}
                <div className="col-md-4">
                    <div className="card mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h6 className="card-title mb-0">Detail Pesanan</h6>
                            <span className={`badge ${statusBadge[order.status]}`}>{statusLabel[order.status]}</span>
                        </div>
                        <div className="card-body">
                            <table className="table table-borderless table-sm mb-0">
                                <tbody>
                                    <tr>
                                        <td className="text-muted">No. Pesanan</td>
                                        <td><code>{order.order_number}</code></td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Tipe</td>
                                        <td>{orderTypeLabel[order.order_type]}</td>
                                    </tr>
                                    {order.guest && (
                                        <tr>
                                            <td className="text-muted">Tamu</td>
                                            <td>{order.guest.full_name}</td>
                                        </tr>
                                    )}
                                    {order.room && (
                                        <tr>
                                            <td className="text-muted">Kamar</td>
                                            <td>{order.room.room_number}</td>
                                        </tr>
                                    )}
                                    {order.table_number && (
                                        <tr>
                                            <td className="text-muted">Meja</td>
                                            <td>{order.table_number}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="text-muted">Kasir</td>
                                        <td>{order.created_by?.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-muted">Waktu</td>
                                        <td>{new Date(order.created_at).toLocaleString('id-ID')}</td>
                                    </tr>
                                    {order.payment_method && (
                                        <tr>
                                            <td className="text-muted">Pembayaran</td>
                                            <td>{paymentLabel[order.payment_method]}</td>
                                        </tr>
                                    )}
                                    {order.notes && (
                                        <tr>
                                            <td className="text-muted">Catatan</td>
                                            <td>{order.notes}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="card mb-3">
                        <div className="card-header"><h6 className="card-title mb-0">Tagihan</h6></div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-1">
                                <span>Subtotal</span>
                                <span>Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>PPN 11%</span>
                                <span>Rp {Number(order.tax).toLocaleString('id-ID')}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Total</span>
                                <span className="text-success fs-5">Rp {Number(order.total).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {canUpdate && order.status !== 'completed' && order.status !== 'cancelled' && (
                        <div className="card">
                            <div className="card-header"><h6 className="card-title mb-0">Aksi</h6></div>
                            <div className="card-body d-grid gap-2">
                                {order.status === 'pending' && (
                                    <button className="btn btn-primary" onClick={() => updateStatus('preparing')}>
                                        <i className="bi bi-fire me-1" />Mulai Proses
                                    </button>
                                )}
                                {order.status === 'preparing' && (
                                    <button className="btn btn-info" onClick={() => updateStatus('served')}>
                                        <i className="bi bi-check-circle me-1" />Tandai Disajikan
                                    </button>
                                )}
                                {order.status === 'served' && (
                                    <>
                                        <button className="btn btn-success" onClick={() => updateStatus('completed', 'cash')}>
                                            <i className="bi bi-cash me-1" />Selesai (Tunai)
                                        </button>
                                        <button className="btn btn-outline-success" onClick={() => updateStatus('completed', 'room_charge')}>
                                            <i className="bi bi-house me-1" />Tagih ke Kamar
                                        </button>
                                    </>
                                )}
                                <button className="btn btn-outline-danger" onClick={() => updateStatus('cancelled')}>
                                    <i className="bi bi-x-circle me-1" />Batalkan
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header"><h6 className="card-title mb-0">Item Pesanan</h6></div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Menu</th>
                                        <th>Kategori</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-end">Harga</th>
                                        <th className="text-end">Subtotal</th>
                                        <th>Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map(item => (
                                        <tr key={item.id}>
                                            <td><strong>{item.menu_item?.name || item.item_name || 'Item Kustom'}</strong></td>
                                            <td><small className="text-muted">{item.menu_item?.category?.name || 'FO Service'}</small></td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end">Rp {Number(item.unit_price).toLocaleString('id-ID')}</td>
                                            <td className="text-end">Rp {Number(item.subtotal).toLocaleString('id-ID')}</td>
                                            <td><small className="text-muted">{item.notes ?? '—'}</small></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <td colSpan="4" className="text-end fw-bold">Total</td>
                                        <td className="text-end fw-bold text-success">
                                            Rp {Number(order.total).toLocaleString('id-ID')}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
