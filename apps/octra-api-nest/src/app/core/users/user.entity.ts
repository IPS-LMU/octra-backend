import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {UserRole} from '@octra/octra-api-types';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username?: string;

  @Column()
  email?: string;

  @Column()
  loginmethod: string;

  @Column({default: true})
  active: boolean;

  @Column()
  hash?: string;

  @Column()
  training: string;

  @Column()
  comment: string;

  @Column()
  role: UserRole;

  @Column()
  lastlogin?: string;
}
