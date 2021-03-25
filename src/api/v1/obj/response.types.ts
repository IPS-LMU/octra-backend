import {MediaItemRow} from './database.types';

export interface ProjectGetTranscriptsResult {
    pid: string;
    orgtext: string;
    transcript: string;
    assessment: string;
    priority: number;
    status: string;
    code: string;
    creationdate: string;
    startdate: string;
    enddate: string;
    log: string;
    comment: string;
    mediaitem?: MediaItemRow;
}
