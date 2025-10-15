import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
}

interface AirtableResponse {
  records: AirtableRecord[];
}

export default function MonthlySalesChart() {
  const [quoteCounts, setQuoteCounts] = useState([0, 0, 0]); 
  const [invoiceCounts, setInvoiceCounts] = useState([0, 0, 0]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Quotes
        const quoteRes = await fetch(
          "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblbF4N9Ixi3mRFKW",
          {
            headers: {
              Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
            },
          }
        );
        const quoteData: AirtableResponse = await quoteRes.json();
        const quoteStatusCounts = [
          quoteData.records.filter((r) => r.fields.Status === "Approved").length,
          quoteData.records.filter((r) => r.fields.Status === "Waiting for Approval").length,
          quoteData.records.filter((r) => r.fields.Status === "Pending").length,
        ];
        setQuoteCounts(quoteStatusCounts);

        // Fetch Invoices
        const invoiceRes = await fetch(
          "https://api.airtable.com/v0/appxmoiNZa85I7nye/tblIl5Qvrlok2MF5V",
          {
            headers: {
              Authorization: `Bearer patpiD7tGAqIjDtBc.2e94dc1d9c6b4dddd0e3d88371f7a123bf34dc9ccd05c8c2bc1219b370bfc609`,
            },
          }
        );
        const invoiceData: AirtableResponse = await invoiceRes.json();
        const invoiceStatusCounts = [
          invoiceData.records.filter((r) => r.fields.Status === "Active").length,
          invoiceData.records.filter((r) => r.fields.Status === "Pending").length,
          invoiceData.records.filter((r) => r.fields.Status === "Draft").length,
        ];
        setInvoiceCounts(invoiceStatusCounts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const series = [
    {
      name: "Quote Status",
      data: quoteCounts,
    },
    {
      name: "Invoice Status",
      data: invoiceCounts,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      height: 250,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 5,
      },
    },
    colors: ["#4caf50", "#2196f3"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Approved", "Waiting For Approval", "Pending"],
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val}` },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Quote & Invoice Status
      </h3>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <Chart options={options} series={series} type="bar" height={250} />
      )}
    </div>
  );
}
