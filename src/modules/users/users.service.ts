import { Injectable } from '@nestjs/common';
import { SafeUser, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll(): Promise<SafeUser[]> {
    return this.usersRepository.findAll();
  }
}
