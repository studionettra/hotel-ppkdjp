import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Swal from 'sweetalert2';
import DatePicker from '@/Components/DatePicker';

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

function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Edit({ reservation, guests, roomTypes }) {
    const { data, setData, put, processing, errors } = useForm({
        guest_id: reservation.guest_id || '', 
        guest: {
            full_name: reservation.guest?.full_name || '',
            id_type: reservation.guest?.id_type || 'ktp',
            id_number: reservation.guest?.id_number || '',
            phone: reservation.guest?.phone || '',
            email: reservation.guest?.email || '',
            address: reservation.guest?.address || '',
            nationality: reservation.guest?.nationality || '',
            date_of_birth: reservation.guest?.date_of_birth ? reservation.guest.date_of_birth.substring(0, 10) : '',
            gender: reservation.guest?.gender || 'male',
            profession: reservation.guest?.profession || '',
            company: reservation.guest?.company || '',
            member_card_no: reservation.guest?.member_card_no || ''
        },
        room_type_id: reservation.room_type_id || '',
        check_in_date: reservation.check_in_date?.substring(0, 10) || '',
        check_out_date: reservation.check_out_date?.substring(0, 10) || '',
        arrival_time: reservation.arrival_time ? reservation.arrival_time.substring(0, 5) : '',
        adults: reservation.adults || 1,
        children: reservation.children || 0,
        channel: reservation.channel || 'walk_in',
        special_request: reservation.special_request || '',
        payment_method: reservation.payment_method || '',
        deposit_box_number: reservation.deposit_box_number || '',
        deposit_box_issued_by: reservation.deposit_box_issued_by || '',
        deposit_box_date: reservation.deposit_box_date?.substring(0, 10) || ''
    });

    const selectedType = roomTypes.find(rt => rt.id == data.room_type_id);
    const nights = hitungMalam(data.check_in_date, data.check_out_date);
    const subTotal  = selectedType ? nights * selectedType.base_price : 0;
    const serviceCharge = subTotal * 0.10; // 10% Service Charge
    const tax = subTotal * 0.11; // 11% Tax
    const grandTotal = subTotal + serviceCharge + tax;
    const formatRp = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    function handleGuestChange(field, value) {
        setData('guest', { ...data.guest, [field]: value });
    }

    function searchGuest() {
        const found = guests.find(g => g.id_number === data.guest.id_number);
        if (found) {
            setData(d => ({
                ...d,
                guest_id: found.id,
                guest: {
                    ...d.guest,
                    full_name: found.full_name || '',
                    id_type: found.id_type || 'ktp',
                    phone: found.phone || '',
                    email: found.email || '',
                    address: found.address || '',
                    nationality: found.nationality || '',
                    date_of_birth: found.date_of_birth ? found.date_of_birth.substring(0, 10) : '',
                    gender: found.gender || 'male',
                    profession: found.profession || '',
                    company: found.company || '',
                    member_card_no: found.member_card_no || ''
                }
            }));
            Swal.fire({
                icon: 'success',
                title: 'Data Ditemukan',
                text: 'Data tamu berhasil diisi otomatis.',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            setData('guest_id', '');
            Swal.fire({
                icon: 'info',
                title: 'Tidak Ditemukan',
                text: 'KTP tamu belum terdaftar, silakan isi sebagai tamu baru.',
            });
        }
    }

    function submit(e) {
        e.preventDefault();
        put(route('reservations.update', reservation.id));
    }

    return (
        <AppLayout title="Edit Registration Form (Reservasi)" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Reservasi', href: route('reservations.index') },
            { label: reservation.reservation_code, href: route('reservations.show', reservation.id) },
            { label: 'Edit' },
        ]}>
            <form onSubmit={submit}>
                <div className="row">
                    <div className="col-md-8">
                        {/* Guest Details */}
                        <div className="card mb-4">
                            <div className="card-header"><h4 className="card-title">Data Tamu (Harap tulis dengan huruf cetak)</h4></div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">No. KTP / Passport No. <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <input type="text" className={`form-control${errors['guest.id_number'] ? ' is-invalid' : ''}`} 
                                                value={data.guest.id_number} onChange={e => handleGuestChange('id_number', e.target.value)} />
                                            <button className="btn btn-outline-secondary" type="button" onClick={searchGuest}>Cari Data Lama</button>
                                        </div>
                                        {errors['guest.id_number'] && <div className="d-block invalid-feedback">{errors['guest.id_number']}</div>}
                                        {data.guest_id && <small className="text-success">Menggunakan data tamu yang sudah ada (ID: {data.guest_id})</small>}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Nama (Name) <span className="text-danger">*</span></label>
                                        <input type="text" className={`form-control${errors['guest.full_name'] ? ' is-invalid' : ''}`}
                                            value={data.guest.full_name} onChange={e => handleGuestChange('full_name', e.target.value)} />
                                        {errors['guest.full_name'] && <div className="invalid-feedback">{errors['guest.full_name']}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Pekerjaan (Profession)</label>
                                        <input type="text" className="form-control"
                                            value={data.guest.profession} onChange={e => handleGuestChange('profession', e.target.value)} />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label">Perusahaan (Company)</label>
                                        <input type="text" className="form-control"
                                            value={data.guest.company} onChange={e => handleGuestChange('company', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Kebangsaan (Nationality)</label>
                                        <input type="text" className="form-control"
                                            value={data.guest.nationality} onChange={e => handleGuestChange('nationality', e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Tanggal Lahir (Birth Date)</label>
                                        <DatePicker className="form-control"
                                            value={data.guest.date_of_birth} onChange={e => handleGuestChange('date_of_birth', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">No. Member (Member Card No.)</label>
                                        <input type="text" className="form-control"
                                            value={data.guest.member_card_no} onChange={e => handleGuestChange('member_card_no', e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Telephone / Handphone</label>
                                        <input type="text" className="form-control"
                                            value={data.guest.phone} onChange={e => handleGuestChange('phone', e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control"
                                            value={data.guest.email} onChange={e => handleGuestChange('email', e.target.value)} />
                                    </div>
                                    
                                    <div className="col-12">
                                        <label className="form-label">Alamat (Address)</label>
                                        <textarea className="form-control" rows="2"
                                            value={data.guest.address} onChange={e => handleGuestChange('address', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reservation Info */}
                        <div className="card mb-4">
                            <div className="card-header"><h4 className="card-title">Informasi Reservasi</h4></div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Tipe Kamar <span className="text-danger">*</span></label>
                                        <select className={`form-select${errors.room_type_id ? ' is-invalid' : ''}`}
                                            value={data.room_type_id} onChange={e => setData('room_type_id', e.target.value)}>
                                            <option value="">-- Pilih Tipe Kamar --</option>
                                            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name} (maks. {rt.max_capacity} org)</option>)}
                                        </select>
                                        {errors.room_type_id && <div className="invalid-feedback">{errors.room_type_id}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Jumlah Tamu <span className="text-danger">*</span></label>
                                        <input type="number" min="1" className={`form-control${errors.adults ? ' is-invalid' : ''}`}
                                            value={data.adults} onChange={e => setData('adults', e.target.value)} />
                                        {errors.adults && <div className="invalid-feedback">{errors.adults}</div>}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Anak-anak</label>
                                        <input type="number" min="0" className="form-control"
                                            value={data.children} onChange={e => setData('children', e.target.value)} />
                                    </div>
                                    
                                    <div className="col-md-4">
                                        <label className="form-label">Tanggal Kedatangan <span className="text-danger">*</span></label>
                                        <DatePicker className={`form-control${errors.check_in_date ? ' is-invalid' : ''}`}
                                            value={data.check_in_date} onChange={e => setData('check_in_date', e.target.value)} 
                                            min={getTodayStr()} />
                                        {errors.check_in_date && <div className="invalid-feedback">{errors.check_in_date}</div>}
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Waktu Kedatangan</label>
                                        <input type="time" className={`form-control${errors.arrival_time ? ' is-invalid' : ''}`}
                                            value={data.arrival_time} onChange={e => setData('arrival_time', e.target.value)} />
                                        {errors.arrival_time && <div className="invalid-feedback">{errors.arrival_time}</div>}
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Tgl Keberangkatan <span className="text-danger">*</span></label>
                                        <DatePicker className={`form-control${errors.check_out_date ? ' is-invalid' : ''}`}
                                            value={data.check_out_date} onChange={e => setData('check_out_date', e.target.value)}
                                            min={data.check_in_date || getTodayStr()} />
                                        {errors.check_out_date && <div className="invalid-feedback">{errors.check_out_date}</div>}
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
                                    <div className="col-md-6">
                                        <label className="form-label">Permintaan Khusus</label>
                                        <input type="text" className="form-control" value={data.special_request}
                                            onChange={e => setData('special_request', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment & Others */}
                        <div className="card mb-4">
                            <div className="card-header"><h4 className="card-title">Pembayaran & Fasilitas</h4></div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label d-block">Cara Pembayaran (Method of Payment)</label>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="payment_method" value="VISA" 
                                                checked={data.payment_method === 'VISA'} onChange={e => setData('payment_method', e.target.value)} />
                                            <label className="form-check-label">VISA</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="payment_method" value="Debit Card"
                                                checked={data.payment_method === 'Debit Card'} onChange={e => setData('payment_method', e.target.value)} />
                                            <label className="form-check-label">Debit Card</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="payment_method" value="Other"
                                                checked={data.payment_method === 'Other'} onChange={e => setData('payment_method', e.target.value)} />
                                            <label className="form-check-label">Other</label>
                                        </div>
                                    </div>
                                    
                                    <div className="col-12 mt-4">
                                        <hr/>
                                        <h6>Safety Deposit Box (Optional)</h6>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Nomor Kotak Deposit</label>
                                        <input type="text" className="form-control"
                                            value={data.deposit_box_number} onChange={e => setData('deposit_box_number', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Dikeluarkan oleh</label>
                                        <input type="text" className="form-control"
                                            value={data.deposit_box_issued_by} onChange={e => setData('deposit_box_issued_by', e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Tanggal Deposit</label>
                                        <DatePicker className="form-control"
                                            value={data.deposit_box_date} onChange={e => setData('deposit_box_date', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card sticky-top" style={{ top: '2rem' }}>
                            <div className="card-header"><h4 className="card-title">Ringkasan</h4></div>
                            <div className="card-body">
                                <table className="table table-sm">
                                    <tbody>
                                        <tr><th>Tamu</th><td>{data.guest.full_name || '-'}</td></tr>
                                        <tr><th>Tipe Kamar</th><td>{selectedType?.name ?? '-'}</td></tr>
                                        <tr><th>Check-In</th><td>{formatTanggal(data.check_in_date)}</td></tr>
                                        <tr><th>Check-Out</th><td>{formatTanggal(data.check_out_date)}</td></tr>
                                        <tr><th>Durasi</th><td>{nights > 0 ? `${nights} malam` : '-'}</td></tr>
                                        <tr><th>Harga/Malam</th><td>{selectedType ? formatRp(selectedType.base_price) : '-'}</td></tr>
                                        <tr><th>Subtotal</th><td>{formatRp(subTotal)}</td></tr>
                                        <tr><th>Service (10%)</th><td>{formatRp(serviceCharge)}</td></tr>
                                        <tr><th>Pajak (11%)</th><td>{formatRp(tax)}</td></tr>
                                        <tr><th>Total Estimasi</th><td className="text-primary fw-bold">{formatRp(grandTotal)}</td></tr>
                                    </tbody>
                                </table>
                                <hr />
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>Perbarui & Konfirmasi</button>
                                    <Link href={route('reservations.index')} className="btn btn-outline-secondary">Batal</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
