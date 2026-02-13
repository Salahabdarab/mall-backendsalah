import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { StoreRequest, StoreRequestStatus } from './store-request.entity';
import { User } from '../users/user.entity';
import { Wing } from '../wings/wing.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private storesRepo: Repository<Store>,
    @InjectRepository(StoreRequest) private reqRepo: Repository<StoreRequest>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Wing) private wingsRepo: Repository<Wing>,
    private usersService: UsersService,
  ) {}

  private async getWingOrFail(id: string) {
    const w = await this.wingsRepo.findOne({ where: { id, isActive: true } as any });
    if (!w) throw new NotFoundException('Wing not found');
    return w;
  }

  private async getUserOrFail(id: string) {
    const u = await this.usersRepo.findOne({ where: { id } as any });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  private async generateStoreCode() {
    const count = await this.storesRepo.count();
    const seq = String(count + 1).padStart(6, '0');
    const year = new Date().getFullYear();
    return `MALL-${year}-${seq}`;
  }

  async listStoresByWing(wingId: string) {
    return this.storesRepo.find({
      where: { wing: { id: wingId } as any, isActive: true } as any,
      relations: ['wing'],
      order: { isFeatured: 'DESC', featuredSortOrder: 'ASC', createdAt: 'DESC' } as any,
    });
  }

  async submitRequest(applicantId: string, dto: any) {
    const applicant = await this.getUserOrFail(applicantId);
    const wing = await this.getWingOrFail(dto.wingId);

    const pending = await this.reqRepo.count({
      where: { applicant: { id: applicantId } as any, status: StoreRequestStatus.SUBMITTED } as any,
    });
    if (pending >= 2) throw new BadRequestException('You have pending requests already');

    const req = await this.reqRepo.save(
      this.reqRepo.create({
        applicant,
        wing,
        desiredStoreName: dto.desiredStoreName.trim(),
        businessDescription: dto.businessDescription?.trim() || null,
        phone: dto.phone?.trim() || null,
        status: StoreRequestStatus.SUBMITTED,
      }),
    );

    return { ok: true, requestId: req.id, status: req.status };
  }

  async myRequests(applicantId: string) {
    return this.reqRepo.find({
      where: { applicant: { id: applicantId } as any } as any,
      relations: ['wing'],
      order: { createdAt: 'DESC' } as any,
    });
  }

  async adminListRequests(status?: StoreRequestStatus) {
    const where = status ? ({ status } as any) : ({} as any);
    return this.reqRepo.find({
      where,
      relations: ['applicant', 'wing'],
      order: { createdAt: 'DESC' } as any,
      take: 200,
    });
  }

  async adminSendContract(requestId: string, dto: any) {
    const req = await this.reqRepo.findOne({ where: { id: requestId } as any, relations: ['applicant', 'wing'] });
    if (!req) throw new NotFoundException('Request not found');
    if (![StoreRequestStatus.SUBMITTED, StoreRequestStatus.CONTRACT_SENT].includes(req.status)) {
      throw new BadRequestException('Invalid status for sending contract');
    }

    req.rentPrice = dto.rentPrice;
    req.rentDurationMonths = dto.rentDurationMonths;
    req.contractText = dto.contractText;
    req.contractSentAt = new Date();
    req.status = StoreRequestStatus.CONTRACT_SENT;
    req.adminNote = dto.adminNote?.trim() || req.adminNote || null;
    await this.reqRepo.save(req);
    return { ok: true, status: req.status };
  }

  async tenantSign(requestId: string, applicantId: string) {
    const req = await this.reqRepo.findOne({ where: { id: requestId } as any, relations: ['applicant'] });
    if (!req) throw new NotFoundException('Request not found');
    if (req.applicant.id !== applicantId) throw new BadRequestException('Not your request');
    if (req.status !== StoreRequestStatus.CONTRACT_SENT) throw new BadRequestException('Contract not sent yet');

    req.tenantSignedAt = new Date();
    req.status = StoreRequestStatus.SIGNED_BY_TENANT;
    await this.reqRepo.save(req);
    return { ok: true, status: req.status };
  }

  async adminApprove(requestId: string, dto?: any) {
    const req = await this.reqRepo.findOne({ where: { id: requestId } as any, relations: ['applicant', 'wing'] });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== StoreRequestStatus.SIGNED_BY_TENANT) throw new BadRequestException('Tenant must sign before final approval');

    await this.usersService.promoteToMerchant(req.applicant.id);

    const code = await this.generateStoreCode();
    const store = await this.storesRepo.save(
      this.storesRepo.create({
        code,
        name: req.desiredStoreName,
        description: req.businessDescription || null,
        owner: req.applicant,
        wing: req.wing,
        isActive: true,
        isFeatured: false,
        featuredSortOrder: 0,
      }),
    );

    req.status = StoreRequestStatus.APPROVED;
    req.adminNote = dto?.adminNote?.trim() || req.adminNote || null;
    await this.reqRepo.save(req);

    return { ok: true, storeId: store.id, storeCode: store.code };
  }

  async adminReject(requestId: string, dto?: any) {
    const req = await this.reqRepo.findOne({ where: { id: requestId } as any });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status === StoreRequestStatus.APPROVED) throw new BadRequestException('Cannot reject approved request');

    req.status = StoreRequestStatus.REJECTED;
    req.adminNote = dto?.adminNote?.trim() || req.adminNote || null;
    await this.reqRepo.save(req);

    return { ok: true, status: req.status };
  }

  async myStore(merchantUserId: string) {
    return this.storesRepo.find({
      where: { owner: { id: merchantUserId } as any } as any,
      relations: ['wing'],
      order: { createdAt: 'DESC' } as any,
    });
  }
}
