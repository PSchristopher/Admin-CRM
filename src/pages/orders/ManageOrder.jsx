import { Link, useNavigate } from "react-router-dom";
import * as Icons from "react-icons/tb";
import React, { useState, useEffect } from "react";
import Input from "../../components/common/Input.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import TableAction from "../../components/common/TableAction.jsx";
import SelectOption from "../../components/common/SelectOption.jsx";
import api from "../../lib/apiClient.js";

const ManageOrders = () => {
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(20);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [tableRow, setTableRow] = useState([
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ]);

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "category", label: "Category" },
    { value: "status", label: "Status" },
  ];

  // Fetch orders from backend API
  const fetchOrders = async (page = currentPage, limit = selectedValue, search = searchQuery) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };
      
      if (search) {
        params.q = search;
      }

      const response = await api.get("/admin/orders", { params });
      
      if (response.data) {
        setOrders(response.data.data);
        setTotalPages(Math.ceil(response.data.total / response.data.limit));
        setCurrentPage(response.data.page);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedValue]);

  const bulkActionDropDown = (selectedOption) => {
    console.log(selectedOption);
    // Implement bulk actions here
    if (selectedOption.value === "delete") {
      // Handle bulk delete
      const selectedOrderIds = Object.keys(specificChecks).filter(id => specificChecks[id]);
      if (selectedOrderIds.length > 0) {
        if (window.confirm(`Are you sure you want to delete ${selectedOrderIds.length} orders?`)) {
          // Implement bulk delete API call
          console.log("Deleting orders:", selectedOrderIds);
        }
      }
    }
  };

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleBulkCheckbox = (isCheck) => {
    setBulkCheck(isCheck);
    if (isCheck) {
      const updateChecks = {};
      orders.forEach((order) => {
        updateChecks[order.id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckOrder = (isCheck, id) => {
    setSpecificChecks((prevSpecificChecks) => ({
      ...prevSpecificChecks,
      [id]: isCheck,
    }));
  };

  const showTableRow = (selectedOption) => {
    setSelectedValue(selectedOption.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Debounce search or implement search on enter
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchOrders(1, selectedValue, searchQuery);
  };

  const actionItems = ["Delete", "View", "Edit"];

  const handleActionItemClick = (item, itemID) => {
    const updateItem = item.toLowerCase();
    if (updateItem === "delete") {
      if (window.confirm(`Are you sure you want to delete order #${itemID}?`)) {
        // Implement delete API call
        alert(`#${itemID} item delete`);
      }
    } else if (updateItem === "view") {
      navigate(`/orders/manage/${itemID.toString()}`);
    } else if (updateItem === "edit") {
      navigate(`/orders/edit/${itemID.toString()}`);
    }
  };

  const getCustomerName = (order) => {
    if (order.customer) {
      return `${order.customer.first_name} ${order.customer.last_name}`.trim();
    }
    return "N/A";
  };

  const getCustomerEmail = (order) => {
    return order.customer?.email || order.contact_email || "N/A";
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    
    if (["active", "completed", "approved", "delivered", "shipped", "new", "coming soon"].includes(statusLower)) {
      return "light-success";
    } else if (["inactive", "out of stock", "rejected", "locked", "discontinued", "cancelled"].includes(statusLower)) {
      return "light-danger";
    } else if (["on sale", "featured", "shipping", "processing", "pending", "partially_fulfilled"].includes(statusLower)) {
      return "light-warning";
    } else if (["archive", "pause", "draft"].includes(statusLower)) {
      return "light-secondary";
    }
    return "";
  };

  if (loading) {
    return (
      <section className="orders">
        <div className="container">
          <div className="wrapper">
            <div className="content transparent">
              <div className="loading">Loading orders...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="orders">
        <div className="container">
          <div className="wrapper">
            <div className="content transparent">
              <div className="error">Error: {error}</div>
              <Button 
                label="Retry" 
                onClick={() => fetchOrders()} 
                className="sm" 
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="orders">
      <div className="container">
        <div className="wrapper">
          <div className="content transparent">
            <div className="content_head">
              <Dropdown
                placeholder="Bulk Action"
                className="sm"
                onClick={bulkActionDropDown}
                options={bulkAction}
              />
              <Input
                placeholder="Search Order..."
                className="sm table_search"
                value={searchQuery}
                onChange={handleSearch}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              <div className="btn_parent">
                <Link to="/orders/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Order</span>
                </Link>
                <Button label="Advance Filter" className="sm" />
                <Button label="Search" onClick={handleSearchSubmit} className="sm" />
              </div>
            </div>
            <div className="content_body">
              <div className="table_responsive">
                <table className="separate">
                  <thead>
                    <tr>
                      <th className="td_checkbox">
                        <CheckBox
                          onChange={handleBulkCheckbox}
                          isChecked={bulkCheck}
                        />
                      </th>
                      <th className="td_id">ID</th>
                      <th>Customers</th>
                      <th>Email</th>
                      <th>Amount</th>
                      <th>Tax Amount</th>
                      <th>Shipping Amount</th>
                      <th>Discount</th>
                      <th>Payment Status</th>
                      <th>Fulfillment Status</th>
                      <th>Status</th>
                      {/* <th>Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) =>
                                handleCheckOrder(isCheck, order.id)
                              }
                              isChecked={specificChecks[order.id] || false}
                            />
                          </td>
                          <td className="td_id">{order.id}</td>
                          <td>
                            {order.customer ? (
                              <Link to={`/customers/manage/${order.customer.id}`}>
                                {getCustomerName(order)}
                              </Link>
                            ) : (
                              getCustomerName(order)
                            )}
                          </td>
                          <td>{getCustomerEmail(order)}</td>
                          <td>${order.total_price}</td>
                          <td>${order.total_tax}</td>
                          <td>${order.total_shipping_price}</td>
                          <td>${order.total_discount}</td>
                          <td>
                            <Badge 
                              label={order.financial_status || "N/A"} 
                              className={`${getStatusBadgeClass(order.financial_status || "")}text-white`}
                            />
                          </td>
                         <td>
  <Badge 
    label={order.fulfillment_status || "Unfulfilled"} 
    className={`${getStatusBadgeClass(order.fulfillment_status || "")} text-white`}
  />
</td>
<td>
  <Badge 
    label={order.status} 
    className={`${getStatusBadgeClass(order.status)} text-white`}
  />
</td>
                          {/* <td className="td_action">
                            <TableAction
                              actionItems={actionItems}
                              onActionItemClick={(item) =>
                                handleActionItemClick(item, order.id)
                              }
                            />
                          </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="content_footer">
              <Dropdown
                className="top show_rows sm"
                placeholder="please select"
                selectedValue={selectedValue}
                onClick={showTableRow}
                options={tableRow}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManageOrders;