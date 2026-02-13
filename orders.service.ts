import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartItem } from '../cart/cart-item.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { Product } from '../products/product.entity';
import { Store } from '../stores/store.entity';
import { Address } from '../addresses/address.entity';
import { ShippingMethod } from '../shipping/shipping-method.entity';
import { Coupon } from '../coupons/coupon.entity';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private ds: DataSource,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(ProductVariant) private varRepo: Repository<ProductVariant>,
    @InjectRepository(Product) private prodRepo: Repository<Product>,
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    @InjectRepository(Address) private addrRepo: Repository<Address>,
    @InjectRepository(ShippingMethod) private shipRepo: Repository<ShippingMethod>,
    @InjectRepository(Coupon) private couponRepo: Repository<Coupon>,
    private coupons: CouponsService,
    private notifications: NotificationsService,
  ) {}

  private reservationMinutes(): number {
    return Number(process.env.ORDER_RESERVATION_MINUTES || 15);
  }

  async myOrders(userId: string) {
    return this.orderRepo.find({
      where: { user: { id: userId } as any } as any,
      relations: ['store', 'shippingAddress', 'shippingMethod', 'coupon'],
      order: { createdAt: 'DESC' } as any,
      take: 100,
    });
  }

  async createFromCart(userId: string, dto: any) {
    const address = dto.addressId
      ? await this.addrRepo.findOne({ where: { id: dto.addressId } as any, relations: ['user'] })
      : null;
    if (address && (address.user as any).id !== userId) throw new BadRequestException('Invalid address');

    const shipping = dto.shippingMethodId
      ? await this.shipRepo.findOne({ where: { id: dto.shippingMethodId } as any })
      : null;

    const coupon = dto.couponCode ? await this.coupons.validate(dto.couponCode) : null;

    const cart = await this.cartRepo.find({
      where: { user: { id: userId } as any } as any,
      relations: ['variant', 'variant.product', 'variant.product.store'],
    });
    if (!cart.length) throw new BadRequestException('Cart is empty');

    // single-store per order (simple demo): use store of first item
    const storeId = (cart[0].variant as any).product.store.id;
    const store = await this.storeRepo.findOne({ where: { id: storeId } as any });
    if (!store) throw new NotFoundException('Store not found');

    return this.ds.transaction(async (tx) => {
      const varRepo = tx.getRepository(ProductVariant);
      const orderRepo = tx.getRepository(Order);
      const itemRepo = tx.getRepository(OrderItem);
      const cartRepo = tx.getRepository(CartItem);

      // lock variants and check stock
      for (const ci of cart) {
        const v = await varRepo.findOne({
          where: { id: ci.variant.id } as any,
          lock: { mode: 'pessimistic_write' } as any,
        });
        if (!v || !v.isActive) throw new BadRequestException('Variant not available');
        if (v.stock < ci.quantity) throw new BadRequestException(`Not enough stock for ${v.sku}`);
      }

      // compute subtotal
      let subtotal = 0;
      for (const ci of cart) {
        const product = (ci.variant as any).product as Product;
        const unit = parseFloat((ci.variant.priceOverride ?? product.basePrice) as any);
        subtotal += unit * ci.quantity;
      }

      const shippingFee = shipping ? parseFloat(shipping.fee as any) : 0;

      // discount (percent off)
      let discount = 0;
      if (coupon) {
        const percent = parseFloat(coupon.percentOff as any) / 100.0;
        discount = subtotal * percent;
        const maxD = parseFloat(coupon.maxDiscount as any);
        if (maxD > 0) discount = Math.min(discount, maxD);
      }

      const total = Math.max(0, subtotal + shippingFee - discount);

      const reservedUntil = new Date(Date.now() + this.reservationMinutes() * 60 * 1000);

      const order = await orderRepo.save(orderRepo.create({
        user: { id: userId } as any,
        store,
        shippingAddress: address || null,
        shippingMethod: shipping || null,
        coupon: coupon || null,
        status: OrderStatus.PENDING,
        subtotal: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        reservedUntil,
        paymentRef: null,
      }));

      // create items and decrement stock (reserve)
      for (const ci of cart) {
        const locked = await varRepo.findOne({ where: { id: ci.variant.id } as any, lock: { mode: 'pessimistic_write' } as any });
        if (!locked) throw new BadRequestException('Variant missing during checkout');

        const product = (ci.variant as any).product as Product;
        const unit = parseFloat((ci.variant.priceOverride ?? product.basePrice) as any);

        await itemRepo.save(itemRepo.create({
          order,
          variant: locked,
          quantity: ci.quantity,
          unitPrice: unit.toFixed(2),
        }));

        locked.stock = locked.stock - ci.quantity;
        await varRepo.save(locked);
      }

      // clear cart
      await cartRepo.delete({ user: { id: userId } as any } as any);

      // notify (customer)
      await this.notifications.create(userId, 'Order created', `Your order ${order.id} is pending payment.`, { orderId: order.id });

      return { ok: true, orderId: order.id, reservedUntil: order.reservedUntil };
    });
  }

  async markPaid(userId: string, orderId: string, paymentRef?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } as any, relations: ['user'] });
    if (!order) throw new NotFoundException('Order not found');
    if ((order.user as any).id !== userId) throw new BadRequestException('Not your order');
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Order is not pending');

    order.status = OrderStatus.PAID;
    order.paymentRef = paymentRef || order.paymentRef || null;
    order.reservedUntil = null;
    await this.orderRepo.save(order);

    await this.notifications.create(userId, 'Payment received', `Order ${order.id} paid successfully.`, { orderId: order.id });
    return { ok: true, status: order.status };
  }
}
