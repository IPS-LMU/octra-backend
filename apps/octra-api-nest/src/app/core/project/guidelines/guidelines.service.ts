import {Injectable} from '@nestjs/common';
import {GuidelinesDto} from './guidelines.dto';
import * as path from 'path';
import {AppService} from '../../../app.service';
import {FileSystemHandler} from '../../../obj/filesystem-handler';

@Injectable()
export class GuidelinesService {
  constructor(private appService: AppService) {
  }

  public async saveGuidelines(project_id: number, dtos: GuidelinesDto[]): Promise<void> {
    const guidelinesPath = this.appService.pathBuilder.getAbsoluteGuidelinesPath(Number(project_id));
    await FileSystemHandler.removeFolder(guidelinesPath);

    for (const createGuidelinesRequest of dtos) {
      await FileSystemHandler.saveFileAsync(path.join(guidelinesPath, `guidelines_${createGuidelinesRequest.language}.json`), JSON.stringify(createGuidelinesRequest.json, null, 2), {
        encoding: 'utf-8'
      });
    }
    return;
  }

  async getGuidelines(project_id: number): Promise<GuidelinesDto[]> {
    const guidelinesPath = this.appService.pathBuilder.getAbsoluteGuidelinesPath(Number(project_id));
    const files = await FileSystemHandler.listFiles(guidelinesPath);
    return files.map(a => {
      let json;
      try {
        json = JSON.parse(a.content);
      } catch (e) {
        console.error(e);
      }

      return {
        language: a.fileName.replace(/guidelines_([^.]+)\.json/g, '$1'),
        json
      };
    });
  }
}
