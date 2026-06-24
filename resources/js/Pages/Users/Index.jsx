import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Index({ users, roles }) {
    const [search, setSearch] = useState('');

    function destroy(user) {
        if (confirm(`Hapus user "${user.name}"?`)) {
            router.delete(route('users.destroy', user.id));
        }
    }

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout title="User Management" breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Users' }]}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Daftar User</h4>
                    <Link href={route('users.create')} className="btn btn-primary btn-sm">
                        <i className="bi bi-plus-lg me-1"></i> Tambah User
                    </Link>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <input type="text" className="form-control" placeholder="Cari nama atau username..."
                            value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
                    </div>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr><th>#</th><th>Nama</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="text-center text-muted">Tidak ada data user.</td></tr>
                            )}
                            {filtered.map((user, i) => (
                                <tr key={user.id}>
                                    <td>{i + 1}</td>
                                    <td>{user.name}</td>
                                    <td><code>{user.username}</code></td>
                                    <td>{user.email}</td>
                                    <td>
                                        {user.roles?.map(r => (
                                            <span key={r.id} className="badge bg-info text-dark me-1">{r.name}</span>
                                        ))}
                                    </td>
                                    <td>
                                        <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                                            {user.is_active ? 'Aktif' : 'Non-aktif'}
                                        </span>
                                    </td>
                                    <td>
                                        <Link href={route('users.edit', user.id)} className="btn btn-sm btn-warning me-1">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button className="btn btn-sm btn-danger" onClick={() => destroy(user)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
