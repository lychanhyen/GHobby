"use client";

import { useState } from "react";
import { Copy, Check, CreditCard } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";

interface OrderPaymentSectionProps {
  order: any;
  settings: any;
}

export default function OrderPaymentSection({ order, settings }: OrderPaymentSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(order.status === "PAYMENT_SUBMITTED");

  const bankConfig = settings.bank_config || {
    bankId: "MB",
    bankAccount: settings.bankAccount || "",
    bankAccountName: settings.bankAccountName || "",
  };

  const depositAmount = order.depositRequired;
  const bankId = bankConfig.bankId || "MB";
  const accountNo = bankConfig.bankAccount || "";
  const accountName = bankConfig.bankAccountName || "";
  
  const vietQRUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(order.orderCode)}&accountName=${encodeURIComponent(accountName)}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.orderCode}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        alert("Đã ghi nhận thông tin chuyển khoản. Vui lòng chờ admin xác nhận.");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
        <CreditCard className="w-5 h-5 text-red-600" />
        <span>Thanh toán tiền cọc</span>
      </h2>

      {submitted ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-bold text-yellow-800">Đã ghi nhận chuyển khoản</p>
          <p className="text-sm text-yellow-700 mt-1">
            Chúng tôi đã nhận thông tin "Tôi đã chuyển khoản". Vui lòng chờ admin xác nhận trong thời gian sớm nhất.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600 mb-4">
            Vui lòng quét mã QR bên dưới để chuyển khoản tiền cọc <span className="font-bold text-red-600">{formatCurrencyVND(depositAmount)}</span>
          </p>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0">
              <img
                src={vietQRUrl}
                alt="VietQR Code"
                className="w-64 h-64 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ngân hàng</p>
                  <p className="font-bold text-slate-900">{bankId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Số tài khoản</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 font-mono">{accountNo}</p>
                    <button
                      onClick={() => copyToClipboard(accountNo, "account")}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {copied === "account" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tên chủ tài khoản</p>
                  <p className="font-bold text-slate-900">{accountName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Nội dung chuyển khoản</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-red-600 font-mono">{order.orderCode}</p>
                    <button
                      onClick={() => copyToClipboard(order.orderCode, "code")}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {copied === "code" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Số tiền</p>
                  <p className="font-bold text-red-600">{formatCurrencyVND(depositAmount)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                * Vui lòng chuyển khoản chính xác nội dung để được xác nhận nhanh chóng
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Đang xử lý..." : "Tôi đã chuyển khoản"}
          </button>
        </>
      )}
    </div>
  );
}
