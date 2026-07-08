import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants';
import { UserRole } from '../constants';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
