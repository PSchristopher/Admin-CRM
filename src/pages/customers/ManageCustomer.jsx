import * as Icons from "react-icons/tb";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Input from "../../components/common/Input.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import TableAction from "../../components/common/TableAction.jsx";
import SelectOption from "../../components/common/SelectOption.jsx";
import api from "../../lib/apiClient.js";

const ManageCustomer = () => {
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableRow, setTableRow] = useState([
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ]);

  // Fetch customers from backend
  const { data: customersData, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', currentPage, selectedValue, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedValue.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const { data } = await api.get(`/user`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const customers = customersData?.data || [];
  const totalPages = customersData?.totalPages || 1;

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "category", label: "Category" },
    { value: "status", label: "Status" },
  ];

  const bulkActionDropDown = (selectedOption) => {
    console.log(selectedOption);
  };

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleBulkCheckbox = (isCheck) => {
    setBulkCheck(isCheck);
    if (isCheck) {
      const updateChecks = {};
      customers.forEach((customer) => {
        updateChecks[customer.id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckCustomer = (isCheck, id) => {
    setSpecificChecks((prevSpecificChecks) => ({
      ...prevSpecificChecks,
      [id]: isCheck,
    }));
  };

  const showTableRow = (selectedOption) => {
    setSelectedValue(selectedOption.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };


  const actionItems = ["Delete", "edit"];

  const handleActionItemClick = async (item, itemID) => {
    const updateItem = item.toLowerCase();
    if (updateItem === "delete") {
      if (window.confirm(`Are you sure you want to delete customer #${itemID}?`)) {
        try {
          await api.delete(`/customers/${itemID}`);
          refetch(); // Refresh the data
          alert(`Customer #${itemID} deleted successfully`);
        } catch (error) {
          console.error('Delete failed:', error);
          alert('Failed to delete customer');
        }
      }
    } else if (updateItem === "edit") {
      navigate(`/customers/manage/${itemID}`);
    }
  };


  return (
    <section className="customer">
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
                placeholder="Search Customer..."
                className="sm table_search"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="btn_parent">
                <Link to="/customers/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Customer</span>
                </Link>
                <Button label="Advance Filter" className="sm" />
                <Button label="save" className="sm" />
              </div>
            </div>
            <div className="content_body">
              {isLoading ? (
                <div className="loading">Loading customers...</div>
              ) : error ? (
                <div className="error">Error loading customers: {error.message}</div>
              ) : (
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
                        <th className="td_id">id</th>
                        <th className="td_image">image</th>
                        <th colSpan="4">name</th>
                        <th>email</th>
                        <th>orders</th>
                        <th className="td_status">status</th>
                        <th className="td_date">created at</th>
                        <th>actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer, key) => {
                      return (
                        <tr key={key}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) =>
                                handleCheckCustomer(isCheck, customer.id)
                              }
                              isChecked={specificChecks[customer.id] || false}
                            />
                          </td>
                          <td className="td_id">{customer.id}</td>
                          <td className="td_image">
                            <img
                              src={customer.image || customer.avatar || '/default-avatar.png'}
                              alt={customer.name}
                            />
                          </td>
                          <td colSpan="4">
                            <Link to={customer.id.toString()}>{customer.name}</Link>
                          </td>
                          <td>{customer.email}</td>
                          <td>{customer.ordersCount || 0}</td>
                          <td className="td_status">
                            {customer.status.toLowerCase() === "active" ||
                             customer.status.toLowerCase() === "completed" ||
                             customer.status.toLowerCase() === "new" ||
                             customer.status.toLowerCase() === "coming soon" ? (
                               <Badge
                                 label={customer.status}
                                 className="light-success"
                               />
                             ) : customer.status.toLowerCase() === "inactive" ||
                               customer.status.toLowerCase() === "out of stock" ||
                               customer.status.toLowerCase() === "locked" ||
                               customer.status.toLowerCase() === "discontinued" ? (
                               <Badge
                                 label={customer.status}
                                 className="light-danger"
                               />
                             ) : customer.status.toLowerCase() === "on sale" ||
                                 customer.status.toLowerCase() === "featured" ||
                                 customer.status.toLowerCase() === "pending" ? (
                               <Badge
                                 label={customer.status}
                                 className="light-warning"
                               />
                             ) : customer.status.toLowerCase() === "archive" ||
                                 customer.status.toLowerCase() === "pause" ? (
                               <Badge
                                 label={customer.status}
                                 className="light-secondary"
                               />
                             ) : (
                               ""
                             )}
                          </td>
                          <td className="td_date">{new Date(customer.createdAt).toLocaleDateString()}</td>
                          
                          <td className="td_action">
                            <TableAction
                              actionItems={actionItems}
                              onActionItemClick={(item) =>
                                handleActionItemClick(item, customer.id)
                              }
                            />
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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

export default ManageCustomer;