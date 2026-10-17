import { Head, usePage } from '@inertiajs/react';

import { LegalDocument, LegalList, LegalSection } from '@/components/public/legal-document';
import PublicLayout from '@/layouts/public-layout';
import type { SharedData, User } from '@/types';

export default function PrivacyPolicy() {
    const { auth, site } = usePage<SharedData>().props;
    const user = auth.user as User | null;

    return (
        <PublicLayout site={site} user={user}>
            <Head title="Privacy Policy" />
            <LegalDocument
                title="Privacy Policy"
                summary="This policy explains the information Chess Mission processes, why it is needed, and the choices available to players."
            >
                <LegalSection title="1. Scope">
                    <p>
                        This Privacy Policy applies to the Chess Mission website, mobile applications, APIs, player accounts, competitions, and
                        related support services.
                    </p>
                </LegalSection>

                <LegalSection title="2. Information we process">
                    <LegalList>
                        <li>
                            <strong className="text-white">Account information:</strong> name, username, email address, optional phone number,
                            password hash, verification status, and account status.
                        </li>
                        <li>
                            <strong className="text-white">Profile information:</strong> display name, avatar, language, timezone, optional date of
                            birth, and profile visibility preference.
                        </li>
                        <li>
                            <strong className="text-white">Sign-in information:</strong> Google or Apple account identifiers when you choose social
                            sign-in. Chess Mission does not receive your Google or Apple password.
                        </li>
                        <li>
                            <strong className="text-white">Location information:</strong> your confirmed country, state, and city. When you choose
                            GPS-assisted setup, coordinates are processed to suggest nearby supported cities; Chess Mission stores the city you
                            confirm rather than your submitted raw GPS coordinates.
                        </li>
                        <li>
                            <strong className="text-white">Device and session information:</strong> platform, device identifier, session records,
                            refresh-token hashes, notification tokens, IP address, and security timestamps.
                        </li>
                        <li>
                            <strong className="text-white">Competition activity:</strong> league eligibility, ratings, games, moves, results,
                            rankings, tournament participation, promotion history, and mission progress as those features become available.
                        </li>
                        <li>
                            <strong className="text-white">Safety and support information:</strong> reports, disputes, anti-cheat indicators,
                            moderation decisions, audit records, and communications with support.
                        </li>
                    </LegalList>
                </LegalSection>

                <LegalSection title="3. How we use information">
                    <LegalList>
                        <li>Authenticate accounts, operate sessions, and provide account recovery.</li>
                        <li>Create player profiles and place players in the appropriate location-based competition structure.</li>
                        <li>Operate ratings, leaderboards, games, tournaments, qualifications, and promotions.</li>
                        <li>Protect players, prevent fraud and cheating, enforce platform rules, and investigate disputes.</li>
                        <li>Send requested login codes, service notices, security alerts, and enabled notifications.</li>
                        <li>Maintain, troubleshoot, measure, and improve Chess Mission.</li>
                        <li>Comply with legal obligations and respond to valid legal requests.</li>
                    </LegalList>
                </LegalSection>

                <LegalSection title="4. When information may be shared">
                    <p>
                        Information may be shared with infrastructure, email, notification, security, analytics, and support providers only where
                        needed to operate Chess Mission. If you use Google or Apple sign-in, those providers process the sign-in interaction under
                        their own policies.
                    </p>
                    <p>
                        Information may also be disclosed when required by law, to protect users or the platform, or as part of a merger, financing,
                        acquisition, or transfer of the service. Chess Mission does not currently sell personal information.
                    </p>
                </LegalSection>

                <LegalSection title="5. Retention and account deletion">
                    <p>
                        Information is kept only as long as reasonably needed to operate the service, meet security and legal obligations, resolve
                        disputes, and enforce agreements. Retention periods may differ by record type.
                    </p>
                    <p>
                        You may request account deletion through available account settings or the official support channel. Some records may be
                        retained where required for security, fraud prevention, legal compliance, or legitimate dispute resolution. Deleted accounts
                        may first enter a limited recovery period before permanent removal or anonymisation.
                    </p>
                </LegalSection>

                <LegalSection title="6. Your choices and rights">
                    <p>
                        Depending on applicable law, you may have rights to access, correct, export, restrict, object to, or delete personal
                        information. You can update supported profile details in account settings, manage device permissions through your operating
                        system, and revoke Google or Apple access from the relevant provider.
                    </p>
                </LegalSection>

                <LegalSection title="7. Security">
                    <p>
                        Chess Mission uses technical and organisational safeguards designed to protect account information, including hashed passwords
                        and refresh tokens, access controls, rate limits, audit records, and encrypted transport in production. No service can
                        guarantee absolute security.
                    </p>
                </LegalSection>

                <LegalSection title="8. Children">
                    <p>
                        Chess Mission is not intended for children under 13. Where a higher minimum age or parental consent requirement applies in a
                        player’s country, that local requirement must also be followed.
                    </p>
                </LegalSection>

                <LegalSection title="9. International processing">
                    <p>
                        Service providers may process information in countries other than your own. Where required, Chess Mission will use appropriate
                        safeguards for international transfers.
                    </p>
                </LegalSection>

                <LegalSection title="10. Policy changes and contact">
                    <p>
                        We may update this policy as Chess Mission develops. Material changes will be communicated through the website, application,
                        or another appropriate channel. Questions and privacy requests can be submitted through the official Chess Mission support
                        channel published in the application or on the Contact page.
                    </p>
                </LegalSection>
            </LegalDocument>
        </PublicLayout>
    );
}
