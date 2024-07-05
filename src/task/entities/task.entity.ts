import { Column, DataType, Table, Unique, Model } from 'sequelize-typescript';
import { TaskState } from '../types/status.task';
import { TaskType } from '../types/type.task';

@Table({ tableName: 'tasks' })
export class Task extends Model<Task> {
  @Column(DataType.STRING)
  bidId: string;

  @Column(DataType.JSON)
  data: string;

  @Column
  type: TaskType;

  @Column
  status: TaskState;
}
