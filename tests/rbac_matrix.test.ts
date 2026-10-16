import { describe, it, expect } from 'vitest';
import {
  getRolePermissions,
  isTabAllowed,
  getRoleBadge,
  ROLE_PERMISSIONS,
} from '../src/lib/rbac';
import type { OpsRole } from '../src/lib/auth';

describe('Aşama 3: Role-Based Access Control (RBAC) & Security Matrix', () => {
  describe('Owner / Admin Permissions', () => {
    it('grants full system access to owner', () => {
      const perms = getRolePermissions('owner');
      expect(perms.canDeleteBookings).toBe(true);
      expect(perms.canManageUsers).toBe(true);
      expect(perms.canViewFinancialMargins).toBe(true);
      expect(perms.canManageSettings).toBe(true);
      expect(perms.canCreateBookings).toBe(true);
      expect(perms.canAssignTransfers).toBe(true);
      expect(perms.canExportData).toBe(true);
      expect(perms.canManageCms).toBe(true);

      expect(isTabAllowed('users', 'owner')).toBe(true);
      expect(isTabAllowed('finance', 'owner')).toBe(true);
      expect(isTabAllowed('settlements', 'owner')).toBe(true);
      expect(isTabAllowed('settings', 'owner')).toBe(true);
      expect(isTabAllowed('transfers', 'owner')).toBe(true);
      expect(isTabAllowed('bookings', 'owner')).toBe(true);
    });

    it('grants full system access to legacy root admin passcode', () => {
      const perms = getRolePermissions('admin');
      expect(perms.canDeleteBookings).toBe(true);
      expect(perms.canManageUsers).toBe(true);
      expect(perms.canViewFinancialMargins).toBe(true);
      expect(isTabAllowed('users', 'admin')).toBe(true);
    });

    it('defaults undefined or null role to owner permissions for backward compatibility', () => {
      const perms = getRolePermissions(null);
      expect(perms.canDeleteBookings).toBe(true);
      expect(perms.canManageUsers).toBe(true);
      expect(perms.allowedTabs.length).toBe(18);
    });
  });

  describe('Manager / Dispatcher Permissions', () => {
    it('grants operations and CMS access but blocks user mgmt, booking deletion, and financial margins', () => {
      const perms = getRolePermissions('manager');
      expect(perms.canDeleteBookings).toBe(false);
      expect(perms.canManageUsers).toBe(false);
      expect(perms.canViewFinancialMargins).toBe(false);
      expect(perms.canManageSettings).toBe(false);
      expect(perms.canCreateBookings).toBe(true);
      expect(perms.canAssignTransfers).toBe(true);
      expect(perms.canExportData).toBe(true);
      expect(perms.canManageCms).toBe(true);

      // Allowed tabs
      expect(isTabAllowed('overview', 'manager')).toBe(true);
      expect(isTabAllowed('bookings', 'manager')).toBe(true);
      expect(isTabAllowed('transfers', 'manager')).toBe(true);
      expect(isTabAllowed('fleet', 'manager')).toBe(true);
      expect(isTabAllowed('suppliers', 'manager')).toBe(true);
      expect(isTabAllowed('partners', 'manager')).toBe(true);
      expect(isTabAllowed('tours', 'manager')).toBe(true);

      // Forbidden tabs
      expect(isTabAllowed('users', 'manager')).toBe(false);
      expect(isTabAllowed('finance', 'manager')).toBe(false);
      expect(isTabAllowed('settlements', 'manager')).toBe(false);
      expect(isTabAllowed('settings', 'manager')).toBe(false);
    });
  });

  describe('Guide / Field Operations Permissions', () => {
    it('restricts guide strictly to transfers, bookings manifest, and whatsapp', () => {
      const perms = getRolePermissions('guide');
      expect(perms.canDeleteBookings).toBe(false);
      expect(perms.canManageUsers).toBe(false);
      expect(perms.canViewFinancialMargins).toBe(false);
      expect(perms.canManageSettings).toBe(false);
      expect(perms.canCreateBookings).toBe(true);
      expect(perms.canAssignTransfers).toBe(false);
      expect(perms.canExportData).toBe(false);
      expect(perms.canManageCms).toBe(false);
      expect(perms.defaultTab).toBe('transfers');

      // Allowed tabs
      expect(isTabAllowed('transfers', 'guide')).toBe(true);
      expect(isTabAllowed('bookings', 'guide')).toBe(true);
      expect(isTabAllowed('whatsapp', 'guide')).toBe(true);

      // Forbidden tabs
      expect(isTabAllowed('overview', 'guide')).toBe(false);
      expect(isTabAllowed('finance', 'guide')).toBe(false);
      expect(isTabAllowed('settlements', 'guide')).toBe(false);
      expect(isTabAllowed('tours', 'guide')).toBe(false);
      expect(isTabAllowed('users', 'guide')).toBe(false);
      expect(isTabAllowed('settings', 'guide')).toBe(false);
    });
  });

  describe('Driver Permissions', () => {
    it('restricts driver exclusively to transfers manifest', () => {
      const perms = getRolePermissions('driver');
      expect(perms.allowedTabs).toEqual(['transfers']);
      expect(perms.defaultTab).toBe('transfers');
      expect(perms.canDeleteBookings).toBe(false);
      expect(perms.canManageUsers).toBe(false);
      expect(perms.canViewFinancialMargins).toBe(false);
      expect(perms.canCreateBookings).toBe(false);
      expect(perms.canAssignTransfers).toBe(false);
      expect(perms.canExportData).toBe(false);
      expect(perms.canManageCms).toBe(false);

      expect(isTabAllowed('transfers', 'driver')).toBe(true);
      expect(isTabAllowed('bookings', 'driver')).toBe(false);
      expect(isTabAllowed('overview', 'driver')).toBe(false);
      expect(isTabAllowed('finance', 'driver')).toBe(false);
      expect(isTabAllowed('tours', 'driver')).toBe(false);
      expect(isTabAllowed('settings', 'driver')).toBe(false);
      expect(isTabAllowed('users', 'driver')).toBe(false);
    });
  });

  describe('Role Badge presentation', () => {
    it('returns appropriate title and styling badge for each role', () => {
      const ownerBadge = getRoleBadge('owner');
      expect(ownerBadge.label).toContain('Kurucu');
      expect(ownerBadge.shortRole).toBe('Patron');

      const managerBadge = getRoleBadge('manager');
      expect(managerBadge.label).toContain('Dispatcher');
      expect(managerBadge.shortRole).toBe('Dispatcher');

      const guideBadge = getRoleBadge('guide');
      expect(guideBadge.label).toContain('Rehber');

      const driverBadge = getRoleBadge('driver');
      expect(driverBadge.label).toContain('Şoför');
    });
  });
});
