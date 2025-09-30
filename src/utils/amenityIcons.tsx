import React from 'react';
import { 
  Wifi, 
  Car, 
  Lock, 
  Droplets, 
  Snowflake, 
  Gamepad2, 
  GraduationCap, 
  Utensils, 
  ShoppingBag, 
  Heart, 
  Shield, 
  Camera, 
  Accessibility, 
  Building2 
} from 'lucide-react';

/**
 * Utility function to get amenity icon component based on icon names
 */
export const getAmenityIcon = (iconName: string | null, className: string = 'text-sm bg-gray-100 px-2 py-1 rounded') => {
  const iconMap: Record<string, React.ReactNode> = {
    // Basic Amenities
    'wifi': <Wifi className="h-4 w-4" />,
    'parking': <Car className="h-4 w-4" />,
    'locker': <Lock className="h-4 w-4" />,
    'shower': <Droplets className="h-4 w-4" />,
    'ac': <Snowflake className="h-4 w-4" />,
    
    // Premium Amenities
    'equipment': <Gamepad2 className="h-4 w-4" />,
    'coach': <GraduationCap className="h-4 w-4" />,
    'food': <Utensils className="h-4 w-4" />,
    'shop': <ShoppingBag className="h-4 w-4" />,
    
    // Safety Amenities
    'first-aid': <Heart className="h-4 w-4" />,
    'security': <Shield className="h-4 w-4" />,
    'camera': <Camera className="h-4 w-4" />,
    
    // Accessibility Amenities
    'wheelchair': <Accessibility className="h-4 w-4" />,
    'disabled-parking': <Car className="h-4 w-4" />,
    'elevator': <Building2 className="h-4 w-4" />,
  };

  const icon = iconName ? iconMap[iconName] || <Building2 className="h-4 w-4" /> : <Building2 className="h-4 w-4" />;
  
  return (
    <span className={className}>
      {icon}
    </span>
  );
};
