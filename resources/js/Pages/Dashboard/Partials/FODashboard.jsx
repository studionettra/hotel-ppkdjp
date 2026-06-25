import { Link } from '@inertiajs/react';

export default function FODashboard({ data }) {
    return (
        <div>
            {/* Quick Actions */}
            <div className="row mb-4">
                <div className="col-12 d-flex gap-3">
                    <Link href={route('reservations.create')} className="btn btn-primary btn-lg">
                        <i className="bi bi-plus-circle me-2"></i>Reservasi Baru
                    </Link>
                    <Link href={route('reservations.index')} className="btn btn-outline-primary btn-lg">
                        <i className="bi bi-search me-2"></i>Cari Tamu
                    </Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="row">
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon blue">
                                    <i className="bi bi-box-arrow-in-right"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Kedatangan Hari Ini</h6>
                                    <h6 className="font-extrabold mb-0">{data.todays_arrivals}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon green">
                                    <i className="bi bi-box-arrow-right"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Keberangkatan Hari Ini</h6>
                                    <h6 className="font-extrabold mb-0">{data.todays_departures}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon red">
                                    <i className="bi bi-door-open"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Kamar Tersedia</h6>
                                    <h6 className="font-extrabold mb-0">{data.available_rooms}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon purple">
                                    <i className="bi bi-journals"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Reservasi Aktif</h6>
                                    <h6 className="font-extrabold mb-0">{data.active_reservations}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lists */}
            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-light-primary">
                            <h5 className="mb-0">Kedatangan Diperkirakan</h5>
                        </div>
                        <div className="card-body mt-3">
                            {data.arrival_list.length === 0 ? (
                                <p className="text-muted text-center py-3">Tidak ada jadwal kedatangan hari ini.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Tamu</th>
                                                <th>Tipe</th>
                                                <th>Kamar Ditugaskan</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.arrival_list.map((res) => (
                                                <tr key={res.id}>
                                                    <td>{res.guest?.full_name}</td>
                                                    <td>{res.room_type?.name}</td>
                                                    <td>{res.room?.room_number ?? <span className="text-muted italic">TBD</span>}</td>
                                                    <td>
                                                        <Link href={route('checkins.create', res.id)} className="btn btn-sm btn-primary">
                                                            Check-In
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-light-success">
                            <h5 className="mb-0">Keberangkatan Diperkirakan</h5>
                        </div>
                        <div className="card-body mt-3">
                            {data.departure_list.length === 0 ? (
                                <p className="text-muted text-center py-3">Tidak ada jadwal keberangkatan hari ini.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Kamar</th>
                                                <th>Tamu</th>
                                                <th>Tipe</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.departure_list.map((res) => (
                                                <tr key={res.id}>
                                                    <td className="fw-bold">{res.room?.room_number}</td>
                                                    <td>{res.guest?.full_name}</td>
                                                    <td>{res.room_type?.name}</td>
                                                    <td>
                                                        <Link href={route('folios.show', res.id)} className="btn btn-sm btn-success me-2">
                                                            Folio
                                                        </Link>
                                                        {res.check_in && (
                                                            <Link href={route('checkouts.create', res.check_in.id)} className="btn btn-sm btn-danger">
                                                                Check-Out
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
