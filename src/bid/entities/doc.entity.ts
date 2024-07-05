import { Column, Table, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'bids' })
export class DiadocDoc extends Model<DiadocDoc> {
  @Column(DataType.STRING)
  bidId: string;

  @Column(DataType.STRING)
  boxId: string | null;

  @Column(DataType.STRING)
  docGuid: string | null;

  @Column({ defaultValue: false })
  isSign: boolean;
}
