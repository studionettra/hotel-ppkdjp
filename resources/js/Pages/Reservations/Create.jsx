import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function hitungMalam(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const [y1, m1, d1] = checkIn.split('-').map(Number);
    const [y2, m2, d2] = checkOut.split('-').map(Number);
    const a = new Date(y1, m1 - 1, d1);
    const b = new Date(y2, m2 - 1, d2);
    return Math.max(0, Math.round((b - a) / 86400000));
}

function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export default function Create({ guests, roomTypes }) {
    const { data, setData, post, processing, errors } = useForm({
        guest_id: '', room_type_id: '', check_in_date: '', check_out_date: '',
        adults: 1, children: 0, channel: 'walk_in', special_request: '',
    });

    const selectedType = roomTypes.find(rt => rt.id == data.room_type_id);
    const nights = hitungMalam(data.check_in_date, data.check_out_date);
    const total  = selectedType ? nights * selectedType.base_price : 0;
    const formatRp = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    function submit(e) {
        e.preventDefault();
        post(route('reservations.store'));
    }

    return (
        <AppLayout title="Buat Reservasi" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Reservasi', href: route('reservations.index') },
            { label: 'Buat' },
        ]}>
            <div className="row">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Form Reservasi</h4></div>
                        <div className="card-body">
                            <form onSubmit={submit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Tamu <span className="text-danger">*</span></label>
                                        <select className={`form-select${errors.guest_id ? ' is-invalid' : ''}`}
                                            value={data.guest_id} onChange={e => setData('guest_id', e.target.value)}>
                                            <option value="">-- Pilih Tamu --</option>
                                            {guests.map(g => <option key={g.id} value={g.id}>{g.full_name} ({g.id_number})</option>)}
                                        </select>
                                        {errors.guest_id && <div className="invalid-feedback">{errors.guest_id}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Tipe Kamar <span className="text-danger">*</span></label>
                                        <select className={`form-select${errors.room_type_id ? ' is-invalid' : ''}`}
                                            value={data.room_type_id} onChange={e => setData('room_type_id', e.target.value)}>
                                            <option value="">-- Pilih Tipe --</option>
                                            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name} (maks. {rt.max_capacity} org)</option>)}
                                        </select>
                                        {errors.room_type_id && <div className="invalid-feedback">{errors.room_type_id}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Check-In <span className="text-danger">*</span></label>
                                        <input type="date" className={`form-control${errors.check_in_date ? ' is-invalid' : ''}`}
                                            value={data.check_in_date} onChange={e => setData('check_in_date', e.target.value)} />
                                        {errors.check_in_date && <div className="invalid-feedback">{errors.check_in_date}</div>}
                                        {data.check_in_date && (
                                            <small className="text-muted">{formatTanggal(data.check_in_date)}</small>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Check-Out <span className="text-danger">*</span></label>
                                        <input type="date" className={`form-control${errors.check_out_date ? ' is-invalid' : ''}`}
                                            value={data.check_out_date} onChange={e => setData('check_out_date', e.target.value)}
                                            min={data.check_in_date || undefined} />
                                        {errors.check_out_date && <div className="invalid-feedback">{errors.check_out_date}</div>}
                                        {data.check_out_date && (
                                            <small className="text-muted">{formatTanggal(data.check_out_date)}</small>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Dewasa <span className="text-danger">*</span></label>
                                        <input type="number" min="1" className={`form-control${errors.adults ? ' is-invalid' : ''}`}
                                            value={data.adults} onChange={e => setData('adults', e.target.value)} />
                                        {errors.adults && <div className="invalid-feedback">{errors.adults}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Anak-anak</label>
                                        <input type="number" min="0" className="form-control"
                                            value={data.children} onChange={e => setData('children', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Channel</label>
                                        <select className="form-select" value={data.channel} onChange={e => setData('channel', e.target.value)}>
                                            <option value="walk_in">Walk In</option>
                                            <option value="phone">Phone</option>
                                            <option value="website">Website</option>
                                            <option value="ota">OTA</option>
                                            <option value="email">Email</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Permintaan Khusus</label>
                                        <textarea className="form-control" rows="2" value={data.special_request}
                                            onChange={e => setData('special_request', e.target.value)} />
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>Buat Reservasi</button>
                                    <Link href={route('reservations.index')} className="btn btn-secondary">Batal</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Ringkasan</h4></div>
                        <div className="card-body">
                            <table className="table table-sm">
                                <tbody>
                                    <tr><th>Tipe Kamar</th><td>{selectedType?.name ?? '-'}</td></tr>
                                    <tr><th>Check-In</th><td>{formatTanggal(data.check_in_date)}</td></tr>
                                    <tr><th>Check-Out</th><td>{formatTanggal(data.check_out_date)}</td></tr>
                                    <tr><th>Durasi</th><td>{nights > 0 ? `${nights} malam` : '-'}</td></tr>
                                    <tr><th>Harga/Malam</th><td>{selectedType ? formatRp(selectedType.base_price) : '-'}</td></tr>
                                    <tr><th>Total Estimasi</th><td><strong>{formatRp(total)}</strong></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
