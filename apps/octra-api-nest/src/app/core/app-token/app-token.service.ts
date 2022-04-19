import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {AppTokenEntity} from './app-token.entity';
import {Repository} from 'typeorm';
import {randomBytes} from 'crypto';
import {removeNullAttributes} from '../../functions';
import {AppTokenChangeDto, AppTokenCreateDto} from './app-token.dto';

@Injectable()
export class AppTokenService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private tokenRepository: Repository<AppTokenEntity>
  ) {
  }

  async getAll(): Promise<AppTokenEntity[]> {
    return await this.tokenRepository.find();
  }

  async createAppToken(appToken: AppTokenCreateDto): Promise<AppTokenEntity> {
    return removeNullAttributes(await this.tokenRepository.save(appToken));
  }

  async updateAppToken(id: number, appToken: AppTokenChangeDto): Promise<void> {
    await this.tokenRepository.update(id, appToken);
    return;
  }

  async removeAppToken(id: number): Promise<void> {
    await this.tokenRepository.delete(id);
    return;
  }

  async refreshAppToken(id: number): Promise<AppTokenEntity> {
    const key = await this.generateAppToken();
    await this.tokenRepository.update(id, {
      key
    });
    return (removeNullAttributes(await this.tokenRepository.findOne(id)));
  }

  private async generateAppToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      randomBytes(20, function (err, buffer) {
        if (err) {
          reject(err);
        } else {
          resolve(buffer.toString('hex'));
        }
      });
    });
  }
}
