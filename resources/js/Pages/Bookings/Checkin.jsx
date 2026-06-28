import React, { useState } from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Swal from 'sweetalert2';
import DatePicker from '@/Components/DatePicker';

export default function Checkin({ rooms, roomConfigs, checkIn, checkOut, guests }) {
    const { auth } = usePage().props;
    
    // Get today's date in YYYY-MM-DD format for min date validation
    const todayObj = new Date();
    const today = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    
    // Generate initial form state
    const initialRoomsData = rooms.map(room => {
        const config = roomConfigs[room.id];
        return {
            room_id: room.id,
            extrabed: config?.extrabed || false,
            breakfast: config?.breakfast || false,
            pax: 2, // default 2
            notes: '',
            guest: {
                id_type: 'KTP',
                id_number: '',
                full_name: '',
                gender: '',
                profession: '',
                company: '',
                nationality: '',
                date_of_birth: '',
                member_card_no: '',
                phone: '',
                email: '',
                address: ''
            }
        };
    });

    const { data, setData, post, processing } = useForm({
        arrival_time: '',
        check_in: checkIn,
        check_out: checkOut,
        payment_method: '',
        rooms: initialRoomsData
    });

    const [isSummaryGenerated, setIsSummaryGenerated] = useState(false);

    const handleGuestSearch = (index, value) => {
        if (!value) return;
        const found = guests.find(g => String(g.id_number) === String(value));
        if (found) {
            const updatedRooms = [...data.rooms];
            updatedRooms[index].guest = {
                id_type: found.id_type || 'KTP',
                id_number: found.id_number,
                full_name: found.full_name,
                gender: found.gender || '',
                profession: found.profession || '',
                company: found.company || '',
                nationality: found.nationality || '',
                date_of_birth: found.date_of_birth ? found.date_of_birth.substring(0, 10) : '',
                member_card_no: found.member_card_no || '',
                phone: found.phone || '',
                email: found.email || '',
                address: found.address || ''
            };
            setData('rooms', updatedRooms);
            Swal.fire({
                icon: 'success',
                title: 'Data Ditemukan',
                text: `Tamu a/n ${found.full_name} berhasil dimuat.`,
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Data Tidak Ditemukan',
                text: 'No ID belum terdaftar. Silakan isi form data tamu baru.',
                confirmButtonColor: '#0d6efd'
            });
        }
    };

    const handleGuestChange = (index, field, value) => {
        const updatedRooms = [...data.rooms];
        updatedRooms[index].guest[field] = value;
        setData('rooms', updatedRooms);
    };

    const nights = Math.max(1, Math.ceil(
        (new Date(data.check_out) - new Date(data.check_in)) / 86400000
    ));

    let grandTotal = 0;
    const roomBreakdowns = data.rooms.map(roomData => {
        const room = rooms.find(r => r.id === roomData.room_id);
        const baseRoomPrice = Number(room.room_type?.base_price ?? 0) * nights;
        const hasBreakfastFacility = Array.isArray(room.room_type?.facilities) && room.room_type.facilities.some(f => f.toLowerCase().includes('breakfast') || f.toLowerCase().includes('sarapan'));
        const includedBreakfast = hasBreakfastFacility || room.room_type?.name?.toLowerCase().includes('breakfast');

        let subtotal = baseRoomPrice;
        let extrabedTotal = 0;
        let breakfastTotal = 0;
        
        if (roomData?.extrabed) {
            extrabedTotal = 200000 * nights;
            subtotal += extrabedTotal;
        }
        if (roomData?.breakfast && !includedBreakfast) {
            breakfastTotal = 150000 * nights;
            subtotal += breakfastTotal;
        }
        
        const serviceCharge = subtotal * 0.10;
        const tax = subtotal * 0.11;
        const total = subtotal + serviceCharge + tax;
        
        grandTotal += total;
        
        return { 
            room, subtotal, serviceCharge, tax, total, 
            baseRoomPrice, extrabedTotal, breakfastTotal, 
            includedBreakfast 
        };
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('bookings.store'));
    };

    return (
        <AppLayout title="Check-In & Registrasi">
            <div className="container-fluid py-4">
                <form onSubmit={submit}>
                    <div className="row g-4">
                        {/* Kiri: Daftar Kamar & Data Tamu */}
                        <div className="col-lg-8">
                            {data.rooms.map((roomData, idx) => {
                                const room = rooms.find(r => r.id === roomData.room_id);
                                return (
                                    <div key={room.id} className="card mb-4 shadow-sm border-primary">
                                        {/* Header Kamar */}
                                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0 fw-bold text-white">
                                                <i className="bi bi-door-closed me-2 text-white"></i>
                                                Kamar {room.room_number} 
                                            </h5>
                                            <small className="badge bg-light text-primary">
                                                {room.room_type.name} 
                                                {roomData.extrabed ? ' | + Extrabed' : ''}
                                                {roomData.breakfast ? ' | + Sarapan' : ''}
                                            </small>
                                        </div>
                                        <div className="card-body">
                                            {idx === 0 && (
                                                <>
                                                    <h5 className="mb-3 mt-2 text-primary fw-bold text-uppercase py-4" style={{ letterSpacing: '1px' }}>
                                                        Tanggal Menginap / Stay Dates
                                                    </h5>
                                                    <div className="row g-3 mb-4">
                                                        <div className="col-12">
                                                            <label className="form-label fw-semibold text-muted">ARRIVAL TIME</label>
                                                            <input type="time" className="form-control"
                                                                value={data.arrival_time} onChange={e => { setData('arrival_time', e.target.value); setIsSummaryGenerated(false); }} />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label fw-semibold text-muted">ARRIVAL DATE <span className="text-danger">*</span></label>
                                                            <DatePicker className="form-control"
                                                                min={today}
                                                                value={data.check_in} onChange={e => { 
                                                                    setData('check_in', e.target.value); 
                                                                    // If check_out is earlier than new check_in, update check_out
                                                                    if (data.check_out && e.target.value >= data.check_out) {
                                                                        const nextDay = new Date(e.target.value);
                                                                        nextDay.setDate(nextDay.getDate() + 1);
                                                                        const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
                                                                        setData(prev => ({...prev, check_in: e.target.value, check_out: nextDayStr}));
                                                                    }
                                                                    setIsSummaryGenerated(false); 
                                                                }} required />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label fw-semibold text-muted">DEPARTURE DATE <span className="text-danger">*</span></label>
                                                            <DatePicker className="form-control"
                                                                min={data.check_in || today}
                                                                value={data.check_out} onChange={e => { setData('check_out', e.target.value); setIsSummaryGenerated(false); }} required />
                                                        </div>
                                                    </div>
                                                    <hr className="mb-4" />
                                                </>
                                            )}

                                            <h5 className="mb-3 text-primary fw-bold text-uppercase py-2" style={{ letterSpacing: '1px' }}>
                                                Informasi Kamar / Room Details
                                            </h5>
                                            <div className="row g-3 mb-4 border-bottom pb-4">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-muted">ROOM NO.</label>
                                                    <input type="text" className="form-control bg-light" value={room.room_number} disabled />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-muted">NO. OF FLOOR</label>
                                                    <input type="text" className="form-control bg-light" value="1" disabled />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-muted mb-0">NO. OF PERSON</label>
                                                    <input type="text" className="form-control bg-light mt-2" value={roomData.pax} disabled />
                                                    <small className="text-primary mt-1 d-block"><i className="bi bi-info-circle me-1"></i>Maks. {roomData.pax} tamu/kamar</small>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold text-muted">ROOM TYPE</label>
                                                    <input type="text" className="form-control bg-light" value={room.room_type.name} disabled />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold text-muted">RECEPTIONIST</label>
                                                    <input type="text" className="form-control bg-light" value={auth?.user?.name || 'Receptionist'} disabled />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label fw-semibold text-muted">CATATAN TAMBAHAN / ADDITIONAL NOTES (OPTIONAL)</label>
                                                    <textarea className="form-control" rows="3" placeholder="Contoh: Permintaan khusus, alergi, atau catatan lainnya..."
                                                        value={roomData.notes}
                                                        onChange={e => {
                                                            const updatedRooms = [...data.rooms];
                                                            updatedRooms[idx].notes = e.target.value;
                                                            setData('rooms', updatedRooms);
                                                        }}></textarea>
                                                </div>
                                            </div>

                                            <h5 className="mb-4 mt-2 text-primary fw-bold">DATA TAMU</h5>
                                            <div className="row g-3">
                                                <div className="col-md-4 mb-2">
                                                    <label className="form-label">Jenis ID <span className="text-danger">*</span></label>
                                                    <select className="form-select"
                                                        value={roomData.guest.id_type}
                                                        onChange={e => handleGuestChange(idx, 'id_type', e.target.value)} required>
                                                        <option value="KTP">KTP</option>
                                                        <option value="Passport">Passport</option>
                                                        <option value="Kitas">Kitas</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-8 mb-2">
                                                    <label className="form-label">No. Identitas <span className="text-danger">*</span></label>
                                                    <div className="input-group">
                                                        <input type="text" className="form-control"
                                                            value={roomData.guest.id_number}
                                                            onChange={e => handleGuestChange(idx, 'id_number', e.target.value)} required />
                                                        <button type="button" className="btn btn-outline-secondary" onClick={() => handleGuestSearch(idx, roomData.guest.id_number)}>Cari Data Lama</button>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Nama (Name) <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control"
                                                        value={roomData.guest.full_name}
                                                        onChange={e => handleGuestChange(idx, 'full_name', e.target.value)} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Jenis Kelamin<span className="text-danger">*</span></label>
                                                    <select className="form-select"
                                                        value={roomData.guest.gender}
                                                        onChange={e => handleGuestChange(idx, 'gender', e.target.value)} required>
                                                        <option value="">-- Pilih Jenis Kelamin --</option>
                                                        <option value="male">Laki-laki (Male)</option>
                                                        <option value="female">Perempuan (Female)</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Pekerjaan (Profession)</label>
                                                    <input type="text" className="form-control"
                                                        value={roomData.guest.profession || ''}
                                                        onChange={e => handleGuestChange(idx, 'profession', e.target.value)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Perusahaan (Company)</label>
                                                    <input type="text" className="form-control"
                                                        value={roomData.guest.company || ''}
                                                        onChange={e => handleGuestChange(idx, 'company', e.target.value)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Kebangsaan (Nationality)</label>
                                                    <input type="text" className="form-control"
                                                        value={roomData.guest.nationality || ''}
                                                        onChange={e => handleGuestChange(idx, 'nationality', e.target.value)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Tanggal Lahir (Birth Date)</label>
                                                    <DatePicker className="form-control"
                                                        value={roomData.guest.date_of_birth || ''}
                                                        onChange={e => handleGuestChange(idx, 'date_of_birth', e.target.value)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">No. Member (Member Card No.)</label>
                                                    <input type="text" className="form-control"
                                                        value={roomData.guest.member_card_no || ''}
                                                        onChange={e => handleGuestChange(idx, 'member_card_no', e.target.value)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Telephone / Handphone</label>
                                                    <input type="text" className="form-control"
                                                        value={roomData.guest.phone || ''}
                                                        onChange={e => handleGuestChange(idx, 'phone', e.target.value)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Email</label>
                                                    <input type="email" className="form-control"
                                                        value={roomData.guest.email || ''}
                                                        onChange={e => handleGuestChange(idx, 'email', e.target.value)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Alamat (Address)</label>
                                                    <input type="text" className="form-control"
                                                        value={roomData.guest.address || ''}
                                                        onChange={e => handleGuestChange(idx, 'address', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Tombol Submit Summary */}
                            <div className="card shadow-sm border-0 bg-primary bg-opacity-10 mt-4 mb-4">
                                <div className="card-body text-end p-4">
                                    <button type="button" className="btn btn-primary btn-lg fw-bold px-5" onClick={() => setIsSummaryGenerated(true)}>
                                        <i className="bi bi-calculator me-2"></i> Tampilkan Ringkasan Pembayaran
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Kanan: Ringkasan & Pembayaran */}
                        <div className="col-lg-4">
                            <div className="card sticky-top shadow-sm border-0" style={{ top: '2rem' }}>
                                <div className="card-header bg-dark text-white">
                                    <h5 className="card-title mb-0 text-white">Ringkasan & Pembayaran</h5>
                                </div>
                                <div className="card-body">
                                    {!isSummaryGenerated ? (
                                        <div className="text-center py-5 text-muted">
                                            <i className="bi bi-file-earmark-text display-4 mb-3 d-block opacity-50"></i>
                                            <p>Silakan lengkapi Data Tamu dan Tanggal Menginap di sebelah kiri, lalu klik tombol <strong>Tampilkan Ringkasan Pembayaran</strong>.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="d-flex justify-content-between mb-2 mt-2">
                                                <span className="text-muted">Check-In</span>
                                                <span className="fw-medium">{data.check_in} {data.arrival_time && `(${data.arrival_time})`}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="text-muted">Check-Out</span>
                                                <span className="fw-medium">{data.check_out} ({nights} malam)</span>
                                            </div>
                                            <hr className="my-2 border-secondary opacity-25" />
                                            <div className="text-dark mb-3" style={{ fontSize: '0.85em' }}>
                                                <div className="text-muted"><strong>Tamu:</strong> {data.rooms[0]?.guest.full_name || '-'} {data.rooms[0]?.guest.company ? `(${data.rooms[0].guest.company})` : ''}</div>
                                                <div className="text-muted"><strong>Kontak:</strong> {data.rooms[0]?.guest.phone || data.rooms[0]?.guest.email || '-'}</div>
                                            </div>
                                            <hr/>
                                    {roomBreakdowns.map((b, i) => {
                                        const conf = data.rooms.find(r => r.room_id === b.room.id);
                                        return (
                                            <div key={i} className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="fw-bold">Kamar {b.room.room_number} <small className="text-muted">({b.room.room_type.name})</small></span>
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.85em' }}>
                                                    <div className="d-flex justify-content-between">
                                                        <span>Tarif Kamar Dasar ({nights} mlm)</span>
                                                        <span>Rp {b.baseRoomPrice.toLocaleString('id-ID')}</span>
                                                    </div>
                                                    {b.extrabedTotal > 0 && (
                                                        <div className="d-flex justify-content-between">
                                                            <span>Extrabed ({nights} mlm)</span>
                                                            <span>Rp {b.extrabedTotal.toLocaleString('id-ID')}</span>
                                                        </div>
                                                    )}
                                                    {b.breakfastTotal > 0 && (
                                                        <div className="d-flex justify-content-between">
                                                            <span>Sarapan Tambahan ({nights} mlm)</span>
                                                            <span>Rp {b.breakfastTotal.toLocaleString('id-ID')}</span>
                                                        </div>
                                                    )}
                                                    <div className="d-flex justify-content-between text-secondary mt-1">
                                                        <span>Service Charge (10%)</span>
                                                        <span>Rp {b.serviceCharge.toLocaleString('id-ID')}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between text-secondary">
                                                        <span>Pajak / PB1 (11%)</span>
                                                        <span>Rp {b.tax.toLocaleString('id-ID')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <hr/>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="fw-bold fs-5">Grand Total</span>
                                        <span className="fw-bold fs-4 text-success">Rp {grandTotal.toLocaleString('id-ID')}</span>
                                    </div>

                                    <h6 className="fw-bold mb-3">Pilih Metode Pembayaran</h6>
                                    
                                    <div className="mb-4">
                                        {['Cash', 'Bank Transfer', 'Credit Card', 'E-Wallet'].map(method => (
                                            <div key={method} className="form-check mb-1" style={{ cursor: 'pointer' }} onClick={() => setData('payment_method', method)}>
                                                <input className="form-check-input" type="radio" checked={data.payment_method === method} readOnly />
                                                <label className="form-check-label fw-medium ms-2">{method}</label>
                                            </div>
                                        ))}
                                    </div>

                                    {data.payment_method === 'Cash' && (
                                        <div className="alert alert-info">Silakan siapkan uang tunai sebesar <strong>Rp {grandTotal.toLocaleString('id-ID')}</strong>.</div>
                                    )}
                                    {data.payment_method === 'Bank Transfer' && (
                                        <div className="alert alert-warning">
                                            <strong>Bank Mandiri</strong><br/>No. Rek: 123-456-789-0<br/>A/N: PPKD Hotel
                                        </div>
                                    )}
                                    {data.payment_method === 'Credit Card' && (
                                        <div className="alert alert-secondary text-center">
                                            <i className="bi bi-credit-card fs-1"></i><br/>Tap/gesek kartu pada mesin EDC.
                                        </div>
                                    )}
                                    {data.payment_method === 'E-Wallet' && (
                                        <div className="alert alert-success text-center">
                                            <i className="bi bi-qr-code-scan fs-1"></i><br/>Tampilkan QRIS ke tamu.
                                        </div>
                                    )}

                                            <div className="d-grid mt-4">
                                                <button type="submit" className="btn btn-success btn-lg fw-bold" disabled={processing || !data.payment_method}>
                                                    <i className="bi bi-check-circle me-2"></i> Proses Check-In & Bayar
                                                </button>
                                                <Link href={route('availability.index')} className="btn btn-outline-secondary mt-2">Kembali</Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
