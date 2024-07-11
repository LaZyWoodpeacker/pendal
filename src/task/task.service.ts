import { Injectable } from '@nestjs/common';
import { Task } from './entities/task.entity';
import { Cron } from '@nestjs/schedule';
import { PendalLogger } from 'src/pendal-logger/pendal-logger.service';
import { TaskType } from './types/type.task';
import { BidService } from 'src/bid/bid.service';
import { DiadocService } from 'src/diadoc/diadoc.service';
import {
  IOnecCreateResultData,
  IOnecCreateResultReportData,
} from 'src/onec/types/ut-create-data';
import getDocumentState from './helpers/getDocumentState';
import sendBidToUT from './helpers/sendToUt';
import sendBidToOnec from './helpers/sendBidToOnec';
import logTaskObj from './methods/logTaskObj';
import createBayerCheck from './methods/createBayerCheck';
import createSailerCheck from './methods/createSailerCheck';
import writeBid from './helpers/writeBid';
import createBayerSignCheck from './methods/createBayerSignCheck';
import createSendToOnec from './methods/createSendToOnec';
import createSailerSignCheck from './methods/createSailerSignCheck';
import createDealFinished from './methods/createDealFinished';
import checkReadyDocumentState from './helpers/checkReadyDocumentState';

@Injectable()
export class TaskService {
  taskLock: boolean = false;
  constructor(
    readonly bids: BidService,
    readonly diadoc: DiadocService,
    readonly logger: PendalLogger,
  ) {}

  async checkTask(task: Task) {
    try {
      if (task.type === TaskType.NewBid) {
        const bid = await this.bids.findOne(task.bidId);
        createBayerCheck(bid);
        createSailerCheck(bid);
        writeBid(bid);
        await task.destroy();
      } else if (task.type === TaskType.CheckSeller) {
        const bid = await this.bids.findOne(task.bidId);
        const diadocOrg = await this.diadoc.getOrganization(bid.sailerInn);
        bid.sailerOrgIdGuid = diadocOrg.OrgIdGuid;
        bid.sailerBoxId = diadocOrg.Boxes[0].BoxIdGuid;
        bid.sailerFnsParticipantId = diadocOrg.FnsParticipantId;
        bid.sailerName = diadocOrg.FullName;
        bid.sailerDiadocCheck = true;
        await bid.save();
        writeBid(bid);
        logTaskObj(
          this,
          task,
          diadocOrg,
          `Уточняем данные покупателя ${TaskType[task.type]}`,
        );
        await task.destroy();
      } else if (task.type == TaskType.CheckBayer) {
        const bid = await this.bids.findOne(task.bidId);
        const diadocOrg = await this.diadoc.getOrganization(bid.bayerInn);
        bid.bayerOrgIdGuid = diadocOrg.OrgIdGuid;
        bid.bayerBoxId = diadocOrg.Boxes[0].BoxIdGuid;
        bid.bayerFnsParticipantId = diadocOrg.FnsParticipantId;
        bid.bayerName = diadocOrg.FullName;
        bid.bayerDiadocCheck = true;
        await bid.save();
        writeBid(bid);
        logTaskObj(
          this,
          task,
          diadocOrg,
          `Уточняем данные поставщика ${TaskType[task.type]}`,
        );
        await task.destroy();
      } else if (task.type === TaskType.CheckPay) {
        const bid = await this.bids.findOne(task.bidId);
        if (!(bid.bayerDiadocCheck && bid.sailerDiadocCheck)) {
          this.logger.log(`Контрагенты не проверенны`);
          return;
        }
        bid.payDocNumber = JSON.parse(task.data).payDoc;
        const data = await sendBidToUT(bid);
        bid.bayerMessageId = data.messageId;
        bid.bayerUpdNumber = data.updNumber;
        await bid.save();
        createBayerSignCheck(bid, data);
        await task.destroy();
        logTaskObj(
          this,
          task,
          data,
          `Отправляем данные об оплате и заявку в УТ `,
        );
        writeBid(bid);
      } else if (task.type === TaskType.CheckDiadocBayer) {
        const data: IOnecCreateResultData = JSON.parse(task.data);
        const bid = await this.bids.findOne(task.bidId);
        const status = await getDocumentState(
          this,
          data.boxId,
          data.messageId,
          data.updNumber,
        );

        if (status === `Документооборот завершен`) {
          logTaskObj(
            this,
            task,
            data,
            `Документооборот с покупателем завершен`,
          );
          bid.bayerSign = true;
          await bid.save();
          createSendToOnec(bid);
          await task.destroy();
        } else {
          this.logger.log(`Статус документа ${task.bidId} ${status}`);
        }
      } else if (task.type === TaskType.SendOnecComplete) {
        const bid = await this.bids.findOne(task.bidId);
        const data = await sendBidToOnec(bid);
        bid.sailerMessageId = data.messageId;
        bid.sailerUpdNumber = data.updNumber;
        bid.sailerReportNumber = data.reportNumber;
        createSailerSignCheck(bid, data);
        await bid.save();
        writeBid(bid);
        logTaskObj(
          this,
          task,
          data,
          `Отправляем данные данные о подписании в 1С`,
        );
        await task.destroy();
      } else if (task.type === TaskType.CheckDiadocSailer) {
        const data: IOnecCreateResultReportData = JSON.parse(task.data);
        const bid = await this.bids.findOne(task.bidId);
        let status = null;
        let statusReport = null;
        if (!bid.sailerSign) {
          status = await getDocumentState(
            this,
            data.boxId,
            data.messageId,
            data.updNumber,
          );
          if (status === 'Документооборот завершен') {
            logTaskObj(this, task, data, `Поставщиком подписан УПД`);
            bid.sailerSign = true;
            await bid.save();
          }
        }
        if (!bid.sailerReportSign) {
          statusReport = await getDocumentState(
            this,
            data.boxId,
            data.messageId,
            data.reportNumber,
          );
          if (statusReport === 'Подписан контрагентом') {
            logTaskObj(this, task, data, `Поставщиком подписан отчёт`);
            bid.sailerReportSign = true;
            await bid.save();
          }
        }
        if (bid.sailerSign && bid.sailerReportSign) {
          createDealFinished(bid);
          await task.destroy();
          logTaskObj(
            this,
            task,
            data,
            `Документооборот с поставщиком завершен`,
          );
        } else {
          this.logger.log(
            `Статус документа ${task.bidId} УПД: ${status} Отчёт Агента: ${statusReport}`,
          );
        }
        writeBid(bid);
      } else if (task.type === TaskType.DealFinished) {
        const bid = await this.bids.findOne(task.bidId);
        await task.destroy();
        writeBid(bid);
        logTaskObj(this, task, bid, `Сделка завершена`);
        bid.destroy();
      }
    } catch (e) {
      this.logger.errorJson(
        `Ошибка при обработке задачи с типом ${TaskType[task.type]}`,
        task.bidId,
        { message: e.message, data: e?.data },
      );
    }
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
