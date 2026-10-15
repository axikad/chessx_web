import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { SiteBranding } from '../types/site';

const defaults: SiteBranding = { name: 'ChessX', slogan: 'React + Laravel', logo_url: null, favicon_url: null };

type SiteBrandingContextValue = {
    site: SiteBranding;
    setSite: (site: SiteBranding) => void;
};

const SiteBrandingContext = createContext<SiteBrandingContextValue>({ site: defaults, setSite: () => undefined });

function applyDocumentBranding(site: SiteBranding): void {
    document.title = site.name;
    let icon = document.querySelector<HTMLLinkElement>("link[rel='icon']");

    if (!site.favicon_url) {
        icon?.remove();
        return;
    }

    if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        document.head.appendChild(icon);
    }

    icon.href = site.favicon_url;
}

export function SiteBrandingProvider({ children, initialSite }: { children: ReactNode; initialSite: SiteBranding }) {
    const [site, setSiteState] = useState<SiteBranding>({ ...defaults, ...initialSite });
    const setSite = (next: SiteBranding) => {
        setSiteState(next);
        applyDocumentBranding(next);
    };

    useEffect(() => applyDocumentBranding({ ...defaults, ...initialSite }), [initialSite]);

    return <SiteBrandingContext.Provider value={{ site, setSite }}>{children}</SiteBrandingContext.Provider>;
}

export const useSiteBranding = () => useContext(SiteBrandingContext);
