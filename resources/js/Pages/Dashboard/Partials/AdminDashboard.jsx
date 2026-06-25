import Chart from 'react-apexcharts';

export default function AdminDashboard({ data }) {
    const revenueChartOptions = {
        chart: { type: 'line', height: 300, toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#435ebe'],
        xaxis: { categories: data.revenue_trend.categories },
        dataLabels: { enabled: false },
    };

    const occupancyChartOptions = {
        chart: { type: 'area', height: 300, toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 2 },
        fill: { opacity: 0.3 },
        colors: ['#5ddab4'],
        xaxis: { categories: data.occupancy_trend.categories },
        yaxis: { max: 100, min: 0 },
        dataLabels: { enabled: false },
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div>
            <div className="row">
                <div className="col-6 col-lg-4 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon purple">
                                    <i className="bi bi-house-door"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Tingkat Hunian</h6>
                                    <h6 className="font-extrabold mb-0">{data.occupancy_rate}%</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-4 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon blue">
                                    <i className="bi bi-cash-stack"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Pendapatan Hari Ini</h6>
                                    <h6 className="font-extrabold mb-0">{formatCurrency(data.revenue_today)}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-4 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon green">
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Tamu Aktif</h6>
                                    <h6 className="font-extrabold mb-0">{data.active_guests}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-4 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon blue">
                                    <i className="bi bi-door-open"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Kamar Tersedia (VC)</h6>
                                    <h6 className="font-extrabold mb-0">{data.available_rooms}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-4 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon purple">
                                    <i className="bi bi-calendar-check"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Reservasi Baru</h6>
                                    <h6 className="font-extrabold mb-0">{data.new_reservations}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-4 col-md-6">
                    <div className="card">
                        <div className="card-body px-4 py-4-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stats-icon red">
                                    <i className="bi bi-tools"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted font-semibold">Kamar OOO / OOS</h6>
                                    <h6 className="font-extrabold mb-0">{data.ooo_rooms}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4>Tren Pendapatan (7 Hari Terakhir)</h4>
                        </div>
                        <div className="card-body">
                            <Chart options={revenueChartOptions} series={[{ name: 'Pendapatan', data: data.revenue_trend.data }]} type="line" height={300} />
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4>Tren Hunian (7 Hari Terakhir)</h4>
                        </div>
                        <div className="card-body">
                            <Chart options={occupancyChartOptions} series={[{ name: 'Tingkat Hunian', data: data.occupancy_trend.data }]} type="area" height={300} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
