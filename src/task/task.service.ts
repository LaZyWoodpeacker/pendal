import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entities/task.entity';
import { Cron } from '@nestjs/schedule';
import { PendalLogger } from 'src/pendal-logger/pendal-logger.service';
import { TaskType } from './types/type.task';
import { BidService } from 'src/bid/bid.service';
import { TaskState } from './types/status.task';
import { DiadocService } from 'src/diadoc/diadoc.service';
import { writeFileSync } from 'fs';
import { IOnecCreateResultData } from 'src/onec/types/ut-create-data';
import { IDiadocMessage } from 'src/diadoc/types/message';
import { Bid } from 'src/bid/entities/bid.entity';
import { PendalException, PendalExceptionType } from 'src/lib/pendal-exception';

@Injectable()
export class TaskService {
  taskLock: boolean = false;
  constructor(
    private bids: BidService,
    private diadoc: DiadocService,
    private logger: PendalLogger,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    try {
      const result = await Task.create(dto);
      return result;
    } catch (e) {
      throw e;
    }
  }

  logTask(task: Task, message: string = null): void {
    if (!message) {
      this.logger.logJson(
        `Обработка задачи с типом  ${TaskType[task.type]} к заявке ${task.bidId}`,
        task.bidId,
        task.toJSON(),
      );
    } else {
      this.logger.logJson(message, task.bidId, task);
    }
  }

  logTaskObj(task: Task, obj: Object, message: string = null): void {
    if (!message) {
      this.logger.logJson(
        `Обработка задачи с типом  ${TaskType[task.type]} к заявке ${task.bidId}`,
        task.bidId,
        obj,
      );
    } else {
      this.logger.logJson(message, task.bidId, obj);
    }
  }

  async sendBidToUT(bid: Bid): Promise<IOnecCreateResultData> {
    const response = await fetch('http://localhost:3000/onec/createUpdUt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(bid.toJSON()),
    });
    return response.json();
  }

  async checkTask(task: Task) {
    try {
      // this.logTask(task);
      if (task.type === TaskType.NewBid) {
        const bid = await this.bids.findOne(task.bidId);
        this.create({
          bidId: bid.bidId,
          status: TaskState.New,
          type: TaskType.CheckSeller,
          data: bid.data,
        });
        this.create({
          bidId: bid.bidId,
          status: TaskState.New,
          type: TaskType.CheckBayer,
          data: bid.data,
        });
        this.writeBid(bid);
        await task.destroy();
      } else if (task.type === TaskType.CheckSeller) {
        const bid = await this.bids.findOne(task.bidId);
        const diadocOrg = await this.diadoc.GetOrganization(bid.sailerInn);
        bid.sailerOrgIdGuid = diadocOrg.OrgIdGuid;
        bid.sailerBoxId = diadocOrg.Boxes[0].BoxIdGuid;
        bid.sailerFnsParticipantId = diadocOrg.FnsParticipantId;
        await bid.save();
        this.writeBid(bid);
        this.logTaskObj(
          task,
          diadocOrg,
          `Уточняем данные покупателя ${TaskType[task.type]}`,
        );
        await task.destroy();
      } else if (task.type == TaskType.CheckBayer) {
        const bid = await this.bids.findOne(task.bidId);
        const diadocOrg = await this.diadoc.GetOrganization(bid.bayerInn);
        bid.bayerOrgIdGuid = diadocOrg.OrgIdGuid;
        bid.bayerBoxId = diadocOrg.Boxes[0].BoxIdGuid;
        bid.bayerFnsParticipantId = diadocOrg.FnsParticipantId;
        await bid.save();
        this.writeBid(bid);
        this.logTaskObj(
          task,
          diadocOrg,
          `Уточняем данные поставщика ${TaskType[task.type]}`,
        );
        await task.destroy();
      } else if (task.type === TaskType.CheckPay) {
        const bid = await this.bids.findOne(task.bidId);
        bid.payDocNumber = JSON.parse(task.data).payDoc;
        const data = await this.sendBidToUT(bid);
        bid.bayerMessageId = data.messageId;
        bid.updNumber = data.updNumber;
        this.create({
          bidId: bid.bidId,
          status: TaskState.New,
          type: TaskType.CheckDiadocBayer,
          data: JSON.stringify(data),
        });
        await bid.save();
        this.writeBid(bid);
        this.logTaskObj(
          task,
          data,
          `Отправляем данные об оплате и заявку в УТ `,
        );
        await task.destroy();
      } else if (task.type === TaskType.CheckDiadocBayer) {
        const data: IOnecCreateResultData = JSON.parse(task.data);
        const result = (await this.diadoc.getDocState(data)) as IDiadocMessage;
        const document = result.Entities.find((doc) => {
          return (
            doc.DocumentInfo?.DocumentType === 'UniversalTransferDocument' &&
            doc.DocumentInfo.DocumentNumber === data.updNumber
          );
        });
        writeFileSync(
          `mon/getmessage.${task.bidId}.json`,
          JSON.stringify(result, null, 2),
        );
        if (
          document.DocumentInfo.DocflowStatus.PrimaryStatus.StatusText ===
          'Документооборот завершен'
        ) {
          this.logTaskObj(
            task,
            {
              status:
                document.DocumentInfo.DocflowStatus.PrimaryStatus.StatusText,
              ...data,
            },
            `Документооборот с покупателем завершен`,
          );
          await task.destroy();
          const bid = await this.bids.findOne(task.bidId);
        } else {
          this.logger.log(
            `Статус документа ${task.bidId} ${document.DocumentInfo.DocflowStatus.PrimaryStatus.StatusText}`,
          );
        }
      } else if (task.type === TaskType.CheckDiadoc) {
      } else {
      }
    } catch (e) {
      this.logger.errorJson(
        `Ошибка при обработке задачи с типом ${TaskType[task.type]}`,
        task.bidId,
        { message: e.message },
      );
    }
  }

  writeBid(bid) {
    writeFileSync(`mon/bid.${bid.bidId}.json`, JSON.stringify(bid, null, 2));
  }

  @Cron('*/5 * * * * *')
  async mainLoop() {
    if (!this.taskLock) {
      try {
        this.taskLock = true;
        const tasks = await Task.findAll();
        for (const task of tasks) {
          await this.checkTask(task);
        }
      } catch (e) {
        this.logger.errorJson(`Ошибка в обработке цикла задач`, e);
        throw e;
      } finally {
        this.taskLock = false;
      }
    }
  }
}
