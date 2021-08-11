import { useEffect, useState } from "react";
import { Modal, Form, Input,DatePicker, Select, Button, Upload } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import moment from 'moment';
import { mutate } from "swr";
import useTranslation from "next-translate/useTranslation";

const { Option } = Select;

const EditModal = ({ visible, data, onClose,reFetchNewData }) => {
  const [formEdit] = Form.useForm();
  const { t } = useTranslation("home");
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
    const dataForm = formEdit.getFieldsValue();
    let formData = new FormData();
    fileList.forEach((file) => {
      if (file.oldURLFile) {
        formData.append("fileList[]", file.oldURLFile);
      } else {
        formData.append("files", file.originFileObj);
      }
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
        formData.append(key, dataForm[key] || "");
      }
    }
    await fetch("/api/documents/" + data._id, {
      method: "PUT",
      body: formData,
    });
    
    setConfirmLoading(false);
    setFileList([]);
    onClose()
    reFetchNewData()
    // // setTimeout(() => {
    // //   setVisible(false);
    // //   setConfirmLoading(false);
    // // }, 2000);
  };

  const handleCancel = () => {
    onClose();
  };
  useEffect(() => {
    if (visible == true) {
      formEdit.setFieldsValue({
        ...data,
        incomeDate: moment(data.incomeDate),
        prefix: "+855",
        phoneNumber: data.phoneNumber.slice(3),
      });
      setFileList(
        (data.files || []).map((v) => ({
          name: v.replace(/^.*[\\\/]/, "").replace(/-\w{5}\./, "."),
          url: v.split("uploads\\").join("uploads\\download\\"),
          oldURLFile: v,
        }))
      );
    } else {
      formEdit.resetFields();
      setFileList([]);
    }
  }, [visible]);
  return (
    <Modal
      destroyOnClose={true}
      title={`Edit Documents ID ${data?._id}`}
      visible={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Form preserve={false} form={formEdit}>
        <Form.Item
          label={t("username")}
          name="username"
          // rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label={t("phoneNumber")}
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
          label={t("subject")}
          name="subject"
          // rules={[{ required: true, message: "Please input your Subject!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={"Date"}
          name="incomeDate"
          // rules={[{ required: true, message: "Please input your Subject!" }]}
        >
          <DatePicker
            showTime={{ use12Hours: true }}
            format="YYYY-MM-DD hh:mma"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label={t("number")} name="number">
          <Input />
        </Form.Item>
        <Form.List name="department" initialValue={[""]}>
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  label={index === 0 ? t("department") : ""}
                  required={false}
                  key={index}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please select department.",
                      },
                    ]}
                    noStyle
                  >
                    <Input
                      placeholder={t("department name")}
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
                  {t("add department")}
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item label={t("note")} name="note">
          <Input />
        </Form.Item>
        <Upload
          action="api/hello"
          accept="application/pdf"
          fileList={fileList}
          multiple
          onChange={onChangeUploadFile}
        >
          <Button icon={<UploadOutlined />}>{t("upload files")}</Button>
        </Upload>
      </Form>
    </Modal>
  );
};

export default EditModal;
