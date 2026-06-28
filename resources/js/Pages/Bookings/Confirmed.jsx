import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Confirmed({ booking }) {
    const handlePrint = () => {
        window.print();
    };

    const firstRes = booking.reservations && booking.reservations.length > 0 ? booking.reservations[0] : null;
    const guest = firstRes?.guest || {};
    const checkInRecord = firstRes?.check_in || {};
    const folio = checkInRecord?.guest_folio || {};
    const charges = folio?.charges || [];
    
    // Aggregate dates and nights
    const arrivalDate = firstRes ? new Date(firstRes.check_in_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : '';
    const departureDate = firstRes ? new Date(firstRes.check_out_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : '';
    const totalNight = firstRes ? Math.round((new Date(firstRes.check_out_date) - new Date(firstRes.check_in_date)) / (1000 * 60 * 60 * 24)) : 0;
    
    // Combine room types & adults
    const roomTypesList = booking.reservations ? booking.reservations.map(r => r.room_type?.name) : [];
    const uniqueRoomTypes = [...new Set(roomTypesList)];
    const roomTypes = uniqueRoomTypes.length > 0 ? uniqueRoomTypes.join(', ') : '';
    const totalGuest = booking.reservations ? booking.reservations.reduce((sum, r) => sum + r.adults, 0) : 0;
    const roomRate = firstRes ? firstRes.room_type?.base_price : 0;

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
        else roomCharge += Number(c.amount); // Fallback to room charge for unknown types
    });

    const additionalCharge = extraBedCharge + fnbCharge;
    const grandTotal = Number(booking.total_amount);

    return (
        <div className="bg-light min-vh-100 py-5 print-bg-white">
            <Head title="Reservation Confirmation" />
            
            <div className="container print-container" style={{ maxWidth: '850px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
                    <Link href={route('availability.index')} className="btn btn-outline-secondary">
                        <i className="bi bi-arrow-left me-2"></i> Kembali ke Beranda
                    </Link>
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <i className="bi bi-printer me-2"></i> Cetak Reservasi
                    </button>
                </div>

                <div className="card shadow border-0" id="print-area">
                    <div className="card-body p-4 p-md-5 print-document">
                        
                        {/* 1. Header */}
                        <div className="d-flex justify-content-between align-items-center print-mb-3 mb-5 pb-3 border-bottom print-header">
                            <div className="d-flex align-items-center gap-3">
                                <img src="/mazer/images/logo/logo-ppkd-hotel.png" alt="PPKD Hotel Logo" className="print-logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
                                <div>
                                    <h3 className="fw-bold mb-0 text-primary print-title">PPKD HOTEL</h3>
                                    <small className="text-muted d-block">Hospitality Excellence</small>
                                </div>
                            </div>
                            <div className="text-end">
                                <h6 className="fw-bold text-uppercase mb-1 print-subtitle" style={{ letterSpacing: '1px' }}>Reservation Confirmation</h6>
                                <div className="text-muted mb-1 print-text-sm">Booking No: <strong>{booking.booking_code}</strong></div>
                                <div className="text-muted mb-1 print-text-sm">Date: {new Date(booking.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                                <span className="badge bg-success mt-1 px-3 py-1 print-badge">CONFIRMED</span>
                            </div>
                        </div>

                        {/* 2 & 3. Guest and Stay Information (Compact 2 Rows) */}
                        <div className="print-mb-3 mb-5 border rounded p-3 ">
                            {/* Baris 1: Guest */}
                            <div className="row g-3 align-items-center mb-2 print-text-sm">
                                <div className="col-auto">
                                    <span className="me-1">Name:</span>
                                    <strong className="fw-bold">{guest.full_name || '-'}</strong>
                                </div>
                                <div className="col-auto border-start">
                                    <span className="me-1">Company:</span>
                                    <strong className="fw-bold">{guest.company || '-'}</strong>
                                </div>
                                <div className="col-auto border-start">
                                    <span className="me-1">Email:</span>
                                    <strong className="fw-bold">{guest.email || '-'}</strong>
                                </div>
                                <div className="col-auto border-start">
                                    <span className="me-1">Phone:</span>
                                    <strong className="fw-bold">{guest.phone || '-'}</strong>
                                </div>
                            </div>
                            
                            <hr className="my-2 border-secondary opacity-25" />
                            
                            {/* Baris 2: Stay */}
                            <div className="row g-3 align-items-center mt-0 print-text-sm">
                                <div className="col-auto">
                                    <span className="me-1">Check In:</span>
                                    <strong className="fw-bold">{arrivalDate}</strong>
                                </div>
                                <div className="col-auto border-start">
                                    <span className="me-1">Check Out:</span>
                                    <strong className="fw-bold">{departureDate}</strong>
                                </div>
                                <div className="col-auto border-start">
                                    <span className="me-1">Duration:</span>
                                    <strong className="fw-bold">{totalNight} Night(s)</strong>
                                </div>
                                <div className="col-auto border-start">
                                    <span className="me-1">Guest:</span>
                                    <strong className="fw-bold">{totalGuest} Pax</strong>
                                </div>
                                <div className="col-auto border-start">
                                    <span className="me-1">Room:</span>
                                    <strong className="fw-bold">{roomTypes}</strong>
                                </div>
                            </div>
                        </div>

                        {/* 4. Payment Summary */}
                        <div className="print-mb-3 mb-5">
                            <h6 className="fw-bold text-uppercase text-secondary mb-2 pb-1 border-bottom print-section-title">Payment Summary</h6>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm mb-0 summary-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Description</th>
                                            <th className="text-end" style={{ width: '250px' }}>Amount (IDR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {charges.length > 0 ? (
                                            <>
                                                <tr>
                                                    <td className="py-1">Room Charge</td>
                                                    <td className="text-end py-1">{roomCharge.toLocaleString('id-ID')}</td>
                                                </tr>
                                                {additionalCharge > 0 && (
                                                    <tr>
                                                        <td className="py-1">Additional Charge (Extra Bed, F&B, dll)</td>
                                                        <td className="text-end py-1">{additionalCharge.toLocaleString('id-ID')}</td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td className="py-1">Service Charge (10%)</td>
                                                    <td className="text-end py-1">{serviceCharge.toLocaleString('id-ID')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">Tax (11%)</td>
                                                    <td className="text-end py-1">{tax.toLocaleString('id-ID')}</td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td className="py-1">Total Booking Charge</td>
                                                <td className="text-end py-1">{grandTotal.toLocaleString('id-ID')}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="table-primary">
                                            <th className="text-end py-2">GRAND TOTAL</th>
                                            <th className="text-end py-2 fw-bold fs-6 print-grand-total">Rp {grandTotal.toLocaleString('id-ID')}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="row g-4 print-mb-3 mb-5">
                            {/* 5. Payment Method */}
                            <div className="col-sm-6">
                                <h6 className="fw-bold text-uppercase text-secondary mb-2 pb-1 border-bottom print-section-title">Payment Method</h6>
                                <div className="p-4 border border-success rounded payment-box">
                                    <div className="fw-bold mb-1 text-uppercase text-primary print-text-sm">
                                        <i className="bi bi-credit-card me-2"></i>
                                        {booking.payment_method || 'Cash'}
                                    </div>
                                    <div className="text-success fw-medium mb-1 print-text-sm">
                                        <i className="bi bi-check-circle-fill me-2"></i>Payment Status: PAID
                                    </div>
                                    {String(booking.payment_method).toLowerCase() === 'bank transfer' && (
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
                                <h6 className="fw-bold text-uppercase text-secondary mb-2 pb-1 border-bottom print-section-title">Hotel Information</h6>
                                <div className="p-2 print-text-sm" style={{ lineHeight: '1.4' }}>
                                    <div className="mb-1"><i className="bi bi-geo-alt text-muted me-2"></i> Jl. Raya Condet No. 1, Jakarta Timur</div>
                                    <div className="mb-1"><i className="bi bi-telephone text-muted me-2"></i> +62 21 1234 5678</div>
                                    <div className="mb-1"><i className="bi bi-envelope text-muted me-2"></i> reservation@ppkdhotel.com</div>
                                    <div><i className="bi bi-globe text-muted me-2"></i> www.ppkdhotel.com</div>
                                </div>
                            </div>
                        </div>

                        {/* 8. Important Information */}
                        <div className="mt-auto pt-3 border-top print-footer">
                            <h6 className="fw-bold text-uppercase text-secondary mb-2 print-section-title">Important Information</h6>
                            <ul className="text-muted small ps-3 mb-0 print-text-xs" style={{ lineHeight: '1.4' }}>
                                <li>Check-in time is from <strong>14:00</strong> and Check-out time is until <strong>12:00</strong>.</li>
                                <li>Reservasi tanpa jaminan (non-guaranteed) akan otomatis dibatalkan pada pukul 18:00 pada hari kedatangan.</li>
                                <li>Pembatalan reservasi yang dilakukan H-1 (kurang dari 24 jam) akan dikenakan biaya pembatalan sebesar 1 malam.</li>
                                <li>Tamu diwajibkan untuk menunjukkan kartu identitas (KTP/Paspor) yang masih berlaku pada saat check-in.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .info-table th { font-weight: normal; padding-left: 0; }
                .info-table td { padding-right: 0; }
                .summary-table th { background-color: #f8f9fa !important; }
                
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    body { background-color: white !important; }
                    .print-bg-white { background-color: white !important; padding: 0 !important; }
                    .print-container { max-width: 100% !important; width: 100% !important; padding: 0 !important; }
                    .d-print-none { display: none !important; }
                    #sidebar, .sidebar-wrapper, header { display: none !important; }
                    #main { margin-left: 0 !important; padding: 0 !important; }
                    
                    /* Reset spacing */
                    .card { box-shadow: none !important; border: none !important; margin: 0 !important; }
                    .card-body { padding: 0 !important; }
                    .print-mb-3 { margin-bottom: 1.5rem !important; }
                    .mb-5 { margin-bottom: 1.5rem !important; }
                    .mt-auto { margin-top: 1.5rem !important; }
                    
                    /* Typography & Colors */
                    body, .print-document { 
                        font-family: 'Inter', 'Roboto', sans-serif !important; 
                        color: #000 !important;
                        font-size: 10pt !important;
                    }
                    .text-muted, .text-secondary { color: #444 !important; }
                    .text-primary { color: #000 !important; }
                    
                    /* Sizes */
                    .print-logo { height: 45px !important; }
                    .print-title { font-size: 16pt !important; }
                    .print-subtitle { font-size: 14pt !important; }
                    .print-section-title { font-size: 11pt !important; }
                    .print-text-sm { font-size: 9pt !important; }
                    .print-text-xs { font-size: 8.5pt !important; }
                    .print-grand-total { font-size: 12pt !important; }
                    .print-badge { padding: 2px 8px !important; font-size: 8pt !important; border-radius: 4px; }
                    
                    /* Tables */
                    .table { margin-bottom: 0 !important; }
                    .table-sm th, .table-sm td { padding: 0.2rem 0.2rem !important; }
                    .table-bordered th, .table-bordered td { border-color: #ddd !important; }
                    .table-light th { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .table-primary th { background-color: #e6f2ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; border-top: 2px solid #000 !important; }
                    
                    /* Boxes */
                    .payment-box { border: 1px solid #ddd !important; background-color: transparent !important; padding: 0.5rem !important; }
                    .badge { border: 1px solid #000; color: #000 !important; background-color: transparent !important; }
                }
            `}</style>
        </div>
    );
}
