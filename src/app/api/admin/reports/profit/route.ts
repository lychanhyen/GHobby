import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await requireStaff();
    if (!sessionData) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const product = searchParams.get("product")?.toLowerCase() || "";

    const where: any = {
      status: "COMPLETED",
    };

    if (from || to) {
      where.createdAt = {};
      if (from) {
        const fromDate = new Date(from + "T00:00:00");
        where.createdAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to + "T23:59:59");
        where.createdAt.lte = toDate;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let filteredOrders = orders;
    if (product) {
      filteredOrders = orders.filter((order: any) =>
        order.items.some((item: any) => {
          const name = (item.productName || item.product?.name || "").toLowerCase();
          const sku = (item.product?.sku || "").toLowerCase();
          return name.includes(product) || sku.includes(product);
        })
      );
    }

    const orderReports = filteredOrders.map((order: any) => {
      let revenue = 0;
      let cost = 0;
      for (const item of order.items) {
        revenue += item.priceAtOrder * item.quantity;
        cost += (item.costPriceAtOrder || 0) * item.quantity;
      }
      const profit = revenue - cost;
      const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
      return {
        id: order.id,
        orderCode: order.orderCode,
        createdAt: order.createdAt,
        customerName: order.customerName,
        revenue,
        cost,
        profit,
        marginPercent,
      };
    });

    // Aggregate by product
    const productMap = new Map<string, any>();
    for (const order of filteredOrders) {
      for (const item of order.items) {
        const key = item.product?.sku || item.productId;
        if (!productMap.has(key)) {
          productMap.set(key, {
            sku: item.product?.sku || "-",
            productName: item.productName || item.product?.name || "-",
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          });
        }
        const p = productMap.get(key);
        p.quantitySold += item.quantity;
        p.revenue += item.priceAtOrder * item.quantity;
        p.cost += (item.costPriceAtOrder || 0) * item.quantity;
        p.profit = p.revenue - p.cost;
      }
    }
    const productReports = Array.from(productMap.values()).sort((a, b) => b.profit - a.profit);

    const totals = orderReports.reduce(
      (acc: any, o: any) => {
        acc.revenue += o.revenue;
        acc.cost += o.cost;
        acc.profit += o.profit;
        return acc;
      },
      { revenue: 0, cost: 0, profit: 0 }
    );
    totals.marginPercent = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        orders: orderReports,
        products: productReports,
        totals,
      },
    });
  } catch (error: any) {
    console.error("Profit report error:", error);
    return NextResponse.json({ success: false, message: error.message || "Có lỗi xảy ra" }, { status: 500 });
  }
}
