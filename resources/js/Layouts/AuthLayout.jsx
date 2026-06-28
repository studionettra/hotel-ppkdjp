import { Head } from '@inertiajs/react';

export default function AuthLayout({ children, title }) {
    return (
        <>
            <Head title={title} />
            <link rel="stylesheet" href="/dist/assets/compiled/css/auth.css" />
            <div id="auth">
                <div className="row h-100">
                    <div className="col-lg-5 col-12">
                        <div id="auth-left">
                            {children}
                        </div>
                    </div>
                    <div className="col-lg-7 d-none d-lg-block">
                        <div id="auth-right"></div>
                    </div>
                </div>
            </div>
        </>
    );
}
