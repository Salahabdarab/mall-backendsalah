import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wing } from './wing.entity';
@Injectable()
export class WingsService {
  constructor(@InjectRepository(Wing) private repo: Repository<Wing>) {}
  listPublic(){ return this.repo.find({ where:{ isActive:true } as any, order:{ sortOrder:'ASC', createdAt:'DESC' } as any }); }
  listAdmin(){ return this.repo.find({ order:{ sortOrder:'ASC', createdAt:'DESC' } as any }); }
  async get(id:string){ const w=await this.repo.findOne({ where:{id} as any }); if(!w) throw new NotFoundException('Wing not found'); return w; }
  async create(dto:any){ return this.repo.save(this.repo.create({ slug:dto.slug.trim().toLowerCase(), name:dto.name.trim(), description:dto.description?.trim()||null, sortOrder:dto.sortOrder??0, isActive:true })); }
  async update(id:string,dto:any){ const w=await this.get(id); if(dto.slug!==undefined) w.slug=dto.slug.trim().toLowerCase(); if(dto.name!==undefined) w.name=dto.name.trim(); if(dto.description!==undefined) w.description=dto.description?.trim()||null; if(dto.sortOrder!==undefined) w.sortOrder=dto.sortOrder; if(dto.isActive!==undefined) w.isActive=!!dto.isActive; return this.repo.save(w); }
  async remove(id:string){ const w=await this.get(id); await this.repo.remove(w); return {ok:true}; }
}
