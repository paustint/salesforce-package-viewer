import { UserIdentity } from '@src/types';
import React from 'react';

export function UserAvatar({ user }: { user: UserIdentity }) {
  if (!user) {
    return null;
  }

  return (
    <div className="relative flex items-center space-x-3">
      <div className="flex-shrink-0">
        <img className="h-10 w-10 rounded-full" src={user.photos.thumbnail} alt="Avatar" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="absolute inset-0" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
        <p className="text-sm text-gray-500 truncate">{user.username}</p>
      </div>
    </div>
  );
}
