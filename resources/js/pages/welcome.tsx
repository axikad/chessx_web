import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import ApexApp from '../apex/App';

export default function Welcome() {
    const { auth, site } = usePage<SharedData>().props;

    return <ApexApp currentUser={auth.user} initialSite={site} navigationAccess={{ permissions: auth.permissions }} />;
}
