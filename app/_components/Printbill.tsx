"use client";
import { useRef } from "react";
import { Printer, X, Download } from "lucide-react";
import { Job } from "../hooks/useJobs";
import html2pdf from "html2pdf.js";

interface Client {
  id: string;
  name: string;
  email?: string;
  contactNo: string;
  company?: string;
  address: string;
}

interface PrintBillProps {
  client: Client;
  jobs: Job[];
  onClose: () => void;
  userCompany: {
    name: string;
    address: string;
    contactNo: string;
    email?: string;
    gstin?: string;
    bankDetails?: {
      bankName: string;
      accountNo: string;
      ifscCode: string;
      branch: string;
    };
  };
}

const PrintBill = ({ client, jobs, onClose, userCompany }: PrintBillProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${client.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .page {
              max-width: 210mm;
              margin: 0 auto;
              page-break-after: always;
            }
            .page:last-child {
              page-break-after: auto;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Invoice_${client.name}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try printing instead.");
    }
  };

  const totalAmount = jobs.reduce((sum, job) => sum + job.amount, 0);
  const cgst = totalAmount * 0.09; // 9% CGST
  const sgst = totalAmount * 0.09; // 9% SGST
  const totalTax = cgst + sgst;
  const grandTotal = totalAmount + totalTax;

  const numberToWords = (num: number): string => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (num === 0) return "Zero";

    const convertHundreds = (n: number): string => {
      let str = "";
      if (n > 99) {
        str += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n > 19) {
        str += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 9) {
        str += teens[n - 10] + " ";
        return str;
      }
      str += ones[n] + " ";
      return str;
    };

    if (num >= 10000000) {
      return convertHundreds(Math.floor(num / 10000000)) + "Crore " + numberToWords(num % 10000000);
    }
    if (num >= 100000) {
      return convertHundreds(Math.floor(num / 100000)) + "Lakh " + numberToWords(num % 100000);
    }
    if (num >= 1000) {
      return convertHundreds(Math.floor(num / 1000)) + "Thousand " + numberToWords(num % 1000);
    }
    return convertHundreds(num);
  };

  const today = new Date().toLocaleDateString("en-GB");
  const invoiceNumber = `HTI/${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${Math.floor(Math.random() * 1000)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-auto relative">
        {/* Header Controls */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center no-print z-10">
          <h2 className="text-xl font-semibold">Print Invoice</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Print Content */}
        <div ref={printRef} className="p-8">
          {/* Page 1: Work Details */}
          <div className="page mb-8">
            <style>
              {`
                .work-details-page {
                  border: 2px solid #000;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
                .work-details-header {
                  text-align: center;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                }
                .work-details-header h1 {
                  font-size: 28px;
                  margin-bottom: 5px;
                  font-weight: bold;
                }
                .work-details-header p {
                  font-size: 14px;
                  margin: 2px 0;
                }
                .work-details-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 15px;
                }
                .work-details-table th,
                .work-details-table td {
                  border: 1px solid #000;
                  padding: 8px 4px;
                  text-align: center;
                  font-size: 12px;
                }
                .work-details-table th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                }
                .work-details-table td {
                  vertical-align: middle;
                }
                .work-details-table .text-left {
                  text-align: left;
                  padding-left: 8px;
                }
                .work-details-table .text-right {
                  text-align: right;
                  padding-right: 8px;
                }
                .total-row {
                  font-weight: bold;
                  background-color: #f9f9f9;
                }
                .amount-words {
                  margin-top: 15px;
                  font-weight: bold;
                  font-size: 13px;
                }
                .signature-section {
                  margin-top: 60px;
                  text-align: right;
                }
                .signature-line {
                  display: inline-block;
                  margin-top: 40px;
                  border-top: 1px solid #000;
                  padding-top: 5px;
                  min-width: 200px;
                  text-align: center;
                }
              `}
            </style>

            <div className="work-details-page">
              <div className="work-details-header">
                <h1>{userCompany.name}</h1>
                <p>({client.company || client.name})</p>
                <p style={{ fontWeight: "bold", marginTop: "10px" }}>
                  Party Name - {client.name}
                </p>
                <p style={{ fontWeight: "bold" }}>Date Wise Work Details</p>
              </div>

              <table className="work-details-table">
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ width: "40px" }}>S.No</th>
                    <th rowSpan={2} style={{ width: "90px" }}>Date</th>
                    <th rowSpan={2} style={{ width: "70px" }}>Ch. No.</th>
                    <th colSpan={2}>Item</th>
                    <th rowSpan={2} style={{ width: "60px" }}>Rate</th>
                    <th rowSpan={2} style={{ width: "80px" }}>Amount</th>
                    <th rowSpan={2} style={{ width: "80px" }}>Remark</th>
                  </tr>
                  <tr>
                    <th style={{ width: "180px" }}>Description</th>
                    <th style={{ width: "50px" }}>Time<br/>Hrs</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <tr key={job.id}>
                      <td>{index + 1}</td>
                      <td>{new Date(job.date).toLocaleDateString("en-GB")}</td>
                      <td>{job.challanNo}</td>
                      <td className="text-left">
                        {formatTime(job.startTime)}-{formatTime(job.endTime!)}
                      </td>
                      <td>{job.totalHours}</td>
                      <td className="text-right">{job.ratePerHour}</td>
                      <td className="text-right">{job.amount}</td>
                      <td></td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={6} className="text-right" style={{ paddingRight: "8px" }}>
                      Total
                    </td>
                    <td className="text-right">{totalAmount}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              <div className="amount-words">
                {numberToWords(Math.floor(totalAmount))} Rupees Only
              </div>

              <div className="signature-section">
                <div>{userCompany.name}</div>
                <div className="signature-line">Authorised Signature</div>
              </div>
            </div>
          </div>

          {/* Page 2: Tax Invoice */}
          <div className="page">
            <style>
              {`
                .tax-invoice-page {
                  border: 2px solid #000;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
                .tax-invoice-header {
                  text-align: center;
                  margin-bottom: 15px;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                }
                .tax-invoice-header h1 {
                  font-size: 24px;
                  margin-bottom: 5px;
                  font-weight: bold;
                }
                .tax-invoice-header p {
                  font-size: 11px;
                  margin: 2px 0;
                }
                .invoice-details {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 15px;
                  font-size: 12px;
                }
                .invoice-details-left,
                .invoice-details-right {
                  flex: 1;
                }
                .invoice-details-right {
                  border: 1px solid #000;
                  padding: 10px;
                  margin-left: 20px;
                }
                .invoice-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 15px;
                  margin-bottom: 15px;
                }
                .invoice-table th,
                .invoice-table td {
                  border: 1px solid #000;
                  padding: 8px;
                  font-size: 12px;
                }
                .invoice-table th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                  text-align: center;
                }
                .invoice-table td {
                  vertical-align: middle;
                }
                .tax-summary-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 15px;
                }
                .tax-summary-table td {
                  border: 1px solid #000;
                  padding: 6px 10px;
                  font-size: 12px;
                }
                .tax-summary-table .label {
                  text-align: right;
                  font-weight: bold;
                  width: 70%;
                }
                .tax-summary-table .value {
                  text-align: right;
                  width: 30%;
                }
                .grand-total-row {
                  font-weight: bold;
                  font-size: 13px;
                }
                .bank-details {
                  border: 1px solid #000;
                  padding: 10px;
                  margin-bottom: 15px;
                  font-size: 11px;
                }
                .bank-details p {
                  margin: 3px 0;
                }
                .tax-signature-section {
                  text-align: right;
                  margin-top: 40px;
                }
                .original-copy {
                  position: absolute;
                  top: 20px;
                  right: 20px;
                  border: 1px solid #000;
                  padding: 5px 10px;
                  font-size: 11px;
                  background-color: white;
                }
              `}
            </style>

            <div className="tax-invoice-page" style={{ position: "relative" }}>
              <div className="original-copy">Original Copy</div>
              
              <div style={{ fontSize: "11px", marginBottom: "5px" }}>
                GSTIN : {userCompany.gstin || "N/A"}
              </div>

              <div className="tax-invoice-header">
                <h1 style={{ textDecoration: "underline" }}>TAX INVOICE</h1>
                <h2 style={{ fontSize: "20px", marginTop: "5px" }}>{userCompany.name}</h2>
                <p>({client.company || "Shree Shyam Market"})</p>
                <p>{userCompany.address}</p>
                <p>Contact No. : {userCompany.contactNo}</p>
                {userCompany.email && <p>Email : {userCompany.email}</p>}
              </div>

              <div className="invoice-details">
                <div className="invoice-details-left">
                  <p><strong>Invoice No :</strong> {invoiceNumber}</p>
                  <p><strong>Dated :</strong> {today}</p>
                  <p><strong>Place :</strong> Rajasthan (08)</p>
                </div>
                <div className="invoice-details-right">
                  <p><strong>Billed to :</strong></p>
                  <p><strong>{client.name}</strong></p>
                  <p>{client.address}</p>
                  <p>GSTIN / UIN : {client.company ? "08AADCV9186G1ZP" : "N/A"}</p>
                  <p>State Name : Rajasthan, Code :08</p>
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>S.No.</th>
                    <th style={{ width: "60%" }}>Item / Work Description</th>
                    <th style={{ width: "80px" }}>HSN/SAC</th>
                    <th style={{ width: "60px" }}>Unit</th>
                    <th style={{ width: "100px" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "center" }}>1</td>
                    <td style={{ paddingLeft: "10px" }}>
                      <strong>Crane Charges</strong><br/>
                      Loading & Unloading of Materials<br/>
                      ( Work Details Enclosed )
                    </td>
                    <td style={{ textAlign: "center" }}>9428</td>
                    <td style={{ textAlign: "center" }}>Lot</td>
                    <td style={{ textAlign: "right", paddingRight: "10px" }}>{totalAmount}</td>
                  </tr>
                </tbody>
              </table>

              <table className="tax-summary-table">
                <tbody>
                  <tr>
                    <td className="label">Taxable Amount</td>
                    <td className="value">{totalAmount}</td>
                  </tr>
                  <tr>
                    <td className="label">CGST 9%</td>
                    <td className="value">{cgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="label">SGST 9%</td>
                    <td className="value">{sgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="label">Total Tax</td>
                    <td className="value">{totalTax.toFixed(2)}</td>
                  </tr>
                  <tr className="grand-total-row">
                    <td className="label">Grand Total</td>
                    <td className="value">{grandTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="label">Say Amount</td>
                    <td className="value">{Math.round(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "15px" }}>
                In Words :- {numberToWords(Math.round(grandTotal))} Rupees Only
              </div>

              {userCompany.bankDetails && (
                <div className="bank-details">
                  <p><strong>Bank Details :-</strong></p>
                  <p><strong>Bank :</strong> {userCompany.bankDetails.bankName}</p>
                  <p><strong>A/C No. :</strong> {userCompany.bankDetails.accountNo}</p>
                  <p><strong>Branch :</strong> {userCompany.bankDetails.branch}</p>
                  <p><strong>IFSC Code :-</strong> {userCompany.bankDetails.ifscCode}</p>
                </div>
              )}

              <div className="tax-signature-section">
                <div style={{ fontSize: "12px", marginBottom: "5px" }}>{userCompany.name}</div>
                <div style={{ marginTop: "50px", borderTop: "1px solid #000", display: "inline-block", paddingTop: "5px", minWidth: "200px" }}>
                  Authorised Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBill;