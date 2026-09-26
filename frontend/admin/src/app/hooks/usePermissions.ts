import { useState, useEffect } from 'react';
import { getCurrentUser, hasPermission as checkPermission } from '../data/users';
import type { User } from '../data/users';

export function usePermissions() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    // Listen for user changes
    const interval = setInterval(() => {
      setCurrentUser(getCurrentUser());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const hasPermission = (permission: string): boolean => {
    return checkPermission(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const canCreate = (resource: string): boolean => {
    return hasPermission(`${resource}.create`);
  };

  const canEdit = (resource: string): boolean => {
    return hasPermission(`${resource}.edit`);
  };

  const canDelete = (resource: string): boolean => {
    return hasPermission(`${resource}.delete`);
  };

  const canView = (resource: string): boolean => {
    return hasPermission(`${resource}.view`);
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'super_admin';
  };

  const isBroadcaster = (): boolean => {
    return currentUser?.role === 'organizer';
  };

  const isOrganizer = (): boolean => {
    return currentUser?.role === 'organizer';
  };

  const isKKFOfficer = (): boolean => {
    return currentUser?.role === 'kkf_officer';
  };

  const isViewer = (): boolean => {
    return currentUser?.role === 'club';
  };

  const isClub = (): boolean => {
    return currentUser?.role === 'club';
  };

  const isSuperAdmin = (): boolean => {
    return currentUser?.role === 'kkf_super_admin' || currentUser?.role === 'super_admin';
  };

  const isReferee = (): boolean => {
    return currentUser?.role === 'referee_judge';
  };

  return {
    currentUser,
    /** Edit an event and add fight cards / bouts to it (Super Admin, KKF Officer, Organizer). */
    canEditEvent: hasPermission('events.edit'),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreate,
    canEdit,
    canDelete,
    canView,
    isAdmin,
    isBroadcaster,
    isOrganizer,
    isKKFOfficer,
    isViewer,
    isClub,
    isSuperAdmin,
    isReferee,
  };
}