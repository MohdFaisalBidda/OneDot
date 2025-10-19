/**
 * Utility functions for consistent status and category color indicators
 * across the application. These can be used for badges, progress bars, etc.
 */

/**
 * Get status badge styling with color indicators
 * @param status - The status value (ACHIEVED, PARTIALLY_ACHIEVED, NOT_ACHIEVED, PENDING)
 * @returns CSS classes for status badge styling
 */
export const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case 'ACHIEVED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'PARTIALLY_ACHIEVED':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'NOT_ACHIEVED':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'PENDING':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

/**
 * Get formatted status text
 * @param status - The status value
 * @returns Human-readable status text
 */
export const getStatusText = (status: string): string => {
  return status.replace(/_/g, ' ');
};

/**
 * Get decision category color (light blend for progress bars)
 * @param category - The category value (CAREER, HEALTH, FINANCE, etc.)
 * @returns CSS class for category color
 */
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    CAREER: 'bg-blue-200',
    HEALTH: 'bg-green-200',
    FINANCE: 'bg-yellow-200',
    RELATIONSHIPS: 'bg-pink-200',
    LIFESTYLE: 'bg-purple-200',
    GENERAL: 'bg-gray-200',
    OTHER: 'bg-orange-200'
  };
  return colors[category] || 'bg-gray-200';
};

/**
 * Get category icon emoji
 * @param category - The category value
 * @returns Emoji icon for the category
 */
export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    CAREER: '💼',
    HEALTH: '❤️',
    FINANCE: '💰',
    RELATIONSHIPS: '👥',
    LIFESTYLE: '🌟',
    GENERAL: '📌',
    OTHER: '✨'
  };
  return icons[category] || '📌';
};

/**
 * Get mood color (light blend for progress bars)
 * @param mood - The mood value (Happy, Calm, Focused, etc.)
 * @returns CSS class for mood color
 */
export const getMoodColor = (mood: string): string => {
  const colors: Record<string, string> = {
    'Happy': 'bg-yellow-200',
    'Excited': 'bg-orange-200',
    'Calm': 'bg-blue-200',
    'Focused': 'bg-indigo-200',
    'Energized': 'bg-green-200',
    'Tired': 'bg-gray-200',
    'Stressed': 'bg-red-200',
    'Anxious': 'bg-purple-200',
    'Peaceful': 'bg-teal-200',
    'Motivated': 'bg-lime-200'
  };
  return colors[mood] || 'bg-gray-200';
};

/**
 * Get mood emoji icon
 * @param mood - The mood value
 * @returns Emoji icon for the mood
 */
export const getMoodIcon = (mood: string): string => {
  const icons: Record<string, string> = {
    'Happy': '😊',
    'Excited': '🤩',
    'Calm': '😌',
    'Focused': '🎯',
    'Energized': '⚡',
    'Tired': '😴',
    'Stressed': '😰',
    'Anxious': '😟',
    'Peaceful': '🕊️',
    'Motivated': '💪'
  };
  return icons[mood] || '😊';
};
