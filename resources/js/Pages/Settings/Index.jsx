import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const groupLabel = {
    general: 'Informasi Hotel',
    policy:  'Kebijakan Operasional',
    email:   'Konfigurasi Email',
};

export default function Index({ settings }) {
    const { auth } = usePage().props;
    const canUpdate = auth.permissions.includes('settings.update');

    // Group settings
    const grouped = settings.reduce((acc, s) => {
        if (!acc[s.group]) acc[s.group] = [];
        acc[s.group].push(s);
        return acc;
    }, {});

    const { data, setData, put, processing, errors } = useForm({
        settings: settings.map(s => ({ key: s.key, value: s.value ?? '' })),
    });

    function setValue(key, value) {
        setData('settings', data.settings.map(s => s.key === key ? { ...s, value } : s));
    }

    function getValue(key) {
        return data.settings.find(s => s.key === key)?.value ?? '';
    }

    function submit(e) {
        e.preventDefault();
        put(route('settings.update'));
    }

    return (
        <AppLayout title="Pengaturan Sistem">
            <form onSubmit={submit}>
                {Object.entries(grouped).map(([group, items]) => (
                    <div key={group} className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className={`bi ${group === 'general' ? 'bi-building' : group === 'policy' ? 'bi-shield-check' : 'bi-envelope'} me-2`} />
                                {groupLabel[group] ?? group}
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {items.map(setting => (
                                    <div key={setting.key} className="col-md-6 mb-3">
                                        <label className="form-label">{setting.label ?? setting.key}</label>
                                        {setting.key === 'hotel_stars' ? (
                                            <select
                                                className="form-select"
                                                value={getValue(setting.key)}
                                                onChange={e => setValue(setting.key, e.target.value)}
                                                disabled={!canUpdate}
                                            >
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <option key={n} value={String(n)}>{n} Bintang</option>
                                                ))}
                                            </select>
                                        ) : setting.key === 'currency' ? (
                                            <select
                                                className="form-select"
                                                value={getValue(setting.key)}
                                                onChange={e => setValue(setting.key, e.target.value)}
                                                disabled={!canUpdate}
                                            >
                                                <option value="IDR">IDR — Rupiah</option>
                                                <option value="USD">USD — Dollar</option>
                                                <option value="SGD">SGD — Singapore Dollar</option>
                                            </select>
                                        ) : setting.key === 'hotel_address' ? (
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={getValue(setting.key)}
                                                onChange={e => setValue(setting.key, e.target.value)}
                                                disabled={!canUpdate}
                                            />
                                        ) : (
                                            <input
                                                type={
                                                    setting.key.includes('password') ? 'password' :
                                                    setting.key.includes('port') || setting.key.includes('rate') || setting.key.includes('days') ? 'number' :
                                                    setting.key.includes('time') ? 'time' :
                                                    setting.key.includes('email') ? 'email' :
                                                    'text'
                                                }
                                                className={`form-control ${errors[setting.key] ? 'is-invalid' : ''}`}
                                                value={getValue(setting.key)}
                                                onChange={e => setValue(setting.key, e.target.value)}
                                                disabled={!canUpdate}
                                            />
                                        )}
                                        {errors[setting.key] && (
                                            <div className="invalid-feedback">{errors[setting.key]}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {canUpdate && (
                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary px-4" disabled={processing}>
                            {processing ? (
                                <><span className="spinner-border spinner-border-sm me-1" />Menyimpan...</>
                            ) : (
                                <><i className="bi bi-save me-1" />Simpan Pengaturan</>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
