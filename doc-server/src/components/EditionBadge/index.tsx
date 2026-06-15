import React from 'react';

type Tier = 'community' | 'enterprise' | 'cloud';

function Badge({tier, label}: {tier: Tier; label: string}): JSX.Element {
  return (
    <span className={`edition-badge edition-badge--${tier}`} title={`Available in the ${label} edition`}>
      {label}
    </span>
  );
}

/** Inline badge marking a feature as available in the free, open-source Community edition. */
export function Community(): JSX.Element {
  return <Badge tier="community" label="Community" />;
}

/** Inline badge marking a feature as requiring a NudgeBee Enterprise license. */
export function Enterprise(): JSX.Element {
  return <Badge tier="enterprise" label="Enterprise" />;
}

/** Inline badge marking a feature as available on NudgeBee Cloud (SaaS). */
export function Cloud(): JSX.Element {
  return <Badge tier="cloud" label="Cloud" />;
}
