import type { HTMLAttributes } from 'react';

import { Trans } from '@lingui/react/macro';
import { CreditCard, Globe2Icon, Settings, Settings2, Users } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router';

import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

export type TeamSettingsNavDesktopProps = HTMLAttributes<HTMLDivElement>;

export const TeamSettingsNavDesktop = ({ className, ...props }: TeamSettingsNavDesktopProps) => {
  const { pathname } = useLocation();
  const params = useParams();

  const teamUrl = typeof params?.teamUrl === 'string' ? params?.teamUrl : '';

  const settingsPath = `/t/${teamUrl}/settings`;
  const preferencesPath = `/t/${teamUrl}/settings/preferences`;
  const publicProfilePath = `/t/${teamUrl}/settings/public-profile`;
  const membersPath = `/t/${teamUrl}/settings/members`;
  const tokensPath = `/t/${teamUrl}/settings/tokens`;
  const webhooksPath = `/t/${teamUrl}/settings/webhooks`;
  const billingPath = `/t/${teamUrl}/settings/billing`;

  return (
    <div className={cn('flex flex-col gap-y-2', className)} {...props}>
      <Link to={settingsPath}>
        <Button
          variant="ghost"
          className={cn('w-full justify-start', pathname === settingsPath && 'bg-secondary')}
        >
          <Settings className="mr-2 h-5 w-5" />
          <Trans>General</Trans>
        </Button>
      </Link>

      <Link to={preferencesPath}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith(preferencesPath) && 'bg-secondary',
          )}
        >
          <Settings2 className="mr-2 h-5 w-5" />

          <Trans>Preferences</Trans>
        </Button>
      </Link>

      <Link to={publicProfilePath}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith(publicProfilePath) && 'bg-secondary',
          )}
        >
          <Globe2Icon className="mr-2 h-5 w-5" />
          <Trans>Public Profile</Trans>
        </Button>
      </Link>

      <Link to={membersPath}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith(membersPath) && 'bg-secondary',
          )}
        >
          <Users className="mr-2 h-5 w-5" />
          <Trans>Members</Trans>
        </Button>
      </Link>

      {/* <Link to={tokensPath}>
        <Button
          variant="ghost"
          className={cn('w-full justify-start', pathname?.startsWith(tokensPath) && 'bg-secondary')}
        >
          <Braces className="mr-2 h-5 w-5" />
          <Trans>API Tokens</Trans>
        </Button>
      </Link>

      <Link to={webhooksPath}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith(webhooksPath) && 'bg-secondary',
          )}
        >
          <Webhook className="mr-2 h-5 w-5" />
          <Trans>Webhooks</Trans>
        </Button>
      </Link> */}

      {IS_BILLING_ENABLED() && (
        <Link to={billingPath}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start',
              pathname?.startsWith(billingPath) && 'bg-secondary',
            )}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            <Trans>Billing</Trans>
          </Button>
        </Link>
      )}
    </div>
  );
};
