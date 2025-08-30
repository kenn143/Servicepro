import { useState } from "react";
import { Send } from "lucide-react"; 

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  invoiceNumber: string;
  amount: string;
}

const dummyData: Customer[] = [
  {
    id: 1,
    name: "Rowel Tabiolo",
    email: "rtabs@gmail.com",
    phone: "0917-111-1111",
    address: "test",
    city: "test",
    state: "Metro ",
    zip: "1000",
    country: "Philippines",
    invoiceNumber: "",
    amount: "",
  },
  {
    id: 2,
    name: "test",
    email: "test@example.com",
    phone: "0917-222-2222",
    address: "test",
    city: "Cebu",
    state: "Cebu",
    zip: "test",
    country: "test",
    invoiceNumber: "test",
    amount: "$test",
  },
  
];

export default function InvoiceList() {
  const [query, setQuery] = useState("");

  const filteredData = dummyData.filter((customer) =>
    customer.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6  rounded-2xl shadow">
      <div className="mb-6">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow">
          <Send size={18} />
          Send Invoice
        </button>
      </div>

      <div className="mb-6 flex justify-start">
        <input
          type="text"
          placeholder="Search customer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border rounded-md px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100 dark:bg-black dark:text-white">
            <tr>
              <th className="px-3 py-2 border">ID</th>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Phone</th>
              <th className="px-3 py-2 border">Address</th>
              <th className="px-3 py-2 border">City</th>
              <th className="px-3 py-2 border">State</th>
              <th className="px-3 py-2 border">ZIP</th>
              <th className="px-3 py-2 border">Country</th>
              <th className="px-3 py-2 border">Invoice</th>
              <th className="px-3 py-2 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800">
                <td className="px-3 py-2 border">{customer.id}</td>
                <td className="px-3 py-2 border">{customer.name}</td>
                <td className="px-3 py-2 border">{customer.email}</td>
                <td className="px-3 py-2 border">{customer.phone}</td>
                <td className="px-3 py-2 border">{customer.address}</td>
                <td className="px-3 py-2 border">{customer.city}</td>
                <td className="px-3 py-2 border">{customer.state}</td>
                <td className="px-3 py-2 border">{customer.zip}</td>
                <td className="px-3 py-2 border">{customer.country}</td>
                <td className="px-3 py-2 border">{customer.invoiceNumber}</td>
                <td className="px-3 py-2 border">{customer.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
