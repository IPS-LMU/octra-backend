import {MediaItemRow} from '../db/database.types';

export interface GetTranscriptsResult {
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
    tool_id: number;
    transcriber_id: number;
    project_id: number;
    mediaitem_id: number;
    mediaitem?: MediaItemRow;
}
