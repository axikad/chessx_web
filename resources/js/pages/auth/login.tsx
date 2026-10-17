import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

import AdminAuthLayout from '@/apex/components/layout/AdminAuthLayout';
import InputError from '@/components/input-error';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    googleClientId?: string;
    appleAuthorization?: AppleAuthorizationConfiguration;
}

interface AppleAuthorizationConfiguration {
    clientId: string;
    redirectUri: string;
    nonce: string;
    nonce_hash: string;
    state: string;
}

interface GoogleCredentialResponse {
    credential: string;
}

interface GoogleIdentityServices {
    accounts: {
        id: {
            initialize: (configuration: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
            renderButton: (
                parent: HTMLElement,
                configuration: {
                    theme: 'outline';
                    size: 'large';
                    shape: 'rectangular';
                    text: 'continue_with';
                    width: number;
                },
            ) => void;
        };
    };
}

interface AppleSignInResponse {
    authorization: {
        id_token: string;
        state: string;
    };
    user?: {
        name?: {
            firstName?: string;
            lastName?: string;
        };
    };
}

interface AppleIdentityServices {
    auth: {
        init: (configuration: { clientId: string; scope: string; redirectURI: string; state: string; nonce: string; usePopup: boolean }) => void;
    };
}

declare global {
    interface Window {
        google?: GoogleIdentityServices;
        AppleID?: AppleIdentityServices;
    }
}

let googleIdentityScript: Promise<void> | null = null;
let appleIdentityScript: Promise<void> | null = null;

function loadGoogleIdentityServices(): Promise<void> {
    if (window.google) {
        return Promise.resolve();
    }

    if (googleIdentityScript) {
        return googleIdentityScript;
    }

    googleIdentityScript = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google Identity Services could not be loaded.'));
        document.head.appendChild(script);
    });

    return googleIdentityScript;
}

function loadAppleIdentityServices(): Promise<void> {
    if (window.AppleID) {
        return Promise.resolve();
    }

    if (appleIdentityScript) {
        return appleIdentityScript;
    }

    appleIdentityScript = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Sign in with Apple JS could not be loaded.'));
        document.head.appendChild(script);
    });

    return appleIdentityScript;
}

export default function Login({ status, canResetPassword, googleClientId, appleAuthorization }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [googleError, setGoogleError] = useState<string>();
    const [googleProcessing, setGoogleProcessing] = useState(false);
    const [appleError, setAppleError] = useState<string>();
    const [appleProcessing, setAppleProcessing] = useState(false);
    const googleButton = useRef<HTMLDivElement>(null);
    const appleButton = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    useEffect(() => {
        if (!googleClientId || !googleButton.current) {
            return;
        }

        let active = true;
        const button = googleButton.current;

        loadGoogleIdentityServices()
            .then(() => {
                if (!active || !window.google) {
                    return;
                }

                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: ({ credential }) => {
                        setGoogleError(undefined);
                        setGoogleProcessing(true);
                        router.post(
                            route('google.login'),
                            { id_token: credential },
                            {
                                onError: (responseErrors) => {
                                    setGoogleError(responseErrors.google ?? responseErrors.id_token ?? 'Google sign-in failed.');
                                },
                                onFinish: () => setGoogleProcessing(false),
                            },
                        );
                    },
                });
                window.google.accounts.id.renderButton(button, {
                    theme: 'outline',
                    size: 'large',
                    shape: 'rectangular',
                    text: 'continue_with',
                    width: 320,
                });
            })
            .catch(() => {
                if (active) {
                    setGoogleError('Google sign-in is temporarily unavailable.');
                    googleIdentityScript = null;
                }
            });

        return () => {
            active = false;
            button.replaceChildren();
        };
    }, [googleClientId]);

    useEffect(() => {
        if (!appleAuthorization || !appleButton.current) {
            return;
        }

        let active = true;
        const button = appleButton.current;
        const handleSuccess = ((event: CustomEvent<{ data: AppleSignInResponse }>) => {
            if (!active) {
                return;
            }

            const response = event.detail.data;

            if (response.authorization.state !== appleAuthorization.state) {
                setAppleError('The Apple sign-in session is invalid. Please try again.');

                return;
            }

            setAppleError(undefined);
            setAppleProcessing(true);
            router.post(
                route('apple.login'),
                {
                    id_token: response.authorization.id_token,
                    nonce: appleAuthorization.nonce,
                    state: response.authorization.state,
                    first_name: response.user?.name?.firstName,
                    last_name: response.user?.name?.lastName,
                },
                {
                    onError: (responseErrors) => {
                        setAppleError(responseErrors.apple ?? responseErrors.id_token ?? 'Apple sign-in failed.');
                    },
                    onFinish: () => setAppleProcessing(false),
                },
            );
        }) as EventListener;
        const handleFailure = (() => {
            if (active) {
                setAppleError('Apple sign-in was cancelled or could not be completed.');
            }
        }) as EventListener;

        document.addEventListener('AppleIDSignInOnSuccess', handleSuccess);
        document.addEventListener('AppleIDSignInOnFailure', handleFailure);

        loadAppleIdentityServices()
            .then(() => {
                if (!active || !window.AppleID) {
                    return;
                }

                window.AppleID.auth.init({
                    clientId: appleAuthorization.clientId,
                    scope: 'name email',
                    redirectURI: appleAuthorization.redirectUri,
                    state: appleAuthorization.state,
                    nonce: appleAuthorization.nonce_hash,
                    usePopup: true,
                });
            })
            .catch(() => {
                if (active) {
                    setAppleError('Apple sign-in is temporarily unavailable.');
                    appleIdentityScript = null;
                }
            });

        return () => {
            active = false;
            document.removeEventListener('AppleIDSignInOnSuccess', handleSuccess);
            document.removeEventListener('AppleIDSignInOnFailure', handleFailure);
            button.replaceChildren();
        };
    }, [appleAuthorization]);

    return (
        <AdminAuthLayout title="Sign in to dashboard" description="Secure administration for your Laravel application">
            <Head title="Log in" />
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        placeholder="email@example.com"
                    />
                    <InputError message={errors.email} />
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Password
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 pr-10 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(event) => setData('remember', event.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    Remember me
                </label>
                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Sign in
                </button>
                {(googleClientId || appleAuthorization) && (
                    <div className="flex items-center gap-3 py-1" aria-hidden="true">
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                        <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">or</span>
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    </div>
                )}
                {googleClientId && (
                    <div className="relative flex min-h-10 justify-center">
                        <div ref={googleButton} aria-label="Continue with Google" />
                        {googleProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center rounded bg-white/90 dark:bg-slate-900/90">
                                <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" aria-label="Signing in with Google" />
                            </div>
                        )}
                    </div>
                )}
                {appleAuthorization && (
                    <>
                        <div className="relative flex min-h-10 justify-center">
                            <div
                                id="appleid-signin"
                                ref={appleButton}
                                className="h-10 w-80 max-w-full"
                                data-color="black"
                                data-border="true"
                                data-type="continue"
                                data-mode="center-align"
                                aria-label="Continue with Apple"
                            />
                            {appleProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center rounded bg-white/90 dark:bg-slate-900/90">
                                    <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" aria-label="Signing in with Apple" />
                                </div>
                            )}
                        </div>
                    </>
                )}
                {googleError && <p className="text-center text-xs font-medium text-red-600">{googleError}</p>}
                {appleError && <p className="text-center text-xs font-medium text-red-600">{appleError}</p>}
                {status && <p className="text-center text-xs font-medium text-emerald-600">{status}</p>}
                <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500 dark:border-slate-800">
                    Need an account?{' '}
                    <Link href={route('register')} className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                        Create one
                    </Link>
                </p>
            </form>
        </AdminAuthLayout>
    );
}
