import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {Account} from './entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>
  ) {
  }

  async findOne(username: string): Promise<Account | undefined> {
    const t = await this.accountRepository.find({
      where: {
        account_person: {
          username
        }
      },
      relations: ['account_person']
    });
    return t[0];
  }
}
