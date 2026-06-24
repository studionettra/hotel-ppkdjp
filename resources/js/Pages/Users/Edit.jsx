import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Edit({ user, roles }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        role: user.roles?.[0]?.name ?? '',
        is_active: user.is_active,
    });

    function submit(e) {
        e.preventDefault();
        put(route('users.update', user.id));
    }

    return (
        <AppLayout title="Edit User" breadcrumbs={[
            { label: 'Dashboard', href: route('dashboard') },
            { label: 'Users', href: route('users.index') },
            { label: 'Edit' },
        ]}>
            <div className="card">
                <div className="card-header"><h4 className="card-title">Edit User: {user.name}</h4></div>
                <div className="card-body">
                    <form onSubmit={submit} style={{ maxWidth: 540 }}>
                        {[
                            { key: 'name', label: 'Nama Lengkap', type: 'text' },
                            { key: 'username', label: 'Username', type: 'text' },
                            { key: 'email', label: 'Email', type: 'email' },
                        ].map(f => (
                            <div className="mb-3" key={f.key}>
                                <label className="form-label">{f.label} <span className="text-danger">*</span></label>
                                <input type={f.type} className={`form-control${errors[f.key] ? ' is-invalid' : ''}`}
                                    value={data[f.key]} onChange={e => setData(f.key, e.target.value)} />
                                {errors[f.key] && <div className="invalid-feedback">{errors[f.key]}</div>}
                            </div>
                        ))}
                        <div className="mb-3">
                            <label className="form-label">Password <small className="text-muted">(kosongkan jika tidak diubah)</small></label>
                            <input type="password" className={`form-control${errors.password ? ' is-invalid' : ''}`}
                                value={data.password} onChange={e => setData('password', e.target.value)}
                                autoComplete="new-password" />
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Role <span className="text-danger">*</span></label>
                            <select className={`form-select${errors.role ? ' is-invalid' : ''}`}
                                value={data.role} onChange={e => setData('role', e.target.value)}>
                                <option value="">-- Pilih Role --</option>
                                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                            {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                        </div>
                        <div className="mb-3 form-check">
                            <input type="checkbox" className="form-check-input" id="is_active"
                                checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                            <label className="form-check-label" htmlFor="is_active">Aktif</label>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={processing}>Perbarui</button>
                            <Link href={route('users.index')} className="btn btn-secondary">Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
