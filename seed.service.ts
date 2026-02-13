import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../modules/users/users.service';
import { Role } from '../modules/users/role.enum';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private users: UsersService) {}

  async onApplicationBootstrap() {
    const enabled = (process.env.SEED_ENABLED || 'false').toLowerCase() === 'true';
    if (!enabled) {
      this.logger.log('SEED disabled (set SEED_ENABLED=true to enable)');
      return;
    }

    await this.ensureUser('admin@test.com', 'Admin@123456', Role.ADMIN);
    await this.ensureUser('merchant@test.com', 'Merchant@123456', Role.MERCHANT);
    await this.ensureUser('customer@test.com', 'Customer@123456', Role.CUSTOMER);

    this.logger.log('Seed users completed ✅');
  }

  private async ensureUser(email: string, password: string, role: Role) {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      this.logger.log(`User exists: ${email} (role=${existing.role})`);
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await this.users.create(email, passwordHash, role);
    this.logger.log(`Created ${role}: ${email} / ${password}`);
  }
}
