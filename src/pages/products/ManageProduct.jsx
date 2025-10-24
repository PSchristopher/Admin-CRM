import * as Icons from "react-icons/tb";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/common/Input.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Offcanvas from "../../components/common/Offcanvas.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import TableAction from "../../components/common/TableAction.jsx";
import RangeSlider from "../../components/common/RangeSlider.jsx";
import MultiSelect from "../../components/common/MultiSelect.jsx";
import api from "../../lib/apiClient.js";
import { useQuery } from "@tanstack/react-query";
import Loader from "../../components/common/Loader.jsx";

const ManageProduct = () => {
  const [fields, setFields] = useState({
    name: "",
    sku: "",
    store: "",
    status: "",
    priceRange: [0, 100],
  });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(5);
  const [tableRow, setTableRow] = useState([
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ]);

  const handleInputChange = (key, value) => {
    setFields({
      ...fields,
      [key]: value,
    });
  };

  const { data: rawProducts = { data: [], pagination: {} }, isLoading , refetch} = useQuery({
    queryKey: ["products", currentPage, selectedValue],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedValue.toString(),
      });
      const res = await api.get(`/admin/products?${params.toString()}`);
      return res.data ?? res;
    },
  });

  // Map the data according to the incoming API structure
  const products = (rawProducts.data || []).map((p) => ({
    id: p.id,
    name: p.title || '',
    image: p.images && p?.images[0] ? (p?.images[0].url ) : '',
    price: p.price_cents != null ? `$${(p.price_cents / 100).toFixed(2)}` : '$0.00',
    price_cents: p.price_cents || 0,
    brand: p.brand || '',
    sku: p.local_sku || '',
    created_at: p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
    status: p.status || 'draft',
    inventory: p.variants?.[0]?.inventory || 0,
    variants: p.variants || [],
    currency: p.currency || 'USD',
    description: p.description || '',
    tags: p.tags || [],
    meta: p.meta || {},
  }));

  const totalPages = rawProducts.pagination?.pages || 1;

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
      products.forEach((product) => {
        updateChecks[product.id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckProduct = (isCheck, id) => {
    setSpecificChecks((prevSpecificChecks) => ({
      ...prevSpecificChecks,
      [id]: isCheck,
    }));
  };

  const showTableRow = (selectedOption) => {
    setSelectedValue(selectedOption.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const actionItems = ["Delete", "edit"];

  const handleActionItemClick = (item, itemID) => {
    const updateItem = item.toLowerCase();
    if (updateItem === "delete") {
      if (window.confirm(`Are you sure you want to delete product #${itemID}?`)) {
        // Add delete API call here
        console.log(`Delete product ${itemID}`);
      }
    } else if (updateItem === "edit") {
      navigate(`/products/product/manage/${itemID}`);
    }
  };

  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const handleToggleOffcanvas = () => {
    setIsOffcanvasOpen(!isOffcanvasOpen);
  };

  const handleCloseOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  const handleSliderChange = (newValues) => {
    setFields({
      ...fields,
      priceRange: newValues,
    });
  };

  const stores = [
    { label: 'FashionFiesta' },
    { label: 'TechTreasures' },
    { label: 'GadgetGrove' },
    { label: 'HomeHarbor' },
    { label: 'HealthHaven' },
    { label: 'BeautyBoutique' },
    { label: "Bookworm's Haven" },
    { label: 'PetParadise' },
    { label: 'FoodieFinds' }
  ];

  const statusOptions = [
    { label: 'draft', value: 'draft' },
    { label: 'published', value: 'published' },
    { label: 'archived', value: 'archived' },
    { label: 'pending', value: 'pending' },
  ];

  const handleSelectStore = (selectedValues) => {
    setFields({
      ...fields,
      store: selectedValues,
    });
  };

  const handleSelectStatus = (selectedValues) => {
    setFields({
      ...fields,
      status: selectedValues.label,
    });
  };

  // Get stock status based on inventory
  const getStockStatus = (product) => {
    const totalInventory = product.variants.reduce((sum, variant) => sum + (variant.inventory || 0), 0);
    
    if (totalInventory > 10) {
      return { label: "In Stock", className: "light-success" };
    } else if (totalInventory > 0) {
      return { label: "Low Stock", className: "light-warning" };
    } else {
      return { label: "Out of Stock", className: "light-danger" };
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return { label: status, className: "light-success" };
      case 'draft':
        return { label: status, className: "light-warning" };
      case 'archived':
        return { label: status, className: "light-secondary" };
      case 'pending':
        return { label: status, className: "light-info" };
      default:
        return { label: status || 'Unknown', className: "light-secondary" };
    }
  };

  return (
    <section className="products">
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
              <Button
                label="Advance Filter"
                className="sm"
                icon={<Icons.TbFilter />}
                onClick={handleToggleOffcanvas}
              />
              <Input
                placeholder="Search Product..."
                className="sm table_search"
                value={fields.name}
                onChange={(value) => handleInputChange("name", value)}
              />
              <Offcanvas
                isOpen={isOffcanvasOpen}
                onClose={handleCloseOffcanvas}
              >
                <div className="offcanvas-head">
                  <h2>Advance Search</h2>
                </div>
                <div className="offcanvas-body">
                  <div className="column">
                    <Input
                      type="text"
                      placeholder="Enter the product name"
                      label="Name"
                      value={fields.name}
                      onChange={(value) => handleInputChange("name", value)}
                    />
                  </div>
                  <div className="column">
                    <Input
                      type="text"
                      label="SKU"
                      value={fields.sku}
                      placeholder="Enter the product SKU"
                      onChange={(value) => handleInputChange("sku", value)}
                    />
                  </div>
                  <div className="column">
                    <MultiSelect
                      options={stores}
                      placeholder="Select Store"
                      label="Store"
                      isSelected={fields.store}
                      onChange={handleSelectStore}
                    />
                  </div>
                  <div className="column">
                    <Dropdown
                      options={statusOptions}
                      placeholder="Select Status"
                      label="Status"
                      selectedValue={fields.status}
                      onClick={handleSelectStatus}
                    />
                  </div>
                  <div className="column">
                    <RangeSlider 
                      label="Price range" 
                      values={fields.priceRange} 
                      onValuesChange={handleSliderChange} 
                    />
                  </div>
                </div>
                <div className="offcanvas-footer">
                  <Button
                    label="Discard"
                    className="sm outline"
                    icon={<Icons.TbX />}
                    onClick={handleCloseOffcanvas}
                  />
                  <Button
                    label="Filter"
                    className="sm"
                    icon={<Icons.TbFilter />}
                    onClick={handleCloseOffcanvas}
                  />
                </div>
              </Offcanvas>
              <div className="btn_parent">
                {/* <Link to="/products/product/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Product</span>
                </Link> */}
                <Button
                  label="Reload"
                  icon={<Icons.TbRefresh />}
                  className="sm"
onClick={()=>refetch()}
                />
              </div>
            </div>
            <div className="content_body">
              {isLoading ? (
<Loader/>              ) : (
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
                        <th className="td_image">Image</th>
                        <th colSpan="4">Name</th>
                        <th>Price</th>
                        <th>Brand</th>
                        <th>SKU</th>
                        <th>Created At</th>
                        <th className="td_status">Status</th>
                        <th className="td_status">Stock Status</th>
                        <th className="td_action">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, key) => {
                        const stockStatus = getStockStatus(product);
                        const statusBadge = getStatusBadge(product.status);
                        
                        return (
                          <tr key={key}>
                            <td className="td_checkbox">
                              <CheckBox
                                onChange={(isCheck) =>
                                  handleCheckProduct(isCheck, product.id)
                                }
                                isChecked={specificChecks[product.id] || false}
                              />
                            </td>
                            <td className="td_id">#{product.id.slice(0, 8)}...</td>
                            <td className="td_image">
                              <img
                                src={product?.image}
                                alt={product.name}
                                // onError={(e) => {
                                //   e.target.src = '/default-product.png';
                                // }}
                              />
                            </td>
                            <td colSpan="4">
                              <Link to={`/products/product/manage/${product.id}`}>
                                {product.name}
                              </Link>
                            </td>
                            <td>
                              {product.price}
                            </td>
                            <td>
                              <Link>{product.brand}</Link>
                            </td>
                            <td>{product.sku}</td>
                            <td>{product.created_at}</td>
                            <td className="td_status">
                              <Badge
                                label={statusBadge.label}
                                className={statusBadge.className}
                              />
                            </td>
                            <td className="td_status">
                              <Badge
                                label={stockStatus.label}
                                className={stockStatus.className}
                              />
                            </td>
                            <td className="td_action">
                              <TableAction
                                actionItems={actionItems}
                                onActionItemClick={(item) =>
                                  handleActionItemClick(item, product.id)
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

export default ManageProduct;