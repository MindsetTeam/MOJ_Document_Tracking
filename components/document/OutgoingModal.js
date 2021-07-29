import { Modal, Form, Input, Select, Button } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const OutgoingModal = ({ visible, setVisible, handlerOk }) => {
  const [outgoingForm] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const handleCancel = () => {
    console.log("Clicked cancel button");
    outgoingForm.resetFields();
    setVisible(false);
  };
  
  return (
    <Modal
      title="Outgoing Document"
      visible={visible}
      onOk={() => {
        setConfirmLoading(true)
        const data =outgoingForm.getFieldsValue()
        handlerOk(data, ()=>{
          outgoingForm.resetFields();
          setConfirmLoading(false)
        })
      }}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      destroyOnClose={true}

    >
      <Form form={outgoingForm}>
        <Form.List name="toDepartment" initialValue={[""]}>
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
      </Form>
    </Modal>
  );
};

export default OutgoingModal;
