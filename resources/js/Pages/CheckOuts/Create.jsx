import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Swal from 'sweetalert2';

function hitungMalam(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const ci = String(checkIn).substring(0, 10);
    const co = String(checkOut).substring(0, 10);
    const [y1, m1, d1] = ci.split('-').map(Number);
    const [y2, m2, d2] = co.split('-').map(Number);
    if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
    return Math.max(0, Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000));
}

function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const s = String(dateStr).substring(0, 10);
    const [y, m, d] = s.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

const formatRp = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function Create({ checkin, folio }) {
    const tasks = checkin.room?.housekeepingTasks || checkin.room?.housekeeping_tasks || [];
    const hasInspectionTask = tasks.some(t => {
        if (t.task_type !== 'inspection') return false;
        return new Date(t.created_at) >= new Date(checkin.created_at);
    });
    
    const [isHkRequested, setIsHkRequested] = useState(hasInspectionTask);
    const [isPrinted, setIsPrinted] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        check_in_id: checkin.id,
        payment_amount: '',
        payment_method: 'Cash',
        feedback_rating: '',
        feedback_notes: '',
        notes: '',
    });

    const nights = hitungMalam(
        checkin.reservation?.check_in_date,
        checkin.reservation?.check_out_date
    );

    function submit(e) {
        e.preventDefault();

        // 1. Validasi HK
        if (!isHkRequested) {
            Swal.fire({
                title: 'Inspeksi HK Diperlukan',
                text: 'Harap minta Inspeksi HK terlebih dahulu dengan menekan tombol Minta Inspeksi.',
                icon: 'warning',
                confirmButtonText: 'Mengerti'
            });
            return;
        }

        const remaining = Number(folio?.balance) - Number(data.payment_amount || 0);

        // 2. Validasi Folio (Tagihan belum lunas)
        if (remaining > 0) {
            Swal.fire({
                title: 'Tagihan Belum Lunas',
                text: 'Ditemukan sisa tagihan. Silakan Buka Detail Folio atau lunasi pada form pelunasan di halaman ini.',
                icon: 'warning',
                confirmButtonText: 'Buka Folio',
                showCancelButton: true,
                cancelButtonText: 'Tutup'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = route('folios.show', folio.id);
                }
            });
            return;
        }

        // 3. Validasi Cetak
        if (!isPrinted) {
            Swal.fire({
                title: 'Cetak Folio',
                text: 'Pembayaran sudah settle. Silakan tekan tombol "Cetak Folio Lunas" untuk memberikan bukti kepada tamu.',
                icon: 'info',
                confirmButtonText: 'Mengerti'
            });
            return;
        }

        // Semua terpenuhi
        Swal.fire({
            title: 'Konfirmasi Check-Out',
            text: `Apakah Anda yakin tamu ${checkin.reservation?.guest?.full_name} siap check-out?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Check-Out',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('checkouts.store'), {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', `Tamu ${checkin.reservation?.guest?.full_name} berhasil check-out.`, 'success');
                    }
                });
            }
        });
    }

    const reservation = checkin.reservation || {};
    const guest = reservation.guest || {};
    const charges = folio?.charges || [];
    
    // Aggregate dates and nights
    const arrivalDate = reservation.check_in_date ? new Date(reservation.check_in_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : '';
    const departureDate = reservation.check_out_date ? new Date(reservation.check_out_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : '';
    const totalNight = reservation.check_out_date ? Math.round((new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) / (1000 * 60 * 60 * 24)) : 0;
    
    const roomTypes = reservation.room_type?.name || checkin.room?.room_number || '';
    const totalGuest = reservation.adults || 0;
    
    // Calculate Payment Breakdown
    let roomCharge = 0;
    let extraBedCharge = 0;
    let fnbCharge = 0;
    let tax = 0;
    let serviceCharge = 0;
    
    charges.forEach(c => {
        if (c.charge_type === 'room') roomCharge += Number(c.amount);
        else if (c.charge_type === 'extra_bed') extraBedCharge += Number(c.amount);
        else if (c.charge_type === 'fnb') fnbCharge += Number(c.amount);
        else if (c.charge_type === 'other' && String(c.description).includes('Tax')) tax += Number(c.amount);
        else if (c.charge_type === 'other' && String(c.description).includes('Service')) serviceCharge += Number(c.amount);
        else roomCharge += Number(c.amount);
    });

    const additionalCharge = extraBedCharge + fnbCharge;
    const grandTotal = Number(folio?.total_charges || 0);
    
    const lastPayment = folio?.payments && folio.payments.length > 0 ? folio.payments[folio.payments.length - 1] : null;
    let paymentMethodDisplay = 'Cash';
    if (lastPayment && lastPayment.payment_method) {
        const ml = { cash: 'Tunai', debit_card: 'Debit', credit_card: 'Kredit', transfer: 'Transfer', city_ledger: 'City Ledger' };
        paymentMethodDisplay = ml[lastPayment.payment_method] || lastPayment.payment_method;
    }
    const remainingAfterForm = Number(folio?.balance) - Number(data.payment_amount || 0);
    const paymentStatusDisplay = folio?.status === 'settled' || remainingAfterForm <= 0 ? 'PAID' : 'UNPAID';

    return (
        <AppLayout title="Proses Check-Out" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Reservasi', href: route('reservations.index') },
            { label: checkin.reservation?.reservation_code },
            { label: 'Check-Out' },
        ]}>
            <div className="row d-print-none">
                {/* Check-In Summary */}
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header pb-2 border-bottom">
                            <h4 className="card-title fs-5 mb-0">Informasi Tamu & Kamar</h4>
                        </div>
                        <div className="card-body mt-3">
                            <div className="d-flex flex-column gap-3">
                                <div>
                                    <small className="text-muted d-block">Tamu</small>
                                    <span className="fw-bold fs-6">{checkin.reservation?.guest?.full_name}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <small className="text-muted d-block">No. Reservasi</small>
                                        <span className="fw-semibold">{checkin.reservation?.reservation_code}</span>
                                    </div>
                                    <div className="text-end">
                                        <small className="text-muted d-block">Kamar</small>
                                        <span className="badge bg-light-primary text-primary fs-6">{checkin.room?.room_number}</span>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <small className="text-muted d-block">Check-In</small>
                                        <span className="fw-semibold">{formatTanggal(checkin.reservation?.check_in_date)}</span>
                                    </div>
                                    <div className="text-end">
                                        <small className="text-muted d-block">Check-Out</small>
                                        <span className="fw-semibold">{formatTanggal(checkin.reservation?.check_out_date)}</span>
                                    </div>
                                </div>
                                <div className="alert alert-light-info py-2 px-3 mb-0 d-flex justify-content-between align-items-center">
                                    <span className="text-info fw-semibold"><i className="bi bi-moon-stars me-2"></i>Durasi</span>
                                    <span className="text-info fw-bold">{nights} Malam</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Folio Summary */}
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100 shadow-sm border-0" style={{ background: 'var(--bs-card-bg)' }}>
                        <div className="card-header pb-2 border-bottom">
                            <h4 className="card-title fs-5 mb-0">Ringkasan Pembayaran</h4>
                        </div>
                        <div className="card-body mt-3 d-flex flex-column">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Total Tagihan</span>
                                <span className="fw-semibold">{formatRp(folio?.total_charges ?? 0)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Total Dibayar</span>
                                <span className="text-success fw-semibold">- {formatRp(folio?.total_payments ?? 0)}</span>
                            </div>
                            
                            <hr className="my-2" />
                            
                            <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
                                <span className="fw-bold fs-6">Sisa Tagihan</span>
                                <span className={`fw-bold fs-4 ${Number(folio?.balance) > 0 ? 'text-danger' : 'text-success'}`}>
                                    {formatRp(folio?.balance ?? 0)}
                                </span>
                            </div>

                            <div className="mt-auto">
                                <div className="alert alert-light-secondary d-flex align-items-start mb-0 py-2 px-3">
                                    <i className="bi bi-info-circle me-2 mt-1 text-primary"></i>
                                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        Pastikan sisa tagihan adalah Rp 0 sebelum memproses Check-Out. Sisa tagihan positif berarti tamu harus membayar kekurangan.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Check-Out Form */}
                <div className="col-lg-4 col-md-12 mb-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header pb-2 border-bottom">
                            <h4 className="card-title fs-5 mb-0">Form Check-Out</h4>
                        </div>
                        <div className="card-body mt-3">
                            <form onSubmit={submit} className="d-flex flex-column h-100">
                                {Number(folio?.balance) > 0 && (
                                    <>
                                        <h6 className="mb-2 fs-6 text-primary">Pelunasan Tagihan</h6>
                                        <div className="row mb-4">
                                            <div className="col-7">
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text">Rp</span>
                                                    <input type="number"
                                                        className={`form-control ${errors.payment_amount ? 'is-invalid' : ''}`}
                                                        value={data.payment_amount} onChange={e => setData('payment_amount', e.target.value)}
                                                        min="0" step="1" placeholder={folio?.balance} />
                                                </div>
                                                {errors.payment_amount && <div className="text-danger small mt-1">{errors.payment_amount}</div>}
                                            </div>
                                            <div className="col-5">
                                                <select className={`form-select form-select-sm ${errors.payment_method ? 'is-invalid' : ''}`}
                                                    value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}>
                                                    <option value="Cash">Cash / Tunai</option>
                                                    <option value="Bank Transfer">Bank Transfer</option>
                                                    <option value="Credit Card">Credit Card</option>
                                                    <option value="E-Wallet">E-Wallet</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <h6 className="mb-2 fs-6">Umpan Balik (Opsional)</h6>
                                <div className="mb-3">
                                    <div className="d-flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button key={star} type="button"
                                                className={`btn btn-sm ${star <= Number(data.feedback_rating) ? 'btn-warning text-white' : 'btn-outline-warning'}`}
                                                onClick={() => setData('feedback_rating', star)}
                                                style={{ padding: '0.2rem 0.5rem' }}>
                                                <i className={`bi ${star <= Number(data.feedback_rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                        <textarea className={`form-control form-control-sm ${errors.feedback_notes ? 'is-invalid' : ''}`}
                                            rows="2" value={data.feedback_notes} onChange={e => setData('feedback_notes', e.target.value)}
                                            placeholder="Tuliskan pengalaman tamu, saran perbaikan, dll." />
                                    </div>

                                    <div className="mt-auto d-grid gap-2">
                                        <button type="button" className="btn btn-info" onClick={() => {
                                            router.post(route('checkouts.request-inspection', checkin.id), {}, {
                                                preserveScroll: true,
                                                preserveState: true,
                                                onSuccess: () => {
                                                    setIsHkRequested(true);
                                                    Swal.fire('Berhasil', 'Permintaan inspeksi HK telah dikirim.', 'success');
                                                }
                                            })
                                        }}>
                                            <i className="bi bi-search me-2"></i>Minta Inspeksi HK (Minibar/Kerusakan)
                                        </button>
                                        
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                            setIsPrinted(true);
                                            window.print();
                                        }}>
                                            <i className="bi bi-printer me-2"></i>Cetak Folio Lunas
                                        </button>

                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing
                                            ? <><span className="spinner-border spinner-border-sm me-2" />Memproses...</>
                                            : <><i className="bi bi-check2-circle me-2" />Konfirmasi Check-Out</>}
                                        </button>

                                        {folio && (
                                            <a href={route('folios.show', folio.id)} className="btn btn-outline-secondary mt-2">
                                                <i className="bi bi-receipt me-2"></i>Buka Detail Folio
                                            </a>
                                        )}
                                    </div>
                                </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Only Layout */}
            <div className="d-none d-print-block print-container bg-white text-dark" style={{ maxWidth: '850px' }}>
                <div className="print-document">
                    
                    {/* 1. Header */}
                    <div className="d-flex justify-content-between align-items-center print-mb-3 pb-3 border-bottom print-header">
                        <div className="d-flex align-items-center gap-3">
                            <img src="/mazer/images/logo/logo-ppkd-hotel.png" alt="PPKD Hotel Logo" className="print-logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
                            <div>
                                <h3 className="fw-bold mb-0 text-dark print-title">PPKD HOTEL</h3>
                                <small className="text-muted d-block">Hospitality Excellence</small>
                            </div>
                        </div>
                        <div className="text-end">
                            <h6 className="fw-bold text-uppercase mb-1 print-subtitle" style={{ letterSpacing: '1px' }}>Guest Folio / Invoice</h6>
                            <div className="text-muted mb-1 print-text-sm">Folio No: <strong>{folio?.folio_number}</strong></div>
                            <div className="text-muted mb-1 print-text-sm">Date: {new Date().toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                            <span className={`badge mt-1 px-3 py-1 print-badge ${paymentStatusDisplay === 'PAID' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                {paymentStatusDisplay}
                            </span>
                        </div>
                    </div>

                    {/* 2 & 3. Guest and Stay Information */}
                    <div className="print-mb-3 border rounded p-3">
                        {/* Baris 1: Guest */}
                        <div className="row g-3 align-items-center mb-2 print-text-sm">
                            <div className="col-auto">
                                <span className="me-1">Name:</span>
                                <strong className="fw-bold">{guest.full_name || '-'}</strong>
                            </div>
                            <div className="col-auto border-start border-dark">
                                <span className="me-1">Company:</span>
                                <strong className="fw-bold">{guest.company || '-'}</strong>
                            </div>
                            <div className="col-auto border-start border-dark">
                                <span className="me-1">Email:</span>
                                <strong className="fw-bold">{guest.email || '-'}</strong>
                            </div>
                            <div className="col-auto border-start border-dark">
                                <span className="me-1">Phone:</span>
                                <strong className="fw-bold">{guest.phone || '-'}</strong>
                            </div>
                        </div>
                        
                        <hr className="my-2 border-dark opacity-50" />
                        
                        {/* Baris 2: Stay */}
                        <div className="row g-3 align-items-center mt-0 print-text-sm">
                            <div className="col-auto">
                                <span className="me-1">Check In:</span>
                                <strong className="fw-bold">{arrivalDate}</strong>
                            </div>
                            <div className="col-auto border-start border-dark">
                                <span className="me-1">Check Out:</span>
                                <strong className="fw-bold">{departureDate}</strong>
                            </div>
                            <div className="col-auto border-start border-dark">
                                <span className="me-1">Duration:</span>
                                <strong className="fw-bold">{totalNight} Night(s)</strong>
                            </div>
                            <div className="col-auto border-start border-dark">
                                <span className="me-1">Guest:</span>
                                <strong className="fw-bold">{totalGuest} Pax</strong>
                            </div>
                            <div className="col-auto border-start border-dark">
                                <span className="me-1">Room:</span>
                                <strong className="fw-bold">{roomTypes}</strong>
                            </div>
                        </div>
                    </div>

                    {/* 4. Payment Summary */}
                    <div className="print-mb-3">
                        <h6 className="fw-bold text-uppercase text-secondary mb-2 pb-1 border-bottom print-section-title border-dark">Payment Summary</h6>
                        <div className="table-responsive">
                            <table className="table table-bordered border-dark table-sm mb-0 summary-table">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-dark">Description</th>
                                        <th className="text-end border-dark" style={{ width: '250px' }}>Amount (IDR)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {charges.length > 0 ? (
                                        <>
                                            <tr>
                                                <td className="py-1 border-dark">Room Charge</td>
                                                <td className="text-end py-1 border-dark">{roomCharge.toLocaleString('id-ID')}</td>
                                            </tr>
                                            {additionalCharge > 0 && (
                                                <tr>
                                                    <td className="py-1 border-dark">Additional Charge (Extra Bed, F&B, dll)</td>
                                                    <td className="text-end py-1 border-dark">{additionalCharge.toLocaleString('id-ID')}</td>
                                                </tr>
                                            )}
                                            <tr>
                                                <td className="py-1 border-dark">Service Charge (10%)</td>
                                                <td className="text-end py-1 border-dark">{serviceCharge.toLocaleString('id-ID')}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 border-dark">Tax (11%)</td>
                                                <td className="text-end py-1 border-dark">{tax.toLocaleString('id-ID')}</td>
                                            </tr>
                                        </>
                                    ) : (
                                        <tr>
                                            <td className="py-1 border-dark">Total Booking Charge</td>
                                            <td className="text-end py-1 border-dark">{grandTotal.toLocaleString('id-ID')}</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-light">
                                        <th className="text-end py-2 border-dark">GRAND TOTAL</th>
                                        <th className="text-end py-2 fw-bold fs-6 print-grand-total border-dark">Rp {grandTotal.toLocaleString('id-ID')}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="row g-4 print-mb-3">
                        {/* 5. Payment Method */}
                        <div className="col-sm-6">
                            <h6 className="fw-bold text-uppercase text-secondary mb-2 pb-1 border-bottom print-section-title border-dark">Payment Method</h6>
                            <div className="p-3 border border-dark rounded payment-box">
                                <div className="fw-bold mb-1 text-uppercase text-dark print-text-sm">
                                    <i className="bi bi-credit-card me-2"></i>
                                    {paymentMethodDisplay}
                                </div>
                                <div className="fw-medium mb-1 print-text-sm" style={{ color: paymentStatusDisplay === 'PAID' ? 'green' : 'red' }}>
                                    <i className="bi bi-check-circle-fill me-2"></i>Payment Status: {paymentStatusDisplay}
                                </div>
                                {String(paymentMethodDisplay).toLowerCase() === 'transfer' && (
                                    <div className="small text-muted mt-2 print-text-sm" style={{ lineHeight: '1.3' }}>
                                        <div>Settled via Transfer to:</div>
                                        <strong>Bank Mandiri</strong><br/>
                                        A/N: PPKD Hotel Jakarta<br/>
                                        Rek: 123-456-789-000
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 7. Hotel Information */}
                        <div className="col-sm-6">
                            <h6 className="fw-bold text-uppercase text-secondary mb-2 pb-1 border-bottom print-section-title border-dark">Hotel Information</h6>
                            <div className="p-2 print-text-sm" style={{ lineHeight: '1.4' }}>
                                <div className="mb-1"><i className="bi bi-geo-alt text-muted me-2"></i> Jl. Raya Condet No. 1, Jakarta Timur</div>
                                <div className="mb-1"><i className="bi bi-telephone text-muted me-2"></i> +62 21 1234 5678</div>
                                <div className="mb-1"><i className="bi bi-envelope text-muted me-2"></i> reservation@ppkdhotel.com</div>
                                <div><i className="bi bi-globe text-muted me-2"></i> www.ppkdhotel.com</div>
                            </div>
                        </div>
                    </div>

                    {/* 8. Important Information */}
                    <div className="mt-auto pt-3 border-top border-dark print-footer">
                        <h6 className="fw-bold text-uppercase text-secondary mb-2 print-section-title">Important Information</h6>
                        <ul className="text-muted small ps-3 mb-0 print-text-xs" style={{ lineHeight: '1.4' }}>
                            <li>Check-in time is from <strong>14:00</strong> and Check-out time is until <strong>12:00</strong>.</li>
                            <li>Tamu diwajibkan mengembalikan seluruh kunci kamar.</li>
                            <li>Terima kasih telah menginap di PPKD Hotel.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    body { background-color: white !important; }
                    .d-print-none { display: none !important; }
                    #sidebar, .sidebar-wrapper, header { display: none !important; }
                    #main { margin-left: 0 !important; padding: 0 !important; }
                    
                    .print-container { display: block !important; max-width: 100% !important; width: 100% !important; padding: 0 !important; }
                    .print-mb-3 { margin-bottom: 1.5rem !important; }
                    
                    body, .print-document { 
                        font-family: 'Inter', 'Roboto', sans-serif !important; 
                        color: #000 !important;
                        font-size: 10pt !important;
                    }
                    .text-muted, .text-secondary { color: #444 !important; }
                    .text-dark { color: #000 !important; }
                    .bg-light { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    
                    .print-logo { height: 45px !important; }
                    .print-title { font-size: 16pt !important; }
                    .print-subtitle { font-size: 14pt !important; }
                    .print-section-title { font-size: 11pt !important; }
                    .print-text-sm { font-size: 9pt !important; }
                    .print-text-xs { font-size: 8.5pt !important; }
                    .print-grand-total { font-size: 12pt !important; }
                    .print-badge { padding: 2px 8px !important; font-size: 8pt !important; border-radius: 4px; border: 1px solid #000; }
                    
                    .table { margin-bottom: 0 !important; }
                    .table-sm th, .table-sm td { padding: 0.2rem 0.2rem !important; }
                    .table-bordered th, .table-bordered td { border-color: #000 !important; }
                    
                    .payment-box { padding: 0.5rem !important; }
                }
            `}</style>
        </AppLayout>
    );
}
