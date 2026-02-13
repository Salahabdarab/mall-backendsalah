import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { OrderStatus } from './order.entity';
import { ProductVariant } from '../products/product-variant.entity';

@Injectable()
export class OrdersScheduler {
  private readonly logger = new Logger(OrdersScheduler.name);

  constructor(private ds: DataSource) {}

  // run every minute
  @Cron('*/1 * * * *')
  async autoCancelExpired() {
    const now = new Date();
    await this.ds.transaction(async (tx) => {
      // find expired pending orders
      const orders = await tx.query(
        `SELECT id FROM "order" WHERE status = $1 AND "reservedUntil" IS NOT NULL AND "reservedUntil" < $2 LIMIT 50`,
        [OrderStatus.PENDING, now],
      );

      for (const row of orders) {
        const orderId = row.id as string;

        // fetch items
        const items = await tx.query(
          `SELECT "variantId" as "variantId", quantity FROM "order_item" WHERE "orderId" = $1`,
          [orderId],
        );

        // restore stock
        for (const it of items) {
          const variantId = it.variantId as string;
          const qty = Number(it.quantity || 0);
          const vRepo = tx.getRepository(ProductVariant);
          const v = await vRepo.findOne({ where: { id: variantId } as any, lock: { mode: 'pessimistic_write' } as any });
          if (v) {
            v.stock = v.stock + qty;
            await vRepo.save(v);
          }
        }

        // cancel order
        await tx.query(
          `UPDATE "order" SET status = $1, "reservedUntil" = NULL WHERE id = $2`,
          [OrderStatus.CANCELLED, orderId],
        );

        this.logger.log(`Auto-cancelled order ${orderId}`);
      }
    });
  }
}
