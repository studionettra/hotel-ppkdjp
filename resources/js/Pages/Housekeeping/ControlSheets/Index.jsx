import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DatePicker from '@/Components/DatePicker';

const AMENITIES_LIST = [
    'Bath Towel', 'Hand Towel', 'Bath Mat', 'Face Towel', 'Double Sheet', 'Single Sheet', 'Pillow Case',
    'Soap Bar', 'Shower Gel', 'Shower Cap', 'Sanitary Bag', 'Shoe Mitt', 'Cotton Buds', 'Comb', 'Nail File',
    'Dental Kit', 'Sewing Kit', 'Razor', 'Shampoo', 'Bath Foam', 'Body Lotion', 'Note Pad', 'Shaving Kit',
    'Coaster', 'Pencil/Pen', 'Mineral Water', 'Glass Tumbler', 'Coffee', 'Tea', 'Sugar', 'Creamer', 'Toilet Paper',
    'Facial Tissue', 'Slippers', 'Laundry Bag', 'Laundry List', 'Remote TV', 'Vas Bunga', 'Bathrobe',
    'Duvet Cover', 'Duvet Inner', 'Bed Runner', 'Trash Bag'
];

const ROOM_STATUSES = {
    vc: 'Vacant Clean', vd: 'Vacant Dirty', vi: 'Vacant Inspected', oc: 'Occupied Clean', od: 'Occupied Dirty',
    o_dnd: 'Occupied DND', oso: 'Occupied Sleep Out', ocg: 'On Change', ooo: 'Out of Order', oos: 'Out of Service',
    blk: 'Blocked', pu: 'Pick Up'
};

export default function Index({ sheets, rooms }) {
    const [showCreate, setShowCreate] = useState(false);
    const [viewData, setViewData] = useState(null);

    // Build initial amenities object { "Bath Towel": 0, ... }
    const initialAmenities = AMENITIES_LIST.reduce((acc, item) => { acc[item] = 0; return acc; }, {});

    const storeForm = useForm({
        room_id: '', date: new Date().toISOString().split('T')[0],
        time_in: '', time_out: '', room_status: 'vc',
        amenities_data: initialAmenities, remarks: ''
    });

    function submitStore(e) {
        e.preventDefault();
        storeForm.post(route('housekeeping.control-sheets.store'), {
            onSuccess: () => { storeForm.reset(); setShowCreate(false); }
        });
    }

    const handleAmenityChange = (key, value) => {
        storeForm.setData('amenities_data', { ...storeForm.data.amenities_data, [key]: value });
    };

    return (
        <AppLayout title="Control Sheet" breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Control Sheet' }]}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Laporan Penggantian Amenities</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                        <i className="bi bi-file-earmark-plus me-1"></i> Input Laporan Baru
                    </button>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Kamar</th>
                                    <th>Waktu In-Out</th>
                                    <th>Status Akhir</th>
                                    <th>Dilaporkan Oleh</th>
                                    <th>Catatan</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sheets.data.length === 0 && <tr><td colSpan={7} className="text-center text-muted">Belum ada laporan control sheet.</td></tr>}
                                {sheets.data.map(sheet => (
                                    <tr key={sheet.id}>
                                        <td>{new Date(sheet.date).toLocaleDateString('id-ID')}</td>
                                        <td><strong>{sheet.room?.room_number}</strong></td>
                                        <td>{sheet.time_in ? `${sheet.time_in} - ${sheet.time_out || '?'}` : '-'}</td>
                                        <td>
                                            {sheet.room_status ? <span className="badge bg-secondary">{ROOM_STATUSES[sheet.room_status] || sheet.room_status}</span> : '-'}
                                        </td>
                                        <td>{sheet.attendant?.name || '-'}</td>
                                        <td>{sheet.remarks || '-'}</td>
                                        <td>
                                            <button className="btn btn-sm btn-info text-white" onClick={() => setViewData(sheet)} title="Lihat Detail Amenities">
                                                <i className="bi bi-eye"></i> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <form onSubmit={submitStore}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Form Control Sheet (Housekeeping Report)</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowCreate(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row mb-3">
                                        <div className="col-md-3">
                                            <label className="form-label">Kamar <span className="text-danger">*</span></label>
                                            <select className="form-select" required value={storeForm.data.room_id} onChange={e => storeForm.setData('room_id', e.target.value)}>
                                                <option value="">-- Pilih --</option>
                                                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Tanggal <span className="text-danger">*</span></label>
                                            <DatePicker className="form-control" required
                                                value={storeForm.data.date} onChange={e => storeForm.setData('date', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Praktek Time In</label>
                                            <input type="time" className="form-control"
                                                value={storeForm.data.time_in} onChange={e => storeForm.setData('time_in', e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Praktek Time Out</label>
                                            <input type="time" className="form-control"
                                                value={storeForm.data.time_out} onChange={e => storeForm.setData('time_out', e.target.value)} />
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label">Ubah Status Kamar (Setelah Dibersihkan)</label>
                                            <select className="form-select" value={storeForm.data.room_status} onChange={e => storeForm.setData('room_status', e.target.value)}>
                                                {Object.entries(ROOM_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Remarks / Catatan</label>
                                            <input type="text" className="form-control"
                                                value={storeForm.data.remarks} onChange={e => storeForm.setData('remarks', e.target.value)} />
                                        </div>
                                    </div>

                                    <h6 className="mb-3 border-bottom pb-2">Pemakaian Amenities & Perlengkapan</h6>
                                    <div className="row g-2">
                                        {AMENITIES_LIST.map((item, idx) => (
                                            <div key={idx} className="col-md-3 col-sm-4 col-6">
                                                <div className="input-group input-group-sm mb-2">
                                                    <span className="input-group-text w-75 text-start overflow-hidden text-truncate" title={item} style={{ fontSize: '0.8rem' }}>{item}</span>
                                                    <input type="number" className="form-control text-center px-1" min="0"
                                                        value={storeForm.data.amenities_data[item] ?? ''}
                                                        onChange={e => handleAmenityChange(item, parseInt(e.target.value) || 0)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Batal</button>
                                    <button type="submit" className="btn btn-primary" disabled={storeForm.processing}>Simpan Laporan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {viewData && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Detail Amenities Kamar {viewData.room?.room_number}</h5>
                                <button type="button" className="btn-close" onClick={() => setViewData(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-2">
                                    {Object.entries(viewData.amenities_data || {}).map(([key, value]) => {
                                        if (!value) return null; // Only show used items
                                        return (
                                            <div key={key} className="col-md-4">
                                                <div className="d-flex justify-content-between border-bottom py-1">
                                                    <span>{key}</span>
                                                    <span className="fw-bold">{value}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {(!viewData.amenities_data || Object.values(viewData.amenities_data).every(v => !v)) && (
                                        <div className="col-12 text-center text-muted py-3">Tidak ada amenities yang dipakai/dicatat.</div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setViewData(null)}>Tutup</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
