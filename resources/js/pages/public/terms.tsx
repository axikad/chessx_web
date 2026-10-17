import { Head, usePage } from '@inertiajs/react';

import { LegalDocument, LegalList, LegalSection } from '@/components/public/legal-document';
import PublicLayout from '@/layouts/public-layout';
import type { SharedData, User } from '@/types';

export default function Terms() {
    const { auth, site } = usePage<SharedData>().props;
    const user = auth.user as User | null;

    return (
        <PublicLayout site={site} user={user}>
            <Head title="Terms of Service" />
            <LegalDocument
                title="Terms of Service"
                summary="These terms describe the rules for using Chess Mission accounts, competitions, websites, mobile applications, and APIs."
            >
                <LegalSection title="1. Accepting these terms">
                    <p>
                        By creating an account, signing in, or using Chess Mission, you agree to these Terms of Service and the Privacy Policy. If you
                        do not agree, do not use the service.
                    </p>
                </LegalSection>

                <LegalSection title="2. Eligibility">
                    <p>
                        You must be at least 13 years old and legally able to accept these terms. A higher minimum age or parental consent requirement
                        may apply in your country. You must provide accurate information and comply with applicable laws.
                    </p>
                </LegalSection>

                <LegalSection title="3. Accounts and security">
                    <LegalList>
                        <li>Keep your credentials and devices secure, and notify support if you suspect unauthorised access.</li>
                        <li>Use one account for yourself unless Chess Mission expressly permits another arrangement.</li>
                        <li>Do not impersonate another person or use misleading account information.</li>
                        <li>Your username must follow platform rules and may be changed only at the intervals offered by the service.</li>
                        <li>You are responsible for activity performed through your account unless prohibited by applicable law.</li>
                    </LegalList>
                </LegalSection>

                <LegalSection title="4. Location-based leagues">
                    <p>
                        Your confirmed city determines the competition region where your league journey begins. Location changes may require
                        verification, a cooldown period, or administrative review to protect competitive integrity.
                    </p>
                    <p>
                        Access to State, National, or World leagues is not automatic. Eligibility and promotion may depend on configurable
                        requirements such as completed games, rating, qualification events, conduct, and active account status.
                    </p>
                </LegalSection>

                <LegalSection title="5. Fair play and prohibited conduct">
                    <LegalList>
                        <li>
                            Do not use chess engines, outside assistance, automation, collusion, account sharing, or result manipulation where
                            prohibited by match rules.
                        </li>
                        <li>Do not harass, threaten, discriminate against, exploit, or impersonate other users.</li>
                        <li>Do not probe, disrupt, reverse engineer, overload, or bypass the security or access controls of Chess Mission.</li>
                        <li>Do not submit unlawful, infringing, deceptive, or harmful content.</li>
                        <li>Do not manipulate ratings, promotions, rewards, advertisements, tournaments, or leaderboards.</li>
                    </LegalList>
                </LegalSection>

                <LegalSection title="6. Games, ratings, and decisions">
                    <p>
                        Chess Mission’s server records are authoritative for accepted moves, clocks, game results, ratings, eligibility, rankings, and
                        promotion status. Technical failures, suspected cheating, abandoned games, or disputes may be reviewed and corrected.
                    </p>
                    <p>
                        Ratings, ranks, missions, virtual balances, and league access are features of the service. They do not have monetary value
                        unless separate written rules expressly state otherwise.
                    </p>
                </LegalSection>

                <LegalSection title="7. User content">
                    <p>
                        You retain ownership of content you submit. You grant Chess Mission a limited licence to host, process, display, reproduce,
                        and moderate that content as needed to operate, secure, and improve the service. You must have the rights needed to submit it.
                    </p>
                </LegalSection>

                <LegalSection title="8. Platform ownership">
                    <p>
                        Chess Mission and its licensors retain rights in the platform, software, branding, artwork, documentation, and other service
                        materials. These terms provide a limited, personal, revocable, non-transferable right to use the service; they do not transfer
                        ownership.
                    </p>
                </LegalSection>

                <LegalSection title="9. Suspension and termination">
                    <p>
                        Chess Mission may restrict, suspend, or terminate access where reasonably necessary to enforce these terms, protect players,
                        investigate abuse, comply with law, or preserve platform integrity. Where appropriate, users may receive notice or an
                        opportunity to appeal.
                    </p>
                    <p>
                        You may stop using the service and request account deletion. Provisions that by their nature should survive termination may
                        continue to apply.
                    </p>
                </LegalSection>

                <LegalSection title="10. Service availability and changes">
                    <p>
                        Features may be added, changed, suspended, or discontinued as Chess Mission develops. Scheduled maintenance, internet
                        conditions, third-party services, and unexpected failures may affect availability. We do not guarantee uninterrupted or
                        error-free operation.
                    </p>
                </LegalSection>

                <LegalSection title="11. Disclaimers and liability">
                    <p>
                        To the extent permitted by law, Chess Mission is provided “as is” and “as available” without warranties that cannot be
                        supported. Liability limitations, governing law, dispute procedures, and any mandatory consumer rights must be finalised by
                        the operator with qualified legal counsel before launch.
                    </p>
                </LegalSection>

                <LegalSection title="12. Changes and contact">
                    <p>
                        We may update these terms as the service changes. Material updates will be communicated through an appropriate channel, and
                        continued use after the effective date may constitute acceptance where permitted by law. Questions can be submitted through
                        the official Chess Mission support channel.
                    </p>
                </LegalSection>
            </LegalDocument>
        </PublicLayout>
    );
}
