import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Create({ menuItems, rooms, guests }) {
    const { auth } = usePage().props;
    const [cartItems, setCartItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [qty, setQty] = useState(1);
    const [itemNote, setItemNote] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        order_type:   'dine_in',
        guest_id:     '',
        room_id:      '',
        table_number: '',
        notes:        '',
        items:        [],
    });

    const TAX_RATE = 0.11;
    const subtotal = cartItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const tax      = Math.round(subtotal * TAX_RATE);
    const total    = subtotal + tax;

    function addToCart() {
        if (!selectedItem) return;
        const menu = menuItems.find(m => m.id === Number(selectedItem));
        if (!menu) return;
        const existing = cartItems.findIndex(i => i.menu_item_id === menu.id);
        if (existing >= 0) {
            const updated = [...cartItems];
            updated[existing].quantity += qty;
            updated[existing].subtotal = updated[existing].unit_price * updated[existing].quantity;
            setCartItems(updated);
        } else {
            setCartItems([...cartItems, {
                menu_item_id: menu.id,
                name:         menu.name,
                unit_price:   menu.price,
                quantity:     qty,
                subtotal:     menu.price * qty,
                notes:        itemNote,
            }]);
        }
        setSelectedItem('');
        setQty(1);
        setItemNote('');
    }

    function removeFromCart(idx) {
        setCartItems(cartItems.filter((_, i) => i !== idx));
    }

    function updateQty(idx, newQty) {
        if (newQty < 1) return;
        const updated = [...cartItems];
        updated[idx].quantity = newQty;
        updated[idx].subtotal = updated[idx].unit_price * newQty;
        setCartItems(updated);
    }

    function submit(e) {
        e.preventDefault();
        if (cartItems.length === 0) return;
        post(route('fnb.orders.store'), {
            data: {
                ...data,
                items: cartItems.map(i => ({
                    menu_item_id: i.menu_item_id,
                    quantity:     i.quantity,
                    notes:        i.notes,
                })),
            },
        });
    }

    // Group menu items by category
    const grouped = menuItems.reduce((acc, item) => {
        const cat = item.category?.name ?? 'Lainnya';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <AppLayout title="Buat Pesanan F&B">
            <form onSubmit={submit}>
                <div className="row">
                    {/* Order Details */}
                    <div className="col-md-4">
                        <div className="card mb-3">
                            <div className="card-header"><h6 className="card-title mb-0">Detail Pesanan</h6></div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Tipe Pesanan *</label>
                                    <select className="form-select" value={data.order_type} onChange={e => setData('order_type', e.target.value)}>
                                        <option value="dine_in">Dine In</option>
                                        <option value="room_service">Room Service</option>
                                        <option value="takeaway">Takeaway</option>
                                    </select>
                                </div>

                                {data.order_type === 'dine_in' && (
                                    <div className="mb-3">
                                        <label className="form-label">No. Meja</label>
                                        <input type="text" className="form-control"
                                            value={data.table_number} onChange={e => setData('table_number', e.target.value)}
                                            placeholder="A1, B2, dst." />
                                    </div>
                                )}

                                {data.order_type === 'room_service' && (
                                    <div className="mb-3">
                                        <label className="form-label">Kamar</label>
                                        <select className="form-select" value={data.room_id} onChange={e => setData('room_id', e.target.value)}>
                                            <option value="">-- Pilih Kamar --</option>
                                            {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">Tamu (Opsional)</label>
                                    <select className="form-select" value={data.guest_id} onChange={e => setData('guest_id', e.target.value)}>
                                        <option value="">-- Pilih Tamu --</option>
                                        {guests.map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Catatan</label>
                                    <textarea className="form-control" rows="2"
                                        value={data.notes} onChange={e => setData('notes', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="card">
                            <div className="card-header"><h6 className="card-title mb-0">Ringkasan</h6></div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>PPN 11%</span>
                                    <span>Rp {tax.toLocaleString('id-ID')}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total</span>
                                    <span className="text-success">Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button type="submit" className="btn btn-primary w-100" disabled={processing || cartItems.length === 0}>
                                    {processing ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                    Buat Pesanan ({cartItems.length} item)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Menu & Cart */}
                    <div className="col-md-8">
                        {/* Add Item */}
                        <div className="card mb-3">
                            <div className="card-header"><h6 className="card-title mb-0">Tambah Item</h6></div>
                            <div className="card-body">
                                <div className="row g-2 align-items-end">
                                    <div className="col-md-5">
                                        <label className="form-label">Menu</label>
                                        <select className="form-select" value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
                                            <option value="">-- Pilih Menu --</option>
                                            {Object.entries(grouped).map(([cat, items]) => (
                                                <optgroup key={cat} label={cat}>
                                                    {items.map(m => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.name} — Rp {Number(m.price).toLocaleString('id-ID')}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Qty</label>
                                        <input type="number" className="form-control" value={qty}
                                            onChange={e => setQty(Number(e.target.value))} min="1" />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Catatan</label>
                                        <input type="text" className="form-control" value={itemNote}
                                            onChange={e => setItemNote(e.target.value)} placeholder="Pedas, tanpa bawang..." />
                                    </div>
                                    <div className="col-md-2">
                                        <button type="button" className="btn btn-outline-primary w-100" onClick={addToCart} disabled={!selectedItem}>
                                            <i className="bi bi-plus" /> Tambah
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="card">
                            <div className="card-header"><h6 className="card-title mb-0">Keranjang</h6></div>
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th className="text-end">Harga</th>
                                            <th className="text-center">Qty</th>
                                            <th className="text-end">Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.length === 0 && (
                                            <tr><td colSpan="5" className="text-center text-muted py-4">Keranjang kosong</td></tr>
                                        )}
                                        {cartItems.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    {item.name}
                                                    {item.notes && <><br /><small className="text-muted">{item.notes}</small></>}
                                                </td>
                                                <td className="text-end">Rp {Number(item.unit_price).toLocaleString('id-ID')}</td>
                                                <td className="text-center">
                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                        <button type="button" className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => updateQty(idx, item.quantity - 1)}>−</button>
                                                        <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => updateQty(idx, item.quantity + 1)}>+</button>
                                                    </div>
                                                </td>
                                                <td className="text-end">Rp {Number(item.subtotal).toLocaleString('id-ID')}</td>
                                                <td>
                                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeFromCart(idx)}>
                                                        <i className="bi bi-trash" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
