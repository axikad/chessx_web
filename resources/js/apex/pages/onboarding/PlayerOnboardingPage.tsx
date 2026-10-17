import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Check, CheckCircle2, ChevronRight, LocateFixed, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useToast } from '../../context/ToastContext';
import { ApiError, apiRequest } from '../../services/apiClient';
import {
    type LocationCandidate,
    type PlayerPlace,
    playerLocationService,
} from '../../services/playerLocationService';

export const PlayerOnboardingPage: React.FC = () => {
    const { auth } = usePage<SharedData>().props;
    const { toast } = useToast();
    const navigate = useNavigate();
    const [username, setUsername] = useState(auth.user.username);
    const [usernameError, setUsernameError] = useState<string>();
    const [usernameConfirmed, setUsernameConfirmed] = useState(false);
    const [savingUsername, setSavingUsername] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [resolvingLocation, setResolvingLocation] = useState(false);
    const [confirmingLocation, setConfirmingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string>();
    const [resolutionToken, setResolutionToken] = useState<string>();
    const [candidates, setCandidates] = useState<LocationCandidate[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<number>();
    const [confirmedLocation, setConfirmedLocation] = useState<PlayerPlace>();

    useEffect(() => {
        playerLocationService.snapshot()
            .then(({ data }) => {
                if (data.current) {
                    setConfirmedLocation(data.current);
                    setUsernameConfirmed(true);
                }
            })
            .catch((error) => {
                setLocationError(error instanceof Error ? error.message : 'Could not load your location status.');
            })
            .finally(() => setLoadingLocation(false));
    }, []);

    const confirmUsername = async (event: React.FormEvent) => {
        event.preventDefault();
        setSavingUsername(true);
        setUsernameError(undefined);

        try {
            await apiRequest('/settings/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    name: auth.user.name,
                    username,
                    email: auth.user.email,
                    display_name: auth.user.profile.display_name,
                    language: auth.user.profile.language,
                    timezone: auth.user.profile.timezone,
                    date_of_birth: auth.user.profile.date_of_birth,
                    profile_visibility: auth.user.profile.profile_visibility,
                }),
            });
            setUsernameConfirmed(true);
            toast.success('Username confirmed', 'Now confirm your home city to unlock City League eligibility.');
        } catch (error) {
            if (error instanceof ApiError) {
                setUsernameError(error.errors.username?.[0]);
            }
            toast.error(error instanceof Error ? error.message : 'Could not confirm your username.');
        } finally {
            setSavingUsername(false);
        }
    };

    const resolveLocation = () => {
        setLocationError(undefined);

        if (!navigator.geolocation) {
            setLocationError('Location services are not supported by this browser.');
            return;
        }

        setResolvingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const response = await playerLocationService.resolve(coords.latitude, coords.longitude);
                    setResolutionToken(response.data.resolutionToken);
                    setCandidates(response.data.candidates);
                    setSelectedCityId(response.data.candidates[0]?.cityId);
                } catch (error) {
                    setLocationError(error instanceof Error ? error.message : 'Could not find a supported city nearby.');
                } finally {
                    setResolvingLocation(false);
                }
            },
            (error) => {
                setLocationError(error.code === error.PERMISSION_DENIED
                    ? 'Allow location access in your browser to confirm your home city.'
                    : 'Your location could not be detected. Check location services and try again.');
                setResolvingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
    };

    const confirmHomeCity = async () => {
        if (!resolutionToken || !selectedCityId) {
            return;
        }

        setConfirmingLocation(true);
        setLocationError(undefined);

        try {
            const response = await playerLocationService.confirm(resolutionToken, selectedCityId);
            setConfirmedLocation(response.data);
            setCandidates([]);
            toast.success('Home city confirmed', 'Your City League eligibility is now available.');
        } catch (error) {
            setLocationError(error instanceof Error ? error.message : 'Could not confirm your home city.');
        } finally {
            setConfirmingLocation(false);
        }
    };

    const isComplete = usernameConfirmed && confirmedLocation !== undefined;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <PageHeader
                title="Set up your ChessX player account"
                subtitle="Confirm your player identity and home city before entering competition."
                breadcrumbs={[{ label: 'Player Onboarding' }]}
            />

            <div className="grid gap-3 sm:grid-cols-3">
                {[
                    { label: 'Account created', complete: true },
                    { label: 'Username confirmed', complete: usernameConfirmed },
                    { label: 'Home city confirmed', complete: confirmedLocation !== undefined },
                ].map((step, index) => (
                    <div key={step.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${step.complete ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${step.complete ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                            {step.complete ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{step.label}</span>
                    </div>
                ))}
            </div>

            {isComplete ? (
                <Card className="overflow-hidden border-emerald-200 dark:border-emerald-900/60">
                    <CardBody className="flex flex-col items-center gap-5 py-12 text-center">
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-8 w-8" />
                        </span>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Your player account is ready</h2>
                            <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
                                @{username} is registered in {confirmedLocation.city}, {confirmedLocation.state}. Your City League eligibility has been unlocked.
                            </p>
                        </div>
                        <Button onClick={() => navigate('/')} rightIcon={<ChevronRight className="h-4 w-4" />}>
                            Go to Dashboard
                        </Button>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className={usernameConfirmed ? 'border-emerald-200 dark:border-emerald-900/60' : ''}>
                        <CardHeader
                            title={<span className="flex items-center gap-2"><UserRound className="h-5 w-5 text-indigo-500" />Confirm your username</span>}
                            description="This unique name identifies you in games and leaderboards."
                            action={usernameConfirmed ? <Badge variant="success">Confirmed</Badge> : <Badge variant="primary">Step 1</Badge>}
                        />
                        <CardBody>
                            <form className="space-y-5" onSubmit={confirmUsername}>
                                <Input
                                    label="Player username"
                                    value={username}
                                    disabled={usernameConfirmed}
                                    onChange={(event) => setUsername(event.target.value.toLowerCase())}
                                    error={usernameError}
                                    helperText="Use 3–30 lowercase letters, numbers, or underscores."
                                    autoComplete="username"
                                    required
                                />
                                {!usernameConfirmed && (
                                    <Button type="submit" className="w-full" isLoading={savingUsername} rightIcon={<ChevronRight className="h-4 w-4" />}>
                                        Confirm Username
                                    </Button>
                                )}
                            </form>
                        </CardBody>
                    </Card>

                    <Card className={confirmedLocation ? 'border-emerald-200 dark:border-emerald-900/60' : ''}>
                        <CardHeader
                            title={<span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-indigo-500" />Confirm your home city</span>}
                            description="Your verified city determines your first competition region."
                            action={confirmedLocation ? <Badge variant="success">Confirmed</Badge> : <Badge variant="primary">Step 2</Badge>}
                        />
                        <CardBody className="space-y-5">
                            {loadingLocation ? (
                                <div className="h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                            ) : !usernameConfirmed ? (
                                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
                                    Confirm your username first to continue.
                                </div>
                            ) : candidates.length === 0 ? (
                                <div className="space-y-4">
                                    <div className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs leading-relaxed text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-200">
                                        <ShieldCheck className="h-5 w-5 shrink-0" />
                                        <p>Your coordinates are used only to find nearby supported cities. ChessX stores the city you confirm, not your raw GPS coordinates.</p>
                                    </div>
                                    <Button className="w-full" onClick={resolveLocation} isLoading={resolvingLocation} leftIcon={<LocateFixed className="h-4 w-4" />}>
                                        Find Nearby Cities
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <fieldset className="space-y-2">
                                        <legend className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Select the correct city</legend>
                                        {candidates.map((candidate) => (
                                            <label key={candidate.cityId} className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-3 transition-colors ${selectedCityId === candidate.cityId ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30' : 'border-slate-200 hover:border-indigo-200 dark:border-slate-800'}`}>
                                                <span className="flex items-center gap-3">
                                                    <input type="radio" name="home-city" checked={selectedCityId === candidate.cityId} onChange={() => setSelectedCityId(candidate.cityId)} className="text-indigo-600 focus:ring-indigo-500" />
                                                    <span>
                                                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{candidate.city}</span>
                                                        <span className="block text-xs text-slate-500">{candidate.state}, {candidate.country}</span>
                                                    </span>
                                                </span>
                                                <Badge variant="neutral">{candidate.distanceKm.toFixed(1)} km</Badge>
                                            </label>
                                        ))}
                                    </fieldset>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1" onClick={resolveLocation} isLoading={resolvingLocation}>Try Again</Button>
                                        <Button className="flex-1" onClick={confirmHomeCity} isLoading={confirmingLocation}>Confirm City</Button>
                                    </div>
                                </div>
                            )}

                            {locationError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">{locationError}</p>}
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
};
