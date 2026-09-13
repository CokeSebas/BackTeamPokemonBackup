import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('news')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'text_id',
    type: 'varchar',
    length: 100,
  })
  textId: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
  })
  message: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  link: string;

  @Column({
    name: 'publish_date',
    type: 'date',
  })
  publishDate: Date;
}