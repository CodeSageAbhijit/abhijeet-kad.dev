import React from 'react';
import useIsMobile from '../hooks/useIsMobile';
import LightModePrankDesktop from './LightModePrankDesktop';
import LightModePrankMobile from './LightModePrankMobile';

const LightModePrank = ({ onClose }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <LightModePrankMobile onClose={onClose} />;
  }

  return <LightModePrankDesktop onClose={onClose} />;
};

export default LightModePrank;
