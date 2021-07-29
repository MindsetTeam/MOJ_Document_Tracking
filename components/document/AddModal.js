import { useState } from "react";
import { Modal, Form, Input, Select, Button, Upload } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { mutate } from "swr";

const { Option } = Select;

const AddModal = ({ visible, setVisible }) => {
  const [formAdd] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const prefixSelectorPhoneNumber = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 80 }}>
        <Option value="855">+855</Option>
      </Select>
    </Form.Item>
  );

  const onChangeUploadFile = ({ fileList: newFileList }) => {
    console.log(newFileList);
    setFileList(newFileList);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    const dataForm = formAdd.getFieldsValue();
    let formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });
    for (const key in dataForm) {
      if (Object.hasOwnProperty.call(dataForm, key)) {
        if (key == "prefix") {
          continue;
        }
        if (key === "phoneNumber") {
          formData.append(key, dataForm.prefix + dataForm[key]);
          continue;
        }
        if (key === "department") {
          dataForm[key].forEach((v) => {
            formData.append("department[]", v);
          });
          continue;
        }
        formData.append(key, dataForm[key]);
      }
    }
    await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });
    setVisible(false);
    setConfirmLoading(false);
    setFileList([]);
    formAdd.resetFields();
    mutate("/api/documents?income=true");
    // setTimeout(() => {
    //   setVisible(false);
    //   setConfirmLoading(false);
    // }, 2000);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setVisible(false);
  };
  return (
    <Modal
      title="Add New Incoming Document"
      visible={visible}
      onOk={handleOk}
      destroyOnClose
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      maskClosable={false}
    >
      <Form name="basic" initialValues={{ prefix: "855" }} form={formAdd}>
        <Form.Item
          label="Username"
          name="username"
          // rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          // rules={[
          //   { required: true, message: "Please input your phone number!" },
          // ]}
        >
          <Input
            addonBefore={prefixSelectorPhoneNumber}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          label="Subject"
          name="subject"
          // rules={[{ required: true, message: "Please input your Subject!" }]}
        >
          <Input />
        </Form.Item>
        <Form.List name="department" initialValue={[""]}>
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  label={index === 0 ? "Department" : ""}
                  required={false}
                  key={field.key}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message:
                          "Please select department or delete this field.",
                      },
                    ]}
                    noStyle
                  >
                    <Input
                      placeholder="department name"
                      style={{ width: "95%" }}
                    />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      onClick={() => remove(field.name)}
                    />
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  style={{ width: "60%" }}
                  icon={<PlusOutlined />}
                >
                  Add More Department
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item label="Note" name="note">
          <Input />
        </Form.Item>
        <Upload
          accept="application/pdf"
          fileList={fileList}
          multiple
          onChange={onChangeUploadFile}
        >
          <Button icon={<UploadOutlined />}>Click to Files</Button>
        </Upload>
      </Form>
    </Modal>
  );
};

export default AddModal;
