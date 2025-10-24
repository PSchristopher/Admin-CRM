import * as Icons from "react-icons/tb";
import Tags from "../../api/Tags.json";
import Taxes from "../../api/Taxes.json";
import Labels from "../../api/Labels.json";
import Categories from "../../api/Categories.json";
import React, { useState, useEffect } from "react";
import Variations from "../../api/Variations.json";
import Colloctions from "../../api/Colloctions.json";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import NotFound from '../../pages/error/NotFound.jsx';
import Tagify from "../../components/common/Tagify.jsx";
import Button from "../../components/common/Button.jsx";
import Attributes from "../../api/ProductAttributes.json";
import Divider from "../../components/common/Divider.jsx";
import { useParams, Routes, Route} from "react-router-dom";
import CheckBox from "../../components/common/CheckBox.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Offcanvas from "../../components/common/Offcanvas.jsx";
import Accordion from "../../components/common/Accordion.jsx";
import FileUpload from "../../components/common/FileUpload.jsx";
import TextEditor from "../../components/common/TextEditor.jsx";
import MultiSelect from "../../components/common/MultiSelect.jsx";
import ManageProduct from "../../pages/products/ManageProduct.jsx";
import api from "../../lib/apiClient.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../components/common/Loader.jsx";

const EditProduct = ({ productData }) => {
  const { productId } = useParams();
  const queryClient = useQueryClient();
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [product, setProduct] = useState();

  console.log('route productId =', productId);

  const { data: apiProduct, isLoading, error, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('missing productId');
      console.log('fetching product from API for id', productId);
      const res = await api.get(`/admin/products/${productId}`);
      console.log('api response', res);
      setProduct(mapProductToForm(res.data));
      return res.data ?? res;
    },
    enabled: Boolean(productId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    onSuccess: (d) => {console.log('useQuery onSuccess product', d)
    },
    onError: (e) => console.error('useQuery onError product', e),
  });

  // Approve product mutation
  const approveProductMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await api.patch(`/admin/products/${productId}/status`, {
        status: 'published'
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', productId]);
      alert('Product approved successfully!');
      setShowApproveConfirm(false);

    },
    onError: (error) => {
      console.error('Failed to approve product:', error);
      alert('Failed to approve product. Please try again.');
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await api.patch(`/admin/products/${productId}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', productId]);
      alert('Product updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    }
  });

  if (!apiProduct && !isLoading) {
    return <Routes>
      <Route path="*" element={<NotFound title="product not found" message="Sorry, the product details you are looking for could not be found."/>}/>
    </Routes>
  }

  // Map API data to our form structure
  const mapProductToForm = (product) => {
    if (!product) return {};
    
    return {
      // Basic Info
      title: product.title || '',
      description: product.description || '',
      brand: product.brand || '',
      
      // Pricing
      price_cents: product.price_cents ? (product.price_cents / 100) : 0,
      price_sale: product.price_cents ? (product.price_cents / 100) * 0.8 : 0,
      cost_per_item: product.price_cents ? (product.price_cents / 100) * 0.6 : 0,
      currency: product.currency || 'RS',
      
      // Inventory & SKU
      local_sku: product.local_sku || '',
      quantity: product?.variants?.[0]?.inventory || 0,
      
      // Meta Data
      meta_fit: product.meta?.fit || '',
      meta_wash: product.meta?.wash || '',
      meta_material: product.meta?.material || '',
      
      // SEO
      meta_title: product.title || '',
      meta_description: product.description || '',
      meta_link: `http://localhost:5173/catalog/product/${product.id}`,
      
      // Status & Tags
      status: product.status ,
      tags: product.tags || [],
      
      // Additional fields
      question: "",
      answer: "",
      // profit: "",
      // margin: "",
    };
  };

console.log('product state =', product);
  // Update product when API data loads
  // useEffect(() => {
  //   console.log('mapping apiProduct to form', apiProduct);
  //   if (apiProduct) {
  //     setProduct(apiProduct);
  //   }
  // }, [apiProduct]);

  // Calculate profit and margin
  // useEffect(() => {
  //   const profit = product.price_cents - product.cost_per_item;
  //   const margin = product.price_cents > 0 ? (profit / product.price_cents) * 100 : 0;
  //   setProduct(prev => ({
  //     ...prev,
  //     profit: profit,
  //     margin: margin,
  //   }));
  // }, [product.price_cents, product.cost_per_item]);

  const [selectOptions, setSelectOptions] = useState([
    { value: "success", label: "in stock" },
    { value: "danger", label: "out of stock" },
    { value: "warning", label: "On backorder" },
  ]);

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  // Determine stock status from API data
  const getStockStatus = (product) => {
    if (product?.variants?.[0]?.inventory > 0) return "in stock";
    return "out of stock";
  };

  const [selectedValue, setSelectedValue] = useState({
    stockValue: getStockStatus(apiProduct),
    statusValue: apiProduct?.status || 'draft',
    categoriesValue: apiProduct?.category || '',
  });

  const handleInputChange = (key, value) => {
    setProduct({
      ...product,
      [key]: value,
    });
  };

  const handleStockSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      stockValue: selectedOption.label,
    });
  };

  const handleStatusSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      statusValue: selectedOption.value,
    });
    setProduct(prev => ({
      ...prev,
      status: selectedOption.value,
    }));
  };

   const handleApproveProduct = () => {
    setShowApproveConfirm(true);
  };

  const confirmApproveProduct = () => {
    approveProductMutation.mutate(productId);
  };

  const cancelApproveProduct = () => {
    setShowApproveConfirm(false);
  };

  const handleSaveProduct = () => {
    const updatedData = {
      title: product.title,
      description: product.description,
      brand: product.brand,
      price_cents: Math.round(product.price_cents * 100),
      local_sku: product.local_sku,
      currency: product.currency,
      status: product.status,
      tags: product.tags,
      meta: {
        fit: product.meta_fit,
        wash: product.meta_wash,
        material: product.meta_material,
      }
    };
    updateProductMutation.mutate(updatedData);
  };

  const attributes = Attributes.map((attribute) => ({
    label: attribute.name,
    value: attribute.name,
  }));

  const [attributeOption, setAttributeOption] = useState(attributes);

  const handleAttributeSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      attribute: selectedOption.label,
    });
  };

  const [faqs, setFaqs] = useState([]);

  const handleFaqQuestion = (e) => {
    e.preventDefault();
    if (product.question && product.answer) {
      setFaqs([
        ...faqs,
        {
          question: product.question,
          answer: product.answer,
        },
      ]);
      setProduct({
        ...product,
        question: "",
        answer: "",
      });
    }
  };

  const category = Categories?.map(category => ({
    label: category?.name
  }));

  const [tags, setTags] = useState(Tags);
  const [taxes, setTaxes] = useState(Taxes);
  const [colloctions, setColloctions] = useState(Colloctions);
  const [labels, setLabels] = useState(Labels);

  const handleCheckTax = (id, checked) => {
    setTaxes((prevCheckboxes) =>
      prevCheckboxes.map((checkbox) =>
        checkbox.id === id ? { ...checkbox, isChecked: checked } : checkbox
      )
    );
  };
  
  const handleCheckCollection = (id, checked) => {
    setColloctions((prevCheckboxes) =>
      prevCheckboxes.map((checkbox) =>
        checkbox.id === id ? { ...checkbox, isChecked: checked } : checkbox
      )
    );
  };
  
  const handleCheckLabels = (id, checked) => {
    setLabels((prevCheckboxes) =>
      prevCheckboxes.map((checkbox) =>
        checkbox.id === id ? { ...checkbox, isChecked: checked } : checkbox
      )
    );
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleOpenOffcanvas = () => setIsOffcanvasOpen(true);
  const handleCloseOffcanvas = () => setIsOffcanvasOpen(false);

  const getAttributesString = (attributes) => {
    const availableAttributes = Object.values(attributes).filter(value => value);
    return availableAttributes.join(' / ');
  };

  // Map API variants to table format
  const getVariantsForTable = () => {
    if (apiProduct?.variants) {
      return apiProduct?.variants?.map(variant => ({
        attributes: variant.options || {},
        price: variant.price_cents ? variant.price_cents / 100 : 0,
        inventory: variant?.inventory || 0,
        sku: variant.sku || ''
      }));
    }
    return Variations;
  };

  const variantsForTable = getVariantsForTable();

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Function to get image URL from image object
  const getImageUrl = (image) => {
    // if (!image) return '/default-product.png';
    
    // Handle different image object structures
    if (typeof image === 'string') return image;
    if (image.url) return image.url;
    if (image.thumbnail) return image.thumbnail;
    if (image.original) return image.original;
    
    // return '/default-product.png';
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section>
      <div className="container">
        <div className="wrapper">
          <div className="content">
            {/* Basic Product Info */}
            <div className="content_item">
              <h2 className="sub_heading">Product Info</h2>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Enter the product title"
                  label="Title"
                  icon={<Icons.TbShoppingCart />}
                  value={product.title}
                  onChange={(value) => handleInputChange("title", value)}
                />
              </div>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Enter the product brand"
                  label="Brand"
                  icon={<Icons.TbTag />} 
                  value={product.brand}
                  onChange={(value) => handleInputChange("brand", value)}
                />
              </div>
              <div className="column">
                <TextEditor
                  label="Description"
                  placeholder="Enter a description"
                  value={product.description}
                  onChange={(value) => handleInputChange("description", value)}
                />
              </div>  
            </div>

            {/* Images Section */}
            <div className="content_item">
              <h2 className="sub_heading">Product Images</h2>
              
              {/* Display existing images */}
              {apiProduct?.images?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {apiProduct.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getImageUrl(image)}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          // onError={(e) => {
                          //   e.target.src = '/default-product.png';
                          // }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            icon={<Icons.TbTrash />}
                            className="danger sm"
                            onClick={() => {
                              // Add delete image functionality here
                              console.log('Delete image:', image);
                            }}
                          />
                        </div>
                        {/* {index === 0 && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            Primary
                          </div>
                        )} */}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload Component */}
              <FileUpload 
                preloadedImages={apiProduct?.images || []}
              />

              {/* Image Count Info */}
              <div className="mt-4 text-sm text-gray-600">
                {apiProduct?.images?.length || 0} image(s) uploaded
              </div>
            </div>

            {/* Pricing */}
            <div className="content_item">
              <h2 className="sub_heading">Pricing</h2>
              <div className="column_2">
                <Input
                  type="number"
                  placeholder="Enter the product price"
                  icon={<Icons.TbCoin />}
                  label={`Price (${product.currency})`}
                  value={product.price_cents}
                  onChange={(value) => handleInputChange("price_cents", value)}
                />
              </div>
              <div className="column_2">
                <Input
                  type="number"
                  placeholder="Enter the sale price"
                  icon={<Icons.TbDiscount />}
                  label={`Sale Price (${product.currency})`}
                  value={product.price_sale}
                  onChange={(value) => handleInputChange("price_sale", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="number"
                  icon={<Icons.TbCoin />}
                  placeholder="Cost Per Item"
                  label="Cost Per Item"
                  value={product.cost_per_item}
                  onChange={(value) => handleInputChange("cost_per_item", value)}
                />
              </div>
              {/* <div className="column_3">
                <Input
                  type="number"
                  placeholder="- -"
                  label="Profit"
                  readOnly={true}
                  value={product.profit}
                />
              </div>
              <div className="column_3">
                <Input
                  type="text"
                  placeholder="- -"
                  label="Margin"
                  readOnly={true}
                  value={`${product.margin ? product.margin.toFixed(2) : "- -"}%`}
                />
              </div> */}
            </div>

            {/* Product Meta Information */}
            <div className="content_item">
              <h2 className="sub_heading">Product Details</h2>
              <div className="column_3">
                <Input
                  type="text"
                  placeholder="Enter SKU"
                  label="SKU"
                  icon={<Icons.TbBarcode />}
                  value={product.local_sku}
                  onChange={(value) => handleInputChange("local_sku", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="text"
                  placeholder="Fit (e.g., regular)"
                  label="Fit"
                  value={product.meta_fit}
                  onChange={(value) => handleInputChange("meta_fit", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="text"
                  placeholder="Wash care instructions"
                  label="Wash Care"
                  value={product.meta_wash}
                  onChange={(value) => handleInputChange("meta_wash", value)}
                />
              </div>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Material composition"
                  label="Material"
                  value={product.meta_material}
                  onChange={(value) => handleInputChange("meta_material", value)}
                />
              </div>
            </div>

            {/* Variations */}
            <div className="content_item">
              <h2 className="sub_heading">
                <span>Variations</span>
                <Button
                  label="add Variant"
                  icon={<Icons.TbPlus />}
                  onClick={openModal}
                  className="sm"
                />
              </h2>

              <table className="bordered">
                <thead>
                  <tr>
                    <th>Variant</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variantsForTable?.map((variation, key) => (
                    <tr key={key}>
                      <td>{getAttributesString(variation.attributes)}</td>
                      <td>{variation.sku}</td>
                      <td>${variation.price.toFixed(2)}</td>
                      <td>{variation?.inventory}</td>
                      <td className="action">
                        <div className="actions flex gap-2">
                          <Button
                            icon={<Icons.TbPencil />}
                            className="sm info"
                            onClick={handleOpenOffcanvas}
                          />
                          <Button
                            icon={<Icons.TbTrash />}
                            className="sm danger"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Variant Modals and Offcanvas */}
              <Offcanvas isOpen={isOffcanvasOpen} onClose={handleCloseOffcanvas} className="lg">
                <div className="offcanvas-head">
                  <h2>Edit Variant</h2>
                </div>
                <div className="offcanvas-body">
                  <div className="content_item">
                    <h2 className="sub_heading">Options</h2>
                    <div className="column_3">
                      <Input
                        type="text"
                        placeholder="Enter color"
                        className="sm"
                        label="Color"
                        icon={<Icons.TbTrash className="trash"/>}
                        value="Black"
                      />
                    </div>
                    <div className="column_3">
                      <Input
                        type="text"
                        placeholder="Enter size"
                        className="sm"
                        label="Size"
                        icon={<Icons.TbTrash className="trash"/>}
                        value="Medium"
                      />
                    </div>
                    <div className="column_3">
                      <Input
                        type="text"
                        placeholder="Enter material"
                        className="sm"
                        label="Material"
                        icon={<Icons.TbTrash className="trash"/>}
                        value="Polyester"
                      />
                    </div>
                  </div>
                </div>
                <div className="offcanvas-footer">
                  <Button
                    label="close"
                    className="outline"
                    onClick={handleCloseOffcanvas}
                  />
                  <Button
                    label="save"
                    className=""
                    onClick={handleCloseOffcanvas}
                  />
                </div>
              </Offcanvas>

              <Modal bool={isModalOpen} onClose={closeModal} className="sm">
                <div className="modal-head">
                  <h2>add variation</h2>
                </div>
                <div className="modal-body">
                  <div className="content_item">
                    <div className="column">
                      <Dropdown
                        placeholder="select attribute"
                        label="Select attribute"
                        selectedValue={selectedValue.attribute}
                        onClick={handleAttributeSelect}
                        options={attributeOption}
                        className="sm"
                      />
                    </div>
                    <Divider label={`${selectedValue.attribute} options`}>
                      <Button label="add option" className="right text" />
                    </Divider>
                    <div className="column">
                      <Input
                        type="text"
                        icon={<Icons.TbTrash className="trash" />}
                        placeholder="Enter the product option"
                        className="sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button
                    label="discard"
                    onClick={closeModal}
                    className="sm outline"
                  />
                  <Button
                    label="save"
                    onClick={closeModal}
                    className="sm"
                  />
                </div>
              </Modal>
            </div>

            {/* FAQ Section */}
            {/* <div className="content_item">
              <h2 className="sub_heading">Add Question</h2>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Enter the question"
                  icon={<Icons.TbQuestionMark />}
                  label="Question"
                  value={product.question}
                  onChange={(value) => handleInputChange("question", value)}
                />
              </div>
              <div className="column">
                <Textarea
                  type="text"
                  placeholder="Enter the Answer"
                  icon={<Icons.TbCircleCheck />}
                  label="Answer"
                  value={product.answer}
                  onChange={(value) => handleInputChange("answer", value)}
                />
              </div>
              <Button
                label="Add Question"
                icon={<Icons.TbCheck />}
                className="sm right"
                onClick={handleFaqQuestion}
              />
            </div> */}

            {faqs?.length > 0 && (
              <div className="content_item">
                <h2 className="sub_heading">FAQ's</h2>
                {faqs.map((faq, key) => (
                  <div className="column" key={key}>
                    <Accordion title={faq.question}>
                      <p>{faq.answer}</p>
                    </Accordion>
                  </div>
                ))}
              </div>
            )}

            {/* SEO Meta Data */}
            <div className="content_item meta_data">
              <h2 className="sub_heading">Search Engine Listing</h2>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Enter the meta title"
                  label="Meta Title"
                  value={product.meta_title}
                  onChange={(value) => handleInputChange("meta_title", value)}
                />
              </div>
              <div className="column">
                <Textarea
                  type="text"
                  placeholder="Enter the meta description"
                  label="Meta Description"
                  value={product.meta_description}
                  onChange={(value) => handleInputChange("meta_description", value)}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Status Approval Box */}
            {product.status === 'draft' && (
              <div className="sidebar_item bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h2 className="sub_heading text-yellow-800 font-semibold mb-3">Approval Required</h2>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(product.status)} mb-3`}>
                    {product?.status?.toUpperCase()}
                  </div>
                  <p className="text-yellow-700 text-sm mb-4">
                    This product is in draft status and needs approval to be published.
                  </p>
                  <Button
                    label={approveProductMutation.isLoading ? "Approving..." : "Approve Product"}
                    icon={<Icons.TbCheck />}
                    className="success w-full"
                    onClick={handleApproveProduct}
                    disabled={approveProductMutation.isLoading}
                  />
                </div>
              </div>
            )}
            {/* <div>{product.status}</div> */}

            <div className="sidebar_item">
              <h2 className="sub_heading">Publish</h2>
              <Button
                label="save & exit"
                icon={<Icons.TbDeviceFloppy />}
                className="mb-2"
                onClick={handleSaveProduct}
                disabled={updateProductMutation.isLoading}
              />
            </div>

            <div className="sidebar_item">
              <h2 className="sub_heading">Status</h2>
              <div className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  {/* <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border w-fit ${getStatusBadge(product.status)}`}>
                    {product?.status?.toUpperCase()}
                  </div> */}
                </div>
                <Dropdown
                  placeholder="Change status"
                  selectedValue={selectedValue.statusValue}
                  onClick={handleStatusSelect}
                  options={statusOptions}
                  className="sm"
                />
              </div>
            </div>

            <div className="sidebar_item">
              <h2 className="sub_heading">Stock status</h2>
              <div className="column">
                <Dropdown
                  placeholder="select stock status"
                  selectedValue={selectedValue.stockValue}
                  onClick={handleStockSelect}
                  options={selectOptions}
                  className="sm"
                />
              </div>
            </div>

            <div className="sidebar_item">
              <h2 className="sub_heading">Categories</h2>
              <MultiSelect
                className="sm"
                isMulti={true}
                isSelected={selectedValue.categoriesValue}
                options={category}
                placeholder="Select options..."
              />
            </div>

            <div className="sidebar_item">
              <h2 className="sub_heading">Inventory</h2>
              <div className="column">
                <Input
                  type="number"
                  placeholder="Enter the product quantity"
                  value={product.quantity}
                  onChange={(value) => handleInputChange("quantity", value)}
                  className="sm"
                />
              </div>
            </div>

            <div className="sidebar_item">
              <h2 className="sub_heading">Currency</h2>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Currency code"
                  value={product.currency}
                  onChange={(value) => handleInputChange("currency", value)}
                  className="sm"
                />
              </div>
            </div>

            <div className="sidebar_item">
              <h2 className="sub_heading">Product collections</h2>
              <div className="sidebar_checkboxes">
                {colloctions.map((collection) => (
                  <CheckBox
                    key={collection.id}
                    id={collection.id}
                    label={`${collection.name}`}
                    isChecked={collection.isChecked}
                    onChange={(isChecked) => handleCheckCollection(collection.id, isChecked)}
                  />
                ))}
              </div>
            </div>

            <div className="sidebar_item">
              <h2 className="sub_heading">Labels</h2>
              <div className="sidebar_checkboxes">
                {labels.map((label) => (
                  <CheckBox
                    key={label.id}
                    id={label.id}
                    label={`${label.name}`}
                    isChecked={label.isChecked}
                    onChange={(isChecked) => handleCheckLabels(label.id, isChecked)}
                  />
                ))}
              </div>
            </div>

            <div className="sidebar_item">
              <h2 className="sub_heading">Tags</h2>
              <Tagify
                tagsData={product?.tags?.length > 0 ? product.tags.map(tag => ({ tag })) : Tags}
                onChange={(newTags) => handleInputChange("tags", newTags.map(t => t.tag))}
              />
            </div>
          </div>
        </div>
      </div>
       {showApproveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icons.TbAlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Approve Product
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Confirm product approval
                  </p>
                </div>
              </div>
              <button
                onClick={cancelApproveProduct}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icons.TbX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <Icons.TbCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Are you sure you want to approve this product?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  This will change the product status from <span className="font-semibold">Draft</span> to <span className="font-semibold">Published</span>. The product will become visible to customers.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700">Product Details:</p>
                  <p className="text-sm text-gray-600 mt-1">{product.title}</p>
                  <p className="text-xs text-gray-500">SKU: {product.local_sku}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex space-x-3 justify-end p-6 border-t border-gray-200">
              <Button
                label="Cancel"
                onClick={cancelApproveProduct}
                className="outline"
                disabled={approveProductMutation.isLoading}
              />
              <Button
                label={
                  approveProductMutation.isLoading 
                    ? "Approving..." 
                    : "Yes, Approve Product"
                }
                onClick={confirmApproveProduct}
                className="success"
                icon={<Icons.TbCheck />}
                disabled={approveProductMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EditProduct;