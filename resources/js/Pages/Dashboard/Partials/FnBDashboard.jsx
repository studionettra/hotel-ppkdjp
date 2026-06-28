import { Link } from '@inertiajs/react';

export default function FnBDashboard({ data }) {
    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div>
            <div className="row">
                <div className="col-6 col-lg-3 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon orange" style={{ backgroundColor: '#fd7e14' }}>
                                    <i className="iconly-boldTime-Circle"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Pesanan Aktif</h6>
                                    <h6 className="font-extrabold mb-0">{data.active_orders}</h6>
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
                                    <i className="iconly-boldHome"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Layanan Kamar</h6>
                                    <h6 className="font-extrabold mb-0">{data.room_service_orders}</h6>
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
                                    <i className="iconly-boldBag"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Pesanan Restoran</h6>
                                    <h6 className="font-extrabold mb-0">{data.restaurant_orders}</h6>
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
                                    <i className="iconly-boldWallet"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Pendapatan Hari Ini</h6>
                                    <h6 className="font-extrabold mb-0">{formatCurrency(data.revenue_today)}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-3">
                <div className="col-12">
                    <Link href={route('fnb.orders.create')} className="btn btn-primary me-3">
                        <i className="bi bi-plus-circle me-2"></i>Pesanan Baru
                    </Link>
                    <Link href={route('fnb.orders.index')} className="btn btn-outline-primary">
                        <i className="bi bi-list-ul me-2"></i>Lihat Semua Pesanan
                    </Link>
                </div>
            </div>
        </div>
    );
}
