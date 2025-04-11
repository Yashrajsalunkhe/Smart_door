import React, { ReactNode } from 'react';
import { DoorbellProvider } from '@/context/DoorbellContext';

interface DoorbellWrapperProps {
  children: ReactNode;
}

const DoorbellWrapper: React.FC<DoorbellWrapperProps> = ({ children }) => {
  return (
    <DoorbellProvider>
      {children}
    </DoorbellProvider>
  );
};

export default DoorbellWrapper;