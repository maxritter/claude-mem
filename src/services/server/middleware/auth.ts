/**
 * Authentication Middleware for Remote Worker Access
 *
 * Validates bearer tokens for remote client connections.
 * Local connections (127.0.0.1, ::1) bypass authentication.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger.js';
import type { RemoteAuthScope } from '../../../types/remote/index.js';
import { SettingsDefaultsManager } from '../../../shared/SettingsDefaultsManager.js';
import { USER_SETTINGS_PATH } from '../../../shared/paths.js';

/**
 * Extended Express Request with auth info
 */
export interface AuthenticatedRequest extends Request {
  /** Authentication information if token was validated */
  auth?: {
    /** Whether request is from localhost */
    isLocal: boolean;
    /** Client identifier from token */
    clientId?: string;
    /** Granted scopes */
    scopes: RemoteAuthScope[];
  };
}

/**
 * Check if request is from localhost
 */
function isLocalRequest(req: Request): boolean {
  const clientIp = req.ip || req.socket.remoteAddress || '';
  return (
    clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp === '::ffff:127.0.0.1' ||
    clientIp === 'localhost'
  );
}

/**
 * Get configured token from settings
 */
function getConfiguredToken(): string {
  const settings = SettingsDefaultsManager.loadFromFile(USER_SETTINGS_PATH);
  return settings.CLAUDE_MEM_REMOTE_TOKEN;
}

/**
 * Authentication middleware
 * - Localhost requests: Always allowed with full access
 * - Remote requests: Require valid bearer token
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Localhost always allowed
  if (isLocalRequest(req)) {
    req.auth = {
      isLocal: true,
      scopes: ['*'],
    };
    return next();
  }

  // Check for bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('SECURITY', 'Remote request missing bearer token', {
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Bearer token required for remote access',
    });
    return;
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  const configuredToken = getConfiguredToken();

  // If no token is configured, reject all remote auth attempts
  if (!configuredToken) {
    logger.warn('SECURITY', 'Remote access attempted but no token configured', {
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Remote access not configured',
    });
    return;
  }

  // Validate token
  if (token !== configuredToken) {
    logger.warn('SECURITY', 'Invalid bearer token', {
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid bearer token',
    });
    return;
  }

  req.auth = {
    isLocal: false,
    clientId: 'remote-client',
    scopes: ['*'],
  };

  logger.debug('SECURITY', 'Remote request authenticated', {
    path: req.path,
    clientId: 'remote-client',
  });

  next();
}

/**
 * Scope requirement middleware factory
 * Creates middleware that checks for required scope
 */
export function requireScope(scope: RemoteAuthScope) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const auth = req.auth;

    if (!auth) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
      return;
    }

    // Full access scope or specific scope
    if (auth.scopes.includes('*') || auth.scopes.includes(scope)) {
      return next();
    }

    logger.warn('SECURITY', 'Insufficient permissions', {
      path: req.path,
      requiredScope: scope,
      grantedScopes: auth.scopes,
    });

    res.status(403).json({
      code: 'FORBIDDEN',
      message: `Scope '${scope}' required`,
    });
  };
}
