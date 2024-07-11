import { Column, DataType, Table, Model, Default } from 'sequelize-typescript';
import { TaskState } from '../types/status.task';
import { TaskType } from '../types/type.task';

@Table({ tableName: 'tasks' })
export class Task extends Model<Task> {
  @Column(DataType.STRING)
  bidId: string;

  @Column(DataType.JSON)
  data: string;

  @Default(0)
  @Column(DataType.INTEGER)
  nextCheckAfter: number;

  @Column(DataType.INTEGER)
  type: TaskType;

  @Column(DataType.INTEGER)
  status: TaskState;
}
