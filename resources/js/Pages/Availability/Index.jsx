import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import DatePicker from '@/Components/DatePicker';

const STATUS_CONFIG = {
    vc:  { label: 'Vacant Clean',    badge: 'bg-success-subtle text-success border border-success-subtle' },
    vd:  { label: 'Vacant Dirty',    badge: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' },
    oc:  { label: 'Occupied Clean',  badge: 'bg-primary-subtle text-primary border border-primary-subtle' },
    od:  { label: 'Occupied Dirty',  badge: 'bg-danger-subtle text-danger border border-danger-subtle' },
    ooo: { label: 'Out of Order',    badge: 'bg-secondary-subtle text-secondary border border-secondary-subtle' },
    oos: { label: 'Out of Service',  badge: 'bg-dark-subtle text-dark border border-dark-subtle' },
};

function StatCard({ label, value, color, icon }) {
    const iconColor = {
        secondary: 'text-secondary bg-secondary bg-opacity-10',
        success: 'text-success bg-success bg-opacity-10',
        primary: 'text-primary bg-primary bg-opacity-10',
        danger: 'text-danger bg-danger bg-opacity-10',
    }[color] || 'text-muted bg-light';

    return (
        <div className="col">
            <div className="card border-0 border-top border-4 shadow-sm h-100" style={{ borderTopColor: `var(--bs-${color})` }}>
                <div className="card-body py-4 px-4 d-flex align-items-center justify-content-between">
                    <div>
                        <div className="fs-2 fw-bold mb-1">{value}</div>
                        <div className="text-uppercase tracking-wider small fw-semibold text-body-secondary" style={{ fontSize: '0.725rem' }}>{label}</div>
                    </div>
                    <div className={`fs-3 ${iconColor} rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '52px', height: '52px' }}>
                        <i className={`bi ${icon}`}></i>
                    </div>
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

    const statusConfig = STATUS_CONFIG[room.status] || { label: room.status, badge: 'bg-secondary' };

    return (
        <div className="col">
            <div 
                className={`card h-100 shadow-sm position-relative ${isSelected ? 'border-primary shadow' : ''}`} 
                style={{ 
                    cursor: isAvailable ? 'pointer' : 'default', 
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    borderLeft: `4px solid var(--bs-${statusColor})`
                }} 
                onClick={() => { if (isAvailable && onSelect) onSelect(room); }}
            >
                {/* Checkbox overlay indicator */}
                {isSelected && (
                    <div className="position-absolute" style={{ top: '8px', right: '8px', zIndex: 2 }}>
                        <span className="badge bg-primary rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
                            <i className="bi bi-check-lg text-white" style={{ fontSize: '0.65rem' }} />
                        </span>
                    </div>
                )}

                <div className="card-body p-2.5 d-flex flex-column">
                    {/* Header: Room Number and Status Badge */}
                    <div className="d-flex justify-content-between align-items-start mb-2 pe-3">
                        <div>
                            <h6 className="mb-0 fw-bold text-body">Kamar {room.room_number}</h6>
                            {showFloor && (
                                <div className="text-body-secondary mt-0.5" style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-layers me-1"></i> 
                                    Lt. {room.floor?.floor_number}
                                </div>
                            )}
                        </div>
                        
                        <div className="d-flex flex-column align-items-end gap-1">
                            <span className={`badge bg-${statusColor}-subtle text-${statusColor} border border-${statusColor}-subtle px-1.5 py-0.5`} style={{ fontSize: '0.65rem' }}>
                                {statusText}
                            </span>
                            <span className={`badge ${statusConfig.badge} px-1.5 py-0.5`} style={{ fontSize: '0.6rem' }}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Stats: Type, Capacity, Price */}
                    <div className="d-flex flex-column gap-1.5 mb-2 small bg-body-secondary p-2 rounded-3" style={{ fontSize: '0.75rem' }}>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="text-body-secondary"><i className="bi bi-door-open me-1 text-primary"></i>Tipe</span>
                            <span className="fw-semibold text-body text-truncate ms-2" style={{ maxWidth: '90px' }}>{room.room_type?.name ?? '—'}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="text-body-secondary"><i className="bi bi-person me-1 text-primary"></i>Kapasitas</span>
                            <span className="fw-semibold text-body">{room.room_type?.max_capacity ?? '—'} Orang</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="text-body-secondary"><i className="bi bi-tag me-1 text-primary"></i>Harga</span>
                            <span className="fw-semibold text-body">Rp {room.room_type?.base_price ? Number(room.room_type.base_price).toLocaleString('id-ID') : '—'}</span>
                        </div>
                    </div>

                    {/* Facilities */}
                    <div className="mb-1 mt-auto">
                        <div className="d-flex flex-wrap gap-1">
                            {Array.isArray(room.room_type?.facilities) && room.room_type.facilities.length > 0 ? (
                                <>
                                    {room.room_type.facilities.slice(0, showFacilities ? undefined : 2).map((f, idx) => (
                                        <span key={idx} className="badge bg-body-tertiary text-body-secondary border border-secondary-subtle px-1.5 py-0.5" style={{ fontSize: '0.6rem' }}>{f}</span>
                                    ))}
                                    {!showFacilities && room.room_type.facilities.length > 2 && (
                                        <span 
                                            className="badge bg-primary bg-opacity-10 text-primary border-0 px-1.5 py-0.5" 
                                            style={{ fontSize: '0.6rem', cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); setShowFacilities(true); }}
                                        >
                                            +{room.room_type.facilities.length - 2}
                                        </span>
                                    )}
                                </>
                            ) : <span className="text-body-secondary small">—</span>}
                        </div>
                    </div>
                    
                    {/* Selected Options Panel */}
                    {isSelected && (
                        <div className="mt-2 pt-2 border-top" onClick={e => e.stopPropagation()}>
                            <div className="form-check form-switch mb-1">
                                <input className="form-check-input" type="checkbox" checked={config?.extrabed || false} onChange={e => onConfigChange(room.id, 'extrabed', e.target.checked)} style={{ transform: 'scale(0.85)', transformOrigin: 'left' }} />
                                <label className="form-check-label text-body" style={{ fontSize: '0.7rem' }}>Extrabed (+200k)</label>
                            </div>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" checked={includedBreakfast || (config?.breakfast || false)} disabled={includedBreakfast} onChange={e => onConfigChange(room.id, 'breakfast', e.target.checked)} style={{ transform: 'scale(0.85)', transformOrigin: 'left' }} />
                                <label className="form-check-label text-body" style={{ fontSize: '0.7rem' }}>
                                    {includedBreakfast ? 'Sarapan (Inc.)' : 'Sarapan (+150k)'}
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer total price */}
                {isSelected && (
                    <div className="card-footer bg-primary bg-opacity-10 border-0 py-2 d-flex justify-content-between align-items-center rounded-bottom">
                        <span className="fw-semibold text-primary" style={{ fontSize: '0.7rem' }}>Total ({nights} Mlm)</span>
                        <strong className="text-primary" style={{ fontSize: '0.9rem' }}>Rp {cardTotal.toLocaleString('id-ID')}</strong>
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
            <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body p-4">
                    <form onSubmit={applyFilter} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label fw-bold text-secondary small">Check-In</label>
                            <DatePicker name="check_in" className="border-light bg-light"
                                defaultValue={filters.checkIn} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold text-secondary small">Check-Out</label>
                            <DatePicker name="check_out" className="border-light bg-light"
                                defaultValue={filters.checkOut} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold text-secondary small">Urutkan</label>
                            <select name="sort" className="form-select border-light bg-light" defaultValue={filters.sortBy}>
                                <option value="floor">Per Lantai</option>
                                <option value="available">Tersedia Dulu</option>
                                <option value="status">Status</option>
                                <option value="type">Tipe Kamar</option>
                                <option value="price">Harga</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <button type="submit" className="btn btn-primary w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center" style={{ height: '38px' }}>
                                <i className="bi bi-search me-2" style={{ display: 'inline-flex', transform: 'translateY(-0.5px)' }} />Tampilkan
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Summary */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4 mb-4">
                <StatCard label="Total Kamar" value={summary.total} color="secondary" icon="bi-door-open" />
                <StatCard label="Tersedia" value={summary.available} color="success" icon="bi-check-circle" />
                <StatCard label="Terisi" value={summary.occupied} color="primary" icon="bi-people" />
                <StatCard label="OOO / OOS" value={summary.ooo} color="danger" icon="bi-exclamation-triangle" />
            </div>

            {/* Legend */}
            <div className="d-flex flex-wrap gap-2 mb-4 p-3 bg-white rounded-3 shadow-sm align-items-center">
                <span className="small text-muted fw-semibold me-2">Legenda Status Kamar:</span>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <span key={key} className={`badge ${cfg.badge} rounded-pill px-2.5 py-1.5`} style={{ fontSize: '0.725rem' }}>{cfg.label}</span>
                ))}
                <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2.5 py-1.5" style={{ fontSize: '0.725rem' }}>Dipesan (tgl dipilih)</span>
            </div>

            {/* Floor View */}
            {isFloorView ? (
                floors.map(floor => (
                    <div key={floor.id} className="mb-5">
                        <div className="d-flex align-items-center gap-3 mb-4 mt-5">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-layers-fill fs-5" />
                            </div>
                            <div>
                                <h5 className="mb-0 fw-bold text-dark">Lantai {floor.floor_number}</h5>
                                {floor.floor_name && <small className="text-muted">{floor.floor_name}</small>}
                            </div>
                            <span className="badge bg-light text-secondary border rounded-pill ms-2">{floor.rooms.length} Kamar</span>
                            <div className="flex-grow-1 border-bottom" style={{ borderBottomColor: '#f1f3f5' }}></div>
                        </div>

                        {floor.rooms.length === 0 ? (
                            <div className="text-center text-muted py-5 bg-white rounded-3 shadow-sm border border-light">Tidak ada kamar di lantai ini</div>
                        ) : (
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
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
                <div className="card border-0 shadow-sm mb-5 pb-5">
                    <div className="card-body p-4">
                        {sortedRooms(filters.sortBy).length === 0 ? (
                            <div className="text-center text-muted py-5">Tidak ada kamar</div>
                        ) : (
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
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
                <div 
                    className="position-fixed bottom-0 start-0 w-100 border-top p-3 z-3" 
                    style={{ 
                        boxShadow: '0 -8px 24px rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                >
                    <div className="container-fluid max-w-7xl mx-auto d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                <i className="bi bi-cart-fill fs-5" />
                            </div>
                            <div>
                                <div className="fw-bold fs-5 text-dark">
                                    {selectedRooms.length} Kamar Terpilih
                                </div>
                                <span className="text-muted small">Total Estimasi Transaksi: <strong className="text-primary fw-bold">Rp {cartTotal.toLocaleString('id-ID')}</strong></span>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg px-4 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={proceedToCheckout}>
                            Lanjutkan ke Registrasi <i className="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
