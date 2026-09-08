import { QrcodeOutlined } from "@ant-design/icons";
import { PaymentMethodEnum } from "../../../enums/order.enum";
import type { IPaymentOption } from "../../../models/data/settings/settings.response";
import { formatPeso } from "../../../utils/formatter.utils";
import {
  amountDue,
  amountDueValue,
  qrImage,
  qrMeta,
  qrMetaLabel,
  qrMetaValue,
  qrPanel,
  sectionHint,
} from "../../../styles/online/online.css";

interface PaymentQrPanelProps {
  option: IPaymentOption;
  qrUrl: string | null;
  amount: number;
}

/// What the customer needs in order to pay: the exact amount, the QR to scan,
/// and the name on the account so they can check they are paying the right shop
/// before any money moves.
///
/// The QR is only shown for GCash — a bank transfer is made from account
/// details, and showing a wallet QR beside them would invite paying the wrong
/// one.
const PaymentQrPanel = ({ option, qrUrl, amount }: PaymentQrPanelProps) => {
  const showQr = option.method === PaymentMethodEnum.GCash && Boolean(qrUrl);

  return (
    <>
      <div className={amountDue}>
        <span>Send exactly</span>
        <span className={amountDueValue}>{formatPeso(amount)}</span>
      </div>

      <div className={qrPanel}>
        {showQr ? (
          <img src={qrUrl as string} alt="Scan to pay" className={qrImage} />
        ) : null}

        <div className={qrMeta}>
          {option.bankName ? (
            <>
              <span className={qrMetaLabel}>Bank</span>
              <span className={qrMetaValue}>{option.bankName}</span>
            </>
          ) : null}

          {option.accountName ? (
            <>
              <span className={qrMetaLabel}>Account name</span>
              <span className={qrMetaValue}>{option.accountName}</span>
            </>
          ) : null}

          {option.accountNumber ? (
            <>
              <span className={qrMetaLabel}>
                {option.method === PaymentMethodEnum.GCash
                  ? "Mobile number"
                  : "Account number"}
              </span>
              <span className={qrMetaValue}>{option.accountNumber}</span>
            </>
          ) : null}

          {!option.accountName && !option.accountNumber && !showQr ? (
            <p className={sectionHint} style={{ margin: 0 }}>
              <QrcodeOutlined /> The shop hasn't finished setting up this payment
              method. Try the other one, or give them a ring.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default PaymentQrPanel;
