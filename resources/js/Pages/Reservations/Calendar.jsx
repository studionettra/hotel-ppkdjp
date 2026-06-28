import { useState } from 'react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import DatePicker from '@/Components/DatePicker';

export default function Calendar({ roomTypes }) {
    const [checkIn, setCheckIn]   = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [results, setResults]   = useState([]);
    const [loading, setLoading]   = useState(false);
    const [searched, setSearched] = useState(false);

    async function search(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.get(route('availability.search'), { params: { check_in: checkIn, check_out: checkOut } });
            setResults(res.data);
            setSearched(true);
        } finally {
            setLoading(false);
        }
    }

    const nights = checkIn && checkOut
        ? Math.max(0, (new Date(checkOut) - new Date(checkIn)) / 86400000)
        : 0;

    return (
        <AppLayout title="Cek Ketersediaan" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Reservasi', href: route('reservations.index') },
            { label: 'Ketersediaan' },
        ]}>
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card">
                        <div className="card-header"><h4 className="card-title">Cek Ketersediaan Kamar</h4></div>
                        <div className="card-body">
                            <form onSubmit={search} className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label">Check In</label>
                                    <DatePicker className="form-control" value={checkIn}
                                        onChange={e => setCheckIn(e.target.value)} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Check Out</label>
                                    <DatePicker className="form-control" value={checkOut}
                                        onChange={e => setCheckOut(e.target.value)} required />
                                </div>
                                <div className="col-md-4">
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? 'Mencari...' : 'Cek Ketersediaan'}
                                    </button>
                                </div>
                            </form>

                            {nights > 0 && (
                                <p className="mt-2 text-muted small">{nights} malam</p>
                            )}

                            {searched && (
                                <div className="mt-4">
                                    <h5>Hasil Ketersediaan</h5>
                                    <div className="row g-3">
                                        {results.map(rt => (
                                            <div className="col-md-4" key={rt.id}>
                                                <div className={`card border-${rt.available > 0 ? 'success' : 'danger'}`}>
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title">{rt.name}</h5>
                                                        <span className="badge bg-primary mb-2">{rt.code}</span>
                                                        <div className="d-flex justify-content-around mt-2">
                                                            <div>
                                                                <div className="fs-4 fw-bold text-success">{rt.available}</div>
                                                                <small className="text-muted">Tersedia</small>
                                                            </div>
                                                            <div>
                                                                <div className="fs-4 fw-bold text-danger">{rt.occupied}</div>
                                                                <small className="text-muted">Terisi</small>
                                                            </div>
                                                            <div>
                                                                <div className="fs-4 fw-bold">{rt.total}</div>
                                                                <small className="text-muted">Total</small>
                                                            </div>
                                                        </div>
                                                        {rt.available > 0 && (
                                                            <a href={route('availability.index')} className="btn btn-sm btn-success mt-3 w-100">
                                                                Buat Reservasi
                                                            </a>
                                                        )}
                                                        {rt.available === 0 && (
                                                            <div className="alert alert-danger mt-3 mb-0 py-1 small">Penuh</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
