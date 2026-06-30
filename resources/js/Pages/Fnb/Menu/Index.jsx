import { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function CategoryModal({ category, onClose }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        is_active: category?.is_active ?? true,
    });

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        category
            ? put(route('menu.categories.update', category.id), opts)
            : post(route('menu.categories.store'), opts);
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{category ? 'Edit' : 'Tambah'} Kategori</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Nama *</label>
                                <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Deskripsi</label>
                                <textarea className="form-control" rows="2"
                                    value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            {category && (
                                <div className="form-check">
                                    <input type="checkbox" className="form-check-input" id="is_active"
                                        checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                    <label className="form-check-label" htmlFor="is_active">Aktif</label>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? <span className="spinner-border spinner-border-sm me-1" /> : null} Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function ItemModal({ item, categories, onClose }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        category_id:  item?.category_id ?? '',
        name:         item?.name ?? '',
        code:         item?.code ?? '',
        description:  item?.description ?? '',
        price:        item?.price ?? '',
        unit:         item?.unit ?? 'porsi',
        is_available: item?.is_available ?? true,
    });

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        item
            ? put(route('menu.items.update', item.id), opts)
            : post(route('menu.items.store'), opts);
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{item ? 'Edit' : 'Tambah'} Menu Item</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Kategori *</label>
                                <select className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                                    value={data.category_id} onChange={e => setData('category_id', e.target.value)} required>
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-8">
                                    <label className="form-label">Nama *</label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Kode *</label>
                                    <input type="text" className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                        value={data.code} onChange={e => setData('code', e.target.value)} required />
                                    {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Harga *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">Rp</span>
                                        <input type="number" className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                            value={data.price} onChange={e => setData('price', e.target.value)} min="0" required />
                                        {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Satuan *</label>
                                    <input type="text" className="form-control"
                                        value={data.unit} onChange={e => setData('unit', e.target.value)} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Deskripsi</label>
                                <textarea className="form-control" rows="2"
                                    value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="is_available"
                                    checked={data.is_available} onChange={e => setData('is_available', e.target.checked)} />
                                <label className="form-check-label" htmlFor="is_available">Tersedia</label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? <span className="spinner-border spinner-border-sm me-1" /> : null} Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Index({ categories }) {
    const { auth } = usePage().props;
    const [catModal, setCatModal] = useState(null);   // null | 'new' | {category object}
    const [itemModal, setItemModal] = useState(null); // null | 'new' | {item object}

    const canCreateMenu = auth.permissions.includes('menu.create');
    const canUpdateMenu = auth.permissions.includes('menu.update');
    const canDeleteMenu = auth.permissions.includes('menu.delete');

    const allCategories = categories;

    function deleteCategory(id) {
        if (!confirm('Hapus kategori ini? Semua menu di dalamnya juga akan dihapus.')) return;
        router.delete(route('menu.categories.destroy', id));
    }

    function deleteItem(id) {
        if (!confirm('Hapus menu item ini?')) return;
        router.delete(route('menu.items.destroy', id));
    }

    return (
        <AppLayout title="Manajemen Menu F&B">
            {catModal && (
                <CategoryModal
                    category={catModal === 'new' ? null : catModal}
                    onClose={() => setCatModal(null)}
                />
            )}
            {itemModal && (
                <ItemModal
                    item={itemModal === 'new' ? null : itemModal}
                    categories={allCategories}
                    onClose={() => setItemModal(null)}
                />
            )}

            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="mb-0">Menu F&B</h4>
                <div className="d-flex gap-2">
                    {canCreateMenu && (
                        <>
                            <button className="btn btn-outline-primary btn-sm" onClick={() => setCatModal('new')}>
                                <i className="bi bi-folder-plus me-1" />Kategori
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setItemModal('new')}>
                                <i className="bi bi-plus-circle me-1" />Menu Item
                            </button>
                        </>
                    )}
                </div>
            </div>

            {categories.length === 0 && (
                <div className="alert alert-info">Belum ada kategori menu. Tambahkan kategori terlebih dahulu.</div>
            )}

            {categories.map(cat => (
                <div key={cat.id} className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-0">
                                {cat.name}
                                {!cat.is_active && <span className="badge bg-secondary ms-2">Nonaktif</span>}
                            </h6>
                            {cat.description && <small className="text-muted">{cat.description}</small>}
                        </div>
                        <div className="d-flex align-items-center gap-1">
                            {canUpdateMenu && (
                                <button className="btn btn-icon btn-link text-warning p-1 mb-0 border-0" onClick={() => setCatModal(cat)} title="Edit Kategori">
                                    <i className="bi bi-pencil fs-6" />
                                </button>
                            )}
                            {canDeleteMenu && (
                                <button className="btn btn-icon btn-link text-danger p-1 mb-0 border-0" onClick={() => deleteCategory(cat.id)} title="Hapus Kategori">
                                    <i className="bi bi-trash fs-6" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4" style={{ width: '10%' }}>Kode</th>
                                    <th style={{ width: '22%' }}>Nama</th>
                                    <th style={{ width: '33%' }}>Deskripsi</th>
                                    <th style={{ width: '10%' }}>Satuan</th>
                                    <th className="text-end" style={{ width: '12%' }}>Harga</th>
                                    <th className="text-center" style={{ width: '8%' }}>Tersedia</th>
                                    <th className="text-center pe-4" style={{ width: '5%' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cat.items?.length === 0 && (
                                    <tr><td colSpan="7" className="text-center text-muted py-4">Belum ada item</td></tr>
                                )}
                                {cat.items?.map(item => {
                                    const availableBadge = item.is_available 
                                        ? 'bg-success bg-opacity-10 text-success border border-success-subtle' 
                                        : 'bg-body-secondary text-secondary border border-secondary-subtle';

                                    return (
                                        <tr key={item.id}>
                                            <td className="ps-4"><code>{item.code}</code></td>
                                            <td><span className="fw-semibold text-body">{item.name}</span></td>
                                            <td><span className="text-body-secondary" style={{ fontSize: '0.85rem' }}>{item.description ?? '—'}</span></td>
                                            <td><span className="text-body" style={{ fontSize: '0.85rem' }}>{item.unit}</span></td>
                                            <td className="text-end"><span className="fw-medium">Rp {Number(item.price).toLocaleString('id-ID')}</span></td>
                                            <td className="text-center">
                                                <span className={`badge ${availableBadge} px-2 py-1`} style={{ fontSize: '0.7rem' }}>
                                                    {item.is_available ? 'Ya' : 'Tidak'}
                                                </span>
                                            </td>
                                            <td className="text-center pe-4">
                                                <div className="d-flex align-items-center justify-content-center gap-1">
                                                    {canUpdateMenu && (
                                                        <button className="btn btn-icon btn-link text-warning p-1 mb-0 border-0" onClick={() => setItemModal(item)} title="Edit Item">
                                                            <i className="bi bi-pencil fs-6" />
                                                        </button>
                                                    )}
                                                    {canDeleteMenu && (
                                                        <button className="btn btn-icon btn-link text-danger p-1 mb-0 border-0" onClick={() => deleteItem(item.id)} title="Hapus Item">
                                                            <i className="bi bi-trash fs-6" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </AppLayout>
    );
}
