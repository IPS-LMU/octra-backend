export interface FileMetaData {
}

export interface AudioFileMetaData extends FileMetaData {
  bitRate: number;
  numberOfChannels: number;
  duration: { samples: number, seconds: number };
  sampleRate: number;
  container: string;
  codec: string;
  lossless: boolean;
}
