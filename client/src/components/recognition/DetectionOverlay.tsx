import React from 'react';
import { Person } from '@/types';

interface DetectionOverlayProps {
  person: Person | null;
  isUnknown: boolean;
  confidence: number;
}

const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ 
  person, 
  isUnknown,
  confidence 
}) => {
  if (!person && !isUnknown) return null;

  return (
    <>
      {/* Face detection box */}
      <div 
        className="face-box animate-pulse"
        style={{ 
          position: 'absolute',
          top: '120px', 
          left: '270px', 
          width: '160px', 
          height: '160px',
          border: `2px solid ${person ? '#3B82F6' : '#F59E0B'}`,
          backgroundColor: `${person ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)'}`
        }}
      ></div>
      
      {/* Recognition result overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="text-white">
          <p className="font-medium text-lg">
            {person ? person.name : 'Unknown Person'}
          </p>
          <p className="text-sm">
            {person 
              ? `Recognized with ${confidence}% confidence` 
              : 'Not recognized - Capture saved to history'
            }
          </p>
        </div>
      </div>
    </>
  );
};

export default DetectionOverlay;
