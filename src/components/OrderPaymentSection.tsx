"use client";

import { useState } from "react";
import { Copy, Check, CreditCard } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";

interface OrderPaymentSectionProps {
  order: any;
  settings: any;
  token?: string;
}

export default function OrderPaymentSection({ order, settings, token }: OrderPaymentSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(order.status === "PAYMENT_SUBMITTED");
  const [errorMsg, setErrorMsg] = useState("");

  const bankConfig = settings?.bank_config || {
    bankId: settings?.bankId || "MB",
    bankAccount: settings?.bankAccount || "",
    bankAccountName: settings?.bankAccountName || "",
  };

  const depositAmount = order.depositRequired;
  const bankId = bankConfig.bankId || settings?.bankId || "MB";
  const accountNo = bankConfig.bankAccount || settings?.bankAccount || "";
  const accountName = bankConfig.bankAccountName || settings?.bankAccountName || "";

  if (!accountNo || !accountName) {
    return (
      <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink-950">
          <CreditCard className="h-4 w-4 text-ink-500" />
          <span>Thanh toán tiền cọc</span>
        </h2>
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          Chưa cấu hình thông tin tài khoản ngân hàng. Vui lòng liên hệ shop để được hướng dẫn thanh toán.
        </div>
      </div>
    );
  }

  const vietQRUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(order.orderCode)}&accountName=${encodeURIComponent(accountName)}`;

  const copyToClipboard = (text: string, type: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {}
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/orders/${order.orderCode}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token } : {}),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      setErrorMsg("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink-950">
        <CreditCard className="h-4 w-4 text-ink-500" />
        <span>Thanh toán tiền cọc</span>
      </h2>

      {submitted ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">Đã ghi nhận chuyển khoản</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-700">
            Chúng tôi đã nhận thông tin "Tôi đã chuyển khoản". Vui lòng chờ admin xác nhận trong thời gian sớm nhất.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Vui lòng quét mã QR bên dưới để chuyển khoản tiền cọc{" "}
            <span className="font-bold text-amber-700">{formatCurrencyVND(depositAmount)}</span>
          </p>

          {errorMsg && (
            <div className="mt-3 rounded-md border border-accent-200 bg-accent-50 p-3 text-sm text-accent-700">
              {errorMsg}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-5 md:flex-row">
            <div className="mx-auto w-full max-w-[248px] shrink-0 md:mx-0">
              <img
                src={vietQRUrl}
                alt="VietQR Code"
                className="h-auto w-full rounded-md border border-ink-200 bg-white"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="divide-y divide-ink-200 rounded-md border border-ink-200 bg-ink-50 px-4">
                <div className="py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">Ngân hàng</p>
                  <p className="mt-0.5 text-sm font-bold text-ink-950">{bankId}</p>
                </div>
                <div className="py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">Số tài khoản</p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-bold text-ink-950">{accountNo}</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(accountNo, "account")}
                      aria-label="Sao chép số tài khoản"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-500 transition-colors duration-200 hover:border-ink-900 hover:text-ink-950"
                    >
                      {copied === "account" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">Tên chủ tài khoản</p>
                  <p className="mt-0.5 text-sm font-bold text-ink-950">{accountName}</p>
                </div>
                <div className="py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">Nội dung chuyển khoản</p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-bold text-ink-950">{order.orderCode}</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.orderCode, "code")}
                      aria-label="Sao chép nội dung chuyển khoản"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-500 transition-colors duration-200 hover:border-ink-900 hover:text-ink-950"
                    >
                      {copied === "code" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-500">Số tiền</p>
                  <p className="mt-0.5 text-sm font-bold text-amber-700">
                    {formatCurrencyVND(depositAmount)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">
                * Vui lòng chuyển khoản chính xác nội dung để được xác nhận nhanh chóng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={submitting}
            className="btn-primary mt-5 h-11 w-full px-5"
          >
            {submitting ? "Đang xử lý..." : "Tôi đã chuyển khoản"}
          </button>
        </>
      )}
    </div>
  );
}
