import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tag,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../config/axios";
import { UploadOutlined } from "@ant-design/icons";

function ManageProduct() {
  const [dataSource, setDataSource] = useState([]);
  const [open, setOpen] = useState(false);

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      // Use the render function to display an image instead of the URL string
      render: (imageUrl) => (
        <Image
          width={80}
          src={imageUrl}
          alt="product"
          preview={{
            mask: "Preview",
          }}
        />
      ),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      // Format the price to a currency string and make the column sortable
      render: (price) => `${price?.toLocaleString("vi-VN")} ₫`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Status",
      dataIndex: "deleted",
      key: "deleted",
      // Use a Tag component to show a clear status
      render: (isDeleted) => (
        <Tag color={isDeleted ? "volcano" : "green"}>
          {isDeleted ? "DELETED" : "ACTIVE"}
        </Tag>
      ),
      // You can also add filters for this column
      filters: [
        { text: "Active", value: false },
        { text: "Deleted", value: true },
      ],
      onFilter: (value, record) => record.deleted === value,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Action",
      key: "action",
      // Add action buttons for each row
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">Edit</Button>
          <Button type="link" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchProduct = async () => {
    // tương tác với API get và lấy dữ liệu lên
    try {
      const response = await api.get("products");
      console.log(response.data);
      setDataSource(response.data);
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  // sự kiện để chạy cái hành động này
  // []: chạy hàm 1 lần duy nhất khi load page
  // [number]: chạy hàm mỗi khi mà biến number đc thay đổi
  useEffect(() => {
    fetchProduct();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("products", values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Successfully create new product");
      setOpen(false);

      fetchProduct();
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  return (
    <div>
      <Button className="mb-4" type="primary" onClick={() => setOpen(true)}>
        Add new product
      </Button>
      <Table dataSource={dataSource} columns={columns} />
      <Modal title="Product" open={open} onCancel={() => setOpen(false)}>
        <Form
          labelCol={{
            span: 24,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              { required: true, message: "Please input the product name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please provide a description!" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* Image Upload */}
          <Form.Item
            name="image"
            label="Image"
            // valuePropName="fileList"
            rules={[{ required: true, message: "Please upload an image!" }]}
          >
            <Input />
          </Form.Item>

          {/* Price with formatter and prefix */}
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please set a price!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              prefix="₫"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\₫\s?|(,*)/g, "")}
            />
          </Form.Item>

          {/* Quantity */}
          <Form.Item
            label="Quantity"
            name="quantity"
            initialValue={10000}
            rules={[{ required: true, message: "Please set the quantity!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageProduct;
