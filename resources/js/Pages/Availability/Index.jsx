import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import DatePicker from '@/Components/DatePicker';

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

function RoomCard({ room, nights, showFloor, isSelected, onSelect, onConfigChange, config }) {
    const [showFacilities, setShowFacilities] = useState(false);
    const isBooked = room.is_booked;
    const isOoo = ['ooo', 'oos'].includes(room.status);
    const isAvailable = !isBooked && !isOoo;
    
    // colors for left border
    const statusColor = isBooked ? 'danger' : isOoo ? 'secondary' : 'success';
    const statusText = isBooked ? 'Dipesan' : isOoo ? 'Tdk Tersedia' : 'Tersedia';

    const hasBreakfastFacility = Array.isArray(room.room_type?.facilities) && room.room_type.facilities.some(f => f.toLowerCase().includes('breakfast') || f.toLowerCase().includes('sarapan'));
    const includedBreakfast = hasBreakfastFacility || room.room_type?.name?.toLowerCase().includes('breakfast');

    const baseRoomPrice = Number(room.room_type?.base_price ?? 0) * nights;
    let cardTotal = baseRoomPrice;
    if (config?.extrabed) cardTotal += (200000 * nights);
    if (config?.breakfast && !includedBreakfast) cardTotal += (150000 * nights);

    return (
        <div className="col">
            <div className={`card h-100 shadow-sm border-0 border-start border-5 border-${statusColor} ${isSelected ? 'bg-primary bg-opacity-10' : ''}`} 
                style={{ cursor: isAvailable ? 'pointer' : 'default', transition: 'all 0.3s ease' }} 
                onClick={() => { if (isAvailable && onSelect) onSelect(room); }}
            >
                <div className="card-body p-3 d-flex flex-column">
                    {/* Header: Room Number and Status Badge */}
                    <div className="d-flex justify-content-between align-items-center mb-3 position-relative">
                        <h5 className="mb-0 fw-bold text-dark">Kamar {room.room_number}</h5>
                        {isSelected && (
                            <div className="position-absolute start-50 translate-middle-x">
                                <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                            </div>
                        )}
                        <span className={`badge bg-${statusColor}`}>{statusText}</span>
                    </div>

                    {/* Floor (if not in floor view) */}
                    {showFloor && (
                        <div className="text-muted small mb-2">
                            <i className="bi bi-layers me-1"></i> 
                            Lantai {room.floor?.floor_number} {room.floor?.floor_name ? `(${room.floor.floor_name})` : ''}
                        </div>
                    )}

                    {/* Stats: Type, Capacity, Price */}
                    <div className="d-flex flex-wrap gap-3 mb-3 small fw-medium text-secondary">
                        <div className="d-flex align-items-center" title="Tipe Kamar">
                            <i className="bi bi-door-open-fill me-1 text-primary"></i>
                            <span>{room.room_type?.name ?? '—'}</span>
                        </div>
                        <div className="d-flex align-items-center" title="Kapasitas">
                            <i className="bi bi-person-fill me-1 text-primary"></i>
                            <span>{room.room_type?.max_capacity ?? '—'} Orang</span>
                        </div>
                        <div className="d-flex align-items-center" title="Harga per Malam">
                            <i className="bi bi-tag-fill me-1 text-primary"></i>
                            <span>Rp {room.room_type?.base_price ? Number(room.room_type.base_price).toLocaleString('id-ID') : '—'}</span>
                        </div>
                    </div>

                    {/* Facilities (condensed) */}
                    <div className="mb-2">
                        <div className="d-flex flex-wrap gap-1">
                            {Array.isArray(room.room_type?.facilities) && room.room_type.facilities.length > 0 ? (
                                <>
                                    {room.room_type.facilities.slice(0, showFacilities ? undefined : 3).map((f, idx) => (
                                        <span key={idx} className="badge bg-white text-dark border" style={{ fontSize: '0.65rem' }}>{f}</span>
                                    ))}
                                    {!showFacilities && room.room_type.facilities.length > 3 && (
                                        <span 
                                            className="badge bg-light text-primary border" 
                                            style={{ fontSize: '0.65rem', cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); setShowFacilities(true); }}
                                        >
                                            +{room.room_type.facilities.length - 3}
                                        </span>
                                    )}
                                </>
                            ) : <span className="text-muted small">—</span>}
                        </div>
                    </div>
                    
                    {/* Selected Options Panel */}
                    {isSelected && (
                        <div className="mt-3 pt-3 border-top" onClick={e => e.stopPropagation()}>
                            <div className="form-check form-switch mb-2">
                                <input className="form-check-input" type="checkbox" checked={config?.extrabed || false} onChange={e => onConfigChange(room.id, 'extrabed', e.target.checked)} />
                                <label className="form-check-label small fw-medium text-dark">Extrabed (+Rp 200rb/mlm)</label>
                            </div>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" checked={includedBreakfast || (config?.breakfast || false)} disabled={includedBreakfast} onChange={e => onConfigChange(room.id, 'breakfast', e.target.checked)} />
                                <label className="form-check-label small fw-medium text-dark">
                                    {includedBreakfast ? 'Sarapan (Termasuk)' : 'Sarapan (+Rp 150rb/mlm)'}
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer total price */}
                {isSelected && (
                    <div className="card-footer bg-primary bg-opacity-25 border-0 py-2 d-flex justify-content-between align-items-center rounded-bottom">
                        <span className="small fw-semibold text-primary">Total ({nights} Mlm)</span>
                        <strong className="text-primary fs-5">Rp {cardTotal.toLocaleString('id-ID')}</strong>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function Index({ floors, filters, summary }) {
    const [selectedRooms, setSelectedRooms] = useState([]);

    function handleSelectRoom(room) {
        setSelectedRooms(prev => {
            const exists = prev.find(r => r.id === room.id);
            if (exists) return prev.filter(r => r.id !== room.id); // unselect
            if (prev.length >= 5) {
                alert('Maksimal memilih 5 kamar dalam satu transaksi.');
                return prev;
            }
            return [...prev, { id: room.id, extrabed: false, breakfast: room.room_type?.name?.toLowerCase().includes('breakfast') || false, room }];
        });
    }

    function handleConfigChange(roomId, field, value) {
        setSelectedRooms(prev => prev.map(r => 
            r.id === roomId ? { ...r, [field]: value } : r
        ));
    }

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

    const cartTotal = selectedRooms.reduce((acc, curr) => {
        const hasBreakfastFacility = Array.isArray(curr.room.room_type?.facilities) && curr.room.room_type.facilities.some(f => f.toLowerCase().includes('breakfast') || f.toLowerCase().includes('sarapan'));
        const includedBreakfast = hasBreakfastFacility || curr.room.room_type?.name?.toLowerCase().includes('breakfast');

        let total = Number(curr.room.room_type?.base_price ?? 0) * nights;
        if (curr.extrabed) total += (200000 * nights);
        if (curr.breakfast && !includedBreakfast) total += (150000 * nights);
        return acc + total;
    }, 0);

    function proceedToCheckout() {
        router.post(route('bookings.checkin'), {
            rooms: selectedRooms.map(r => ({ id: r.id, extrabed: r.extrabed, breakfast: r.breakfast })),
            check_in: filters.checkIn,
            check_out: filters.checkOut
        });
    }

    return (
        <AppLayout title="Ketersediaan Kamar">
            {/* Filter Bar */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={applyFilter} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Check-In</label>
                            <DatePicker name="check_in" className="form-control"
                                defaultValue={filters.checkIn} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Check-Out</label>
                            <DatePicker name="check_out" className="form-control"
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
                    <div key={floor.id} className="mb-5">
                        <div className="divider divider-left mb-4">
                            <div className="divider-text fs-5 fw-bold text-dark">
                                <i className="bi bi-layers-fill text-primary me-2" />
                                Lantai {floor.floor_number}
                                {floor.floor_name && <span className="text-muted ms-2 fw-normal fs-6">— {floor.floor_name}</span>}
                                <span className="badge bg-secondary ms-3 rounded-pill" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>{floor.rooms.length} Kamar</span>
                            </div>
                        </div>

                        {floor.rooms.length === 0 ? (
                            <div className="text-center text-muted py-3">Tidak ada kamar di lantai ini</div>
                        ) : (
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                {floor.rooms.map(room => (
                                    <RoomCard key={room.id} room={room} nights={nights} showFloor={false} 
                                        isSelected={!!selectedRooms.find(r => r.id === room.id)}
                                        config={selectedRooms.find(r => r.id === room.id)}
                                        onSelect={handleSelectRoom}
                                        onConfigChange={handleConfigChange}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                /* Sorted flat view */
                <div className="card mb-5 pb-5">
                    <div className="card-body bg-light">
                        {sortedRooms(filters.sortBy).length === 0 ? (
                            <div className="text-center text-muted py-3">Tidak ada kamar</div>
                        ) : (
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                                {sortedRooms(filters.sortBy).map(room => (
                                    <RoomCard key={room.id} room={room} nights={nights} showFloor={true} 
                                        isSelected={!!selectedRooms.find(r => r.id === room.id)}
                                        config={selectedRooms.find(r => r.id === room.id)}
                                        onSelect={handleSelectRoom}
                                        onConfigChange={handleConfigChange}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Sticky Checkout Bar */}
            {selectedRooms.length > 0 && (
                <div className="position-fixed bottom-0 start-0 w-100 bg-white shadow-lg border-top p-3 z-3" style={{ transform: 'translateY(0)' }}>
                    <div className="container-fluid max-w-7xl mx-auto d-flex justify-content-between align-items-center">
                        <div>
                            <div className="fw-bold fs-5 text-primary">
                                {selectedRooms.length} Kamar Terpilih
                            </div>
                            <small className="text-muted">Total Estimasi: Rp {cartTotal.toLocaleString('id-ID')}</small>
                        </div>
                        <button className="btn btn-primary btn-lg px-4 fw-bold shadow-sm" onClick={proceedToCheckout}>
                            Lanjutkan ke Registrasi <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
