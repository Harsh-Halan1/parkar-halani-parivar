import { Injectable } from '@nestjs/common';

export interface Family {
  id: number;
  headFirstName: string;
  name: string;
  city?: string;
  members?: number;
  events?: number;
  description?: string;
}

export interface CreateFamilyDto {
  headFirstName: string;
  city?: string;
  description?: string;
}

export interface UpdateFamilyDto extends Partial<CreateFamilyDto> {}

@Injectable()
export class FamiliesService {
  private families: Family[] = [
    { id: 1, headFirstName: 'Raj', name: "Raj's family", city: 'Surat', members: 12, events: 3, description: 'Main branch of the Halani family tree' },
    { id: 2, headFirstName: 'Meera', name: "Meera's family", city: 'Ahmedabad', members: 8, events: 2, description: 'Extended family members from Parakar lineage' },
    { id: 3, headFirstName: 'Kishan', name: "Kishan's family", city: 'Mumbai', members: 15, events: 5, description: 'Connected through marriage' },
    { id: 4, headFirstName: 'Vikas', name: "Vikas's family", city: 'Vadodara', members: 6, events: 1 },
  ];

  findAll(): Family[] {
    return this.families;
  }

  findOne(id: number): Family | undefined {
    return this.families.find((f) => f.id === id);
  }

  create(dto: CreateFamilyDto): Family {
    const head = dto.headFirstName.trim();
    const name = `${head.charAt(0).toUpperCase()}${head.slice(1)}'s family`;
    const family: Family = {
      id: Date.now(),
      headFirstName: head,
      name,
      city: dto.city,
      description: dto.description,
      members: 0,
      events: 0,
    };
    this.families.push(family);
    return family;
  }

  update(id: number, dto: UpdateFamilyDto): Family | undefined {
    const family = this.findOne(id);
    if (!family) return undefined;
    if (dto.headFirstName) {
      const head = dto.headFirstName.trim();
      family.headFirstName = head;
      family.name = `${head.charAt(0).toUpperCase()}${head.slice(1)}'s family`;
    }
    if (dto.city !== undefined) family.city = dto.city;
    if (dto.description !== undefined) family.description = dto.description;
    return family;
  }

  remove(id: number): boolean {
    const before = this.families.length;
    this.families = this.families.filter((f) => f.id !== id);
    return this.families.length < before;
  }
}
