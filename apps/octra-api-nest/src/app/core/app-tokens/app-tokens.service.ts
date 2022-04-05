import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {AppToken} from './app-tokens.entity';
import {Repository} from 'typeorm';
import {randomBytes} from 'crypto';
import {removeNullAttributes} from '../../functions';
import {AppTokenCreateDto, AppTokenDto} from './app-token.dto';

@Injectable()
export class AppTokensService {
  constructor(
    @InjectRepository(AppToken)
    private tokenRepository: Repository<AppToken>
  ) {
  }

  async getAll(): Promise<AppTokenDto[]> {
    return removeNullAttributes(await this.tokenRepository.find());
  }

  async createAppToken(appToken: AppTokenCreateDto): Promise<AppTokenDto> {
    return removeNullAttributes(await this.tokenRepository.save(appToken));
  }

  async updateAppToken(id: number, appToken: AppTokenCreateDto): Promise<void> {
    await this.tokenRepository.update(id, appToken);
    return;
  }

  async removeAppToken(id: number): Promise<void> {
    await this.tokenRepository.delete(id);
    return;
  }

  async refreshAppToken(id: number): Promise<AppToken> {
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
