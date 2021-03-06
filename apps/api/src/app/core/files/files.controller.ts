import {BadRequestException, Controller, Get, NotFoundException, Param, Req, Res} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import * as Path from 'path';
import {pathExists} from 'fs-extra';
import {InternRequest} from '../../obj/types';
import {AppService} from '../../app.service';
import {createReadStream} from 'fs';
import {CombinedRolesWithoutSerialization} from '../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/api-types';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private appService: AppService) {
  }

  /**
   * returns a file from a given, encrypted path.
   *
   * Allowed user roles: <code>administrator, user</code>
   */
  @CombinedRolesWithoutSerialization(AccountRole.administrator, AccountRole.user)
  @Get('/:encryptedPath/:fileName')
  async getFile(@Param('encryptedPath') encryptedPath: string, @Param('fileName') fileName: string, @Req() req: InternRequest, @Res() res: any): Promise<any> {
    try {
      let decryptedPath = this.appService.pathBuilder.decryptFilePath(encryptedPath);
      const t = this.appService.pathBuilder.readPathFromDB(decryptedPath);
      decryptedPath = Path.join(this.appService.pathBuilder.readPathFromDB(decryptedPath), fileName);
      if (await pathExists(decryptedPath)) {
        const file = createReadStream(decryptedPath);
        return file.pipe(res);
      } else {
        throw new NotFoundException(`Can't find file`);
      }
    } catch (e) {
      throw new BadRequestException(`Can't find file`);
    }
  }
}
