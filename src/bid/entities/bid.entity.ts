import {
  Column,
  Table,
  Model,
  DataType,
  Unique,
  Default,
} from 'sequelize-typescript';
import { BidState } from '../types/bid-state';

@Table({ tableName: 'bids' })
export class Bid extends Model<Bid> {
  @Unique
  @Column
  bidId: string;

  @Column(DataType.JSON)
  data: string;

  @Column(DataType.STRING)
  payDocNumber: string | null;

  @Column(DataType.STRING)
  payDocDate: string | null;

  @Column(DataType.STRING)
  sailerName: string | null;

  @Column(DataType.STRING)
  sailerInn: string | null;

  @Column(DataType.STRING)
  sailerKpp: string | null;

  @Column(DataType.STRING)
  sailerBoxId: string | null;

  @Column(DataType.STRING)
  sailerOrgIdGuid: string | null;

  @Column(DataType.STRING)
  sailerFnsParticipantId: string | null;

  @Column(DataType.STRING)
  sailerMessageId: string | null;

  @Column(DataType.STRING)
  sailerUpdGuid: string | null;

  @Column(DataType.STRING)
  sailerReportNumber: string | null;

  @Column(DataType.STRING)
  sailerUpdNumber: string | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  sailerDiadocCheck: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  bayerDiadocCheck: boolean;

  @Column(DataType.STRING)
  bayerName: string | null;

  @Column(DataType.STRING)
  bayerUpdNumber: string | null;

  @Column(DataType.STRING)
  bayerInn: string | null;

  @Column(DataType.STRING)
  bayerKpp: string | null;

  @Column(DataType.STRING)
  bayerMessageId: string | null;

  @Column(DataType.STRING)
  bayerOrgIdGuid: string | null;

  @Column(DataType.STRING)
  bayerBoxId: string | null;

  @Column(DataType.STRING)
  bayerFnsParticipantId: string | null;

  @Column(DataType.STRING)
  bayerCopyGuid: string | null;

  @Column(DataType.STRING)
  bayerAgentResultGuid: string | null;

  @Column(DataType.STRING)
  bayerUpdResultGuid: string | null;

  @Column({ defaultValue: false })
  sailerSign: boolean;

  @Column({ defaultValue: false })
  sailerReportSign: boolean;

  @Column({ defaultValue: false })
  sailerCopySign: boolean;

  @Column({ defaultValue: false })
  bayerSign: boolean;

  @Column(DataType.INTEGER)
  state: BidState;

  @Column({ defaultValue: true })
  isActive: boolean;
}
