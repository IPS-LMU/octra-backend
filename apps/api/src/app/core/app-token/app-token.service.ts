import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {randomBytes} from 'crypto';
import {AppTokenChangeDto, AppTokenCreateDto} from './app-token.dto';
import {AppTokenEntity, removeNullAttributes} from '@octra/server-side';

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

  async refreshAppToken(id: string): Promise<AppTokenEntity> {
    const key = await this.generateAppToken();
    await this.tokenRepository.update(id, {
      key
    });
    return (removeNullAttributes(await this.tokenRepository.findOneBy({id})));
  }

  async isValidAppToken(token: string, originHost: string): Promise<boolean> {
    const tokenRow = await this.tokenRepository.findOne({
      where: {
        key: token
      }
    });

    if (tokenRow) {
      if (tokenRow.domain) {
        const domainEntry = tokenRow.domain.replace(/\s+/g, '');

        if (domainEntry !== '') {
          let valid;
          if (tokenRow.domain.indexOf(',') > -1) {
            // multiple domains
            const domains = domainEntry.split(',');
            valid = domains.filter(a => a !== '').findIndex(a => a === originHost) > -1;
          } else {
            // one domain
            valid = tokenRow.domain.trim() === originHost;
          }
          return valid;
        }
      }
    }

    return false;
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
