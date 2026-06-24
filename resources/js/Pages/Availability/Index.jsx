import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_CONFIG = {
    vc:  { label: 'Vacant Clean',    badge: 'bg-success' },
    vd:  { label: 'Vacant Dirty',    badge: 'bg-warning text-dark' },
    oc:  { label: 'Occupied Clean',  badge: 'bg-primary' },
    od:  { label: 'Occupied Dirty',  badge: 'bg-danger' },
    ooo: { label: 'Out of Order',    badge: 'bg-secondary' },
    oos: { label: 'Out of Service',  badge: 'bg-dark' },
};

function StatCard({ label, value, color }) {
    return (
        <div className="col">
            <div className={`card border-0 bg-${color} text-white`}>
                <div className="card-body py-3 text-center">
                    <div className="fs-3 fw-bold">{value}</div>
                    <div className="small opacity-75">{label}</div>
                </div>
            </div>
        </div>
    );
}

export default function Index({ floors, filters, summary }) {
    function applyFilter(e) {
        e.preventDefault();
        const form = e.target;
        router.get(route('availability.index'), {
            check_in:  form.check_in.value,
            check_out: form.check_out.value,
            sort:      form.sort.value,
        }, { preserveState: true });
    }

    // Flatten all rooms for sort view
    const allRooms = floors.flatMap(f =>
        f.rooms.map(r => ({ ...r, floor: f }))
    );

    // Sort options
    const sortedRooms = (sort) => {
        const rooms = [...allRooms];
        if (sort === 'status') return rooms.sort((a, b) => a.status.localeCompare(b.status));
        if (sort === 'type')   return rooms.sort((a, b) => (a.room_type?.name ?? '').localeCompare(b.room_type?.name ?? ''));
        if (sort === 'price')  return rooms.sort((a, b) => (a.room_type?.base_price ?? 0) - (b.room_type?.base_price ?? 0));
        if (sort === 'available') return rooms.sort((a, b) => Number(a.is_booked) - Number(b.is_booked));
        return rooms; // default: floor order
    };

    const nights = Math.max(1, Math.ceil(
        (new Date(filters.checkOut) - new Date(filters.checkIn)) / 86400000
    ));

    const isFloorView = !filters.sortBy || filters.sortBy === 'floor';

    return (
        <AppLayout title="Ketersediaan Kamar">
            {/* Filter Bar */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={applyFilter} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Check-In</label>
                            <input type="date" name="check_in" className="form-control"
                                defaultValue={filters.checkIn} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Check-Out</label>
                            <input type="date" name="check_out" className="form-control"
                                defaultValue={filters.checkOut} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Urutkan</label>
                            <select name="sort" className="form-select" defaultValue={filters.sortBy}>
                                <option value="floor">Per Lantai</option>
                                <option value="available">Tersedia Dulu</option>
                                <option value="status">Status</option>
                                <option value="type">Tipe Kamar</option>
                                <option value="price">Harga</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="bi bi-search me-1" />Tampilkan
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Summary */}
            <div className="row row-cols-2 row-cols-md-4 g-3 mb-4">
                <StatCard label="Total Kamar"    value={summary.total}     color="secondary" />
                <StatCard label="Tersedia"        value={summary.available} color="success" />
                <StatCard label="Terisi"          value={summary.occupied}  color="primary" />
                <StatCard label="OOO / OOS"       value={summary.ooo}       color="danger" />
            </div>

            {/* Legend */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <span key={key} className={`badge ${cfg.badge}`}>{cfg.label}</span>
                ))}
                <span className="badge bg-info text-dark">Dipesan (tgl dipilih)</span>
            </div>

            {/* Floor View */}
            {isFloorView ? (
                floors.map(floor => (
                    <div key={floor.id} className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-layers-fill me-2 text-primary" />
                                Lantai {floor.floor_number}
                                {floor.floor_name && <span className="text-muted ms-2 fw-normal">— {floor.floor_name}</span>}
                            </h5>
                            <small className="text-muted">{floor.rooms.length} kamar</small>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>No. Kamar</th>
                                        <th>Tipe Kamar</th>
                                        <th className="text-center">Kapasitas</th>
                                        <th className="text-end">Harga / Malam</th>
                                        <th className="text-end">Est. {nights} Malam</th>
                                        <th className="text-center">Status Kamar</th>
                                        <th className="text-center">Periode Dipilih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floor.rooms.length === 0 && (
                                        <tr><td colSpan="7" className="text-center text-muted py-3">Tidak ada kamar</td></tr>
                                    )}
                                    {floor.rooms.map(room => (
                                        <tr key={room.id} className={room.is_booked ? 'table-danger' : ''}>
                                            <td>
                                                <strong className="fs-6">{room.room_number}</strong>
                                            </td>
                                            <td>
                                                <div>{room.room_type?.name ?? '—'}</div>
                                                <small className="text-muted">{room.room_type?.code}</small>
                                            </td>
                                            <td className="text-center">
                                                <i className="bi bi-person-fill text-muted me-1" />
                                                {room.room_type?.max_capacity ?? '—'}
                                            </td>
                                            <td className="text-end">
                                                {room.room_type?.base_price
                                                    ? `Rp ${Number(room.room_type.base_price).toLocaleString('id-ID')}`
                                                    : '—'}
                                            </td>
                                            <td className="text-end fw-semibold text-success">
                                                {room.room_type?.base_price
                                                    ? `Rp ${(Number(room.room_type.base_price) * nights).toLocaleString('id-ID')}`
                                                    : '—'}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge ${STATUS_CONFIG[room.status]?.badge ?? 'bg-secondary'}`}>
                                                    {STATUS_CONFIG[room.status]?.label ?? room.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {room.is_booked
                                                    ? <span className="badge bg-info text-dark">Dipesan</span>
                                                    : ['ooo', 'oos'].includes(room.status)
                                                        ? <span className="badge bg-secondary">Tidak Tersedia</span>
                                                        : <span className="badge bg-success">Tersedia</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            ) : (
                /* Sorted flat view */
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Semua Kamar — Diurutkan berdasarkan {
                            filters.sortBy === 'status' ? 'Status' :
                            filters.sortBy === 'type' ? 'Tipe Kamar' :
                            filters.sortBy === 'price' ? 'Harga' :
                            'Ketersediaan'
                        }</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>No. Kamar</th>
                                    <th>Lantai</th>
                                    <th>Tipe Kamar</th>
                                    <th className="text-center">Kapasitas</th>
                                    <th className="text-end">Harga / Malam</th>
                                    <th className="text-end">Est. {nights} Malam</th>
                                    <th className="text-center">Status Kamar</th>
                                    <th className="text-center">Periode Dipilih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedRooms(filters.sortBy).map(room => (
                                    <tr key={room.id} className={room.is_booked ? 'table-danger' : ''}>
                                        <td><strong className="fs-6">{room.room_number}</strong></td>
                                        <td>
                                            <small className="text-muted">
                                                Lantai {room.floor?.floor_number}
                                                {room.floor?.floor_name ? ` — ${room.floor.floor_name}` : ''}
                                            </small>
                                        </td>
                                        <td>
                                            <div>{room.room_type?.name ?? '—'}</div>
                                            <small className="text-muted">{room.room_type?.code}</small>
                                        </td>
                                        <td className="text-center">
                                            <i className="bi bi-person-fill text-muted me-1" />
                                            {room.room_type?.max_capacity ?? '—'}
                                        </td>
                                        <td className="text-end">
                                            {room.room_type?.base_price
                                                ? `Rp ${Number(room.room_type.base_price).toLocaleString('id-ID')}`
                                                : '—'}
                                        </td>
                                        <td className="text-end fw-semibold text-success">
                                            {room.room_type?.base_price
                                                ? `Rp ${(Number(room.room_type.base_price) * nights).toLocaleString('id-ID')}`
                                                : '—'}
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge ${STATUS_CONFIG[room.status]?.badge ?? 'bg-secondary'}`}>
                                                {STATUS_CONFIG[room.status]?.label ?? room.status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            {room.is_booked
                                                ? <span className="badge bg-info text-dark">Dipesan</span>
                                                : ['ooo', 'oos'].includes(room.status)
                                                    ? <span className="badge bg-secondary">Tidak Tersedia</span>
                                                    : <span className="badge bg-success">Tersedia</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
