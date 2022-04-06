import {Injectable} from '@nestjs/common';
import {UserRole} from '@octra/octra-api-types';

export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'john',
      roles: [UserRole.administrator]
    },
    {
      userId: 2,
      username: 'maria',
      password: 'maria',
      roles: [UserRole.user]
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
