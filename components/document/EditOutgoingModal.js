import { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import { mutate } from "swr";
import useTranslation from "next-translate/useTranslation";

const EditOutgoingModal = ({ visible, data, onClose,reFetchNewData }) => {
  const [outgoingForm] = Form.useForm();
  const { t } = useTranslation("home");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    setConfirmLoading(true);
    const dataForm = outgoingForm.getFieldsValue();
    console.log(dataForm);
    const formData = new FormData();
    for (const key in dataForm) {
      if (Object.hasOwnProperty.call(dataForm, key)) {
        if (key === "outgoingDate") {
          formData.append(key, dataForm[key]?.toJSON());
          continue;
        }
        if (key === "toDepartment") {
          dataForm[key].forEach((v) => {
            formData.append("toDepartment[]", v);
          });
          continue;
        }
        formData.append(key, dataForm[key]);
      }
    }

    await fetch("/api/documents/" + data._id, {
      method: "PUT",
      // body: JSON.stringify({
      //   ...dataForm,
      //   outgoingDate: dataForm.outgoingDate.toJSON(),
      // }),
      // headers: {
      //      'Content-Type': 'application/json'
      // }, 2000
      body: formData,
    });
    setConfirmLoading(false);
    onClose();
    reFetchNewData()
    // mutate("/api/documents?type=income&search=&sort=&limit=10&page=1");
    // mutate("/api/documents/department?type=outgoing");
    // mutate("/api/documents/department?type=income");
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
      outgoingForm.setFieldsValue({
        ...data,
        outgoingDate: moment(data.outgoingDate),
      });
    } else {
      outgoingForm.resetFields();
    }
  }, [visible]);
  return (
    <Modal
      destroyOnClose={true}
      title={`Edit Documents ID ${data?._id}`}
      visible={visible}
      onOk={handleOk}
      okText={t("ok")}
      cancelText={t("cancel")}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Form form={outgoingForm}>
        <Form.Item name="outgoingDate" label="Outgoing Date">
          <DatePicker
            showTime={{ use12Hours: true }}
            format="YYYY-MM-DD hh:mma"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.List name="toDepartment" initialValue={[""]}>
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
      </Form>
    </Modal>
  );
};

export default EditOutgoingModal;
