import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Selamat datang di PPKD Hotel</h5>
                            <p className="text-muted">Dashboard sedang dalam pengembangan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
