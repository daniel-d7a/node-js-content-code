CREATE TYPE "order_status" AS ENUM('pending', 'shipped', 'delivered', 'cancelled');
--> statement-breakpoint
ALTER TABLE "cart_product" RENAME COLUMN "prodcut_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "order_product" RENAME COLUMN "prodcut_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "status" "order_status" DEFAULT 'pending'::"order_status";