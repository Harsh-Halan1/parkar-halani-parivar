import { Injectable } from '@nestjs/common';

export type MaritalStatus = 'married' | 'unmarried';

export interface Member {
  id: number;
  name: string;
  family: string;
  role: MaritalStatus;
  age?: number;
  location?: string;
  phone?: string;
  email?: string;
  tags?: string[];
}

export interface CreateMemberDto {
  name: string;
  familyHeadFirstName: string;
  role: MaritalStatus;
  age?: number;
  location?: string;
  phone?: string;
  email?: string;
  tags?: string[];
}

export interface UpdateMemberDto extends Partial<CreateMemberDto> {}

@Injectable()
export class MembersService {
  private members: Member[] = [
    { id: 1, name: 'Aisha Kapoor', family: "Raj's family", role: 'married', age: 34, location: 'Surat', phone: '+91 98765 43210', email: 'aisha@example.com', tags: ['Teacher'] },
    { id: 2, name: 'Rohan Mehta', family: "Meera's family", role: 'unmarried', age: 24, location: 'Ahmedabad', tags: ['Engineer'] },
    { id: 3, name: 'Sonal Patel', family: "Kishan's family", role: 'unmarried', age: 27, location: 'Mumbai', email: 'sonal@example.com', tags: ['Designer'] },
    { id: 4, name: 'Vikas Shah', family: "Vikas's family", role: 'married', age: 31, location: 'Vadodara', phone: '+91 91234 56789', tags: ['Business'] },
    { id: 5, name: 'Meera Halani', family: "Meera's family", role: 'married', age: 42, location: 'Rajkot', email: 'meera@example.com', tags: ['Homemaker'] }
  ];

  private formatFamily(head: string) {
    const trimmed = head.trim();
    if (!trimmed) return '';
    return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}'s family`;
  }

  findAll(): Member[] {
    return this.members;
  }

  findOne(id: number): Member | undefined {
    return this.members.find((m) => m.id === id);
  }

  create(dto: CreateMemberDto): Member {
    const family = this.formatFamily(dto.familyHeadFirstName);
    const member: Member = {
      id: Date.now(),
      name: dto.name.trim(),
      family,
      role: dto.role,
      age: dto.age,
      location: dto.location,
      phone: dto.phone,
      email: dto.email,
      tags: dto.tags?.map((t) => t.trim()).filter(Boolean),
    };
    this.members.push(member);
    return member;
  }

  update(id: number, dto: UpdateMemberDto): Member | undefined {
    const member = this.findOne(id);
    if (!member) return undefined;
    if (dto.name !== undefined) member.name = dto.name.trim();
    if (dto.familyHeadFirstName !== undefined) member.family = this.formatFamily(dto.familyHeadFirstName);
    if (dto.role !== undefined) member.role = dto.role;
    if (dto.age !== undefined) member.age = dto.age;
    if (dto.location !== undefined) member.location = dto.location;
    if (dto.phone !== undefined) member.phone = dto.phone;
    if (dto.email !== undefined) member.email = dto.email;
    if (dto.tags !== undefined) member.tags = dto.tags.map((t) => t.trim()).filter(Boolean);
    return member;
  }

  remove(id: number): boolean {
    const before = this.members.length;
    this.members = this.members.filter((m) => m.id !== id);
    return this.members.length < before;
  }
}
