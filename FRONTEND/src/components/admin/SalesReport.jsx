import React, { useState, useEffect } from "react";
import { Calendar, Download, FileSpreadsheet, FileIcon } from "lucide-react";
import axios from "../../axios/adminAxios";
import { Toaster,toast } from "react-hot-toast";
//import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns'
//import { isValid } from 'date-fns';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  isValid,
  parseISO,
} from "date-fns";

const SalesReport = () => {
  const [dateRange, setDateRange] = useState("daily");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  //const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(9);
  const [error, setError] = useState(""); 

  const [salesData, setSalesData] = useState({
    orders: [],
    totalSales: 0,
    totalRevenue: 0,
    totalDiscounts: 0,
    salesCount: 0,
  });

  useEffect(() => {
    fetchSalesData();
  }, [dateRange, startDate, endDate]);

  useEffect(() => {
    console.log("Sales Data Orders:", salesData.orders);
  }, [salesData]);

  const formatDate = (date) => {
    if (!date || isNaN(Date.parse(date))) {
      return "Invalid Date";
    }
    return new Date(date).toLocaleDateString("en-GB"); // Use en-GB format for DD/MM/YYYY
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      let start, end;
      switch (dateRange) {
        case "daily":
          start = startOfDay(startDate);
          end = endOfDay(startDate);
          break;
        case "weekly":
          start = startOfWeek(startDate);
          end = endOfWeek(startDate);
          break;
        case "yearly":
          start = startOfYear(startDate);
          end = endOfYear(startDate);
          break;
        case "custom":
          if (startDate > endDate) {
            setError("Start date cannot be after end date.");
            setLoading(false);
            return;
          }
          setError(""); // Clear error if valid
          start = startOfDay(startDate);
          end = endOfDay(endDate);

          break;
        default:
          start = startOfDay(new Date());
          end = endOfDay(new Date());
      }

      console.log(
        "Fetching data from",
        format(start, "yyyy-MM-dd"),
        "to",
        format(end, "yyyy-MM-dd")
      );

      const response = await axios.get("/salesreport", {
        params: {
          startDate: format(start, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          endDate: format(end, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        },
      });

      console.log("API response data:", response.data);

      const orders = response.data.orders || [];
      const totalSales = response.data.totalSales || 0;
      const totalRevenue = response.data.totalRevenue || 0;
      const totalDiscounts = response.data.totalDiscounts || 0;

      setSalesData({
        orders,
        totalSales,
        totalRevenue,
        totalDiscounts,
        salesCount: orders.length,
      });
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setSalesData({
        orders: [],
        totalSales: 0,
        totalRevenue: 0,
        totalDiscounts: 0,
        salesCount: 0,
      });
    }
    setLoading(false);
  };

  const handleDateRangeChange = (e) => {
    e.preventDefault(); // Prevent default behavior to avoid page refresh

    const selectedRange = e.target.value;
    setDateRange(selectedRange);

    const currentDate = new Date();
    let newStartDate = startDate;
    let newEndDate = endDate;

    switch (selectedRange) {
      case "daily":
        newStartDate = currentDate;
        newEndDate = currentDate;
        break;
      case "weekly":
        newStartDate = startOfWeek(currentDate);
        newEndDate = endOfWeek(currentDate);
        break;
      case "yearly":
        newStartDate = startOfYear(currentDate);
        newEndDate = endOfYear(currentDate);
        break;
      case "custom":
        newStartDate = currentDate;
        newEndDate = currentDate;
      default:
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setError("");
  };

  const handleDateChange = (date, setterFunction, isStart = true) => {
    const newDate = new Date(date);
    
    // First check if it's a valid date
    if (!isValid(newDate)) {
      setError("Please enter a valid date");
      return;
    }

    // For start date
    if (isStart) {
      if (dateRange === 'custom' && newDate > endDate) {
        setError("Start date cannot be after end date");
        return;
      }
      setStartDate(newDate);
    } 
    // For end date
    else {
      if (dateRange === 'custom' && newDate < startDate) {
        setError("End date cannot be before start date");
        return;
      }
      setEndDate(newDate);
    }
    
    // Clear error if validation passes
    setError("");
  };


  const handleStartDateChange = (e) => {
    handleDateChange(e.target.value, setStartDate, true);
  };

  const handleEndDateChange = (e) => {
    handleDateChange(e.target.value, setEndDate, false);
  };

  const formatDateForInput = (date) => {
    return format(date, "yyyy-MM-dd"); // Format for HTML date input
  };

  const handleDownload = async (format) => {
    try {
      const response = await axios.get(`/downloadreport`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format,
          dateRange ,
        },
        responseType: "blob", // To handle binary data
      });

      const mimeType =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // For .xlsx

      const blob = new Blob([response.data], { type: mimeType });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `sales_report.${format}`;
      link.click();
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download the report. Please try again.");
    }
  };

  const ProductCell = ({ items }) => {
    return (
      <div>
        {items.map((item, idx) => (
          <div key={idx} className="mb-2 border-b last:border-b-0 pb-2">
            <div className="font-medium">{item.productId.name}</div>
            <div className="text-sm text-gray-600">
              <div>Quantity: {item.quantity}</div>
              <div>Price: ₹{item.price.toFixed(2)}</div>
              {item.productId.categoryId && (
                <div className="text-xs text-gray-500">
                  Category: {item.productId.categoryId.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const OffersCell = ({ item, orderDate }) => {
    const orderDateStr = new Date(orderDate).toLocaleDateString();

    return (
      <div className="mb-2">
        {item.offers ? (
          <div>
            {item.offers.appliedDiscount > 0 ? (
              <>
                <div className="font-medium text-pink-600">
                  {item.offers.name}
                </div>
                <div className="text-sm">
                  <div>{item.offers.discountPercentage}% off</div>
                  <div className="text-pink-600">
                    -₹{item.offers.appliedDiscount.toFixed(2)}
                  </div>
                  {item.offers.validFrom && item.offers.validTo && (
                    <div className="text-gray-500 text-xs">
                      Valid:{" "}
                      {new Date(item.offers.validFrom).toLocaleDateString()} -{" "}
                      {new Date(item.offers.validTo).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <span className="text-gray-400">
                No offer applicable on {orderDateStr}
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">
            No offer available on {orderDateStr}
          </span>
        )}
      </div>
    );
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders =
    salesData?.orders?.slice(indexOfFirstOrder, indexOfLastOrder) || [];
  const totalPages = Math.ceil(
    (salesData?.orders?.length || 0) / ordersPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">Sales Report</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <select
          value={dateRange}
          onChange={handleDateRangeChange}
          className="border border-pink-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom Date Range</option>
        </select>

        {dateRange === "custom" && (
          <>
            <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className={`border ${
              error && error.includes("Start date") 
                ? "border-red-500 focus:ring-red-500" 
                : "border-pink-300 focus:ring-pink-500"
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2`}
          />
          {error && error.includes("Start date") && (
            <span className="text-red-500 text-sm mt-1">{error}</span>
          )}
             <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            className={`border ${
              error && error.includes("End date") 
                ? "border-red-500 focus:ring-red-500" 
                : "border-pink-300 focus:ring-pink-500"
            } rounded-md px-3 py-2 focus:outline-none focus:ring-2`}
          />
          {error && error.includes("End date") && (
            <span className="text-red-500 text-sm mt-1">{error}</span>
          )}
          </>
        )}

<button
  onClick={() => {
    if (!error) fetchSalesData();
    else toast.error(error); // Show error as a toast
  }}
  className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors duration-300"
  disabled={error !== ""}
>
  <Calendar className="inline-block mr-2" size={18} />
  Apply Filter
</button>


      </div>

      {loading ? (
        <p className="text-center text-pink-600">Loading sales data...</p>
      ) : salesData.orders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-pink-100 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-pink-800">
                Total Orders
              </h2>
              <p className="text-3xl font-bold text-pink-600">
                {salesData.salesCount}
              </p>
            </div>
            <div className="bg-pink-100 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-pink-800">
                Gross Sales
              </h2>
              <p className="text-3xl font-bold text-pink-600">
                ₹{salesData.totalSales.toFixed(2)}
              </p>
            </div>
            <div className="bg-pink-100 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-pink-800">
                Total Discounts
              </h2>
              <p className="text-3xl font-bold text-pink-600">
                ₹{salesData.totalDiscounts.toFixed(2)}
              </p>
            </div>
            <div className="bg-pink-100 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-pink-800">
                Net Revenue
              </h2>
              <p className="text-3xl font-bold text-pink-600">
                ₹{salesData.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mb-6">
            <button
              onClick={() => handleDownload("pdf")}
              className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors duration-300"
            >
              <FileIcon className="inline-block mr-2" size={18} />
              Download PDF
            </button>
            <button
              onClick={() => handleDownload("xlsx")}
              className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors duration-300"
            >
              <FileSpreadsheet className="inline-block mr-2" size={18} />
              Download Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-pink-200">
              <thead className="bg-pink-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Order ID</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Products</th>
                  <th className="py-2 px-4 border-b text-left">
                    Offers Applied
                  </th>
                  <th className="py-2 px-4 border-b text-left">Total</th>
                  <th className="py-2 px-4 border-b text-left">Discount</th>
                  <th className="py-2 px-4 border-b text-left">Final Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((orderData) => (
                  <tr key={orderData.order._id} className="hover:bg-pink-50">
                    <td className="py-2 px-4 border-b">
                      {orderData.order._id}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatDate(orderData.order.orderDate)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <ProductCell items={orderData.order.items} />
                    </td>
                    <td className="py-2 px-4 border-b">
                      {orderData.order.items.map((item, idx) => (
                        <OffersCell key={idx} item={item} />
                      ))}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ₹{orderData.order.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-pink-600">
                      ₹{(orderData.totalOrderDiscount || 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b font-medium">
                      ₹
                      {(
                        orderData.order.totalPrice -
                        (orderData.totalOrderDiscount || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div>
              <span className="text-pink-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors duration-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors duration-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-pink-600">
          No sales data available for the selected period.
        </p>
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default SalesReport;
