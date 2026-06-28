import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_COLORS = {
    pending: 'secondary', confirmed: 'primary', checked_in: 'success',
    checked_out: 'dark', cancelled: 'danger', no_show: 'warning',
};

const STATUS_LABELS = {
    pending: 'Pending', confirmed: 'Confirmed', checked_in: 'Check-In',
    checked_out: 'Check-Out', cancelled: 'Cancelled', no_show: 'No Show',
};

function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const s = String(dateStr).substring(0, 10);
    const [y, m, d] = s.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function hitungMalam(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const ci = String(checkIn).substring(0, 10);
    const co = String(checkOut).substring(0, 10);
    const [y1, m1, d1] = ci.split('-').map(Number);
    const [y2, m2, d2] = co.split('-').map(Number);
    if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
    const a = new Date(y1, m1 - 1, d1);
    const b = new Date(y2, m2 - 1, d2);
    return Math.max(0, Math.round((b - a) / 86400000));
}

export default function Show({ reservation, menuItems }) {
    const formatRp = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    const nights = hitungMalam(reservation.check_in_date, reservation.check_out_date);

    // Form F&B
    const { data: fnbData, setData: setFnbData, post: postFnb, processing: fnbProcessing, reset: fnbReset, errors: fnbErrors } = useForm({
        menu_item_id: '', quantity: 1, notes: ''
    });

    const selectedMenuItem = menuItems?.find(m => String(m.id) === String(fnbData.menu_item_id));
    const fnbTotalPrice = selectedMenuItem ? (selectedMenuItem.price * fnbData.quantity) : 0;

    // Form Extrabed
    const { data: ebData, setData: setEbData, post: postEb, processing: ebProcessing, reset: ebReset, errors: ebErrors } = useForm({
        price: '', notes: ''
    });

    // Form Laundry
    const { data: laundryData, setData: setLaundryData, post: postLaundry, processing: laundryProcessing, reset: laundryReset, errors: laundryErrors } = useForm({
        item_name: '', item_type: 'clothes', quantity: 1, service_type: 'regular', unit_price: '', notes: ''
    });

    const [showFnbModal, setShowFnbModal] = useState(false);
    const [showEbModal, setShowEbModal] = useState(false);
    const [showLaundryModal, setShowLaundryModal] = useState(false);

    const submitFnb = (e) => {
        e.preventDefault();
        postFnb(route('fo.services.fnb', reservation.id), {
            onSuccess: () => { setShowFnbModal(false); fnbReset(); },
        });
    };

    const submitEb = (e) => {
        e.preventDefault();
        postEb(route('fo.services.extrabed', reservation.id), {
            onSuccess: () => { setShowEbModal(false); ebReset(); },
        });
    };

    const submitLaundry = (e) => {
        e.preventDefault();
        postLaundry(route('fo.services.laundry', reservation.id), {
            onSuccess: () => { setShowLaundryModal(false); laundryReset(); },
        });
    };

    return (
        <AppLayout title="Detail Reservasi" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Reservasi', href: route('reservations.index') },
            { label: reservation.reservation_code },
        ]}>
            <div className="row">
                <div className="col-md-7">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title mb-0">{reservation.reservation_code}</h4>
                            <span className={`badge bg-${STATUS_COLORS[reservation.status]}`}>
                                {STATUS_LABELS[reservation.status] ?? reservation.status}
                            </span>
                        </div>
                        <div className="card-body">
                            <table className="table table-sm">
                                <tbody>
                                    <tr><th style={{width:'40%'}}>Tamu</th><td>{reservation.guest?.full_name}</td></tr>
                                    <tr><th>Tipe Kamar</th><td>{reservation.room_type?.name}</td></tr>
                                    <tr><th>Kamar</th><td>{reservation.room?.room_number ?? <em className="text-muted">Belum ditentukan</em>}</td></tr>
                                    <tr><th>Check-In</th><td>{formatTanggal(reservation.check_in_date)}</td></tr>
                                    <tr><th>Check-Out</th><td>{formatTanggal(reservation.check_out_date)}</td></tr>
                                    <tr><th>Durasi</th><td>{nights} malam</td></tr>
                                    <tr><th>Dewasa</th><td>{reservation.adults}</td></tr>
                                    <tr><th>Anak-anak</th><td>{reservation.children}</td></tr>
                                    <tr><th>Channel</th><td>{reservation.channel}</td></tr>
                                    <tr><th>Total</th><td><strong>{formatRp(reservation.total_amount)}</strong></td></tr>
                                    <tr><th>Dibuat oleh</th><td>{reservation.created_by?.name ?? '-'}</td></tr>
                                    <tr><th>Permintaan Khusus</th><td>{reservation.special_request || '-'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-md-5">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Aksi</h4></div>
                        <div className="card-body d-flex flex-column gap-2">
                            {['pending', 'confirmed'].includes(reservation.status) && (
                                <Link href={route('reservations.edit', reservation.id)} className="btn btn-warning">
                                    <i className="bi bi-pencil me-2"></i>Edit Reservasi
                                </Link>
                            )}
                            {reservation.status === 'confirmed' && (
                                <Link href={route('checkins.create', reservation.id)} className="btn btn-success">
                                    <i className="bi bi-box-arrow-in-right me-2"></i>Proses Check-In
                                </Link>
                            )}
                            {reservation.status === 'checked_in' && reservation.check_in && (
                                <>
                                    <button onClick={() => setShowLaundryModal(true)} className="btn btn-outline-info">
                                        <i className="bi bi-droplet me-2"></i>Pesan Laundry
                                    </button>
                                    <button onClick={() => setShowEbModal(true)} className="btn btn-outline-primary">
                                        <i className="bi bi-plus-circle me-2"></i>Pesan Ekstrabed
                                    </button>
                                    <button onClick={() => setShowFnbModal(true)} className="btn btn-outline-success">
                                        <i className="bi bi-cup-hot me-2"></i>Pesan F&B
                                    </button>
                                    <Link href={route('checkouts.create', reservation.check_in.id)} className="btn btn-dark">
                                        <i className="bi bi-box-arrow-right me-2"></i>Proses Check-Out
                                    </Link>
                                </>
                            )}
                            <Link href={route('guests.show', reservation.guest_id)} className="btn btn-info">
                                <i className="bi bi-person me-2"></i>Lihat Profil Tamu
                            </Link>
                            <Link href={route('reservations.index')} className="btn btn-secondary">
                                <i className="bi bi-arrow-left me-2"></i>Kembali
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal F&B */}
            {showFnbModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={submitFnb}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Pesan F&B (Front Office)</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowFnbModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Menu Makanan/Minuman <span className="text-danger">*</span></label>
                                        <select className={`form-select${fnbErrors.menu_item_id ? ' is-invalid' : ''}`}
                                            value={fnbData.menu_item_id} onChange={e => setFnbData('menu_item_id', e.target.value)} required>
                                            <option value="">-- Pilih Menu --</option>
                                            {menuItems?.map(menu => (
                                                <option key={menu.id} value={menu.id}>
                                                    {menu.name} - {formatRp(menu.price)}
                                                </option>
                                            ))}
                                        </select>
                                        {fnbErrors.menu_item_id && <div className="invalid-feedback">{fnbErrors.menu_item_id}</div>}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Jumlah (Qty) <span className="text-danger">*</span></label>
                                            <input type="number" min="1" className={`form-control${fnbErrors.quantity ? ' is-invalid' : ''}`}
                                                value={fnbData.quantity} onChange={e => setFnbData('quantity', e.target.value)} required />
                                            {fnbErrors.quantity && <div className="invalid-feedback">{fnbErrors.quantity}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Harga Total (Rp)</label>
                                            <input type="text" className="form-control" value={formatRp(fnbTotalPrice)} readOnly disabled />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Catatan</label>
                                        <textarea className="form-control" rows="2"
                                            value={fnbData.notes} onChange={e => setFnbData('notes', e.target.value)}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowFnbModal(false)}>Batal</button>
                                    <button type="submit" className="btn btn-success" disabled={fnbProcessing}>Kirim Pesanan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Extrabed */}
            {showEbModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={submitEb}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Pesan Ekstrabed (Front Office)</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEbModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Harga Total (Rp)</label>
                                        <input type="number" min="0" className={`form-control${ebErrors.price ? ' is-invalid' : ''}`}
                                            value={ebData.price} onChange={e => setEbData('price', e.target.value)} required />
                                        {ebErrors.price && <div className="invalid-feedback">{ebErrors.price}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Catatan Tambahan</label>
                                        <textarea className="form-control" rows="2"
                                            value={ebData.notes} onChange={e => setEbData('notes', e.target.value)}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEbModal(false)}>Batal</button>
                                    <button type="submit" className="btn btn-primary" disabled={ebProcessing}>Pesan Ekstrabed</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Laundry */}
            {showLaundryModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Pesan Laundry (Front Office)</h5>
                                <button type="button" className="btn-close" onClick={() => setShowLaundryModal(false)} />
                            </div>
                            <form onSubmit={submitLaundry}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Nama Barang <span className="text-danger">*</span></label>
                                        <input type="text" className={`form-control ${laundryErrors.item_name ? 'is-invalid' : ''}`}
                                            value={laundryData.item_name} onChange={e => setLaundryData('item_name', e.target.value)} placeholder="Contoh: Kemeja Putih" required />
                                        {laundryErrors.item_name && <div className="invalid-feedback">{laundryErrors.item_name}</div>}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Jenis <span className="text-danger">*</span></label>
                                            <select className={`form-select ${laundryErrors.item_type ? 'is-invalid' : ''}`}
                                                value={laundryData.item_type} onChange={e => setLaundryData('item_type', e.target.value)}>
                                                <option value="clothes">Pakaian</option>
                                                <option value="linen">Linen</option>
                                                <option value="towel">Handuk</option>
                                                <option value="uniform">Seragam</option>
                                                <option value="other">Lainnya</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Layanan <span className="text-danger">*</span></label>
                                            <select className={`form-select ${laundryErrors.service_type ? 'is-invalid' : ''}`}
                                                value={laundryData.service_type} onChange={e => setLaundryData('service_type', e.target.value)}>
                                                <option value="regular">Reguler</option>
                                                <option value="express">Express</option>
                                                <option value="dry_clean">Dry Clean</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Jumlah (Qty) <span className="text-danger">*</span></label>
                                            <input type="number" className={`form-control ${laundryErrors.quantity ? 'is-invalid' : ''}`}
                                                value={laundryData.quantity} onChange={e => setLaundryData('quantity', e.target.value)} min="1" required />
                                            {laundryErrors.quantity && <div className="invalid-feedback">{laundryErrors.quantity}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Harga Satuan <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text">Rp</span>
                                                <input type="number" className={`form-control ${laundryErrors.unit_price ? 'is-invalid' : ''}`}
                                                    value={laundryData.unit_price} onChange={e => setLaundryData('unit_price', e.target.value)} min="0" required />
                                            </div>
                                            {laundryErrors.unit_price && <div className="d-block invalid-feedback">{laundryErrors.unit_price}</div>}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Catatan</label>
                                        <textarea className="form-control" rows="2"
                                            value={laundryData.notes} onChange={e => setLaundryData('notes', e.target.value)} placeholder="Catatan tambahan..." />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowLaundryModal(false)}>Batal</button>
                                    <button type="submit" className="btn btn-info" disabled={laundryProcessing}>Pesan Laundry</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
