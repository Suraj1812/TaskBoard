import React, { useState } from 'react';
import { User } from '../types/kanban';

interface UserAvatarProps {
  user: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  isFilterButton?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'sm',
  showName = false,
  isFilterButton = false,
  isSelected = false,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  if (!user) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 font-medium shrink-0`}
        title="Unassigned"
      >
        ?
      </div>
    );
  }

  const avatarElement = (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border border-slate-200/80 ${sizeClasses} ${
        isSelected ? 'ring-2 ring-blue-600 ring-offset-1' : ''
      }`}
      title={`${user.name} (${user.role})`}
    >
      {user.avatarUrl && !imageError ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-semibold">
          {user.initials}
        </div>
      )}
    </div>
  );

  if (isFilterButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`h-8.5 flex items-center gap-2 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-2xs ${
          isSelected
            ? 'bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 ring-1 ring-blue-500 font-semibold'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
        }`}
        title={`Filter by ${user.name}`}
      >
        {avatarElement}
        <span className="whitespace-nowrap">{user.name.split(' ')[0]}</span>
      </button>
    );
  }

  if (showName) {
    return (
      <div className="flex items-center gap-2">
        {avatarElement}
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-900 truncate">
            {user.name}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{user.role}</p>
        </div>
      </div>
    );
  }

  return avatarElement;
};
