// import { Trans } from '@lingui/react/macro';
import { Link, Section, Text } from '../components';

export type TemplateFooterProps = {
  isDocument?: boolean;
};

export const TemplateFooter = ({ isDocument = true }: TemplateFooterProps) => {
  return (
    <Section>
      {isDocument && (
        <Text className="my-4 text-base text-slate-400">
          {/* <Trans> */}
          This document was sent using{' '}
          <Link
            className="text-[#7AC455]"
            href="https://disturbed-tiffanie-latain-27ff5f7d.koyeb.app/"
          >
            LPM.
          </Link>
          {/* </Trans> */}
        </Text>
      )}

      {/* {branding.brandingCompanyDetails ? (
        <Text className="my-8 text-sm text-slate-400">
          {branding.brandingCompanyDetails.split('\n').map((line, idx) => {
            return (
              <>
                {idx > 0 && <br />}
                {line}
              </>
            );
          })}
        </Text>
      )  */}
      <Text className="my-8 text-sm text-slate-400">
        LPM, Inc.
        <br />
        {/* 2261 Market Street, #5211, San Francisco, CA 94114, USA */}
      </Text>
    </Section>
  );
};

export default TemplateFooter;
