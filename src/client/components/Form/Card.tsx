import styled from '@emotion/styled';

import { type ReactNode } from 'react';
import ErrorBoundary from 'client/components/misc/ErrorBoundary';
import Heading from 'client/components/Form/Heading';
import colors from 'client/styles/colors';

export const StyledCard = styled.section<{ styles?: string }>`
  background:
    linear-gradient(150deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
    color-mix(in srgb, ${colors.backgroundLighter} 88%, transparent);
  color: ${colors.textColor};
  border: 1px solid ${colors.primaryTransparent};
  border-radius: 1rem;
  padding: 1.15rem;
  position: relative;
  max-height: 54rem;
  overflow: auto;
  overflow-wrap: anywhere;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 14px 50px rgba(0, 0, 0, 0.17);
  backdrop-filter: blur(15px);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;

  &:hover {
    border-color: color-mix(in srgb, ${colors.primary} 35%, transparent);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.055),
      0 18px 60px rgba(0, 0, 0, 0.24);
    transform: translateY(-2px);
  }
  ${(props) => props.styles}
`;

interface CardProps {
  children: ReactNode;
  heading?: string;
  styles?: string;
  actionButtons?: ReactNode | undefined;
}

export const Card = (props: CardProps): JSX.Element => {
  const { children, heading, styles, actionButtons } = props;
  return (
    <ErrorBoundary title={heading}>
      <StyledCard styles={styles}>
        {actionButtons && actionButtons}
        {heading && (
          <Heading className="inner-heading" as="h3" align="left" color={colors.primary}>
            {heading}
          </Heading>
        )}
        {children}
      </StyledCard>
    </ErrorBoundary>
  );
};

export default StyledCard;
