import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

type PrismaTransaction = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function reserveStock(
  productId: string,
  quantity: number,
  orderId?: string,
  tx?: PrismaTransaction
) {
  const client = tx || prisma;
  if (quantity <= 0) throw new Error("Số lượng phải lớn hơn 0");

  const product = await client.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new Error("Không tìm thấy sản phẩm");
  if (!product.isActive) throw new Error("Sản phẩm không còn hoạt động");

  if (product.productType === "IN_STOCK") {
    // Check and deduct stock atomically
    const updated = await client.product.updateMany({
      where: {
        id: productId,
        stockQuantity: { gte: quantity },
      },
      data: {
        stockQuantity: { decrement: quantity },
      },
    });

    if (updated.count === 0) {
      throw new Error("Không đủ hàng tồn kho");
    }

    const updatedProduct = await client.product.findUnique({
      where: { id: productId },
    });

    await client.inventoryLog.create({
      data: {
        productId,
        orderId: orderId || null,
        changeType: orderId ? "ONLINE_SALE" : "ORDER_DEDUCT",
        quantityChange: -quantity,
        stockBefore: updatedProduct!.stockQuantity + quantity,
        stockAfter: updatedProduct!.stockQuantity,
        performedBy: "SYSTEM",
        createdById: null,
        note: orderId ? `Trừ kho cho đơn hàng online` : "Giữ hàng",
      },
    });

    return updatedProduct;
  } else if (product.productType === "PRE_ORDER") {
    // For pre-order, don't deduct stock, increase preOrderCount
    if (product.preOrderLimit > 0 && product.preOrderCount + quantity > product.preOrderLimit) {
      throw new Error("Vượt quá giới hạn đặt trước");
    }

    const updated = await client.product.update({
      where: { id: productId },
      data: {
        preOrderCount: { increment: quantity },
      },
    });

    await client.inventoryLog.create({
      data: {
        productId,
        orderId: orderId || null,
        changeType: "ORDER_DEDUCT",
        quantityChange: 0, // No stock change for pre-order
        stockBefore: updated.stockQuantity,
        stockAfter: updated.stockQuantity,
        performedBy: "SYSTEM",
        createdById: null,
        note: orderId ? `Giữ suất pre-order cho đơn hàng` : "Giữ suất pre-order",
      },
    });

    return updated;
  }

  throw new Error("Loại sản phẩm không hợp lệ");
}

export async function releaseStock(
  productId: string,
  quantity: number,
  orderId?: string,
  reason?: string,
  tx?: PrismaTransaction
) {
  const client = tx || prisma;
  if (quantity <= 0) throw new Error("Số lượng phải lớn hơn 0");

  const product = await client.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new Error("Không tìm thấy sản phẩm");

  if (product.productType === "IN_STOCK") {
    const updated = await client.product.update({
      where: { id: productId },
      data: {
        stockQuantity: { increment: quantity },
      },
    });

    await client.inventoryLog.create({
      data: {
        productId,
        orderId: orderId || null,
        changeType: "RESTOCK",
        quantityChange: quantity,
        stockBefore: updated.stockQuantity - quantity,
        stockAfter: updated.stockQuantity,
        performedBy: "SYSTEM",
        createdById: null,
        note: reason || (orderId ? `Hoàn kho do hủy đơn hàng` : "Hoàn kho"),
      },
    });

    return updated;
  } else if (product.productType === "PRE_ORDER") {
    const newPreOrderCount = Math.max(0, product.preOrderCount - quantity);
    const updated = await client.product.update({
      where: { id: productId },
      data: {
        preOrderCount: newPreOrderCount,
      },
    });

    await client.inventoryLog.create({
      data: {
        productId,
        orderId: orderId || null,
        changeType: "RESTOCK",
        quantityChange: 0,
        stockBefore: updated.stockQuantity,
        stockAfter: updated.stockQuantity,
        performedBy: "SYSTEM",
        createdById: null,
        note: reason || (orderId ? `Hoàn suất pre-order do hủy đơn hàng` : "Hoàn suất pre-order"),
      },
    });

    return updated;
  }

  throw new Error("Loại sản phẩm không hợp lệ");
}

export async function importStock(
  productId: string,
  quantity: number,
  note?: string,
  createdById?: string,
  creatorName?: string,
  tx?: PrismaTransaction,
  costPrice?: number
) {
  const client = tx || prisma;
  if (quantity <= 0) throw new Error("Số lượng phải lớn hơn 0");

  const product = await client.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new Error("Không tìm thấy sản phẩm");

  const updateData: any = {
    stockQuantity: { increment: quantity },
  };

  // Update product cost price to latest import price if provided
  if (typeof costPrice === "number" && costPrice >= 0) {
    updateData.costPrice = Math.round(costPrice);
  }

  const updated = await client.product.update({
    where: { id: productId },
    data: updateData,
  });

  await client.inventoryLog.create({
    data: {
      productId,
      orderId: null,
      changeType: "RESTOCK",
      quantityChange: quantity,
      stockBefore: updated.stockQuantity - quantity,
      stockAfter: updated.stockQuantity,
      costPrice: typeof costPrice === "number" && costPrice >= 0 ? Math.round(costPrice) : product.costPrice,
      performedBy: creatorName || "Admin",
      createdById: createdById || null,
      note: note || "Nhập kho",
    },
  });

  return updated;
}

export async function adjustStock(
  productId: string,
  newStock: number,
  note?: string,
  createdById?: string,
  creatorName?: string,
  tx?: PrismaTransaction
) {
  const client = tx || prisma;
  if (newStock < 0) throw new Error("Tồn kho không được âm");

  const product = await client.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new Error("Không tìm thấy sản phẩm");

  const diff = newStock - product.stockQuantity;

  const updated = await client.product.update({
    where: { id: productId },
    data: {
      stockQuantity: newStock,
    },
  });

  await client.inventoryLog.create({
    data: {
      productId,
      orderId: null,
      changeType: "MANUAL_ADJUST",
      quantityChange: diff,
      stockBefore: product.stockQuantity,
      stockAfter: updated.stockQuantity,
      performedBy: creatorName || "Admin",
      createdById: createdById || null,
      note: note || "Điều chỉnh kho",
    },
  });

  return updated;
}

export async function checkLowStock(threshold?: number) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      productType: "IN_STOCK",
      stockQuantity: { lte: threshold || 5 },
    },
    include: { category: true },
    orderBy: { stockQuantity: "asc" },
  });

  return products;
}
