import { type Cradle } from "@fastify/awilix";
import { eq } from "drizzle-orm";
import { type INotificationService } from "../notifications.port.js";
import { products, type Product } from "@/db/schema.js";
import { type Database } from "@/db/type.js";

export class ProductService {
  private readonly ns: INotificationService;
  private readonly db: Database;

  public constructor({ ns, db }: Pick<Cradle, "ns" | "db">) {
    this.ns = ns;
    this.db = db;
  }

  public async notifyDelay(leadTime: number, p: Product): Promise<void> {
    p.leadTime = leadTime;
    await this.db.update(products).set(p).where(eq(products.id, p.id));
    this.ns.sendDelayNotification(leadTime, p.name);
  }

  public async handleSeasonalProduct(p: Product): Promise<void> {
    const currentDate = new Date();
    const d = 1000 * 60 * 60 * 24;
    if (new Date(currentDate.getTime() + p.leadTime * d) > p.seasonEndDate!) {
      this.ns.sendOutOfStockNotification(p.name);
      p.available = 0;
      await this.db.update(products).set(p).where(eq(products.id, p.id));
    } else if (p.seasonStartDate! > currentDate) {
      this.ns.sendOutOfStockNotification(p.name);
      await this.db.update(products).set(p).where(eq(products.id, p.id));
    } else {
      await this.notifyDelay(p.leadTime, p);
    }
  }

  public async handleExpiredProduct(p: Product): Promise<void> {
    const currentDate = new Date();
    if (p.available > 0 && p.expiryDate! > currentDate) {
      p.available -= 1;
      await this.db.update(products).set(p).where(eq(products.id, p.id));
    } else {
      this.ns.sendExpirationNotification(p.name, p.expiryDate!);
      p.available = 0;
      await this.db.update(products).set(p).where(eq(products.id, p.id));
    }
  }
  async handleFlashSaleProduct(product:Product): Promise<void>  {
    const currentDate = new Date();
    if (currentDate > product.flashSaleEndDate || product.available <= 0) {
      await this.ns.sendOutOfStockNotification(product.name);
    } else {
      await this.ns.sendDelayNotification(0,product.name);
    }
  }
}
