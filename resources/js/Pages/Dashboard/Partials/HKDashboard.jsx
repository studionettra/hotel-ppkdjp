import { Link } from '@inertiajs/react';

export default function HKDashboard({ data }) {
    return (
        <div>
            <div className="row">
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon yellow" style={{ backgroundColor: '#ffc107' }}>
                                    <i className="bi bi-broom"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Kamar Kosong Kotor</h6>
                                    <h6 className="font-extrabold mb-0">{data.vacant_dirty}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon orange" style={{ backgroundColor: '#fd7e14' }}>
                                    <i className="bi bi-person-x"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Kamar Terisi Kotor</h6>
                                    <h6 className="font-extrabold mb-0">{data.occupied_dirty}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon blue">
                                    <i className="bi bi-basket-fill"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Laundry Tertunda</h6>
                                    <h6 className="font-extrabold mb-0">{data.pending_laundry}</h6>
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
                                    <i className="bi bi-card-checklist"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Tugas Pembersihan</h6>
                                    <h6 className="font-extrabold mb-0">{data.cleaning_tasks}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon info" style={{ backgroundColor: '#0dcaf0' }}>
                                    <i className="bi bi-droplet-fill text-white"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Jadwal Perawatan Kolam</h6>
                                    <h6 className="font-extrabold mb-0">{data.pool_maintenance_due}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-3">
                <div className="col-12">
                    <Link href={route('housekeeping.tasks.index')} className="btn btn-outline-primary me-3">
                        <i className="bi bi-arrow-right-circle me-2"></i>Ke Tugas Pembersihan
                    </Link>
                    <Link href={route('laundry.index')} className="btn btn-outline-primary">
                        <i className="bi bi-arrow-right-circle me-2"></i>Ke Laundry
                    </Link>
                </div>
            </div>
        </div>
    );
}
