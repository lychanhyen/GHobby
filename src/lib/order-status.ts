export type CustomerOrderGroup =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export interface CustomerOrderGroupMeta {
  label: string;
  description: string;
  badgeClass: string;
  statuses: string[];
}

/**
 * Nhóm trạng thái hiển thị cho khách hàng.
 * Các trạng thái chi tiết trong DB được gộp lại thành 5 nhóm dễ hiểu.
 */
export const CUSTOMER_ORDER_GROUPS: Record<CustomerOrderGroup, CustomerOrderGroupMeta> = {
  PENDING: {
    label: "Đang chờ xử lý",
    description: "Đơn hàng đã được ghi nhận và đang chờ shop xác nhận.",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    statuses: ["PENDING_DEPOSIT", "PAYMENT_SUBMITTED", "PREORDER_PENDING"],
  },
  PROCESSING: {
    label: "Đang chuẩn bị hàng",
    description: "Shop đã xác nhận cọc và đang chuẩn bị hàng cho bạn.",
    badgeClass: "bg-ink-100 text-ink-700 border-ink-200",
    statuses: ["DEPOSITED", "PREORDER_DEPOSITED", "PREORDER_ARRIVED"],
  },
  SHIPPING: {
    label: "Đang giao hàng",
    description: "Đơn hàng đang trên đường đến bạn.",
    badgeClass: "bg-ink-50 text-ink-800 border-ink-300",
    statuses: ["SHIPPING"],
  },
  COMPLETED: {
    label: "Hoàn thành",
    description: "Đơn hàng đã được giao thành công.",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    statuses: ["COMPLETED"],
  },
  CANCELLED: {
    label: "Đã hủy",
    description: "Đơn hàng đã bị hủy hoặc hoàn trả.",
    badgeClass: "bg-accent-50 text-accent-700 border-accent-200",
    statuses: ["CANCELLED", "RETURNED"],
  },
};

export const CUSTOMER_ORDER_GROUP_KEYS: CustomerOrderGroup[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_TO_GROUP: Record<string, CustomerOrderGroup> = Object.entries(
  CUSTOMER_ORDER_GROUPS
).reduce((acc, [group, meta]) => {
  for (const status of meta.statuses) {
    acc[status] = group as CustomerOrderGroup;
  }
  return acc;
}, {} as Record<string, CustomerOrderGroup>);

export function getCustomerOrderGroup(status: string): CustomerOrderGroup {
  return STATUS_TO_GROUP[status] ?? "PENDING";
}

export function getCustomerOrderGroupMeta(status: string): CustomerOrderGroupMeta {
  return CUSTOMER_ORDER_GROUPS[getCustomerOrderGroup(status)];
}

export function isCustomerOrderGroup(value: string | undefined): value is CustomerOrderGroup {
  return Boolean(value && CUSTOMER_ORDER_GROUP_KEYS.includes(value as CustomerOrderGroup));
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_DEPOSIT: "Chờ thanh toán cọc",
  PAYMENT_SUBMITTED: "Đã chuyển khoản, chờ xác nhận",
  DEPOSITED: "Đã cọc, đang xử lý",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  RETURNED: "Trả hàng",
  PREORDER_PENDING: "Pre-order - Chờ cọc",
  PREORDER_DEPOSITED: "Pre-order - Đã cọc",
  PREORDER_ARRIVED: "Pre-order - Hàng đã về",
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status;
}

export function getShippingMethodLabel(shippingMethod: string): string {
  return shippingMethod === "STORE_PICKUP" ? "Nhận tại cửa hàng" : "Giao hàng tận nơi";
}
